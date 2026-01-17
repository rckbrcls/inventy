use crate::dtos::brand_dto::{CreateBrandDTO, UpdateBrandDTO};
use crate::models::brand_model::Brand;
use crate::repositories::brand_repository::BrandsRepository;
use sqlx::SqlitePool;

pub struct BrandService {
    repo: BrandsRepository,
}

impl BrandService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = BrandsRepository::new(pool);
        Self { repo }
    }

    pub async fn create_brand(&self, payload: CreateBrandDTO) -> Result<Brand, String> {
        let brand = payload.into_model();
        self.repo
            .create(brand)
            .await
            .map_err(|e| format!("Failed to create brand: {}", e))
    }

    pub async fn update_brand(&self, payload: UpdateBrandDTO) -> Result<Brand, String> {
        let existing = self
            .repo
            .find_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch brand: {}", e))?
            .ok_or_else(|| format!("Brand not found: {}", payload.id))?;

        let updated = payload.apply_to_model(existing);
        self.repo
            .update(updated)
            .await
            .map_err(|e| format!("Failed to update brand: {}", e))
    }

    pub async fn delete_brand(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete brand: {}", e))
    }

    pub async fn get_brand(&self, id: &str) -> Result<Option<Brand>, String> {
        self.repo
            .find_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch brand: {}", e))
    }

    pub async fn list_brands(&self) -> Result<Vec<Brand>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list brands: {}", e))
    }

    pub async fn list_brands_by_shop(&self, shop_id: &str) -> Result<Vec<Brand>, String> {
        self.repo
            .list_by_shop(shop_id)
            .await
            .map_err(|e| format!("Failed to list brands by shop: {}", e))
    }
}
