use chrono::{DateTime, Utc};
use http_api_problem::HttpApiProblem;
use reqwest::StatusCode;
use rocket::{serde::json::Json, State};
use serde::{Deserialize, Serialize};
use url::Url;
use uuid::Uuid;

use common_domain::{AggregateRootRepository, GithubIssue, GithubIssueStatus, GithubUser, Project};
use presentation::http::guards::{Claims, Role};

use crate::application;
use crate::domain::permissions::IntoPermission;

#[derive(Debug, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Request {
	project_id: Uuid,
	github_repo_id: i32,
	title: String,
	description: String,
}

#[derive(Debug, Serialize)]
pub struct Response {
	pub id: i64,
	pub repo_id: i64,
	pub number: i64,
	pub title: String,
	pub author: UserResponse,
	pub html_url: Url,
	pub status: Status,
	pub created_at: DateTime<Utc>,
	pub updated_at: DateTime<Utc>,
	pub closed_at: Option<DateTime<Utc>>,
	pub assignees: Vec<UserResponse>,
	pub comments_count: i64,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
	pub id: i64,
	pub login: String,
	pub avatar_url: Url,
	pub html_url: Url,
}

#[derive(Debug, Serialize)]
pub enum Status {
	Open,
	Completed,
	Cancelled,
}

impl From<GithubUser> for UserResponse {
	fn from(github_user: GithubUser) -> Self {
		Self {
			login: github_user.login,
			avatar_url: github_user.avatar_url,
			html_url: github_user.html_url,
			id: github_user.id.into(),
		}
	}
}

impl From<GithubIssue> for Response {
	fn from(github_issue: GithubIssue) -> Self {
		Self {
			id: github_issue.id.into(),
			repo_id: github_issue.repo_id.into(),
			number: github_issue.number.into(),
			title: github_issue.title,
			author: UserResponse::from(github_issue.author),
			html_url: github_issue.html_url,
			status: Status::from(github_issue.status),
			created_at: github_issue.created_at,
			updated_at: github_issue.updated_at,
			closed_at: github_issue.closed_at,
			comments_count: github_issue.comments_count as i64,
			assignees: github_issue.assignees.into_iter().map(Into::into).collect(),
		}
	}
}

impl From<GithubIssueStatus> for Status {
	fn from(github_issue_status: GithubIssueStatus) -> Self {
		match github_issue_status {
			GithubIssueStatus::Cancelled => Status::Cancelled,
			GithubIssueStatus::Open => Status::Open,
			GithubIssueStatus::Completed => Status::Completed
		}
	}
}


#[post("/api/issues", data = "<request>", format = "application/json")]
pub async fn create_and_close_issue(
	claims: Claims,
	role: Role,
	request: Json<Request>,
	create_github_issue_usecase: &State<application::github::create_issue::Usecase>,
	project_repository: &State<AggregateRootRepository<Project>>,
) -> Result<Json<Response>, HttpApiProblem> {
	let caller_id = claims.user_id;

	if !role.to_permissions((*project_repository).clone())
		.can_create_github_issue_for_project(&request.project_id.into())
	{
		return Err(HttpApiProblem::new(StatusCode::UNAUTHORIZED)
			.title("Unauthorized operation on issue")
			.detail(format!("User {} needs project lead role to create an issue on project {}", caller_id, &request.project_id.to_string())));
	}

	let issue = create_github_issue_usecase
		.create_and_close_issue(
			&request.project_id.into(),
			(request.github_repo_id as i64).into(),
			request.title.to_string(),
			request.description.to_string(),
		)
		.await
		.map_err(|e| {
			HttpApiProblem::new(StatusCode::INTERNAL_SERVER_ERROR)
				.title("Internal server error while creating and closing issue")
				.detail(e.to_string())
		})?;
	Ok(Json(issue.into()))
}

