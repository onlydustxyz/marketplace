use crate::graphql::{Context, Schema};
use rocket::{response::content, State};

#[get("/")]
pub fn graphiql() -> content::RawHtml<String> {
	juniper_rocket::graphiql_source("/graphql", None)
}

#[get("/graphql?<request>")]
pub fn get_graphql_handler(
	request: juniper_rocket::GraphQLRequest,
	schema: &State<Schema>,
	context: &State<Context>,
) -> juniper_rocket::GraphQLResponse {
	request.execute_sync(&**schema, &**context)
}

#[post("/graphql", data = "<request>")]
pub fn post_graphql_handler(
	request: juniper_rocket::GraphQLRequest,
	schema: &State<Schema>,
	context: &State<Context>,
) -> juniper_rocket::GraphQLResponse {
	request.execute_sync(&**schema, &**context)
}
