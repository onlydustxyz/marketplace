#[macro_use]
extern crate diesel;

pub mod amqp;
pub mod database;
pub mod graphql;
pub mod tracing;

pub mod event_bus;
pub mod event_store;

use diesel_migrations::*;
#[macro_use]
extern crate diesel_migrations;

embed_migrations!("../migrations");
