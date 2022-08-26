use super::{ContractAdministrator, ContractError};
use crate::starknet::model::OnChainContributorId;
use itertools::Itertools;
use marketplace_domain::*;
use starknet::{
	accounts::{Account, Call},
	core::{types::FieldElement, utils::get_selector_from_name},
};
use std::sync::Arc;

pub struct Contract<A: Account + Sync> {
	administrator: ContractAdministrator<A>,
}

fn contributions_contract_address() -> FieldElement {
	let contributions_contract_address =
		std::env::var("CONTRIBUTIONS_ADDRESS").expect("CONTRIBUTIONS_ADDRESS must be set");
	FieldElement::from_hex_be(&contributions_contract_address)
		.expect("Invalid value for CONTRIBUTIONS_ADDRESS")
}

impl<A: Account + Sync> Contract<A> {
	pub fn new(administrator_account: Arc<A>) -> Self {
		Self {
			administrator: ContractAdministrator::new(administrator_account),
		}
	}

	pub async fn execute_actions(
		&self,
		actions: &[Action],
		wait_for_acceptance: bool,
	) -> Result<String, ContractError> {
		let calls = actions.iter().map(|action| action.into_call()).collect_vec();
		let transaction_result = self
			.administrator
			.send_transaction(&calls, wait_for_acceptance)
			.await
			.map_err(|e| ContractError::TransactionReverted(e.to_string()))?;
		Ok(format!("0x{:x}", transaction_result.transaction_hash))
	}
}

trait IntoCall {
	fn into_call(self) -> Call;
}

impl IntoCall for &Action {
	fn into_call(self) -> Call {
		match self {
			Action::CreateContribution { contribution } => Call {
				to: contributions_contract_address(),
				selector: get_selector_from_name("new_contribution").unwrap(),
				calldata: vec![
					FieldElement::from_dec_str(&contribution.onchain_id).unwrap(), // id : felt
					FieldElement::from_dec_str(&contribution.project_id).unwrap(), /* project_id
					                                                                * : felt */
					FieldElement::from(contribution.gate), /* contribution_count_required : felt */
				],
			},

			Action::AssignContributor {
				contribution_id,
				contributor_id,
			} => {
				let OnChainContributorId(contributor_id_low, contributor_id_high): OnChainContributorId =
					contributor_id.to_owned().into();

				Call {
					to: contributions_contract_address(),
					selector: get_selector_from_name("assign_contributor_to_contribution").unwrap(),
					calldata: vec![
						contribution_id.parse().unwrap(), // id : felt
						contributor_id_low,               // contributor_id : Uint256
						contributor_id_high,
					],
				}
			},

			Action::UnassignContributor { contribution_id } => Call {
				to: contributions_contract_address(),
				selector: get_selector_from_name("unassign_contributor_from_contribution").unwrap(),
				calldata: vec![
					contribution_id.parse().unwrap(), // id : felt
				],
			},

			Action::ValidateContribution { contribution_id } => Call {
				to: contributions_contract_address(),
				selector: get_selector_from_name("validate_contribution").unwrap(),
				calldata: vec![
					contribution_id.parse().unwrap(), // id : felt
				],
			},
		}
	}
}
