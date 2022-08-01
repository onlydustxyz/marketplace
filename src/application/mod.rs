mod get_contributor;

pub use get_contributor::{GetContributor, Usecase as GetContributorUsecase};

use crate::domain::*;

pub fn apply_to_contribution<A: ApplicationRepository, U: UuidRepository>(
	application_repository: A,
	uuid_repository: U,
	contribution_id: ContributionId,
	contributor_id: ContributorId,
) -> Result<()> {
	let id = uuid_repository.new_random();

	let application = Application::new(id, contribution_id, contributor_id);

	application_repository.store(application)
}
