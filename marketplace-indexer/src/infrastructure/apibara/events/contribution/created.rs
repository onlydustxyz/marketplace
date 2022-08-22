use super::{EventTranslator, FromEventError, StarknetTopics, Topics};
use marketplace_domain::{ContributionEvent, Event};
use starknet::core::{types::FieldElement, utils::get_selector_from_name};

pub struct Created;

impl EventTranslator for Created {
	fn selector() -> FieldElement {
		get_selector_from_name("ContributionCreated").unwrap()
	}

	fn to_domain_event(mut topics: Topics) -> Result<Event, FromEventError> {
		let project_id: u128 = topics.pop_front_as()?;
		let _contribution_id: u128 = topics.pop_front_as()?;
		let gate: u128 = topics.pop_front_as()?;

		Ok(Event::Contribution(ContributionEvent::Created {
			project_id: project_id.to_string(),
			gate: gate as u8,
		}))
	}
}

#[cfg(test)]
mod test {
	use super::*;
	use crate::infrastructure::apibara::proto::TopicValue;
	use rstest::*;

	#[fixture]
	fn apibara_event_data() -> Topics {
		vec![
			TopicValue {
				value: vec![
					0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					0, 0, 0, 0, 0, 12,
				],
			},
			TopicValue {
				value: vec![
					0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					0, 0, 0, 0, 0, 24,
				],
			},
			TopicValue {
				value: vec![
					0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
					0, 0, 0, 0, 0, 1,
				],
			},
		]
		.into()
	}

	#[rstest]
	fn selector() {
		assert_eq!(
			get_selector_from_name("ContributionCreated").unwrap(),
			<Created as EventTranslator>::selector()
		);
	}

	#[rstest]
	fn create_event_from_apibara(apibara_event_data: Topics) {
		let result = <Created as EventTranslator>::to_domain_event(apibara_event_data);
		assert!(result.is_ok(), "{}", result.err().unwrap());
		assert_eq!(
			Event::Contribution(ContributionEvent::Created {
				project_id: String::from("12"),
				gate: 1,
			},),
			result.unwrap()
		);
	}
}
