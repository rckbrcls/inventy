use crate::dtos::location_dto::{CreateLocationDTO, UpdateLocationDTO};
use crate::models::location_model::Location;
use crate::repositories::locations_repository::LocationsRepository;
use sqlx::SqlitePool;

pub struct LocationService {
    repo: LocationsRepository,
}

impl LocationService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = LocationsRepository::new(pool);
        Self { repo }
    }

    pub async fn create_location(&self, payload: CreateLocationDTO) -> Result<Location, String> {
        let location = payload.into_model();
        self.repo
            .create(location)
            .await
            .map_err(|e| format!("Failed to create location: {}", e))
    }

    pub async fn update_location(&self, payload: UpdateLocationDTO) -> Result<Location, String> {
        let existing = self
            .repo
            .get_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch location: {}", e))?
            .ok_or_else(|| format!("Location not found: {}", payload.id))?;

        let updated = payload.apply_to_model(existing);
        self.repo
            .update(updated)
            .await
            .map_err(|e| format!("Failed to update location: {}", e))
    }

    pub async fn delete_location(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete location: {}", e))
    }

    pub async fn get_location(&self, id: &str) -> Result<Option<Location>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch location: {}", e))
    }

    pub async fn list_locations(&self) -> Result<Vec<Location>, String> {
        self.repo
            .get_all()
            .await
            .map_err(|e| format!("Failed to list locations: {}", e))
    }
}
