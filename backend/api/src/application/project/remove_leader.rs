use std::sync::Arc;

use domain::{
	AggregateRepository, Destination, DomainError, Event, Project, ProjectId, Publisher, UserId,
};
use event_store::bus::QUEUE_NAME as EVENT_STORE_QUEUE;
use infrastructure::amqp::UniqueMessage;
use tracing::instrument;

pub struct Usecase {
	event_publisher: Arc<dyn Publisher<UniqueMessage<Event>>>,
	project_repository: AggregateRepository<Project>,
}

impl Usecase {
	pub fn new(
		event_publisher: Arc<dyn Publisher<UniqueMessage<Event>>>,
		project_repository: AggregateRepository<Project>,
	) -> Self {
		Self {
			event_publisher,
			project_repository,
		}
	}

	#[instrument(skip(self))]
	pub async fn remove_leader(
		&self,
		project_id: &ProjectId,
		user_id: &UserId,
	) -> Result<(), DomainError> {
		let project = self.project_repository.find_by_id(project_id)?;

		let events = project
			.unassign_leader(*user_id)
			.map_err(|e| DomainError::InvalidInputs(e.into()))?
			.into_iter()
			.map(Event::from)
			.map(UniqueMessage::new)
			.collect::<Vec<_>>();

		self.event_publisher
			.publish_many(Destination::queue(EVENT_STORE_QUEUE), &events)
			.await?;

		Ok(())
	}
}
