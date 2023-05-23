/// This module manages Ethereum address manipulation
use serde::{Deserialize, Serialize};
use std::convert::TryFrom;
use web3::types::H160;
use thiserror::Error;

/// This struct represents an Ethereum address as a `0x` prefixed hexadecimal string
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(transparent)]
pub struct EthereumAddress(String);

impl Default for EthereumAddress {
	/// Returns a default `EthereumAddress` that contains only 0's
	fn default() -> Self {
		Self("0x00".to_string())
	}
}

/// This enum represents all possible errors that can occur from parsing an `EthereumAddress` from a `&str`
#[derive(Debug, Error)]
pub enum EthereumAddressFromStrError {
	#[error("Input should be at least 3 characters long")]
	TooShort,
	#[error("Input should be at most 42 characters long")]
	TooLong,
	#[error("Input start with '0x'")]
	NoPrefix,
	#[error("Input should only contains it's prefix and valid hexadecimal numbers")]
	InvalidCharacter,
}

impl TryFrom<&str> for EthereumAddress {
	type Error = EthereumAddressFromStrError;

	fn try_from(str: &str) -> Result<Self, Self::Error> {
		if str.len() < 3 {
			return Err(Self::Error::TooShort);
		}

		if str.len() > 42 {
			return Err(Self::Error::TooLong);
		}

		let lowercased = str.to_lowercase();

		if &lowercased[0..2] != "0x" {
			return Err(Self::Error::NoPrefix);
		}

		if !lowercased[2..].chars().all(|c| c.is_numeric() || ('a'..='f').contains(&c)) {
			return Err(Self::Error::InvalidCharacter);
		}

		// Add 0 if len is odd
		let padded = format!(
			"0x{:0>width$}",
			&lowercased[2..],
			width = str.len() - 2 + str.len() % 2
		);

		Ok(Self(padded))
	}
}

/// This trait implements the `GraphQLScalar` trait from the `juniper` crate for `EthereumAddress`
#[juniper::graphql_scalar(
	description = "A `0x` prefixed hexadecimal string representing 20 bytes of data"
)]
impl<S> GraphQLScalar for EthereumAddress
where
	S: juniper::ScalarValue,
{
	fn resolve(&self) -> juniper::Value {
		juniper::Value::scalar(self.0.to_owned())
	}

	fn from_input_value(value: &juniper::InputValue) -> Option<Self> {
		EthereumAddress::try_from(value.as_string_value()?).ok()
	}

	fn from_str<'a>(value: juniper::ScalarToken<'a>) -> juniper::ParseScalarResult<'a, S> {
		<String as juniper::ParseScalarValue<S>>::from_str(value)
	}
}

impl From<H160> for EthereumAddress {
	/// Converts an `H160` to an `EthereumAddress`
	fn from(address: H160) -> Self {
		Self(format!("{address:#x}"))
	}
}

#[cfg(test)]
mod test {
	use juniper::{DefaultScalarValue, FromInputValue, InputValue};
	use rstest::rstest;

	use super::*;

	#[rstest]
	#[case(InputValue::Scalar(DefaultScalarValue::String("0x0".to_string())), true)]
	#[case(InputValue::Scalar(DefaultScalarValue::String("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045".to_string())), true)]
	#[case(InputValue::Scalar(DefaultScalarValue::String("0xd8da6bf26964af9d7eed9e03e53415d37aa96045".to_string())), true)]
	#[case(InputValue::Scalar(DefaultScalarValue::String("0Xd8da6bf26964af9d7eed9e03e53415d37aa96045".to_string())), true)]
	#[case(InputValue::Scalar(DefaultScalarValue::String("0xd8dA6BF26964aF9D7".to_string())), true)]
	#[case(InputValue::Scalar(DefaultScalarValue::String("d8da6bf26964af9d7eed9e03e53415d37aa96045".to_string())), false)]
	#[case(InputValue::Scalar(DefaultScalarValue::String("0xfd8da6bf26964af9d7eed9e03e53415d37aa96045".to_string())), false)]
	#[case(InputValue::Scalar(DefaultScalarValue::String("xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045".to_string())), false)]
	#[case(InputValue::Scalar(DefaultScalarValue::String("0x1G".to_string())), false)]
	#[case(InputValue::Scalar(DefaultScalarValue::Int(0x0)), false)]
	#[case(InputValue::Scalar(DefaultScalarValue::Float(4.2)), false)]
	#[case(InputValue::Scalar(DefaultScalarValue::Boolean(false)), false)]
	#[case(InputValue::Null, false)]
	#[case(InputValue::Enum("0x0".to_string()), false)]
	#[case(InputValue::Variable("0x0".to_string()), false)]
	#[case(InputValue::list(vec![InputValue::Scalar(DefaultScalarValue::String("0x0".to_string()))]), false)]
	#[case(InputValue::<DefaultScalarValue>::Object(Default::default()), false)]
	fn is_valid_ethereum_address(#[case] input: juniper::InputValue, #[case] expect: bool) {
		assert_eq!(EthereumAddress::from_input_value(&input).is_some(), expect)
	}

	#[rstest]
	fn from_h160() {
		const RAW_ADDR: &str = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
		let address_as_h160: H160 = RAW_ADDR.parse().unwrap();
		let address_as_eth: EthereumAddress = RAW_ADDR.try_into().unwrap();
		assert_eq!(EthereumAddress::from(address_as_h160), address_as_eth);
	}
}