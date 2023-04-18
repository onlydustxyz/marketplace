mod logger;
use logger::Logger;

mod webhook;
use std::sync::Arc;

use anyhow::Result;
use domain::{Event, Subscriber, SubscriberCallbackError};
use infrastructure::{
	amqp::{ConsumableBus, UniqueMessage},
	database, event_bus, github,
};
use tokio::task::JoinHandle;
use webhook::EventWebHook;

use crate::{
	domain::*,
	infrastructure::database::{
		BudgetRepository, CrmGithubRepoRepository, GithubRepoDetailsRepository,
		GithubRepoIndexRepository, PaymentRepository, PaymentRequestRepository,
		ProjectGithubRepoDetailsRepository, ProjectLeadRepository, ProjectRepository,
		WorkItemRepository,
	},
	Config,
};

pub async fn spawn_all(
	config: &Config,
	reqwest: reqwest::Client,
	database: Arc<database::Client>,
	github: Arc<github::Client>,
) -> Result<Vec<JoinHandle<()>>> {
	let handles = [
		Logger.spawn(event_bus::consumer(config.amqp(), "logger").await?),
		EventWebHook::new(reqwest)
			.spawn(event_bus::consumer(config.amqp(), "event-webhooks").await?),
		ProjectProjector::new(
			ProjectRepository::new(database.clone()),
			ProjectLeadRepository::new(database.clone()),
			GithubRepoDetailsRepository::new(database.clone()),
			ProjectGithubRepoDetailsRepository::new(database.clone()),
			GithubRepoIndexRepository::new(database.clone()),
			github.clone(),
		)
		.spawn(event_bus::consumer(config.amqp(), "projects").await?),
		BudgetProjector::new(
			PaymentRequestRepository::new(database.clone()),
			PaymentRepository::new(database.clone()),
			BudgetRepository::new(database.clone()),
			WorkItemRepository::new(database.clone()),
		)
		.spawn(event_bus::consumer(config.amqp(), "budgets").await?),
		CrmProjector::new(CrmGithubRepoRepository::new(database.clone()), github)
			.spawn(event_bus::consumer(config.amqp(), "crm").await?),
	];

	Ok(handles.into())
}

trait Spawnable {
	fn spawn(self, bus: ConsumableBus) -> JoinHandle<()>;
}

impl<EL: EventListener + 'static> Spawnable for EL {
	fn spawn(self, bus: ConsumableBus) -> JoinHandle<()> {
		let listener = Arc::new(self);
		tokio::spawn(async move {
			bus.subscribe(|message: UniqueMessage<Event>| {
				notify_event_listener(listener.clone(), message.payload().clone())
			})
			.await
			.expect("Failed while trying to project received event");
		})
	}
}

async fn notify_event_listener(
	listener: Arc<dyn EventListener>,
	event: Event,
) -> Result<(), SubscriberCallbackError> {
	listener.on_event(&event).await.map_err(SubscriberCallbackError::from)
}
