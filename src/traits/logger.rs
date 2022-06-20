use anyhow::Result;
use async_trait::async_trait;
use futures::future::try_join_all;
use std::rc::Rc;
use std::sync::Arc;

pub trait SyncLogger<Item, Report> {
    fn log_sync(&self, item: &Item) -> Result<Report>;
}

#[async_trait]
pub trait AsyncLogger<Item, Report> {
    async fn log_async(&self, item: &Item) -> Result<Report>;
}

impl<T, Item, Report> SyncLogger<Vec<Item>, Vec<Report>> for T
where
    T: SyncLogger<Item, Report>,
{
    fn log_sync(&self, items: &Vec<Item>) -> Result<Vec<Report>> {
        items.iter().map(|item| self.log_sync(item)).collect()
    }
}

#[async_trait]
impl<T, Item, Report> AsyncLogger<Vec<Item>, Vec<Report>> for T
where
    T: AsyncLogger<Item, Report> + Send + Sync,
    Item: Send + Sync,
    Report: Send + Sync,
{
    async fn log_async(&self, items: &Vec<Item>) -> Result<Vec<Report>> {
        try_join_all(items.iter().map(|item| self.log_async(item))).await
    }
}

pub enum Logger<Item, Report> {
    Sync(Rc<dyn SyncLogger<Item, Report>>),
    Async(Arc<dyn AsyncLogger<Item, Report>>),
}

impl<Item, Report> Logger<Item, Report> {
    pub async fn log(&self, item: &Item) -> Result<Report> {
        match self {
            Self::Sync(logger) => logger.as_ref().log_sync(item),
            Self::Async(logger) => logger.as_ref().log_async(item).await,
        }
    }
}
