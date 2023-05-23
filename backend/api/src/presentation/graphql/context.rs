/// This module contains the definition of the context struct used in the application.
///
/// # Example
///
/// ```rust
/// use std::sync::Arc;
/// use derive_getters::Getters;
/// use domain::{AggregateRootRepository, Event, GithubUserId, Project, Publisher, UserId};
/// use infrastructure::{
/// 	amqp::{self, UniqueMessage},
/// 	github, graphql,
/// };
/// use presentation::http::guards::OptionUserId;
///
/// use super::{Error, Result};
/// use crate::{
/// 	application,
/// 	domain::{ArePayoutSettingsValid, Permissions},
/// 	infrastructure::{
/// 		database::{
/// 			IgnoredGithubIssuesRepository, PendingProjectLeaderInvitationsRepository,
/// 			ProjectDetailsRepository, ProjectSponsorRepository, SponsorRepository,
/// 			UserInfoRepository,
/// 		},
/// 		simple_storage,
/// 		web3::ens,
/// 	},
/// };
///
/// pub struct Context {
/// 	pub caller_permissions: Box<dyn Permissions>,
/// 	caller_info: OptionUserId,
/// 	pub request_payment_usecase: application::payment::request::Usecase,
/// 	pub process_payment_usecase: application::payment::process::Usecase,
/// 	pub cancel_payment_usecase: application::payment::cancel::Usecase,
/// 	pub invoice_usecase: application::payment::invoice::Usecase,
/// 	pub create_project_usecase: application::project::create::Usecase,
/// 	pub update_budget_allocation_usecase: application::budget::allocate::Usecase,
/// 	pub update_project_usecase: application::project::update::Usecase,
/// 	pub link_github_repo_usecase: application::project::link_github_repo::Usecase,
/// 	pub unlink_github_repo_usecase: application::project::unlink_github_repo::Usecase,
/// 	pub create_sponsor_usecase: application::sponsor::create::Usecase,
/// 	pub update_sponsor_usecase: application::sponsor::update::Usecase,
/// 	pub add_sponsor_usecase: application::project::add_sponsor::Usecase,
/// 	pub remove_sponsor_usecase: application::project::remove_sponsor::Usecase,
/// 	pub remove_project_leader_usecase: application::project::remove_leader::Usecase,
/// 	pub invite_project_leader_usecase: application::project::invite_leader::Usecase,
/// 	pub accept_project_leader_invitation_usecase:
/// 		application::project::accept_leader_invitation::Usecase,
/// 	pub project_details_repository: ProjectDetailsRepository,
/// 	pub update_user_info_usecase: application::user::update_profile_info::Usecase,
/// 	pub create_github_issue_usecase: application::github::create_issue::Usecase,
/// 	pub ignored_github_issues_usecase: application::project::ignored_issues::Usecase,
/// 	pub ens: Arc<ens::Client>,
/// }
/// impl Context {
/// 	/// Creates a new Context struct
///     ///
/// 	/// # Arguments
///     ///
///     /// * `caller_permissions` - The permissions associated with the caller
///     /// * `caller_info` - Information about the caller
///     /// * `event_publisher` - An Arc to a Publisher that implements UniqueMessage<Event>
///     /// * `project_repository` - An AggregateRootRepository for Project
///     /// * `project_details_repository` - A ProjectDetailsRepository
///     /// * `sponsor_repository` - A SponsorRepository
///     /// * `project_sponsor_repository` - A ProjectSponsorRepository
///     /// * `pending_project_leader_invitations_repository` - A PendingProjectLeaderInvitationsRepository
///     /// * `ignored_github_issues_repository` - An IgnoredGithubIssuesRepository
///     /// * `user_info_repository` - A UserInfoRepository
///     /// * `graphql` - An Arc to a graphql Client
///     /// * `github` - An Arc to a github Client
///     /// * `ens` - An Arc to an ens Client
///     /// * `simple_storage` - An Arc to a simple storage Client
///     /// * `publisher` - An Arc to an amqp Bus
///     ///
/// 	/// # Returns
/// 	/// A new Context
///     
/// 	pub fn new(
/// 		caller_permissions: Box<dyn Permissions>,
/// 		caller_info: OptionUserId,
/// 		event_publisher: Arc<dyn Publisher<UniqueMessage<Event>>>,
/// 		project_repository: AggregateRootRepository<Project>,
/// 		project_details_repository: ProjectDetailsRepository,
/// 		sponsor_repository: SponsorRepository,
/// 		project_sponsor_repository: ProjectSponsorRepository,
/// 		pending_project_leader_invitations_repository: PendingProjectLeaderInvitationsRepository,
/// 		ignored_github_issues_repository: IgnoredGithubIssuesRepository,
/// 		user_info_repository: UserInfoRepository,
/// 		graphql: Arc<graphql::Client>,
/// 		github: Arc<github::Client>,
/// 		ens: Arc<ens::Client>,
/// 		simple_storage: Arc<simple_storage::Client>,
/// 		publisher: Arc<amqp::Bus>,
/// 	) -> Self {
/// 		Self {
/// 			caller_permissions,
/// 			caller_info,
/// 			request_payment_usecase: application::payment::request::Usecase::new(
/// 				event_publisher.to_owned(),
/// 				project_repository.clone(),
/// 			),
/// 			process_payment_usecase: application::payment::process::Usecase::new(
/// 				event_publisher.to_owned(),
/// 				project_repository.clone(),
/// 				application::dusty_bot::close_issues::Usecase::new(github.clone(), publisher),
/// 			),
/// 			cancel_payment_usecase: application::payment::cancel::Usecase::new(
/// 				event_publisher.to_owned(),
/// 				project_repository.clone(),
/// 			),
/// 			invoice_usecase: application::payment::invoice::Usecase::new(
/// 				event_publisher.to_owned(),
/// 				project_repository.clone(),
/// 			),
/// 			create_project_usecase: application::project::create::Usecase::new(
/// 				event_publisher.to_owned(),
/// 				project_details_repository.clone(),
/// 				simple_storage.clone(),
/// 			),
/// 			update_budget_allocation_usecase: application::budget::allocate::Usecase::new(
/// 				event_publisher.to_owned(),
/// 				project_repository.clone(),
/// 			),
/// 			update_project_usecase: application::project::update::Usecase::new(
/// 				project_details_repository.clone(),
/// 				simple_storage.clone(),
/// 			),
/// 			link_github_repo_usecase: application::project::link_github_repo::Usecase::new(
/// 				event_publisher.to_owned(),
/// 				project_repository.clone(),
/// 				github,
/// 			),
/// 			unlink_github_repo_usecase: application::project::unlink_github_repo::Usecase::new(
/// 				event_publisher.to_owned(),
/// 				project_repository.clone(),
/// 			),
/// 			create_sponsor_usecase: application::sponsor::create::Usecase::new(
/// 				sponsor_repository.clone(),
/// 				simple_storage.clone(),
/// 			),
/// 			update_sponsor_usecase: application::sponsor::update::Usecase::new(
/// 				sponsor_repository,
/// 				simple_storage,
/// 			),
/// 			add_sponsor_usecase: application::project::add_sponsor::Usecase::new(
/// 				project_sponsor_repository.clone(),
/// 			),
/// 			remove_sponsor_usecase: application::project::remove_sponsor::Usecase::new(
/// 				project_sponsor_repository,
/// 			),
/// 			remove_project_leader_usecase: application::project::remove_leader::Usecase::new(
/// 				event_publisher.to_owned(),
/// 				project_repository.clone(),
/// 			),
/// 			invite_project_leader_usecase: application::project::invite_leader::Usecase::new(
/// 				pending_project_leader_invitations_repository.clone(),
/// 			),
/// 			accept_project_leader_invitation_usecase:
/// 				application::project::accept_leader_invitation::Usecase::new(
/// 					event_publisher.to_owned(),
/// 					pending_project_leader_invitations_repository,
/// 					project_repository.clone(),
/// 				),
/// 			project_details_repository,
/// 			update_user_info_usecase: application::user::update_profile_info::Usecase::new(
/// 				user_info_repository,
/// 				ArePayoutSettingsValid::new(ens.clone()),
/// 			),
/// 			create_github_issue_usecase: application::github::create_issue::Usecase::new(
/// 				project_repository,
/// 				graphql,
/// 			),
/// 			ignored_github_issues_usecase: application::project::ignored_issues::Usecase::new(
/// 				ignored_github_issues_repository,
/// 			),
/// 			ens,
/// 		}
/// 	}
///
///     /// Returns the caller information associated with the Context
///     ///
/// 	/// # Returns
///     ///
///     /// CallerInfo struct containing user_id and github_user_id
///     
/// 	pub fn caller_info(&self) -> Result<CallerInfo> {
/// 		let user_id =
/// 			self.caller_info.user_id().map_err(|e| Error::NotAuthenticated(e.to_string()))?;
///
/// 		let caller_info = CallerInfo {
/// 			user_id,
/// 			github_user_id: self
/// 				.caller_info
/// 				.github_user_id()
/// 				.map_err(|e| Error::NotAuthenticated(e.to_string()))?,
/// 		};
/// 		Ok(caller_info)
/// 	}
/// }
/// impl juniper::Context for Context {}
///
/// #[derive(Getters)]
/// pub struct CallerInfo {
/// 	user_id: UserId,
/// 	github_user_id: GithubUserId,
/// }
/// ```
///
/// This module uses the crate `derive_getters` to derive Getters for each attribute in the struct and `doc_comment` macro to write documentation comments compatible with cargo docs command.