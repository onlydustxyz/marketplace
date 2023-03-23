use std::sync::Arc;

use ::domain::{AggregateRootRepository, Event, Project, Publisher};
use anyhow::Result;
use http::Config;
use infrastructure::{amqp::UniqueMessage, github, web3::ens};
use presentation::http;

use crate::{
	infrastructure::{
		database::{
			GithubRepoRepository, PendingProjectLeaderInvitationsRepository,
			ProjectDetailsRepository, ProjectGithubRepoRepository, ProjectSponsorRepository,
			SponsorRepository, UserInfoRepository,
		},
		simple_storage,
	},
	presentation::graphql,
};

pub mod dto;
pub mod roles;
mod routes;

#[allow(clippy::too_many_arguments)]
pub async fn serve(
	config: Config,
	schema: graphql::Schema,
	event_publisher: Arc<dyn Publisher<UniqueMessage<Event>>>,
	project_repository: AggregateRootRepository<Project>,
	project_details_repository: ProjectDetailsRepository,
	github_repo_repository: GithubRepoRepository,
	project_github_repo_repository: ProjectGithubRepoRepository,
	sponsor_repository: SponsorRepository,
	project_sponsor_repository: ProjectSponsorRepository,
	pending_project_leader_invitations_repository: PendingProjectLeaderInvitationsRepository,
	user_info_repository: UserInfoRepository,
	github: Arc<github::RoundRobinClient>,
	ens: Arc<ens::Client>,
	simple_storage: Arc<simple_storage::Client>,
) -> Result<()> {
	let _ = rocket::custom(http::config::rocket("backend/api/Rocket.toml"))
		.manage(config)
		.manage(schema)
		.manage(event_publisher)
		.manage(project_repository)
		.manage(project_details_repository)
		.manage(github_repo_repository)
		.manage(project_github_repo_repository)
		.manage(sponsor_repository)
		.manage(project_sponsor_repository)
		.manage(pending_project_leader_invitations_repository)
		.manage(user_info_repository)
		.manage(github)
		.manage(ens)
		.manage(simple_storage)
		.mount("/", routes![http::routes::health_check,])
		.mount(
			"/",
			routes![
				routes::graphql::graphiql,
				routes::graphql::get_graphql_handler,
				routes::graphql::post_graphql_handler
			],
		)
		.launch()
		.await?;

	Ok(())
}
