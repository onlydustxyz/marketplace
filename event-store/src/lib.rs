pub mod bus;

mod domain;
mod infrastructure;

use anyhow::Result;
use backend_domain::{
	Destination, Event, Publisher, Subscriber, SubscriberCallbackError, UniqueMessage,
};
use backend_infrastructure::{
	amqp::Bus,
	database::{init_pool, Client as DatabaseClient},
	event_bus::EXCHANGE_NAME,
};
use domain::EventStore;
use futures::TryFutureExt;
use std::sync::Arc;
use tracing::info;

pub async fn main() -> Result<()> {
	let inbound_event_bus = bus::consumer().await?;
	let outbound_event_bus = Arc::new(Bus::default().await?);
	let database = Arc::new(DatabaseClient::new(init_pool()?));

	inbound_event_bus
		.subscribe(|event| {
			store(database.clone(), event)
				.and_then(|event| publish(event, outbound_event_bus.clone()))
		})
		.await?;

	Ok(())
}

async fn store(
	store: Arc<dyn EventStore>,
	message: UniqueMessage<Event>,
) -> Result<UniqueMessage<Event>, SubscriberCallbackError> {
	info!(message = message.to_string(), "📨 Received event");
	store
		.append(&message.payload().aggregate_id(), message.clone())
		.map_err(|e| SubscriberCallbackError::Fatal(e.into()))?;

	Ok(message)
}

async fn publish(
	message: UniqueMessage<Event>,
	publisher: Arc<dyn Publisher<Event>>,
) -> Result<(), SubscriberCallbackError> {
	publisher
		.publish(Destination::exchange(EXCHANGE_NAME), message.payload())
		.await
		.map_err(|e| SubscriberCallbackError::Fatal(e.into()))?;
	Ok(())
}

// TODO: remove once events are type safe
trait IdentifiableAggregate {
	fn aggregate_id(&self) -> String;
}

impl IdentifiableAggregate for Event {
	fn aggregate_id(&self) -> String {
		match &self {
			Event::Project(event) => match event {
				backend_domain::ProjectEvent::Created { id, .. }
				| backend_domain::ProjectEvent::LeaderAssigned { id, .. } => id.to_string(),
			},
			Event::Payment(event) => match event {
				backend_domain::PaymentEvent::Requested { id, .. }
				| backend_domain::PaymentEvent::Processed { id, .. } => id.to_string(),
			},
			Event::Budget(event) => match event {
				backend_domain::BudgetEvent::Allocated { id, .. } => id.to_string(),
			},
		}
	}
}
