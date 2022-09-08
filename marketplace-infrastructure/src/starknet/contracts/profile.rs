use super::{ContractError, ContractViewer};
use crate::starknet::model::OnChainContributorId;
use marketplace_domain::*;
use starknet::core::types::FieldElement;

pub struct Contract {
	contract_viewer: ContractViewer,
}

fn profile_contract_address() -> FieldElement {
	let profile_contract_address =
		std::env::var("PROFILE_ADDRESS").expect("PROFILE_ADDRESS must be set");
	FieldElement::from_hex_be(&profile_contract_address).expect("Invalid value for PROFILE_ADDRESS")
}

impl Default for Contract {
	fn default() -> Self {
		Self {
			contract_viewer: ContractViewer::new(profile_contract_address()),
		}
	}
}

impl Contract {
	pub async fn get_account(
		&self,
		contributor_id: &ContributorId,
	) -> Result<FieldElement, ContractError> {
		let contributor_id: OnChainContributorId = contributor_id.clone().into();
		self.contract_viewer
			.call("ownerOf", vec![contributor_id.0, contributor_id.1])
			.await
			.map(|c| c[0])
	}
}
