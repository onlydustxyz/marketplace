use ::infrastructure::database::schema::*;
use chrono::NaiveDateTime;
use domain::GithubRepoId;
use serde::{Deserialize, Serialize};

#[allow(clippy::too_many_arguments)]
#[derive(
	Debug, Clone, Insertable, AsChangeset, Serialize, Deserialize, Queryable, Identifiable,
)]
pub struct GithubRepo {
	pub id: GithubRepoId,
	pub owner: String,
	pub name: String,
	pub updated_at: Option<NaiveDateTime>,
	pub description: String,
	pub stars: i32,
	pub fork_count: i32,
	pub html_url: String,
	pub languages: serde_json::Value,
}

impl domain::Entity for GithubRepo {
	type Id = GithubRepoId;
}
