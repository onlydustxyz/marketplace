mod github;
pub use github::{
	Repository as GithubRepository, Service as GithubService, ServiceError as GithubServiceError,
	ServiceResult as GithubServiceResult, User as GithubUser,
};
