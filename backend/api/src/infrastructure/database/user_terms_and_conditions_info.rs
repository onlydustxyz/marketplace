use std::sync::Arc;

use derive_more::Constructor;
use infrastructure::database::{schema::user_info::dsl, Client};

use crate::domain::UserTermsAndConditionsInfo;

#[derive(DieselRepository, Constructor, Clone)]
#[entity(UserTermsAndConditionsInfo)]
#[table(dsl::user_info)]
#[id(dsl::user_id)]
#[mock]
pub struct Repository(Arc<Client>);
