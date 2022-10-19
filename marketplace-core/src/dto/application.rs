use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

use marketplace_domain as domain;

#[derive(Serialize, JsonSchema, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Application {
	pub contribution_id: String,
	pub contributor_account_address: String,
}

impl From<domain::ApplicationProjection> for Application {
	fn from(application: domain::ApplicationProjection) -> Self {
		Self {
			contribution_id: application.contribution_id().to_string(),
			contributor_account_address: application.contributor_account_address().to_string(),
		}
	}
}
