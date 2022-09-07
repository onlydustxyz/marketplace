use crate::database::{
	models,
	schema::{event_deduplications, events},
	Client,
};
use diesel::prelude::*;
use log::error;
use marketplace_domain::*;
use serde_json::Value;

use crate::database::schema::events::index;

trait NamedAggregate: Aggregate {
	fn name() -> String;
}

impl NamedAggregate for Contribution {
	fn name() -> String {
		return String::from("CONTRIBUTION");
	}
}

impl NamedAggregate for ProjectAggregate {
	fn name() -> String {
		return String::from("PROJECT");
	}
}

impl<A: NamedAggregate> EventStore<A> for Client {
	fn append(
		&self,
		aggregate_id: &A::Id,
		storable_events: Vec<StorableEvent<A>>,
	) -> Result<(), EventStoreError> {
		let connection = self.connection().map_err(|e| {
			error!("Failed to connect to database: {e}");
			EventStoreError::Connection(e.into())
		})?;

		let events = storable_events
			.iter()
			.map(|event| {
				Ok(models::Event {
					aggregate_name: A::name(),
					aggregate_id: aggregate_id.to_string(),
					payload: serde_json::to_value(&event.event).map_err(|e| {
						error!("Failed to serialize event {:?}: {e}", &event.event);
						EventStoreError::InvalidEvent(e.into())
					})?,
				})
			})
			.collect::<Result<Vec<_>, EventStoreError>>()?;

		connection
			.transaction(|| {
				let inserted_events: Vec<i32> = diesel::insert_into(events::table)
					.values(&events)
					.returning(index)
					.get_results(&*connection)?;

				assert_eq!(
					inserted_events.len(),
					storable_events.len(),
					"list of inserted events and storable events should never have different lengths"
				);

				let deduplications = storable_events
					.iter()
					.zip(inserted_events)
					.map(|event| models::EventDeduplication {
						deduplication_id: event.0.deduplication_id.to_owned(),
						event_index: event.1,
					})
					.collect::<Vec<_>>();

				diesel::insert_into(event_deduplications::table)
					.values(&deduplications)
					.execute(&*connection)
			})
			.map_err(|e| {
				error!("Failed to insert event(s) into database: {e}");
				EventStoreError::Append(e.into())
			})?;

		Ok(())
	}

	fn list_by_id(&self, aggregate_id: &A::Id) -> Result<Vec<A::Event>, EventStoreError> {
		let connection = self.connection().map_err(|e| {
			error!("Failed to connect to database: {e}");
			EventStoreError::Connection(e.into())
		})?;

		let events = events::dsl::events
			.select(events::payload)
			.filter(events::aggregate_id.eq(aggregate_id.to_string()))
			.filter(events::aggregate_name.eq_all(A::name()))
			.order_by(events::index)
			.load::<Value>(&*connection)
			.map_err(|e| {
				error!(
					"Failed to retrieve {} events of aggregate {aggregate_id} from database: {e}",
					A::name()
				);
				EventStoreError::List(e.into())
			})?;

		deserialize_events::<A>(events)
	}

	fn list(&self) -> Result<Vec<A::Event>, EventStoreError> {
		let connection = self.connection().map_err(|e| {
			error!("Failed to connect to database: {e}");
			EventStoreError::Connection(e.into())
		})?;

		let events = events::dsl::events
			.select(events::payload)
			.filter(events::aggregate_name.eq_all(A::name()))
			.order_by(events::index)
			.load::<Value>(&*connection)
			.map_err(|e| {
				error!("Failed to retrieve {} events from database: {e}", A::name());
				EventStoreError::List(e.into())
			})?;

		deserialize_events::<A>(events)
	}
}

fn deserialize_events<A: Aggregate>(
	serialized_events: Vec<Value>,
) -> Result<Vec<A::Event>, EventStoreError> {
	serialized_events
		.iter()
		.map(|event_value| {
			serde_json::from_value::<A::Event>(event_value.to_owned()).map_err(|e| {
				error!("Failed to deserialize event {event_value}: {e}");
				e
			})
		})
		.collect::<Result<Vec<_>, _>>()
		.map_err(|e| EventStoreError::List(e.into()))
}
