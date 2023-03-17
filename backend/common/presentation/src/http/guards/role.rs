use std::{collections::HashSet, str::FromStr};

use domain::GithubUserId;
use rocket::{
	request::{FromRequest, Outcome},
	Request,
};
use uuid::Uuid;

#[derive(Debug, PartialEq, Eq)]
pub enum Role {
	Admin,
	RegisteredUser {
		lead_projects: HashSet<Uuid>,
		github_user_id: GithubUserId,
	},
	Public,
}

#[async_trait]
impl<'r> FromRequest<'r> for Role {
	type Error = ();

	async fn from_request(request: &'r Request<'_>) -> Outcome<Role, ()> {
		match request.headers().get_one("x-hasura-role") {
			Some("admin") => Outcome::Success(Role::Admin),
			Some("registered_user") => from_role_registered_user(request),
			_ => return Outcome::Success(Role::Public),
		}
	}
}

fn from_role_registered_user(request: &'_ Request<'_>) -> Outcome<Role, ()> {
	if request.headers().get_one("x-hasura-user-id").is_none() {
		return Outcome::Success(Role::Public);
	}

	let github_user_id = request
		.headers()
		.get_one("x-hasura-githubUserId")
		.and_then(|header_value| GithubUserId::from_str(header_value).ok());

	if let Some(github_user_id) = github_user_id {
		let lead_projects: HashSet<Uuid> = request
			.headers()
			.get_one("x-hasura-projectsLeaded")
			.and_then(|h| serde_json::from_str(&h.replace('{', "[").replace('}', "]")).ok())
			.unwrap_or_default();

		return Outcome::Success(Role::RegisteredUser {
			lead_projects,
			github_user_id,
		});
	}

	Outcome::Success(Role::Public)
}

#[cfg(test)]
mod tests {
	use assert_matches::assert_matches;
	use rocket::{
		http::Header,
		local::blocking::{Client, LocalRequest},
	};
	use rstest::{fixture, rstest};

	use super::*;

	#[fixture]
	fn client() -> Client {
		let rocket = rocket::build();
		Client::untracked(rocket).expect("valid rocket")
	}

	#[rstest]
	async fn from_request_admin(client: Client) {
		let mut request: LocalRequest = client.post("/v1/graphql");
		request.add_header(Header::new("x-hasura-role", "admin"));

		let result = Role::from_request(&request).await;
		assert_eq!(result, Outcome::Success(Role::Admin));
	}

	#[rstest]
	async fn from_request_public(client: Client) {
		let mut request: LocalRequest = client.post("/v1/graphql");
		request.add_header(Header::new("x-hasura-role", "public"));

		let result = Role::from_request(&request).await;
		assert_eq!(result, Outcome::Success(Role::Public));
	}

	#[rstest]
	async fn from_request_no_role(client: Client) {
		let request: LocalRequest = client.post("/v1/graphql");

		let result = Role::from_request(&request).await;
		assert_eq!(result, Outcome::Success(Role::Public));
	}

	#[rstest]
	async fn from_request_user_without_id(client: Client) {
		let mut request: LocalRequest = client.post("/v1/graphql");
		request.add_header(Header::new("x-hasura-role", "registered_user"));

		let result = Role::from_request(&request).await;
		assert_eq!(result, Outcome::Success(Role::Public));
	}

	#[rstest]
	async fn from_request_user_without_github_id(client: Client) {
		let mut request: LocalRequest = client.post("/v1/graphql");
		request.add_header(Header::new("x-hasura-role", "registered_user"));
		request.add_header(Header::new(
			"x-hasura-user-id",
			"3cb208f6-998f-4210-94d5-fa62eba1e077",
		));

		let result = Role::from_request(&request).await;
		assert_eq!(result, Outcome::Success(Role::Public));
	}

	#[rstest]
	async fn from_request_registered_user(client: Client) {
		let mut request: LocalRequest = client.post("/v1/graphql");
		request.add_header(Header::new("x-hasura-role", "registered_user"));
		request.add_header(Header::new(
			"x-hasura-user-id",
			"3cb208f6-998f-4210-94d5-fa62eba1e077",
		));
		request.add_header(Header::new("x-hasura-githubUserId", "112233"));

		let result = Role::from_request(&request).await;
		assert_matches!(result.succeeded().unwrap(), Role::RegisteredUser { .. });
	}
}
