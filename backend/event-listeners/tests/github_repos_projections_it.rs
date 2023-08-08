use anyhow::Result;
use diesel::query_dsl::RunQueryDsl;
use domain::{Destination, Publisher};
use event_listeners::{listeners::github::Event, models, GITHUB_EVENTS_EXCHANGE};
use fixtures::*;
use infrastructure::{
	amqp::UniqueMessage,
	database::schema::{github_repo_indexes, github_repos},
};
use olog::info;
use rstest::rstest;
use serde_json::json;
use testcontainers::clients::Cli;

use crate::context::{docker, event_listeners::Context};

mod context;
mod fixtures;

#[rstest]
#[tokio::test(flavor = "multi_thread")]
pub async fn repo_projection_it(docker: &'static Cli) {
	let mut test = Test {
		context: Context::new(docker).await.expect("Unable to create test context"),
	};

	test.should_project_repo_events().await.expect("should_project_repo_events");
	test.should_index_fork_parents().await.expect("should_index_fork_parents");
}

struct Test<'a> {
	context: Context<'a>,
}

impl<'a> Test<'a> {
	async fn should_project_repo_events(&mut self) -> Result<()> {
		info!("should_project_repo_events");

		// When
		self.context
			.amqp
			.publisher
			.publish(
				Destination::exchange(GITHUB_EVENTS_EXCHANGE),
				&UniqueMessage::new(Event::Repo(repos::marketplace())),
			)
			.await?;

		// Then
		let mut connection = self.context.database.client.connection()?;
		{
			let mut repos: Vec<models::GithubRepo> = retry(
				|| github_repos::table.load(&mut *connection),
				|res| !res.is_empty(),
			)
			.await?;
			assert_eq!(repos.len(), 1, "Invalid repos count");

			let repo = repos.pop().unwrap();
			assert_eq!(repo.id, repos::marketplace().id);
			assert_eq!(repo.owner, repos::marketplace().owner);
			assert_eq!(repo.name, repos::marketplace().name);
			assert_eq!(repo.html_url, repos::marketplace().html_url.to_string());
			assert_eq!(repo.description, repos::marketplace().description);
			assert_eq!(repo.fork_count, repos::marketplace().forks_count);
			assert_eq!(repo.stars, repos::marketplace().stars);
			assert_eq!(
				repo.languages,
				json!({
					"TypeScript": 2405007,
					"Rust": 574966,
					"PLpgSQL": 26212,
					"JavaScript": 23721,
					"Shell": 12794,
					"Makefile": 8658,
					"CSS": 4475,
					"HTML": 1539,
					"Procfile": 507,
					"Nix": 120
				})
			);
		}

		Ok(())
	}

	async fn should_index_fork_parents(&mut self) -> Result<()> {
		info!("should_index_fork_parents");

		// When
		self.context
			.amqp
			.publisher
			.publish(
				Destination::exchange(GITHUB_EVENTS_EXCHANGE),
				&UniqueMessage::new(Event::Repo(repos::marketplace_fork())),
			)
			.await?;

		// Then
		let mut connection = self.context.database.client.connection()?;
		{
			let mut repo_indexes: Vec<models::GithubRepoIndex> = retry(
				|| github_repo_indexes::table.load(&mut *connection),
				|res| !res.is_empty(),
			)
			.await?;
			assert_eq!(repo_indexes.len(), 1, "Invalid repos index count");

			let repo_index = repo_indexes.pop().unwrap();
			assert_eq!(repo_index.repo_id, repos::marketplace().id);
		}

		Ok(())
	}
}
