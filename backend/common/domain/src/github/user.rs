/// This module defines the `User` struct.
use std::str::FromStr;
use derive_getters::Getters;
use derive_more::{AsRef, Display, From, Into};
use derive_new::new;
use juniper::{GraphQLObject, ParseScalarResult, ParseScalarValue, Value};
use serde::{Deserialize, Serialize};
use url::Url;
use crate::Entity;

/// A representation of a user in GitHub.
#[derive(
    new, Debug, Clone, Getters, GraphQLObject, Serialize, Deserialize, PartialEq, Eq, Hash,
)]
pub struct User {
    /// The ID of the user.
    id: Id,
    /// The login of the user.
    login: String,
    /// The avatar URL of the user.
    avatar_url: Url,
    /// The HTML URL of the user's profile.
    html_url: Url,
}

/// This trait defines an entity with an ID.
pub trait Entity {
    /// The type of the ID.
    type Id: FromStr + Copy;

    /// Returns the ID of the entity.
    fn id(&self) -> Self::Id;
}

/// The ID of a user.
#[derive(
    Debug,
    Clone,
    Copy,
    Default,
    Serialize,
    Deserialize,
    PartialEq,
    Eq,
    Hash,
    Display,
    From,
    Into,
    AsRef,
    AsExpression,
    FromToSql,
    FromSqlRow,
)]
#[sql_type = "diesel::sql_types::BigInt"]
pub struct Id(i64);

impl FromStr for Id {
    type Err = <i64 as FromStr>::Err;

    /// Parses a string into an ID value.
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        i64::from_str(s).map(Into::into)
    }
}

impl From<u64> for Id {
    /// Converts an unsigned 64-bit integer to an ID value.
    fn from(value: u64) -> Self {
        (value as i64).into()
    }
}

#[juniper::graphql_scalar(
    name = "GithubUserId",
    description = "A GitHub user ID, represented as an integer"
)]
impl<S> GraphQLScalar for Id
where
    S: ScalarValue,
{
    /// Resolves the scalar to a value.
    fn resolve(&self) -> Value {
        Value::scalar::<i32>(
            self.0.try_into().expect("Inner user id is not a valid 32-bits integer"),
        )
    }

    /// Converts an input value to an ID value.
    fn from_input_value(value: &InputValue) -> Option<Self> {
        value.as_int_value().map(|x| Self(x as i64))
    }

    /// Parses a scalar token into a scalar value.
    fn from_str<'a>(value: ScalarToken<'a>) -> ParseScalarResult<'a, S> {
        <i32 as ParseScalarValue<S>>::from_str(value)
    }
}