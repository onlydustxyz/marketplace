use std::sync::Arc;

use domain::Payment;
use event_listeners::listeners::*;
use infrastructure::database;

use super::{Refreshable, Refresher};

pub fn create(database: Arc<database::Client>) -> impl Refreshable {
	let payment_projector = payment::Projector::new(
		database.clone(),
		database.clone(),
		database.clone(),
		database.clone(),
		database.clone(),
		database.clone(),
	);

	Refresher::<Payment>::new(database, vec![Arc::new(payment_projector)])
}
