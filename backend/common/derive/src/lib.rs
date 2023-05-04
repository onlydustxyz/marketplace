extern crate proc_macro;

use convert_case::{Case, Casing};
use proc_macro::TokenStream;
use syn::{parse::Parse, DeriveInput, Ident};

mod diesel_mapping_repository;
mod diesel_repository;
mod from_to_sql;
mod stream_filter;

/// Implements a mapping repository between two entities using Diesel.
///
/// ```compile_fail
/// #[derive(DieselMappingRepository, Constructor, Clone)]
/// #[entities((Project, GithubRepo))]
/// #[ids((dsl::project_id, dsl::github_repo_id))]
/// #[table(dsl::project_github_repos)]
/// pub struct Repository(Arc<Client>);
/// ```
///
/// When the `mock` attribute is present, a mocked implementation of the repository
/// (using mockall crate) will be generated as well.
///
/// ```compile_fail
/// #[derive(DieselMappingRepository, Constructor, Clone)]
/// #[entities((Project, GithubRepo))]
/// #[ids((dsl::project_id, dsl::github_repo_id))]
/// #[table(dsl::project_github_repos)]
/// #[mock]
/// pub struct Repository(Arc<Client>);
/// ```
#[proc_macro_derive(DieselMappingRepository, attributes(table, entities, ids, mock))]
pub fn diesel_mapping_repository(input: TokenStream) -> TokenStream {
	let derive_input: DeriveInput = syn::parse(input).unwrap();
	diesel_mapping_repository::impl_diesel_mapping_repository(derive_input)
}

/// Implements a repository for this entity using Diesel.
///
/// ```compile_fail
/// #[derive(DieselRepository, Constructor, Clone)]
/// #[entity(ProjectDetails)]
/// #[table(dsl::project_details)]
/// #[id(dsl::project_id)]
/// pub struct Repository(Arc<Client>);
/// ```
///
/// You can also choose which part of the repository to implement thanks to the #[features]
/// attribute:
///
/// ```compile_fail
/// #[derive(DieselRepository, Constructor, Clone)]
/// #[entity(ProjectDetails)]
/// #[table(dsl::project_details)]
/// #[id(dsl::project_id)]
/// #[features(select, insert, update, delete)]
/// pub struct Repository(Arc<Client>);
/// ```
///
/// When the `mock` attribute is present, a mocked implementation of the repository
/// (using mockall crate) will be generated as well.
///
/// ```compile_fail
/// #[derive(DieselRepository, Constructor, Clone)]
/// #[entity(ProjectDetails)]
/// #[table(dsl::project_details)]
/// #[id(dsl::project_id)]
/// #[mock]
/// pub struct Repository(Arc<Client>);
/// ```
#[proc_macro_derive(DieselRepository, attributes(entity, table, id, features, mock))]
pub fn diesel_repository(input: TokenStream) -> TokenStream {
	let derive_input: DeriveInput = syn::parse(input).unwrap();
	diesel_repository::impl_diesel_repository(derive_input)
}

/// Parse a FromToSql derive macro.
/// This macro implements the traits [ToSql](https://docs.rs/diesel/2.0.2/diesel/serialize/trait.ToSql.html) and
/// [FromSql](https://docs.rs/diesel/2.0.2/diesel/deserialize/trait.FromSql.html).
///
/// Requires the 'sql_type' attribute to be set.
///
/// Single field unnamed struct will be modelized as their inner type (newtype patter)
/// Enum and named struct will be modelized as [serde_json::Value](https://docs.rs/serde_json/1.0.89/serde_json/enum.Value.html)
///
/// You may also need to derive FromSqlRow and AsExpression in order to use it in actual diesel
/// queries.
///
/// ```compile_fail
/// # #[macro_use] extern crate derive;
/// # use diesel::{FromSqlRow, AsExpression};
/// # struct InnerA;
/// # struct InnerB;
///
/// #[derive(AsExpression, FromToSql, FromSqlRow)]
/// #[sql_type = "diesel::sql_types::Uuid"]
/// struct Id(u32);
///
/// #[derive(AsExpression, FromToSql, FromSqlRow)]
/// #[sql_type = "diesel::sql_types::Jsonb"]
/// enum AOrB {
///     A(InnerA),
///     B(InnerB)
/// }
///
/// #[derive(AsExpression, FromToSql, FromSqlRow)]
/// #[sql_type = "diesel::sql_types::Jsonb"]
/// struct Person {
///     firstname: String,
///     lastname: String,
/// }
/// ```
#[proc_macro_derive(FromToSql, attributes(sql_type))]
pub fn to_sql(input: TokenStream) -> TokenStream {
	let derive_input: DeriveInput = syn::parse(input).unwrap();
	from_to_sql::impl_from_to_sql_macro(derive_input)
}

/// Parse a StreamFilter derive macro.
/// This macro generates the traits that one can implement in order to filter streams.
///
/// ```compile_fail
/// # #[macro_use] extern crate derive;
///
/// #[derive(StreamFilter)]
/// struct Person {
///     firstname: String,
///     lastname: String,
/// }
/// ```
#[proc_macro_derive(StreamFilter)]
pub fn stream_filter(input: TokenStream) -> TokenStream {
	let derive_input: DeriveInput = syn::parse(input).unwrap();
	stream_filter::impl_stream_filter(derive_input)
}

fn find_attr<T: Parse>(ast: &DeriveInput, attr_name: &str) -> T {
	ast.attrs
		.iter()
		.find(|a| a.path.is_ident(attr_name))
		.unwrap_or_else(|| panic!("{attr_name} keyword not found"))
		.parse_args()
		.unwrap_or_else(|e| panic!("Failed to parse attribute {attr_name}: {e}"))
}

fn has_attr(derive_input: &syn::DeriveInput, attr_name: &str) -> bool {
	derive_input.attrs.iter().any(|a| a.path.is_ident(attr_name))
}

fn ident_to_snake_case(ident: &Ident) -> String {
	ident.to_string().from_case(Case::UpperCamel).to_case(Case::Snake)
}
