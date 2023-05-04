use async_trait::async_trait;

mod error;
pub use error::{Error, IgnoreErrors, Result};

mod state;
pub use state::State;

use crate::domain::{GithubEvent, GithubRepoIndex, IndexerState};

#[async_trait]
pub trait Indexer: Send + Sync {
	async fn index(
		&self,
		repo_index: GithubRepoIndex,
	) -> Result<(Vec<GithubEvent>, Option<IndexerState>)>;
}
