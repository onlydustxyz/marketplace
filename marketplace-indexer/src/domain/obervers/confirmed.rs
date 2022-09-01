use super::{ObservedEvent, Observer};
use async_trait::async_trait;
use std::{
	collections::VecDeque,
	sync::{Arc, RwLock, RwLockReadGuard, RwLockWriteGuard},
};

pub struct WithBockConfirmationCount {
	observer: Arc<dyn Observer>,
	confirmation_blocks_count: u64,
	events: RwLock<VecDeque<(ObservedEvent, u64)>>,
}

impl WithBockConfirmationCount {
	pub fn new(observer: Arc<dyn Observer>, confirmation_blocks_count: u64) -> Self {
		Self {
			observer,
			confirmation_blocks_count,
			events: RwLock::new(Default::default()),
		}
	}

	fn events_mut(&self) -> RwLockWriteGuard<'_, VecDeque<(ObservedEvent, u64)>> {
		self.events.write().expect("Could not acquire lock to push new events")
	}

	fn events(&self) -> RwLockReadGuard<'_, VecDeque<(ObservedEvent, u64)>> {
		self.events.read().expect("Could not acquire lock to fetch new events")
	}

	fn peek(&self) -> Option<(ObservedEvent, u64)> {
		self.events().back().map(|value| value.to_owned())
	}
}

#[async_trait]
impl Observer for WithBockConfirmationCount {
	async fn on_new_block(&self, _block_hash: &crate::domain::BlockHash, block_number: u64) {
		while let Some((_, event_block)) = self.peek() {
			if block_number >= event_block + self.confirmation_blocks_count {
				let (event, event_block) = self.events_mut().pop_back().unwrap();
				self.observer.on_new_event(&event, event_block).await;
			} else {
				return;
			}
		}
	}

	async fn on_new_event(&self, event: &ObservedEvent, block_number: u64) {
		self.events_mut().push_front((event.to_owned(), block_number));
	}
}

pub trait ConfirmedObserver {
	fn confirmed(self, confirmation_blocks_count: u64) -> Arc<WithBockConfirmationCount>;
}

impl<O: Observer + Sized + 'static> ConfirmedObserver for Arc<O> {
	fn confirmed(self, confirmation_blocks_count: u64) -> Arc<WithBockConfirmationCount> {
		Arc::new(WithBockConfirmationCount::new(
			self,
			confirmation_blocks_count,
		))
	}
}

#[cfg(test)]
mod test {
	use super::*;
	use crate::domain::MockBlockchainObserver;
	use marketplace_domain::{ContributionEvent, Event};
	use mockall::predicate::eq;
	use rstest::*;

	#[fixture]
	fn observer() -> MockBlockchainObserver {
		MockBlockchainObserver::new()
	}

	#[fixture]
	fn event() -> ObservedEvent {
		ObservedEvent {
			event: Event::Contribution(ContributionEvent::Validated {
				id: Default::default(),
			}),
			..Default::default()
		}
	}

	#[rstest]
	async fn should_call_observer_only_if_confirmed(
		event: ObservedEvent,
		mut observer: MockBlockchainObserver,
	) {
		observer
			.expect_on_new_event()
			.with(eq(event.clone()), eq(1))
			.times(1)
			.return_const(());

		let confirmed = WithBockConfirmationCount::new(Arc::new(observer), 3);
		confirmed.on_new_event(&event, 1).await;
		confirmed.on_new_block(&Default::default(), 4).await;
	}

	#[rstest]
	async fn should_call_observer_if_confirmed_and_block_missed(
		event: ObservedEvent,
		mut observer: MockBlockchainObserver,
	) {
		observer.expect_on_new_event().times(1).return_const(());

		let confirmed = WithBockConfirmationCount::new(Arc::new(observer), 3);
		confirmed.on_new_event(&event, 1).await;
		confirmed.on_new_block(&Default::default(), 42).await;
	}

	#[rstest]
	async fn should_call_observer_only_once(
		event: ObservedEvent,
		mut observer: MockBlockchainObserver,
	) {
		observer.expect_on_new_event().times(1).return_const(());

		let confirmed = WithBockConfirmationCount::new(Arc::new(observer), 3);
		confirmed.on_new_event(&event, 1).await;
		confirmed.on_new_block(&Default::default(), 4).await;
		confirmed.on_new_block(&Default::default(), 5).await;
		confirmed.on_new_block(&Default::default(), 6).await;
		confirmed.on_new_block(&Default::default(), 7).await;
	}

	#[rstest]
	async fn should_not_call_observer_before_confirmation(
		event: ObservedEvent,
		mut observer: MockBlockchainObserver,
	) {
		observer.expect_on_new_event().never();

		let confirmed = WithBockConfirmationCount::new(Arc::new(observer), 3);
		confirmed.on_new_event(&event, 1).await;
		confirmed.on_new_block(&Default::default(), 1).await;
		confirmed.on_new_block(&Default::default(), 2).await;
		confirmed.on_new_block(&Default::default(), 3).await;
	}
}
