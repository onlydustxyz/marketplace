use std::{
	collections::hash_map::DefaultHasher,
	hash::{Hash, Hasher},
};

use anyhow::Result;
use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl};
use domain::{GithubCodeReviewStatus, GithubIssueId, GithubPullRequestId};
use event_listeners::models::{self, GithubRepoIndex, ProjectGithubRepo};
use fixtures::*;
use infrastructure::database::{
	enums::{ContributionStatus, ContributionType},
	schema::{
		contributions, github_pull_request_indexes, projects_contributors,
		projects_pending_contributors,
	},
	ImmutableRepository,
};
use olog::info;
use rstest::rstest;
use serde_json::json;
use testcontainers::clients::Cli;

use crate::context::{docker, github_indexer::Context};

mod context;
mod fixtures;

#[rstest]
#[tokio::test(flavor = "multi_thread")]
pub async fn new_github_repository_added(docker: &'static Cli) {
	let mut test = Test {
		context: Context::new(docker).await.expect("Unable to create test context"),
	};

	test.should_index_repo().await.expect("should_index_repo");
	test.should_update_index_repo().await.expect("should_update_index_repo");
}

struct Test<'a> {
	context: Context<'a>,
}

impl<'a> Test<'a> {
	async fn should_index_repo(&mut self) -> Result<()> {
		info!("should_index_repo");

		self.context.database.client.insert(ProjectGithubRepo {
			project_id: projects::project_id(),
			github_repo_id: repos::marketplace().id,
		})?;

		// When
		self.context
			.database
			.client
			.insert(GithubRepoIndex::new(repos::marketplace().id))?;

		self.context.indexing_scheduler.run_once().await?;

		// Then
		repos::assert_indexed(&mut self.context, vec![repos::marketplace()])?;
		issues::assert_indexed(
			&mut self.context,
			vec![issues::x1061(), issues::x1141(), issues::x1145()],
		)?;
		self.assert_marketplace_pulls_are_indexed_cycle_1()?;
		self.assert_marketplace_contributions_are_up_to_date(1)?;
		self.assert_marketplace_contributors_are_up_to_date_and_indexed(1)?;

		let mut connection = self.context.database.client.connection()?;
		{
			let mut states: Vec<models::GithubPullRequestIndex> =
				github_pull_request_indexes::table
					.order(github_pull_request_indexes::pull_request_id.desc())
					.load(&mut *connection)?;

			{
				let state = states.pop().unwrap();
				assert_eq!(state.pull_request_id, pull_requests::x1144().id);
				assert_eq!(
					state.pull_request_indexer_state,
					Some(
						json!({"base_sha": pull_requests::x1144().base_sha, "head_sha": pull_requests::x1144().head_sha, "hash": hash(&pull_requests::x1144())})
					)
				);
			}
			{
				let state = states.pop().unwrap();
				assert_eq!(state.pull_request_id, pull_requests::x1146().id);
				assert_eq!(
					state.pull_request_indexer_state,
					Some(
						json!({"base_sha": pull_requests::x1146().base_sha, "head_sha": pull_requests::x1146().head_sha, "hash": hash(&pull_requests::x1146())})
					)
				);
			}
			{
				let state = states.pop().unwrap();
				assert_eq!(state.pull_request_id, pull_requests::x1152().id);
				assert_eq!(
					state.pull_request_indexer_state,
					Some(
						json!({"base_sha": pull_requests::x1152().base_sha, "head_sha": pull_requests::x1152().head_sha, "hash": hash(&pull_requests::x1152())})
					)
				);
			}
		}

		Ok(())
	}

	async fn should_update_index_repo(&mut self) -> Result<()> {
		info!("should_update_index_repo");

		// When
		self.context.indexing_scheduler.run_once().await?;

		// Then
		repos::assert_indexed(&mut self.context, vec![repos::marketplace()])?;
		issues::assert_indexed(
			&mut self.context,
			vec![issues::x1061(), issues::x1141(), issues::x1145()],
		)?;
		self.assert_marketplace_pulls_are_indexed_cycle_2()?;
		self.assert_marketplace_contributions_are_up_to_date(2)?;
		self.assert_marketplace_contributors_are_up_to_date_and_indexed(2)?;

		let mut connection = self.context.database.client.connection()?;
		{
			let mut states: Vec<models::GithubPullRequestIndex> =
				github_pull_request_indexes::table
					.order(github_pull_request_indexes::pull_request_id.desc())
					.load(&mut *connection)?;

			{
				let state = states.pop().unwrap();
				assert_eq!(state.pull_request_id, pull_requests::x1144().id);
				assert_eq!(
					state.pull_request_indexer_state,
					Some(
						json!({"base_sha": pull_requests::x1144().base_sha, "head_sha": pull_requests::x1144().head_sha, "hash": hash(&pull_requests::x1144())})
					)
				);
			}
			{
				let state = states.pop().unwrap();
				assert_eq!(state.pull_request_id, pull_requests::x1146().id);
				assert_eq!(
					state.pull_request_indexer_state,
					Some(
						json!({"base_sha": pull_requests::x1146().base_sha, "head_sha": pull_requests::x1146().head_sha, "hash": hash(&pull_requests::x1146())})
					)
				);
			}
			{
				let state = states.pop().unwrap();
				assert_eq!(state.pull_request_id, pull_requests::x1152_updated().id);
				assert_eq!(
					state.pull_request_indexer_state,
					Some(
						json!({"base_sha": pull_requests::x1152_updated().base_sha, "head_sha": pull_requests::x1152_updated().head_sha, "hash": hash(&pull_requests::x1152_updated())})
					)
				);
			}
		}

		Ok(())
	}

	fn assert_marketplace_pulls_are_indexed_cycle_1(&mut self) -> Result<()> {
		pull_requests::assert_indexed(
			&mut self.context,
			vec![
				pull_requests::x1144(),
				pull_requests::x1146(),
				pull_requests::x1152(),
			],
		)?;

		commits::assert_indexed(
			&mut self.context,
			vec![
				(commits::f(), pull_requests::x1144().id),
				(commits::g(), pull_requests::x1144().id),
				(commits::c(), pull_requests::x1146().id),
				(commits::d(), pull_requests::x1146().id),
				(commits::e(), pull_requests::x1146().id),
				(commits::b(), pull_requests::x1152().id),
				(commits::a(), pull_requests::x1152().id),
			],
		)?;

		reviews::assert_indexed(
			&mut self.context,
			vec![
				// Reviews requested
				(
					reviews::requested(GithubCodeReviewStatus::Pending),
					pull_requests::x1144().id,
				),
				(
					reviews::requested(GithubCodeReviewStatus::Pending),
					pull_requests::x1146().id,
				),
				// Actual reviews
				(
					reviews::change_requested(GithubCodeReviewStatus::Pending),
					pull_requests::x1152().id,
				),
				(
					reviews::commented(GithubCodeReviewStatus::Pending),
					pull_requests::x1152().id,
				),
				(
					reviews::approved(GithubCodeReviewStatus::Completed),
					pull_requests::x1152().id,
				),
			],
		)?;

		Ok(())
	}

	fn assert_marketplace_pulls_are_indexed_cycle_2(&mut self) -> Result<()> {
		pull_requests::assert_indexed(
			&mut self.context,
			vec![
				pull_requests::x1144(),
				pull_requests::x1146(),
				pull_requests::x1152_updated(),
			],
		)?;

		commits::assert_indexed(
			&mut self.context,
			vec![
				(commits::f(), pull_requests::x1144().id),
				(commits::g(), pull_requests::x1144().id),
				(commits::c(), pull_requests::x1146().id),
				(commits::d(), pull_requests::x1146().id),
				(commits::e(), pull_requests::x1146().id),
				(commits::h(), pull_requests::x1152().id),
				(commits::b(), pull_requests::x1152().id),
				(commits::a(), pull_requests::x1152().id),
			],
		)?;

		reviews::assert_indexed(
			&mut self.context,
			vec![
				// Reviews requested
				(
					reviews::requested(GithubCodeReviewStatus::Pending),
					pull_requests::x1144().id,
				),
				(
					reviews::requested(GithubCodeReviewStatus::Pending),
					pull_requests::x1146().id,
				),
				// Actual reviews
				(
					reviews::change_requested(GithubCodeReviewStatus::Pending),
					pull_requests::x1152().id,
				),
				(
					reviews::commented(GithubCodeReviewStatus::Pending),
					pull_requests::x1152().id,
				),
				(
					reviews::approved(GithubCodeReviewStatus::Completed),
					pull_requests::x1152().id,
				),
			],
		)?;

		Ok(())
	}

	fn assert_marketplace_contributions_are_up_to_date(&mut self, cycle: i32) -> Result<()> {
		let mut connection = self.context.database.client.connection()?;
		{
			let mut contributions: Vec<models::Contribution> = contributions::table
				.order((
					contributions::dsl::type_.desc(),
					contributions::dsl::details_id.desc(),
					contributions::dsl::user_id.desc(),
					contributions::dsl::created_at.asc(),
				))
				.load(&mut *connection)?;
			assert_eq!(
				contributions.len(),
				if cycle == 1 { 10 } else { 11 },
				"Invalid contribution count"
			);

			// Issue assigned to ofux
			{
				let contribution = contributions.pop().unwrap();
				assert_eq!(contribution.repo_id, repos::marketplace().id);
				assert_eq!(contribution.type_, ContributionType::Issue);
				assert_eq!(contribution.user_id, users::ofux().id);
				assert_eq!(
					contribution.details_id,
					GithubIssueId::from(1763108414u64).into()
				);
				assert_eq!(contribution.status, ContributionStatus::Complete);
			}

			// PR 1144
			{
				let contribution = contributions.pop().unwrap();
				assert_eq!(contribution.repo_id, repos::marketplace().id);
				assert_eq!(contribution.type_, ContributionType::PullRequest);
				assert_eq!(contribution.user_id, users::ofux().id);
				assert_eq!(
					contribution.details_id,
					GithubPullRequestId::from(1452363285u64).into()
				);
				assert_eq!(contribution.status, ContributionStatus::Canceled);
			}
			{
				let contribution = contributions.pop().unwrap();
				assert_eq!(contribution.repo_id, repos::marketplace().id);
				assert_eq!(contribution.type_, ContributionType::PullRequest);
				assert_eq!(contribution.user_id, users::anthony().id);
				assert_eq!(
					contribution.details_id,
					GithubPullRequestId::from(1452363285u64).into()
				);
				assert_eq!(contribution.status, ContributionStatus::Canceled);
			}

			// PR 1146
			{
				let contribution = contributions.pop().unwrap();
				assert_eq!(contribution.repo_id, repos::marketplace().id);
				assert_eq!(contribution.type_, ContributionType::PullRequest);
				assert_eq!(contribution.user_id, users::ofux().id);
				assert_eq!(
					contribution.details_id,
					GithubPullRequestId::from(1455874031u64).into()
				);
				assert_eq!(contribution.status, ContributionStatus::Complete);
			}

			// PR 1152
			if cycle == 2 {
				{
					let contribution = contributions.pop().unwrap();
					assert_eq!(contribution.repo_id, repos::marketplace().id);
					assert_eq!(contribution.type_, ContributionType::PullRequest);
					assert_eq!(contribution.user_id, users::stan().id);
					assert_eq!(
						contribution.details_id,
						GithubPullRequestId::from(1458220740u64).into()
					);
					assert_eq!(contribution.status, ContributionStatus::InProgress);
				}
			}

			{
				let contribution = contributions.pop().unwrap();
				assert_eq!(contribution.repo_id, repos::marketplace().id);
				assert_eq!(contribution.type_, ContributionType::PullRequest);
				assert_eq!(contribution.user_id, users::anthony().id);
				assert_eq!(
					contribution.details_id,
					GithubPullRequestId::from(1458220740u64).into()
				);
				assert_eq!(contribution.status, ContributionStatus::InProgress);
			}

			// Code review by anthony (not approved)
			{
				let contribution = contributions.pop().unwrap();
				assert_eq!(contribution.repo_id, repos::marketplace().id);
				assert_eq!(contribution.type_, ContributionType::CodeReview);
				assert_eq!(contribution.user_id, users::anthony().id);
				assert_eq!(
					contribution.details_id,
					GithubPullRequestId::from(1452363285u64).into()
				);
				assert_eq!(contribution.status, ContributionStatus::InProgress);
			}

			// Code review by anthony (not approved)
			{
				let contribution = contributions.pop().unwrap();
				assert_eq!(contribution.repo_id, repos::marketplace().id);
				assert_eq!(contribution.type_, ContributionType::CodeReview);
				assert_eq!(contribution.user_id, users::anthony().id);
				assert_eq!(
					contribution.details_id,
					GithubPullRequestId::from(1455874031u64).into()
				);
				assert_eq!(contribution.status, ContributionStatus::InProgress);
			}

			// Code review by ofux (not approved)
			{
				let contribution = contributions.pop().unwrap();
				assert_eq!(contribution.repo_id, repos::marketplace().id);
				assert_eq!(contribution.type_, ContributionType::CodeReview);
				assert_eq!(contribution.user_id, users::ofux().id);
				assert_eq!(
					contribution.details_id,
					GithubPullRequestId::from(1458220740u64).into()
				);
				assert_eq!(contribution.status, ContributionStatus::InProgress);
			}

			// Code review by alex (not approved)
			{
				let contribution = contributions.pop().unwrap();
				assert_eq!(contribution.repo_id, repos::marketplace().id);
				assert_eq!(contribution.type_, ContributionType::CodeReview);
				assert_eq!(contribution.user_id, users::alex().id);
				assert_eq!(
					contribution.details_id,
					GithubPullRequestId::from(1458220740u64).into()
				);
				assert_eq!(contribution.status, ContributionStatus::InProgress);
			}

			// Code review by anthony (approved)
			{
				let contribution = contributions.pop().unwrap();
				assert_eq!(contribution.repo_id, repos::marketplace().id);
				assert_eq!(contribution.type_, ContributionType::CodeReview);
				assert_eq!(contribution.user_id, users::anthony().id);
				assert_eq!(
					contribution.details_id,
					GithubPullRequestId::from(1458220740u64).into()
				);
				assert_eq!(contribution.status, ContributionStatus::Complete);
			}
		}
		Ok(())
	}

	fn assert_marketplace_contributors_are_up_to_date_and_indexed(
		&mut self,
		cycle: i32,
	) -> Result<()> {
		let mut connection = self.context.database.client.connection()?;

		{
			let mut pending_contributors: Vec<models::ProjectsPendingContributor> =
				projects_pending_contributors::table.load(&mut *connection)?;
			assert_eq!(
				pending_contributors.len(),
				if cycle == 1 { 3 } else { 4 },
				"Invalid pending contributors count"
			);

			{
				let pending_contributor = pending_contributors.pop().unwrap();
				assert_eq!(pending_contributor.project_id, projects::project_id());
				assert_eq!(pending_contributor.github_user_id, users::anthony().id);
			}

			{
				let pending_contributor = pending_contributors.pop().unwrap();
				assert_eq!(pending_contributor.project_id, projects::project_id());
				assert_eq!(pending_contributor.github_user_id, users::alex().id);
			}

			if cycle == 2 {
				let pending_contributor = pending_contributors.pop().unwrap();
				assert_eq!(pending_contributor.project_id, projects::project_id());
				assert_eq!(pending_contributor.github_user_id, users::stan().id);
			}

			{
				let pending_contributor = pending_contributors.pop().unwrap();
				assert_eq!(pending_contributor.project_id, projects::project_id());
				assert_eq!(pending_contributor.github_user_id, users::ofux().id);
			}
		}

		{
			let mut contributors: Vec<models::ProjectsContributor> =
				projects_contributors::table.load(&mut *connection)?;
			assert_eq!(contributors.len(), 2, "Invalid contributors count");

			{
				let contributor = contributors.pop().unwrap();
				assert_eq!(contributor.project_id, projects::project_id());
				assert_eq!(contributor.github_user_id, users::anthony().id);
			}

			{
				let contributor = contributors.pop().unwrap();
				assert_eq!(contributor.project_id, projects::project_id());
				assert_eq!(contributor.github_user_id, users::ofux().id);
			}
		}
		Ok(())
	}
}

fn hash<T: Hash>(t: &T) -> u64 {
	let mut s = DefaultHasher::new();
	t.hash(&mut s);
	s.finish()
}
