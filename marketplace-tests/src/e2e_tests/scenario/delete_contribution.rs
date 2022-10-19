use super::{wait_for_events, STARKONQUEST_ID};
use crate::e2e_tests::{
	applications,
	backends::{event_listeners, marketplace_api, marketplace_event_store, marketplace_indexer},
	contributions,
	database::get_events_count,
	projects::add_lead_contributor,
	scenario::STARKONQUEST_TITLE,
	starknet::{accounts::accounts, Account},
};
use anyhow::Result;
use marketplace_core::dto::Application;
use rstest::*;
use tokio::task::JoinHandle;

// Lead contributors must not overlap between different scenario
// otherwise their will consume the same call nonces
const LEAD_CONTRIBUTOR_INDEX: usize = 2;

#[rstest]
#[tokio::test]
async fn delete_contribution(
	accounts: [Account; 10],
	#[future] marketplace_api: JoinHandle<Result<()>>,
	#[future] marketplace_indexer: JoinHandle<Result<()>>,
	#[future] marketplace_event_store: JoinHandle<Result<()>>,
	#[future] event_listeners: JoinHandle<Result<()>>,
) {
	marketplace_api.await;
	marketplace_indexer.await;
	marketplace_event_store.await;
	event_listeners.await;

	let events_count = get_events_count();

	let lead_contributor = &accounts[LEAD_CONTRIBUTOR_INDEX];
	let issue_number = 32;

	add_lead_contributor(&accounts[0], STARKONQUEST_ID, lead_contributor.address()).await;
	contributions::create(lead_contributor, STARKONQUEST_ID, issue_number, 0).await;
	wait_for_events(events_count + 3).await;

	let contribution =
		contributions::get_project_contribution_by_issue_number(STARKONQUEST_TITLE, issue_number)
			.await
			.expect("Contribution not found in db");

	let contributor_account_address = String::from("0x0029");
	contributions::apply(&contribution.id, &contributor_account_address).await;
	let applications = applications::list_for_contributor(&contributor_account_address).await;
	assert!(
		applications.contains(&Application {
			contribution_id: contribution.id.clone(),
			contributor_account_address: contributor_account_address.clone()
		}),
		"{} {}",
		contribution.id,
		contributor_account_address
	);
	contributions::delete(lead_contributor, &contribution.id).await;
	wait_for_events(events_count + 5).await;

	let contribution =
		contributions::get_project_contribution_by_issue_number(STARKONQUEST_TITLE, issue_number)
			.await
			.expect("Contribution not found in project");
	assert_eq!(&contribution.status, "ABANDONED");
	assert!(contribution.closed);
	let applications = applications::list_for_contributor(&contributor_account_address).await;
	assert!(!applications.contains(&Application {
		contribution_id: contribution.id,
		contributor_account_address
	}));
}
