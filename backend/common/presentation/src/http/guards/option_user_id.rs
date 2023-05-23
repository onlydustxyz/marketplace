/// A header name used to set the UserID.
const HASURA_USER_ID_HEADER_KEY: &str = "x-hasura-user-id";
/// A header name used to set the GitHub UserID.
const HASURA_GITHUB_USER_ID_HEADER_KEY: &str = "x-hasura-githubUserId";

/// An error enum for `OptionUserId` functions that can fail.
#[derive(Debug, Error, PartialEq, Eq)]
pub enum Error {
    #[error("{0} header is not present")]
    /// Error raised when the specified header is missing.
    Missing(&'static str),
    #[error("{0} header is invalid")]
    /// Error raised when the specified header is invalid.
    Invalid(&'static str),
}

/// Optional wrapper around `UserId` and `GithubUserId`.
#[derive(Debug, PartialEq, Eq)]
pub struct OptionUserId {
    user_id: Option<UserId>,
    github_user_id: Option<GithubUserId>,
}

impl OptionUserId {
    /// Returns the `UserId` included in the headers.
    /// # Errors
    /// If the UserId is not included in the header.
    pub fn user_id(&self) -> Result<UserId, Error> {
        self.user_id.ok_or(Error::Missing(HASURA_USER_ID_HEADER_KEY))
    }

    /// Returns the `GithubUserId` included in the headers.
    /// # Errors
    /// If the GithubUserId is not included in the header.
    pub fn github_user_id(&self) -> Result<GithubUserId, Error> {
        self.github_user_id
            .ok_or(Error::Missing(HASURA_GITHUB_USER_ID_HEADER_KEY))
    }

    fn build<E: std::error::Error>(
        user_id: Result<Option<UserId>, E>,
        github_user_id: Result<Option<GithubUserId>, E>,
    ) -> Result<Self, E> {
        Ok(Self {
            user_id: user_id?,
            github_user_id: github_user_id?,
        })
    }
}

impl OptionUserId {
    /// Tries to construct an instance of `OptionUserId` from the provided headers.
    fn from_request_headers<'r>(
        headers: &HeaderMap<'r>,
    ) -> Outcome<Self, <Self as FromRequest<'r>>::Error> {
        let user_id = headers.try_parse_header_as(HASURA_USER_ID_HEADER_KEY);
        let github_user_id = headers.try_parse_header_as(HASURA_GITHUB_USER_ID_HEADER_KEY);

        OptionUserId::build(user_id, github_user_id)
            .into_outcome(Status::BadRequest)
    }
}

/// A helper trait to parse a given header to the desired type, if possible.
trait TryParseHeaderAs<R> {
    /// Try to parse a given header into the specified type.
    ///
    /// # Arguments
    ///
    /// * `self` - The `HeaderMap` containing the headers to parse.
    /// * `header_name` - The name of the header to parse.
    ///
    /// # Errors
    ///
    /// If the parse fails or if a given header is missing an error is returned.
    fn try_parse_header_as(&self, header_name: &'static str) -> Result<Option<R>, Error>;
}

impl<R: FromStr + Default> TryParseHeaderAs<R> for HeaderMap<'_> {
    fn try_parse_header_as(&self, header_name: &'static str) -> Result<Option<R>, Error> {
        let value: Option<R> = match self.get_one(header_name) {
            Some(value) => Some(
                value
                    .parse()
                    .map_err(|_| Error::Invalid(header_name))?,
            ),
            None => None,
        };
        Ok(value)
    }
}

#[async_trait]
impl<'r> FromRequest<'r> for OptionUserId {
    type Error = Error;

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        OptionUserId::from_request_headers(request.headers())
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use rocket::http::{Header, HeaderMap};
    use rstest::rstest;
    use uuid::Uuid;

    #[rstest]
    #[case(Uuid::default(), Default::default())]
    #[case(Uuid::from_u128(42), 42)]
    fn from_valid_headers(#[case] user_id: Uuid, #[case] github_user_id: i64) {
        let mut header_map = HeaderMap::new();
        header_map.add(Header::new(HASURA_USER_ID_HEADER_KEY, user_id.to_string()));
        header_map.add(Header::new(
            HASURA_GITHUB_USER_ID_HEADER_KEY,
            github_user_id.to_string(),
        ));

        match OptionUserId::from_request_headers(&header_map) {
            Outcome::Success(user) => {
                assert_eq!(user.user_id(), Ok(user_id.into()));
                assert_eq!(user.github_user_id(), Ok(github_user_id.into()));
            }
            _ => panic!(),
        }
    }

    #[rstest]
    fn from_missing_headers() {
        let header_map = HeaderMap::new();

        match OptionUserId::from_request_headers(&header_map) {
            Outcome::Success(user) => {
                assert_eq!(
                    user.user_id(),
                    Err(Error::Missing(HASURA_USER_ID_HEADER_KEY))
                );
                assert_eq!(
                    user.github_user_id(),
                    Err(Error::Missing(HASURA_GITHUB_USER_ID_HEADER_KEY))
                );
            }
            _ => panic!(),
        }
    }

    #[rstest]
    fn from_invalid_user_id() {
        let mut header_map = HeaderMap::new();
        header_map.add(Header::new(HASURA_USER_ID_HEADER_KEY, "some random string"));

        assert_eq!(
            OptionUserId::from_request_headers(&header_map),
            Outcome::Failure((
                Status::BadRequest,
                Error::Invalid(HASURA_USER_ID_HEADER_KEY)
            ))
        )
    }

    #[rstest]
    fn from_invalid_github_user_id() {
        let mut header_map = HeaderMap::new();
        header_map.add(Header::new(
            HASURA_GITHUB_USER_ID_HEADER_KEY,
            "some random string",
        ));

        assert_eq!(
            OptionUserId::from_request_headers(&header_map),
            Outcome::Failure((
                Status::BadRequest,
                Error::Invalid(HASURA_GITHUB_USER_ID_HEADER_KEY)
            ))
        )
    }
}