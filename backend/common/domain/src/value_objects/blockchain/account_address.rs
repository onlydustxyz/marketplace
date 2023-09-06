use std::{convert::TryFrom, fmt, str::FromStr};

use hex::FromHex;
use serde_with::{DeserializeFromStr, SerializeDisplay};

/// A struct that represents an account address.
#[derive(
	Ord, PartialOrd, Eq, PartialEq, Hash, Clone, Copy, SerializeDisplay, DeserializeFromStr,
)]
pub struct AccountAddress<const LENGTH: usize>([u8; LENGTH]);

impl<const LENGTH: usize> AccountAddress<LENGTH> {
	/// Hex address: 0x0
	pub const ZERO: Self = Self([0u8; LENGTH]);

	pub const fn new(address: [u8; LENGTH]) -> Self {
		Self(address)
	}

	pub fn short_str_lossless(&self) -> String {
		let hex_str = hex::encode(&self.0).trim_start_matches('0').to_string();
		if hex_str.is_empty() {
			"0".to_string()
		} else {
			hex_str
		}
	}

	pub fn to_vec(&self) -> Vec<u8> {
		self.0.to_vec()
	}

	pub fn into_bytes(self) -> [u8; LENGTH] {
		self.0
	}

	pub fn from_hex_literal(literal: &str) -> Result<Self, AccountAddressParseError> {
		if !literal.starts_with("0x") {
			return Err(AccountAddressParseError);
		}

		let hex_len = literal.len() - 2;

		// If the string is too short, pad it
		if hex_len < LENGTH * 2 {
			let mut hex_str = String::with_capacity(LENGTH * 2);
			for _ in 0..LENGTH * 2 - hex_len {
				hex_str.push('0');
			}
			hex_str.push_str(&literal[2..]);
			AccountAddress::from_hex(hex_str)
		} else {
			AccountAddress::from_hex(&literal[2..])
		}
	}

	pub fn from_hex<T: AsRef<[u8]>>(hex: T) -> Result<Self, AccountAddressParseError> {
		<Vec<u8>>::from_hex(hex)
			.map_err(|_| AccountAddressParseError)
			.and_then(|vec| vec.try_into().map_err(|_| AccountAddressParseError))
			.map(Self)
			.map_err(|_| AccountAddressParseError)
	}

	pub fn to_hex(&self) -> String {
		format!("{:x}", self)
	}

	pub fn from_bytes<T: AsRef<[u8]>>(bytes: T) -> Result<Self, AccountAddressParseError> {
		<[u8; LENGTH]>::try_from(bytes.as_ref())
			.map_err(|_| AccountAddressParseError)
			.map(Self)
	}
}

impl<const LENGTH: usize> AsRef<[u8]> for AccountAddress<LENGTH> {
	fn as_ref(&self) -> &[u8] {
		&self.0
	}
}

impl<const LENGTH: usize> std::ops::Deref for AccountAddress<LENGTH> {
	type Target = [u8; LENGTH];

	fn deref(&self) -> &Self::Target {
		&self.0
	}
}

impl<const LENGTH: usize> fmt::Display for AccountAddress<LENGTH> {
	fn fmt(&self, f: &mut fmt::Formatter) -> std::fmt::Result {
		write!(f, "{:#x}", self)
	}
}

impl<const LENGTH: usize> fmt::Debug for AccountAddress<LENGTH> {
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
		write!(f, "{:#x}", self)
	}
}

impl<const LENGTH: usize> fmt::LowerHex for AccountAddress<LENGTH> {
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
		if f.alternate() {
			write!(f, "0x")?;
		}

		for byte in &self.0 {
			write!(f, "{:02x}", byte)?;
		}

		Ok(())
	}
}

impl<const LENGTH: usize> fmt::UpperHex for AccountAddress<LENGTH> {
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
		if f.alternate() {
			write!(f, "0x")?;
		}

		for byte in &self.0 {
			write!(f, "{:02X}", byte)?;
		}

		Ok(())
	}
}

impl<const LENGTH: usize> From<[u8; LENGTH]> for AccountAddress<LENGTH> {
	fn from(bytes: [u8; LENGTH]) -> Self {
		Self::new(bytes)
	}
}

impl<const LENGTH: usize> TryFrom<&[u8]> for AccountAddress<LENGTH> {
	type Error = AccountAddressParseError;

	fn try_from(bytes: &[u8]) -> Result<AccountAddress<LENGTH>, AccountAddressParseError> {
		Self::from_bytes(bytes)
	}
}

impl<const LENGTH: usize> TryFrom<Vec<u8>> for AccountAddress<LENGTH> {
	type Error = AccountAddressParseError;

	fn try_from(bytes: Vec<u8>) -> Result<AccountAddress<LENGTH>, AccountAddressParseError> {
		Self::from_bytes(bytes)
	}
}

impl<const LENGTH: usize> From<AccountAddress<LENGTH>> for Vec<u8> {
	fn from(addr: AccountAddress<LENGTH>) -> Vec<u8> {
		addr.0.to_vec()
	}
}

impl<const LENGTH: usize> From<&AccountAddress<LENGTH>> for Vec<u8> {
	fn from(addr: &AccountAddress<LENGTH>) -> Vec<u8> {
		addr.0.to_vec()
	}
}

impl<const LENGTH: usize> From<AccountAddress<LENGTH>> for [u8; LENGTH] {
	fn from(addr: AccountAddress<LENGTH>) -> Self {
		addr.0
	}
}

impl<const LENGTH: usize> From<&AccountAddress<LENGTH>> for [u8; LENGTH] {
	fn from(addr: &AccountAddress<LENGTH>) -> Self {
		addr.0
	}
}

impl<const LENGTH: usize> From<&AccountAddress<LENGTH>> for String {
	fn from(addr: &AccountAddress<LENGTH>) -> String {
		format!("{addr}")
	}
}

impl<const LENGTH: usize> TryFrom<String> for AccountAddress<LENGTH> {
	type Error = AccountAddressParseError;

	fn try_from(s: String) -> Result<AccountAddress<LENGTH>, AccountAddressParseError> {
		Self::from_hex_literal(&s)
	}
}

impl<const LENGTH: usize> FromStr for AccountAddress<LENGTH> {
	type Err = AccountAddressParseError;

	fn from_str(s: &str) -> Result<Self, AccountAddressParseError> {
		Self::from_hex_literal(s)
	}
}

#[derive(Clone, Copy, Debug)]
pub struct AccountAddressParseError;

impl fmt::Display for AccountAddressParseError {
	fn fmt(&self, f: &mut fmt::Formatter) -> std::fmt::Result {
		write!(f, "unable to parse AccoutAddress")
	}
}

impl std::error::Error for AccountAddressParseError {}

#[cfg(test)]
mod tests {
	use std::{
		convert::{AsRef, TryFrom},
		str::FromStr,
	};

	use hex::FromHex;

	use super::AccountAddress;

	#[test]
	fn test_display_impls() {
		let hex = "ca843279e3427144cead5e4d5999a3d0";
		let upper_hex = "CA843279E3427144CEAD5E4D5999A3D0";

		let address = AccountAddress::<16>::from_hex(hex).unwrap();

		assert_eq!(format!("{}", address), format!("0x{}", hex));
		assert_eq!(format!("{:?}", address), format!("0x{}", hex));
		assert_eq!(format!("{:X}", address), upper_hex);
		assert_eq!(format!("{:x}", address), hex);

		assert_eq!(format!("{:#x}", address), format!("0x{}", hex));
		assert_eq!(format!("{:#X}", address), format!("0x{}", upper_hex));
	}

	#[test]
	fn test_short_str_lossless() {
		let address = AccountAddress::<16>::from_hex("00c0f1f95c5b1c5f0eda533eff269000").unwrap();

		assert_eq!(
			address.short_str_lossless(),
			"c0f1f95c5b1c5f0eda533eff269000",
		);
	}

	#[test]
	fn test_short_str_lossless_zero() {
		let address = AccountAddress::<16>::from_hex("00000000000000000000000000000000").unwrap();

		assert_eq!(address.short_str_lossless(), "0");
	}

	#[test]
	fn test_address() {
		let hex = "ca843279e3427144cead5e4d5999a3d0";
		let bytes = Vec::from_hex(hex).expect("You must provide a valid Hex format");

		assert_eq!(
			bytes.len(),
			16,
			"Address {bytes:?} is not 16-bytes long. Addresses must be 16 bytes",
		);

		let address = AccountAddress::<16>::from_hex(hex).unwrap();

		assert_eq!(address.as_ref().to_vec(), bytes);
	}

	#[test]
	fn test_from_hex_literal() {
		let hex_literal = "0x1";
		let hex = "00000000000000000000000000000001";

		let address_from_literal = AccountAddress::<16>::from_hex_literal(hex_literal).unwrap();
		let address = AccountAddress::<16>::from_hex(hex).unwrap();

		assert_eq!(address_from_literal, address);

		// Missing '0x'
		AccountAddress::<16>::from_hex_literal(hex).unwrap_err();
		// Too long
		AccountAddress::<16>::from_hex_literal("0x100000000000000000000000000000001").unwrap_err();
	}

	#[test]
	fn test_ref() {
		let address = AccountAddress::new([1u8; 16]);
		let _: &[u8] = address.as_ref();
	}

	#[test]
	fn test_address_from_proto_invalid_length() {
		let bytes = vec![1; 123];
		AccountAddress::<16>::from_bytes(bytes).unwrap_err();
	}

	#[test]
	fn test_deserialize_from_json_value() {
		let address = AccountAddress::new([1u8; 16]);
		let json_value = serde_json::to_value(address).expect("serde_json::to_value fail.");
		let address2: AccountAddress<16> =
			serde_json::from_value(json_value).expect("serde_json::from_value fail.");
		assert_eq!(address, address2)
	}

	#[test]
	fn test_serde_json() {
		let hex = "ca843279e3427144cead5e4d5999a3d0";
		let json_hex = "\"0xca843279e3427144cead5e4d5999a3d0\"";

		let address = AccountAddress::from_hex(hex).unwrap();

		let json = serde_json::to_string(&address).unwrap();
		let json_address: AccountAddress<16> = serde_json::from_str(json_hex).unwrap();

		assert_eq!(json, json_hex);
		assert_eq!(address, json_address);
	}

	#[test]
	fn test_address_from_empty_string() {
		assert!(AccountAddress::<16>::try_from("".to_string()).is_err());
		assert!(AccountAddress::<16>::from_str("").is_err());
	}

	#[test]
	fn test_address_string_roundtrip() {
		let addr = AccountAddress::new([1u8; 16]);
		let s = String::from(&addr);
		let addr2 = AccountAddress::<16>::try_from(s).expect("roundtrip to string should work");
		assert_eq!(addr, addr2);
	}

	#[test]
	fn test_address_protobuf_roundtrip() {
		let addr = AccountAddress::new([1u8; 16]);
		let bytes = addr.to_vec();
		assert_eq!(bytes.clone(), addr.as_ref());
		let addr2 = AccountAddress::<16>::try_from(&bytes[..]).unwrap();
		assert_eq!(addr, addr2);
	}
}
