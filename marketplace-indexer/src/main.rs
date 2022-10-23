use anyhow::Result;
use dotenv::dotenv;
use marketplace_infrastructure::tracing::setup_tracing;

#[tokio::main]
async fn main() -> Result<()> {
	dotenv().ok();
	setup_tracing();

	marketplace_indexer::main().await
}
