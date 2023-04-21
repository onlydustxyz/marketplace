use derive_getters::Getters;
use derive_new::new;
use juniper::GraphQLInputObject;
use serde::{Deserialize, Serialize};

use crate::{GithubIssueNumber, GithubRepoId};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, GraphQLInputObject, Getters, new)]
pub struct WorkItem {
	repo_id: GithubRepoId,
	issue_number: GithubIssueNumber,
}

#[derive(
	Debug, Default, Clone, PartialEq, Eq, Serialize, Deserialize, GraphQLInputObject, Getters,
)]
pub struct Reason {
	work_items: Vec<WorkItem>,
}
