use crate::features::checkout::dtos::checkout_dto::{CreateCheckoutDTO, UpdateCheckoutDTO};
use crate::features::checkout::models::checkout_model::Checkout;
use crate::features::checkout::repositories::checkouts_repository::CheckoutsRepository;
use sqlx::SqlitePool;

pub struct CheckoutService {
    repo: CheckoutsRepository,
}

impl CheckoutService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = CheckoutsRepository::new(pool);
        Self { repo }
    }

    pub async fn create_checkout(&self, payload: CreateCheckoutDTO) -> Result<Checkout, String> {
        let checkout = payload.into_model();
        self.repo
            .create(checkout)
            .await
            .map_err(|e| format!("Failed to create checkout: {}", e))
    }

    pub async fn update_checkout(&self, payload: UpdateCheckoutDTO) -> Result<Checkout, String> {
        let existing = self
            .repo
            .find_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch checkout: {}", e))?
            .ok_or_else(|| "Checkout not found".to_string())?;

        let updated = payload.apply_to_checkout(existing);
        self.repo
            .update(updated)
            .await
            .map_err(|e| format!("Failed to update checkout: {}", e))
    }

    pub async fn delete_checkout(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete checkout: {}", e))
    }

    pub async fn get_checkout(&self, id: &str) -> Result<Option<Checkout>, String> {
        self.repo
            .find_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch checkout: {}", e))
    }

    pub async fn get_checkout_by_token(&self, token: &str) -> Result<Option<Checkout>, String> {
        self.repo
            .find_by_token(token)
            .await
            .map_err(|e| format!("Failed to fetch checkout: {}", e))
    }

    pub async fn list_checkouts(&self) -> Result<Vec<Checkout>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list checkouts: {}", e))
    }
}
