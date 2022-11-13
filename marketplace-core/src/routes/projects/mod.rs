use crate::dto;
use marketplace_domain::*;
use marketplace_infrastructure::{database, github};

use http_api_problem::HttpApiProblem;
use rocket::{http::Status, post, serde::json::Json, State};
use rocket_okapi::openapi;
use std::{result::Result, sync::Arc};

use super::{api_key::ApiKey, to_http_api_problem::ToHttpApiProblem};

pub mod refresh;

#[openapi(tag = "Projects")]
#[post("/projects", format = "application/json", data = "<project>")]
pub async fn new_project(
	_api_key: ApiKey,
	project: Json<dto::ProjectCreation<'_>>,
	database: &State<Arc<database::Client>>,
	github: &State<Arc<github::Client>>,
) -> Result<Status, HttpApiProblem> {
	let project = github
		.get_project_by_owner_and_name(project.owner, project.name)
		.await
		.map_err(|e| e.to_http_api_problem())?;

	let owner = project.owner.expect("Invalid repo owner received from github API");
	let projection = ProjectProjection {
		id: *project.id,
		owner: owner.login,
		name: project.name,
		description: project.description,
		url: project.html_url,
		logo_url: Some(owner.avatar_url),
	};
	ProjectProjectionRepository::insert(database.as_ref(), projection)
		.map_err(|e| e.to_http_api_problem())?;

	Ok(Status::Accepted)
}
