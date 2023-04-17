use std::sync::Arc;

use ::infrastructure::{config, database};
use anyhow::Result;
use dotenv::dotenv;
use event_listeners::{
	presentation::{graphql, http, listeners},
	Config,
};
use futures::future::try_join_all;
use infrastructure::{github, graphql::Client as GraphQlClient, tracing::Tracer};
use tokio::task::JoinHandle;

#[tokio::main]
async fn main() -> Result<()> {
	dotenv().ok();
	let config: Config = config::load("backend/event-listeners/app.yaml")?;
	let _tracer = Tracer::init(config.tracer(), "event-queue-worker")?;

	let reqwest = reqwest::Client::new();
	let database = Arc::new(database::Client::new(database::init_pool(
		config.database(),
	)?));
	let github = Arc::<github::Client>::new(github::RoundRobinClient::new(config.github())?.into());
	let graphql = Arc::new(GraphQlClient::new(config.graphql())?);

	let mut handles = vec![spawn_web_server()?];
	handles.extend(listeners::spawn_all(&config, reqwest, database, github, graphql).await?);
	try_join_all(handles).await?;

	Ok(())
}

fn spawn_web_server() -> Result<JoinHandle<()>> {
	let web_server = http::server(http::port()?, graphql::Context::new);

	Ok(tokio::spawn(web_server))
}
