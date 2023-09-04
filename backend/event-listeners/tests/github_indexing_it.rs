use std::{
	collections::hash_map::DefaultHasher,
	hash::{Hash, Hasher},
};

use anyhow::Result;
use diesel::{ExpressionMethods, QueryDsl, RunQueryDsl};
use domain::{
	GithubCodeReview, GithubCodeReviewStatus, GithubCommit, GithubIssueId, GithubPullRequest,
	GithubPullRequestId, GithubPullRequestStatus, GithubRepo, GithubUser,
};
use event_listeners::models::{self, GithubRepoIndex, ProjectGithubRepo};
use fixtures::{users::anthony, *};
use infrastructure::database::{
	enums::{self, ContributionStatus, ContributionType},
	schema::{
		contributions, github_issues, github_pull_request_commits, github_pull_request_indexes,
		github_pull_request_reviews, github_pull_requests, projects_contributors,
		projects_pending_contributors,
	},
	ImmutableRepository,
};
use olog::info;
use rstest::rstest;
use serde_json::json;
use testcontainers::clients::Cli;

use crate::{
	context::{docker, github_indexer::Context},
	fixtures::repos::marketplace,
};

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
		repos::assert_is_indexed(&mut self.context, repos::marketplace())?;
		self.assert_marketplace_issues_are_indexed()?;
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
				assert_eq!(state.pull_request_id, pr_1144().id);
				assert_eq!(
					state.pull_request_indexer_state,
					Some(
						json!({"base_sha": pr_1144().base_sha, "head_sha": pr_1144().head_sha, "hash": hash(&pr_1144())})
					)
				);
			}
			{
				let state = states.pop().unwrap();
				assert_eq!(state.pull_request_id, pr_1146().id);
				assert_eq!(
					state.pull_request_indexer_state,
					Some(
						json!({"base_sha": pr_1146().base_sha, "head_sha": pr_1146().head_sha, "hash": hash(&pr_1146())})
					)
				);
			}
			{
				let state = states.pop().unwrap();
				assert_eq!(state.pull_request_id, pr_1152().id);
				assert_eq!(
					state.pull_request_indexer_state,
					Some(
						json!({"base_sha": pr_1152().base_sha, "head_sha": pr_1152().head_sha, "hash": hash(&pr_1152())})
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
		repos::assert_is_indexed(&mut self.context, marketplace())?;
		self.assert_marketplace_issues_are_indexed()?;
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
				assert_eq!(state.pull_request_id, pr_1144().id);
				assert_eq!(
					state.pull_request_indexer_state,
					Some(
						json!({"base_sha": pr_1144().base_sha, "head_sha": pr_1144().head_sha, "hash": hash(&pr_1144())})
					)
				);
			}
			{
				let state = states.pop().unwrap();
				assert_eq!(state.pull_request_id, pr_1146().id);
				assert_eq!(
					state.pull_request_indexer_state,
					Some(
						json!({"base_sha": pr_1146().base_sha, "head_sha": pr_1146().head_sha, "hash": hash(&pr_1146())})
					)
				);
			}
			{
				let state = states.pop().unwrap();
				assert_eq!(state.pull_request_id, pr_1152_updated().id);
				assert_eq!(
					state.pull_request_indexer_state,
					Some(
						json!({"base_sha": pr_1152_updated().base_sha, "head_sha": pr_1152_updated().head_sha, "hash": hash(&pr_1152_updated())})
					)
				);
			}
		}

		Ok(())
	}

	fn assert_marketplace_issues_are_indexed(&mut self) -> Result<()> {
		let mut connection = self.context.database.client.connection()?;
		{
			let mut issues: Vec<models::GithubIssue> =
				github_issues::table.load(&mut *connection)?;
			assert_eq!(issues.len(), 3, "Invalid issue count");

			{
				let issue = issues.pop().unwrap();
				assert_eq!(issue.id, 1763108414u64.into());
				assert_eq!(issue.repo_id, repos::marketplace().id);
				assert_eq!(issue.number, 1061u64.into());
				assert_eq!(issue.title, "A completed issue");
				assert_eq!(issue.status, enums::GithubIssueStatus::Completed);
				assert_eq!(
					issue.html_url,
					"https://github.com/onlydustxyz/marketplace/issues/1061"
				);
				assert_eq!(issue.created_at, "2023-06-19T09:16:20".parse().unwrap());
				assert_eq!(issue.closed_at, "2023-07-31T07:49:13".parse().ok());
				assert_eq!(issue.author_id, users::od_develop().id);
				assert_eq!(issue.assignee_ids.0, vec![users::ofux().id]);
				assert_eq!(issue.comments_count, 0);
			}

			{
				let issue = issues.pop().unwrap();
				assert_eq!(issue.id, 1822333508u64.into());
				assert_eq!(issue.repo_id, repos::marketplace().id);
				assert_eq!(issue.number, 1141u64.into());
				assert_eq!(issue.title, "A cancelled issue");
				assert_eq!(issue.status, enums::GithubIssueStatus::Cancelled);
				assert_eq!(
					issue.html_url,
					"https://github.com/onlydustxyz/marketplace/issues/1141"
				);
				assert_eq!(issue.created_at, "2023-07-26T12:39:59".parse().unwrap());
				assert_eq!(issue.closed_at, "2023-07-27T15:43:37".parse().ok());
				assert_eq!(issue.author_id, users::anthony().id);
				assert_eq!(issue.assignee_ids.0, vec![]);
				assert_eq!(issue.comments_count, 2);
			}

			{
				let issue = issues.pop().unwrap();
				assert_eq!(issue.id, 1828603947u64.into());
				assert_eq!(issue.repo_id, repos::marketplace().id);
				assert_eq!(issue.number, 1145u64.into());
				assert_eq!(issue.title, "Some issue to be resolved");
				assert_eq!(issue.status, enums::GithubIssueStatus::Open);
				assert_eq!(
					issue.html_url,
					"https://github.com/onlydustxyz/marketplace/issues/1145"
				);
				assert_eq!(issue.created_at, "2023-07-31T07:46:18".parse().unwrap());
				assert_eq!(issue.closed_at, None);
				assert_eq!(issue.author_id, users::anthony().id);
				assert_eq!(issue.assignee_ids.0, vec![]);
				assert_eq!(issue.comments_count, 0);
			}
		}

		Ok(())
	}

	#[track_caller]
	fn assert_pull_request(
		&self,
		pull_request: models::github_pull_requests::Inner,
		expected: GithubPullRequest,
	) {
		assert_eq!(pull_request.id, expected.id);
		assert_eq!(pull_request.repo_id, repos::marketplace().id);
		assert_eq!(pull_request.number, expected.number);
		assert_eq!(pull_request.created_at, expected.created_at.naive_utc());
		assert_eq!(pull_request.author_id, expected.author.id);
		assert_eq!(
			pull_request.merged_at,
			expected.merged_at.map(|d| d.naive_utc())
		);
		assert_eq!(pull_request.status, expected.status.into());
		assert_eq!(pull_request.title, expected.title);
		assert_eq!(pull_request.html_url, expected.html_url.to_string());
		assert_eq!(
			pull_request.closed_at,
			expected.closed_at.map(|d| d.naive_utc())
		);
		assert_eq!(pull_request.draft, expected.draft);
	}

	#[track_caller]
	fn assert_review(
		&self,
		review: models::github_pull_requests::Review,
		expected: GithubCodeReview,
		expected_pull_request_id: &GithubPullRequestId,
	) {
		assert_eq!(review.pull_request_id, *expected_pull_request_id);
		assert_eq!(review.reviewer_id, expected.reviewer.id);
		assert_eq!(review.status, expected.status.into());
		assert_eq!(review.outcome, expected.outcome.map(|o| o.into()));
		assert_eq!(
			review.submitted_at,
			expected.submitted_at.map(|d| d.naive_utc())
		);
	}

	#[track_caller]
	fn assert_commit(
		&self,
		commit: models::github_pull_requests::Commit,
		expected: GithubCommit,
		expected_pull_request_id: &GithubPullRequestId,
	) {
		assert_eq!(commit.pull_request_id, *expected_pull_request_id);
		assert_eq!(commit.sha, expected.sha);
		assert_eq!(commit.author_id, expected.author.id);
		assert_eq!(commit.html_url, expected.html_url.to_string());
	}

	fn assert_marketplace_pulls_are_indexed_cycle_1(&mut self) -> Result<()> {
		let mut connection = self.context.database.client.connection()?;

		let mut pull_requests: Vec<models::github_pull_requests::Inner> =
			github_pull_requests::table
				.order(github_pull_requests::dsl::number.desc())
				.load(&mut *connection)?;
		assert_eq!(pull_requests.len(), 3, "Invalid pull requests count");

		{
			self.assert_pull_request(pull_requests.pop().unwrap(), pr_1144());
			self.assert_pull_request(pull_requests.pop().unwrap(), pr_1146());
			self.assert_pull_request(pull_requests.pop().unwrap(), pr_1152());
		}

		{
			let mut commits: Vec<models::github_pull_requests::Commit> =
				github_pull_request_commits::table
					.order((
						github_pull_request_commits::dsl::pull_request_id.desc(),
						github_pull_request_commits::dsl::sha.asc(),
					))
					.load(&mut *connection)?;
			assert_eq!(commits.len(), 7, "Invalid commits count");

			{
				self.assert_commit(commits.pop().unwrap(), commits::g(), &pr_1144().id);
				self.assert_commit(commits.pop().unwrap(), commits::f(), &pr_1144().id);

				self.assert_commit(commits.pop().unwrap(), commits::e(), &pr_1146().id);
				self.assert_commit(commits.pop().unwrap(), commits::d(), &pr_1146().id);
				self.assert_commit(commits.pop().unwrap(), commits::c(), &pr_1146().id);

				self.assert_commit(commits.pop().unwrap(), commits::a(), &pr_1152().id);
				self.assert_commit(commits.pop().unwrap(), commits::b(), &pr_1152().id);
			}
		}

		{
			let mut reviews: Vec<models::github_pull_requests::Review> =
				github_pull_request_reviews::table
					.order((
						github_pull_request_reviews::dsl::pull_request_id.desc(),
						github_pull_request_reviews::dsl::status.desc(),
						github_pull_request_reviews::dsl::reviewer_id.desc(),
					))
					.load(&mut *connection)?;
			assert_eq!(reviews.len(), 5, "Invalid reviews count");

			// Reviews requested
			self.assert_review(
				reviews.pop().unwrap(),
				reviews::requested(GithubCodeReviewStatus::Pending),
				&pr_1144().id,
			);
			self.assert_review(
				reviews.pop().unwrap(),
				reviews::requested(GithubCodeReviewStatus::Pending),
				&pr_1146().id,
			);

			// Actual reviews
			self.assert_review(
				reviews.pop().unwrap(),
				reviews::change_requested(GithubCodeReviewStatus::Pending),
				&pr_1152().id,
			);
			self.assert_review(
				reviews.pop().unwrap(),
				reviews::commented(GithubCodeReviewStatus::Pending),
				&pr_1152().id,
			);
			self.assert_review(
				reviews.pop().unwrap(),
				reviews::approved(GithubCodeReviewStatus::Completed),
				&pr_1152().id,
			);
		}

		Ok(())
	}

	fn assert_marketplace_pulls_are_indexed_cycle_2(&mut self) -> Result<()> {
		let mut connection = self.context.database.client.connection()?;

		let mut pull_requests: Vec<models::github_pull_requests::Inner> =
			github_pull_requests::table
				.order(github_pull_requests::dsl::number.desc())
				.load(&mut *connection)?;
		assert_eq!(pull_requests.len(), 3, "Invalid pull requests count");

		{
			self.assert_pull_request(pull_requests.pop().unwrap(), pr_1144());
			self.assert_pull_request(pull_requests.pop().unwrap(), pr_1146());
			self.assert_pull_request(pull_requests.pop().unwrap(), pr_1152_updated());
		}

		{
			let mut commits: Vec<models::github_pull_requests::Commit> =
				github_pull_request_commits::table
					.order((
						github_pull_request_commits::dsl::pull_request_id.desc(),
						github_pull_request_commits::dsl::sha.asc(),
					))
					.load(&mut *connection)?;
			assert_eq!(commits.len(), 8, "Invalid commits count");

			{
				self.assert_commit(commits.pop().unwrap(), commits::g(), &pr_1144().id);
				self.assert_commit(commits.pop().unwrap(), commits::f(), &pr_1144().id);

				self.assert_commit(commits.pop().unwrap(), commits::e(), &pr_1146().id);
				self.assert_commit(commits.pop().unwrap(), commits::d(), &pr_1146().id);
				self.assert_commit(commits.pop().unwrap(), commits::c(), &pr_1146().id);

				self.assert_commit(commits.pop().unwrap(), commits::a(), &pr_1152().id);
				self.assert_commit(commits.pop().unwrap(), commits::b(), &pr_1152().id);
				self.assert_commit(commits.pop().unwrap(), commits::h(), &pr_1152().id);
			}
		}

		{
			let mut reviews: Vec<models::github_pull_requests::Review> =
				github_pull_request_reviews::table
					.order((
						github_pull_request_reviews::dsl::pull_request_id.desc(),
						github_pull_request_reviews::dsl::status.desc(),
						github_pull_request_reviews::dsl::reviewer_id.desc(),
					))
					.load(&mut *connection)?;
			assert_eq!(reviews.len(), 5, "Invalid reviews count");

			// Reviews requested
			self.assert_review(
				reviews.pop().unwrap(),
				reviews::requested(GithubCodeReviewStatus::Pending),
				&pr_1144().id,
			);
			self.assert_review(
				reviews.pop().unwrap(),
				reviews::requested(GithubCodeReviewStatus::Pending),
				&pr_1146().id,
			);
			// Actual reviews
			self.assert_review(
				reviews.pop().unwrap(),
				reviews::change_requested(GithubCodeReviewStatus::Pending),
				&pr_1152().id,
			);
			self.assert_review(
				reviews.pop().unwrap(),
				reviews::commented(GithubCodeReviewStatus::Pending),
				&pr_1152().id,
			);
			self.assert_review(
				reviews.pop().unwrap(),
				reviews::approved(GithubCodeReviewStatus::Completed),
				&pr_1152().id,
			);
		}

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

fn pr_1144() -> GithubPullRequest {
	GithubPullRequest {
		id: 1452363285u64.into(),
		repo_id: repos::marketplace().id,
		number: 1144u64.into(),
		title: String::from("Improve impersonation"),
		status: GithubPullRequestStatus::Closed,
		html_url: "https://github.com/onlydustxyz/marketplace/pull/1144".parse().unwrap(),
		created_at: "2023-07-27T16:46:00Z".parse().unwrap(),
		updated_at: "2023-07-28T08:34:54Z".parse().unwrap(),
		closed_at: "2023-07-28T08:34:53Z".parse().ok(),
		author: users::ofux(),
		merged_at: None,
		draft: false,
		head_sha: String::from("1c20736f7cd8ebab4d915661c57fc8a987626f9b"),
		head_repo: Some(repos::marketplace()),
		base_sha: String::from("3fb55612f69b5352997b4aeafdeea958c564074f"),
		base_repo: repos::marketplace(),
		requested_reviewers: vec![anthony()],
	}
}

fn pr_1146() -> GithubPullRequest {
	GithubPullRequest {
		id: 1455874031u64.into(),
		repo_id: repos::marketplace().id,
		number: 1146u64.into(),
		title: String::from("Hide tooltips on mobile"),
		status: GithubPullRequestStatus::Merged,
		html_url: "https://github.com/onlydustxyz/marketplace/pull/1146".parse().unwrap(),
		created_at: "2023-07-31T09:23:37Z".parse().unwrap(),
		updated_at: "2023-07-31T09:32:08Z".parse().unwrap(),
		closed_at: "2023-07-31T09:32:08Z".parse().ok(),
		author: users::alex(),
		merged_at: "2023-07-31T09:32:08Z".parse().ok(),
		draft: false,
		head_sha: String::from("559e878ff141f16885f2372456dffdb2cb223843"),
		head_repo: Some(repos::marketplace()),
		base_sha: String::from("979a35c6fe75aa304d1ad5a4b7d222ecfd308dc3"),
		base_repo: repos::marketplace(),
		requested_reviewers: vec![anthony()],
	}
}

fn pr_1152() -> GithubPullRequest {
	GithubPullRequest {
		id: 1458220740u64.into(),
		repo_id: repos::marketplace().id,
		number: 1152u64.into(),
		title: String::from("[E-642] Index extra fields in github pull requests"),
		status: GithubPullRequestStatus::Open,
		html_url: "https://github.com/onlydustxyz/marketplace/pull/1152".parse().unwrap(),
		created_at: "2023-08-01T14:26:33Z".parse().unwrap(),
		updated_at: "2023-08-01T14:26:41Z".parse().unwrap(),
		closed_at: None,
		author: GithubUser {
			id: 43467246u64.into(),
			login: String::from("AnthonyBuisset"),
			avatar_url: "https://avatars.githubusercontent.com/u/43467246?v=4".parse().unwrap(),
			html_url: "https://github.com/AnthonyBuisset".parse().unwrap(),
		},
		merged_at: None,
		draft: true,
		head_sha: String::from("7cf6b6e5631a6f462d17cc0ef175e23b8efa9f00"),
		head_repo: Some(GithubRepo {
			parent: None,
			..repos::marketplace_fork()
		}),
		base_sha: String::from("fad8ea5cd98b89367fdf80b09d8796b093d2dac8"),
		base_repo: repos::marketplace(),
		requested_reviewers: vec![],
	}
}

fn pr_1152_updated() -> GithubPullRequest {
	GithubPullRequest {
		id: 1458220740u64.into(),
		repo_id: repos::marketplace().id,
		number: 1152u64.into(),
		title: String::from("[E-642] Index extra fields in github pull requests 2"),
		status: GithubPullRequestStatus::Open,
		html_url: "https://github.com/onlydustxyz/marketplace/pull/1152".parse().unwrap(),
		created_at: "2023-08-01T14:26:33Z".parse().unwrap(),
		updated_at: "2023-08-02T14:26:41Z".parse().unwrap(),
		closed_at: None,
		author: GithubUser {
			id: 43467246u64.into(),
			login: String::from("AnthonyBuisset"),
			avatar_url: "https://avatars.githubusercontent.com/u/43467246?v=4".parse().unwrap(),
			html_url: "https://github.com/AnthonyBuisset".parse().unwrap(),
		},
		merged_at: None,
		draft: true,
		head_sha: String::from("9999b6e5631a6f462d17cc0ef175e23b8efa9999"),
		head_repo: Some(GithubRepo {
			parent: None,
			..repos::marketplace_fork()
		}),
		base_sha: String::from("fad8ea5cd98b89367fdf80b09d8796b093d2dac8"),
		base_repo: repos::marketplace(),
		requested_reviewers: vec![],
	}
}

fn hash<T: Hash>(t: &T) -> u64 {
	let mut s = DefaultHasher::new();
	t.hash(&mut s);
	s.finish()
}
