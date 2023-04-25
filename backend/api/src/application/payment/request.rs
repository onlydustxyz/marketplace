use std::sync::Arc;

use anyhow::Result;
use chrono::Duration;
use derive_more::Constructor;
use domain::{
	AggregateRootRepository, Budget, DomainError, Event, EventSourcable, GithubUserId, Payment,
	PaymentId, PaymentReason, Project, ProjectId, Publisher, UserId,
};
use infrastructure::amqp::UniqueMessage;
use rusty_money::{crypto, Money};
use tracing::instrument;

use crate::domain::Publishable;

#[derive(Constructor)]
pub struct Usecase {
	event_publisher: Arc<dyn Publisher<UniqueMessage<Event>>>,
	project_repository: AggregateRootRepository<Project>,
}

impl Usecase {
	#[instrument(skip(self))]
	pub async fn request(
		&self,
		project_id: ProjectId,
		requestor_id: UserId,
		recipient_id: GithubUserId,
		amount_in_usd: u32,
		hours_worked: u32,
		reason: PaymentReason,
	) -> Result<(Project, Budget, Payment), DomainError> {
		let project = self.project_repository.find_by_id(&project_id)?;
		let new_payment_id = PaymentId::new();

		let events = project
			.request_payment(
				new_payment_id,
				requestor_id,
				recipient_id,
				Money::from_major(amount_in_usd as i64, crypto::USDC).into(),
				Duration::hours(hours_worked as i64),
				reason.clone(),
			)
			.await
			.map_err(|e| DomainError::InvalidInputs(e.into()))?;

		let project = project.apply_events(&events);
		let budget = project.budget().clone().unwrap();
		let payment = budget.payments().get(&new_payment_id).cloned().unwrap();

		events
			.into_iter()
			.map(Event::from)
			.map(UniqueMessage::new)
			.collect::<Vec<_>>()
			.publish(self.event_publisher.clone())
			.await?;

		Ok((project, budget, payment))
	}
}
