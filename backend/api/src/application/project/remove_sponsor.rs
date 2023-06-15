use anyhow::Result;
use domain::{DomainError, ProjectId};
use tracing::instrument;

use crate::models::*;

pub struct Usecase {
	project_sponsor_repository: ProjectSponsorRepository,
}

impl Usecase {
	pub fn new(project_sponsor_repository: ProjectSponsorRepository) -> Self {
		Self {
			project_sponsor_repository,
		}
	}

	#[instrument(skip(self))]
	pub fn remove_sponsor(
		&self,
		project_id: &ProjectId,
		sponsor_id: &SponsorId,
	) -> Result<(), DomainError> {
		self.project_sponsor_repository.delete(project_id, sponsor_id)?;
		Ok(())
	}
}
