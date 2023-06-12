use proc_macro::TokenStream;
use quote::quote;
use syn::{Ident, Type, TypePath, TypeTuple};

use super::find_attr;
use crate::{has_attr, ident_to_snake_case};

trait UnwrapAsPath {
	fn unwrap_as_path(&self) -> TypePath;
}

impl UnwrapAsPath for Type {
	fn unwrap_as_path(&self) -> TypePath {
		match self {
			Type::Path(path) => path.clone(),
			_ => panic!("TypePath required"),
		}
	}
}

fn find_entities(input: &syn::DeriveInput) -> (TypePath, TypePath) {
	let entities: TypeTuple = find_attr(input, "entities");
	assert_eq!(
		entities.elems.len(),
		2,
		"DieselMappingRepository only support mapping with 2 entities"
	);
	let entity1 = entities.elems.first().unwrap().unwrap_as_path();
	let entity2 = entities.elems.last().unwrap().unwrap_as_path();
	(entity1, entity2)
}

fn find_ids(input: &syn::DeriveInput) -> (TypePath, TypePath) {
	let ids: TypeTuple = find_attr(input, "ids");
	assert_eq!(
		ids.elems.len(),
		2,
		"DieselMappingRepository only support mapping with 2 entities"
	);
	let id1 = ids.elems.first().unwrap().unwrap_as_path();
	let id2 = ids.elems.last().unwrap().unwrap_as_path();
	(id1, id2)
}

pub fn impl_diesel_mapping_repository(input: syn::DeriveInput) -> TokenStream {
	let repository_name = input.ident.clone();
	let table: TypePath = find_attr(&input, "table");
	let (entity1, entity2) = find_entities(&input);
	let (id1, id2) = find_ids(&input);

	let table_ident = &table.path.segments.last().unwrap().ident;
	let insert_span_name = format!("{table_ident}::insert");
	let delete_span_name = format!("{table_ident}::delete");

	let entity1_ident = entity1.path.get_ident().unwrap();
	let entity2_ident = entity2.path.get_ident().unwrap();

	let delete_all_entity1_of = syn::Ident::new(
		&format!("delete_all_{}s_of", ident_to_snake_case(entity1_ident)),
		entity1_ident.span(),
	);
	let delete_all_entity2_of = syn::Ident::new(
		&format!("delete_all_{}s_of", ident_to_snake_case(entity2_ident)),
		entity2_ident.span(),
	);

	let delete_all_entity1_of_span_name = format!("{table_ident}::{delete_all_entity1_of}");
	let delete_all_entity2_of_span_name = format!("{table_ident}::{delete_all_entity2_of}");

	let find_all_entity1_of = syn::Ident::new(
		&format!("find_all_{}s_of", ident_to_snake_case(entity1_ident)),
		entity1_ident.span(),
	);
	let find_all_entity2_of = syn::Ident::new(
		&format!("find_all_{}s_of", ident_to_snake_case(entity2_ident)),
		entity2_ident.span(),
	);

	let find_all_entity1_of_span_name = format!("{table_ident}::{find_all_entity1_of}");
	let find_all_entity2_of_span_name = format!("{table_ident}::{find_all_entity2_of}");

	let mocks = if has_attr(&input, "mock") {
		impl_mocks(
			&repository_name,
			&entity1,
			&entity2,
			&delete_all_entity1_of,
			&delete_all_entity2_of,
			&find_all_entity1_of,
			&find_all_entity2_of,
		)
	} else {
		quote! {}
	};

	// Build the output, possibly using quasi-quotation
	let expanded = quote! {
		use diesel::RunQueryDsl;
		use diesel::QueryDsl;
		use diesel::ExpressionMethods;
		use diesel::query_dsl::filter_dsl::FindDsl;
		use diesel::BoolExpressionMethods;

		impl #repository_name {
			#[tracing::instrument(name = #insert_span_name, skip(self))]
			pub fn try_insert(&self, id1: &<#entity1 as domain::Entity>::Id, id2: &<#entity2 as domain::Entity>::Id) -> Result<(), infrastructure::database::DatabaseError> {
				let mut connection = self.0.connection()?;

				diesel::insert_into(#table)
					.values((#id1.eq(id1), #id2.eq(id2)))
					.on_conflict_do_nothing()
					.execute(&mut *connection)?;

				Ok(())
			}

			#[tracing::instrument(name = #delete_span_name, skip(self))]
			pub fn delete(&self, id1: &<#entity1 as domain::Entity>::Id, id2: &<#entity2 as domain::Entity>::Id) -> Result<(), infrastructure::database::DatabaseError> {
				let mut connection = self.0.connection()?;

				diesel::delete(#table.filter(#id1.eq(id1)).filter(#id2.eq(id2)))
					.execute(&mut *connection)?;

				Ok(())
			}

			#[tracing::instrument(name = #delete_all_entity2_of_span_name, skip(self))]
			pub fn #delete_all_entity2_of(&self, id1: &<#entity1 as domain::Entity>::Id) -> Result<(), infrastructure::database::DatabaseError> {
				let mut connection = self.0.connection()?;

				diesel::delete(#table.filter(#id1.eq(id1)))
					.execute(&mut *connection)?;

				Ok(())
			}

			#[tracing::instrument(name = #delete_all_entity1_of_span_name, skip(self))]
			pub fn #delete_all_entity1_of(&self, id2: &<#entity2 as domain::Entity>::Id) -> Result<(), infrastructure::database::DatabaseError> {
				let mut connection = self.0.connection()?;

				diesel::delete(#table.filter(#id2.eq(id2)))
					.execute(&mut *connection)?;

				Ok(())
			}

			#[tracing::instrument(name = #find_all_entity2_of_span_name, skip(self))]
			pub fn #find_all_entity2_of(
				&self,
				id1: &<#entity1 as domain::Entity>::Id,
			) -> Result<
				Vec<(<#entity1 as domain::Entity>::Id, <#entity2 as domain::Entity>::Id)>,
				infrastructure::database::DatabaseError,
			> {
				let mut connection = self.0.connection()?;

				let result = #table.filter(#id1.eq(id1))
				.select((#id1, #id2))
				.load::<(
					<#entity1 as domain::Entity>::Id,
					<#entity2 as domain::Entity>::Id,
				)>(&mut *connection)?;

				Ok(result)
			}

			#[tracing::instrument(name = #find_all_entity1_of_span_name, skip(self))]
			pub fn #find_all_entity1_of(
				&self,
				id2: &<#entity2 as domain::Entity>::Id,
			) -> Result<
				Vec<(<#entity1 as domain::Entity>::Id, <#entity2 as domain::Entity>::Id)>,
				infrastructure::database::DatabaseError,
			> {
				let mut connection = self.0.connection()?;

				let result = #table.filter(#id2.eq(id2))
				.select((#id1, #id2))
				.load::<(
					<#entity1 as domain::Entity>::Id,
					<#entity2 as domain::Entity>::Id,
				)>(&mut *connection)?;

				Ok(result)
			}

			#[tracing::instrument(name = #find_all_entity2_of_span_name, skip(self))]
			pub fn exists(
				&self,
				id1: &<#entity1 as domain::Entity>::Id,
				id2: &<#entity2 as domain::Entity>::Id,
			) -> Result<
				bool,
				infrastructure::database::DatabaseError,
			> {
				let mut connection = self.0.connection()?;

				let result = #table.filter(#id1.eq(id1).and(#id2.eq(id2)))
				.select((#id1, #id2))
				.load::<(
					<#entity1 as domain::Entity>::Id,
					<#entity2 as domain::Entity>::Id,
				)>(&mut *connection)?;

				Ok(!result.is_empty())
			}
		}

		#mocks
	};

	// Hand the output tokens back to the compiler
	TokenStream::from(expanded)
}

fn impl_mocks(
	repository_name: &Ident,
	entity1: &TypePath,
	entity2: &TypePath,
	delete_all_entity1_of: &Ident,
	delete_all_entity2_of: &Ident,
	find_all_entity1_of: &Ident,
	find_all_entity2_of: &Ident,
) -> quote::__private::TokenStream {
	// Build the output
	let expanded = quote! {
		#[cfg(test)]
		mockall::mock! {
			pub #repository_name {
				pub fn new(client: std::sync::Arc<infrastructure::database::Client>) -> Self;
				pub fn try_insert(&self, id1: &<#entity1 as domain::Entity>::Id, id2: &<#entity2 as domain::Entity>::Id) -> Result<(), infrastructure::database::DatabaseError>;
				pub fn delete(&self, id1: &<#entity1 as domain::Entity>::Id, id2: &<#entity2 as domain::Entity>::Id) -> Result<(), infrastructure::database::DatabaseError>;
				pub fn #delete_all_entity2_of(&self, id1: &<#entity1 as domain::Entity>::Id) -> Result<(), infrastructure::database::DatabaseError>;
				pub fn #delete_all_entity1_of(&self, id2: &<#entity2 as domain::Entity>::Id) -> Result<(), infrastructure::database::DatabaseError>;
				pub fn #find_all_entity2_of(
					&self,
					id1: &<#entity1 as domain::Entity>::Id,
				) -> Result<
					Vec<(<#entity1 as domain::Entity>::Id, <#entity2 as domain::Entity>::Id)>,
					infrastructure::database::DatabaseError,
				>;
				pub fn #find_all_entity1_of(
					&self,
					id2: &<#entity2 as domain::Entity>::Id,
				) -> Result<
					Vec<(<#entity1 as domain::Entity>::Id, <#entity2 as domain::Entity>::Id)>,
					infrastructure::database::DatabaseError,
				>;
				pub fn exists(&self, id1: &<#entity1 as domain::Entity>::Id, id2: &<#entity2 as domain::Entity>::Id) -> Result<bool, infrastructure::database::DatabaseError>;
			}

			impl Clone for #repository_name {
				fn clone(&self) -> Self;
			}
		}
	};

	expanded
}
