use std::sync::Arc;

use derive_more::Constructor;
use infrastructure::database::{schema::project_details::dsl, Client};

use super::ProjectDetails;

#[derive(DieselRepository, Constructor, Clone)]
#[entity(ProjectDetails)]
#[table(dsl::project_details)]
#[id(dsl::project_id)]
#[mock]
pub struct Repository(Arc<Client>);
