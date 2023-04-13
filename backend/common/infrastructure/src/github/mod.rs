use std::collections::HashMap;

use domain::PositiveCount;
use octocrab::OctocrabBuilder;
use serde::Deserialize;

mod contributors;
pub use contributors::Contributors;

mod clients;
pub use clients::{Client, RoundRobinClient, SingleClient};

mod error;
pub use error::Error;

mod logged_response;
pub use logged_response::DebugTechnicalHeaders;

mod issue;
pub use issue::IssueFromOctocrab;

mod service;

mod user;
pub use user::UserFromOctocrab;

mod repo;
pub use repo::RepoFromOctocrab;

#[derive(Deserialize, Clone, Default)]
pub struct Config {
	base_url: String,
	personal_access_tokens: String,
	#[serde(default)]
	headers: HashMap<String, String>,
	max_calls_per_request: Option<PositiveCount>,
}

trait AddHeaders: Sized {
	fn add_headers(self, headers: &HashMap<String, String>) -> anyhow::Result<Self>;
}

impl AddHeaders for OctocrabBuilder {
	fn add_headers(mut self, headers: &HashMap<String, String>) -> anyhow::Result<Self> {
		for (key, value) in headers {
			self = self.add_header(key.parse()?, value.clone());
		}
		Ok(self)
	}
}
