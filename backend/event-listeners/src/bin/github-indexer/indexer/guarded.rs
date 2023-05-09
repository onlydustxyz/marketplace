use std::future::Future;

use async_trait::async_trait;
use domain::GithubRepoId;
use event_listeners::domain::GithubEvent;

use super::Result;

pub struct Indexer<I: super::Indexer, Fut: Future<Output = bool>, F: Fn() -> Fut> {
	indexer: I,
	guard: F,
}

#[async_trait]
impl<I: super::Indexer, Fut: Future<Output = bool> + Send, F: Fn() -> Fut + Send + Sync>
	super::Indexer for Indexer<I, Fut, F>
{
	async fn index(&self, repo_id: GithubRepoId) -> Result<Vec<GithubEvent>> {
		if (self.guard)().await {
			self.indexer.index(repo_id).await
		} else {
			Ok(vec![])
		}
	}
}

pub trait Guarded<I: super::Indexer> {
	fn guarded<Fut: Future<Output = bool>, F: Fn() -> Fut>(self, guard: F) -> Indexer<I, Fut, F>;
}

impl<I: super::Indexer> Guarded<I> for I {
	fn guarded<Fut: Future<Output = bool>, F: Fn() -> Fut>(self, guard: F) -> Indexer<I, Fut, F> {
		Indexer {
			indexer: self,
			guard,
		}
	}
}
