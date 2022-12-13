#[allow(clippy::extra_unused_lifetimes)]
mod budget;
#[allow(clippy::extra_unused_lifetimes)]
mod payment;
#[allow(clippy::extra_unused_lifetimes)]
mod payment_request;
#[allow(clippy::extra_unused_lifetimes)]
mod project;

mod budget_spender;

pub use budget::Budget;
pub use budget_spender::Repository as BudgetSpenderRepository;
use domain::Entity;
pub use payment::Payment;
pub use payment_request::PaymentRequest;
pub use project::Project;

pub trait Projection: Entity {}
