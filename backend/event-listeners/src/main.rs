use std::sync::Arc;

use anyhow::Result;
use dotenv::dotenv;
use event_listeners::{listeners, Config};
use futures::future::try_join_all;
use infrastructure::{config, database, github, tracing::Tracer};

#[tokio::main]
async fn main() -> Result<()> {
	dotenv().ok();
	let config: Config = config::load("backend/event-listeners/app.yaml")?;
	let _tracer = Tracer::init(config.tracer.clone(), "event-queue-worker")?;

	let reqwest = reqwest::Client::new();
	let database = Arc::new(database::Client::new(database::init_pool(
		config.database.clone(),
	)?));
	let github =
		Arc::<github::Client>::new(github::RoundRobinClient::new(config.github.clone())?.into());

	try_join_all(listeners::spawn_all(config, reqwest, database, github).await?).await?;

	Ok(())
}
