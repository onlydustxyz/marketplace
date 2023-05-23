/// A usecase for updating a sponsor in the system.
///
/// This usecase provides the main business logic for updating a sponsor's information and calls on the
/// relevant repositories and services to perform the necessary database and image store operations.
pub struct Usecase {
    sponsor_repository: SponsorRepository,
    image_store: Arc<dyn ImageStoreService>,
}

impl Usecase {
    /// Creates a new `Usecase` instance with the given `SponsorRepository` and `ImageStoreService`.
    ///
    /// # Arguments:
    ///
    /// * `sponsor_repository` - The repository to be used for retrieving and updating sponsors.
    /// * `image_store` - The image store service to be used for storing sponsor logos.
    ///
    /// # Returns:
    ///
    /// A new `Usecase` instance.
    pub fn new(
        sponsor_repository: SponsorRepository,
        image_store: Arc<dyn ImageStoreService>,
    ) -> Self {
        Self {
            sponsor_repository,
            image_store,
        }
    }

    /// Updates the sponsor's information according to the given values.
    ///
    /// # Arguments:
    ///
    /// * `sponsor_id` - The ID of the sponsor to be updated.
    /// * `name` - The new name of the sponsor (optional).
    /// * `logo_url` - The new logo URL of the sponsor (optional).
    /// * `url` - The new website URL of the sponsor (nullable).
    ///
    /// # Returns:
    ///
    /// The ID of the updated sponsor.
    ///
    /// # Errors:
    ///
    /// Returns a `DomainError` if any of the input values are invalid or if the update operation fails.
    #[allow(clippy::too_many_arguments)]
    #[instrument(skip(self))]
    pub async fn update(
        &self,
        sponsor_id: SponsorId,
        name: Option<NonEmptyTrimmedString>,
        logo_url: Option<Url>,
        url: Nullable<Url>,
    ) -> Result<SponsorId, DomainError> {
        let mut sponsor = self.sponsor_repository.find_by_id(&sponsor_id)?;

        if let Some(name) = name {
            sponsor = sponsor.with_name(name.into());
        }
        if let Some(logo_url) = logo_url {
            let stored_logo_url = self.image_store.store_image(&logo_url).await?.to_string();
            sponsor = sponsor.with_logo_url(stored_logo_url);
        }
        if let Some(url) = url.explicit() {
            sponsor = sponsor.with_url(url.map(|url| url.to_string()))
        }

        self.sponsor_repository.update(&sponsor_id, sponsor)?;
        Ok(sponsor_id)
    }
}

#[cfg(test)]
mod tests {

    use ::url::Url;
    use anyhow::anyhow;
    use assert_matches::assert_matches;
    use mockall::predicate::eq;
    use rstest::{fixture, rstest};

    use super::*;
    use crate::domain::{ImageStoreServiceError, MockImageStoreService, Sponsor};

    #[fixture]
    fn sponsor_id() -> SponsorId {
        uuid::Uuid::new_v4().into()
    }

    #[fixture]
    fn name() -> NonEmptyTrimmedString {
        NonEmptyTrimmedString::new("name".to_string()).unwrap()
    }

    #[fixture]
    fn logo_url() -> Url {
        Url::parse("http://sponsor.org/image.jpg").unwrap()
    }

    #[fixture]
    fn url() -> Url {
        Url::parse("http://sponsor.org").unwrap()
    }

    #[rstest]
    async fn test_update(
        sponsor_id: SponsorId,
        name: NonEmptyTrimmedString,
        logo_url: Url,
        url: Url,
    ) {
        let mut image_store_service = MockImageStoreService::new();
        image_store_service
            .expect_store_image()
            .with(eq(logo_url.clone()))
            .once()
            .returning(|_| Ok(Url::parse("http://img-store.com/1234.jpg").unwrap()));

        let mut sponsor_repository = SponsorRepository::default();
        sponsor_repository
            .expect_find_by_id()
            .with(eq(sponsor_id))
            .once()
            .returning(move |_| {
                Ok(Sponsor::new(
                    sponsor_id,
                    "old name".to_string(),
                    "http://sponsor.org/old-image.jpg".to_string(),
                    None,
                ))
            });
        sponsor_repository
            .expect_update()
            .withf(|_, input: &Sponsor| input.logo_url() == "http://img-store.com/1234.jpg")
            .once()
            .returning(|_, _: Sponsor| Ok(()));

        let usecase = Usecase::new(sponsor_repository, Arc::new(image_store_service));

        usecase
            .update(sponsor_id, Some(name), Some(logo_url), Nullable::Some(url))
            .await
            .unwrap();
    }

    #[rstest]
    async fn test_update_with_bad_logo_url(
        sponsor_id: SponsorId,
        name: NonEmptyTrimmedString,
        logo_url: Url,
        url: Url,
    ) {
        let mut image_store_service = MockImageStoreService::new();
        image_store_service
            .expect_store_image()
            .with(eq(logo_url.clone()))
            .once()
            .returning(|_| Err(ImageStoreServiceError::NotFound(anyhow!("404"))));

        let mut sponsor_repository = SponsorRepository::default();
        sponsor_repository
            .expect_find_by_id()
            .with(eq(sponsor_id))
            .once()
            .returning(move |_| {
                Ok(Sponsor::new(
                    sponsor_id,
                    "old name".to_string(),
                    "http://sponsor.org/old-image.jpg".to_string(),
                    None,
                ))
            });

        let usecase = Usecase::new(sponsor_repository, Arc::new(image_store_service));

        let result = usecase
            .update(sponsor_id, Some(name), Some(logo_url), Nullable::Some(url))
            .await;
        assert_matches!(result, Err(DomainError::InvalidInputs(_)));
    }
}