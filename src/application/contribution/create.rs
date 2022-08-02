use crate::domain::*;
use mockall::automock;
use std::sync::Arc;

#[automock]
pub trait Usecase: Send + Sync {
	fn send_creation_request(&self, contribution: Contribution) -> AnyResult<()>;
}

pub struct CreateContribution {
	contribution_service: Arc<dyn ContributionService>,
}

impl CreateContribution {
	pub fn new_usecase(contribution_service: Arc<dyn ContributionService>) -> Box<dyn Usecase> {
		Box::new(Self {
			contribution_service,
		})
	}
}

impl Usecase for CreateContribution {
	fn send_creation_request(&self, contribution: Contribution) -> AnyResult<()> {
		self.contribution_service.create(contribution)
	}
}

#[cfg(test)]
mod test {
	use super::*;
	use mockall::predicate::*;
	use starknet::core::types::FieldElement;
	use uuid::Uuid;

	#[test]
	fn forward_request() {
		let mut contribution_service = MockContributionService::new();

		let contribution = Contribution {
			id: Uuid::from_u128(12),
			onchain_id: String::from("12"),
			project_id: String::from("34"),
			contributor_id: None,
			title: None,
			description: None,
			status: ContributionStatus::Open,
			external_link: None,
			gate: 0,
			metadata: ContributionMetadata {
				difficulty: None,
				technology: None,
				duration: None,
				context: None,
				r#type: None,
			},
			validator: FieldElement::ZERO,
		};

		contribution_service
			.expect_create()
			.with(eq(contribution.clone()))
			.returning(|_| Ok(()));

		let usecase = CreateContribution::new_usecase(Arc::new(contribution_service));

		let result = usecase.send_creation_request(contribution);
		assert!(result.is_ok(), "{:?}", result.err().unwrap());
	}

	#[test]
	fn forward_request_error() {
		let mut contribution_service = MockContributionService::new();

		let contribution = Contribution {
			id: Uuid::from_u128(12),
			onchain_id: String::from("12"),
			project_id: String::from("34"),
			contributor_id: None,
			title: None,
			description: None,
			status: ContributionStatus::Open,
			external_link: None,
			gate: 0,
			metadata: ContributionMetadata {
				difficulty: None,
				technology: None,
				duration: None,
				context: None,
				r#type: None,
			},
			validator: FieldElement::ZERO,
		};

		contribution_service
			.expect_create()
			.returning(|_| Err(Error::TransactionRevertedError(String::new())));

		let usecase = CreateContribution::new_usecase(Arc::new(contribution_service));

		let result = usecase.send_creation_request(contribution);
		assert!(result.is_err());
		assert_eq!(
			Error::TransactionRevertedError(String::new()),
			result.unwrap_err(),
		);
	}
}
