use anyhow::Result;
use async_trait::async_trait;
use domain::Event;
use tracing::info;

use crate::domain::EventListener;

pub struct Logger;

#[async_trait]
impl EventListener for Logger {
	async fn on_event(&self, event: &Event) -> Result<()> {
		info!(event = event.to_string(), "📨 Received event");
		Ok(())
	}
}
