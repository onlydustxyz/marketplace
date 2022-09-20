mod event_store;
mod models;
mod repositories;
mod schema;
#[cfg(test)]
mod tests;

mod error;
pub use error::Error as DatabaseError;

use diesel::{
	associations::HasTable,
	pg::Pg,
	query_builder::{IntoUpdateTarget, QueryFragment, QueryId},
	PgConnection, QuerySource, RunQueryDsl,
};
use log::error;
use r2d2;
use r2d2_diesel::ConnectionManager;

type Pool = r2d2::Pool<ConnectionManager<PgConnection>>;
type PooledConnection = r2d2::PooledConnection<ConnectionManager<PgConnection>>;

pub fn run_migrations(pool: &Pool) {
	let connection = pool.get().expect("Unable to get connection from pool");
	diesel_migrations::run_pending_migrations(&*connection).expect("diesel migration failure");
}

pub struct Client {
	pool: Pool,
}

impl Client {
	pub fn new(pool: Pool) -> Self {
		Self { pool }
	}
}

impl Client {
	fn connection(&self) -> Result<PooledConnection, DatabaseError> {
		self.pool.get().map_err(|e| {
			error!("Failed to connect to get connection out of pool: {e}");
			DatabaseError::Connection(e.to_string())
		})
	}

	pub fn run_migrations(&self) -> Result<(), DatabaseError> {
		let connection = self.connection()?;
		diesel_migrations::run_pending_migrations(&*connection).map_err(|e| {
			error!("Failed to run migrations: {e}");
			DatabaseError::Migration(e.to_string())
		})?;
		Ok(())
	}

	fn clear_table<T: IntoUpdateTarget>(&self, diesel_table: T) -> Result<(), anyhow::Error>
	where
		<T as HasTable>::Table: QueryId,
		<<T as HasTable>::Table as QuerySource>::FromClause: QueryFragment<Pg>,
		<T as diesel::query_builder::IntoUpdateTarget>::WhereClause: QueryFragment<Pg>,
		<T as diesel::query_builder::IntoUpdateTarget>::WhereClause: QueryId,
	{
		let connection = self
			.connection()
			.map_err(|e| {
				error!("Failed while trying to get connection from pool: {e}");
				e
			})
			.map_err(anyhow::Error::msg)?;

		diesel::delete(diesel_table)
			.execute(&*connection)
			.map_err(|e| {
				error!("Failed while trying to clear project_members table: {e}");
				e
			})
			.map_err(anyhow::Error::msg)?;

		Ok(())
	}
}

pub fn init_pool() -> Pool {
	let manager = ConnectionManager::<PgConnection>::new(database_url());
	if cfg!(test) {
		use diesel::Connection;

		let pool = Pool::builder().max_size(1).build(manager).unwrap();
		pool.get().unwrap().begin_test_transaction().unwrap();
		pool
	} else {
		let pool_max_size =
			std::env::var("PG_POOL_MAX_SIZE").unwrap_or_else(|_| String::from("20"));
		Pool::builder()
			.max_size(pool_max_size.parse().expect("PG_POOL_MAX_SIZE is not a valid number"))
			.build(manager)
			.expect("Unable to create database connection pool")
	}
}

fn database_url() -> String {
	std::env::var("DATABASE_URL").expect("DATABASE_URL must be set")
}
