use infrastructure::{database, github, tracing};
use presentation::http;
use serde::Deserialize;

#[derive(Deserialize, Default, Clone)]
pub struct Config {
	#[serde(default)]
	pub database: database::Config,
	#[serde(default)]
	pub tracer: tracing::Config,
	#[serde(default)]
	pub github: github::Config,
	#[serde(default)]
	pub http: http::Config,
}
