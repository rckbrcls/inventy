use crate::features::category::dtos::category_dto::{CreateCategoryDTO, UpdateCategoryDTO};
use crate::features::category::models::category_model::Category;
use crate::features::category::repositories::category_repository::CategoriesRepository;
use sqlx::SqlitePool;

pub struct CategoryService {
    repo: CategoriesRepository,
}

impl CategoryService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = CategoriesRepository::new(pool);
        Self { repo }
    }

    pub async fn create_category(&self, payload: CreateCategoryDTO) -> Result<Category, String> {
        let category = payload.into_model();
        self.repo
            .create(category)
            .await
            .map_err(|e| format!("Failed to create category: {}", e))
    }

    pub async fn update_category(&self, payload: UpdateCategoryDTO) -> Result<Category, String> {
        let existing = self
            .repo
            .find_by_id(&payload.id)
            .await
            .map_err(|e| format!("Failed to fetch category: {}", e))?
            .ok_or_else(|| format!("Category not found: {}", payload.id))?;

        let updated = payload.apply_to_model(existing);
        self.repo
            .update(updated)
            .await
            .map_err(|e| format!("Failed to update category: {}", e))
    }

    pub async fn delete_category(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete category: {}", e))
    }

    pub async fn get_category(&self, id: &str) -> Result<Option<Category>, String> {
        self.repo
            .find_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch category: {}", e))
    }

    pub async fn list_categories_by_shop(&self, shop_id: &str) -> Result<Vec<Category>, String> {
        self.repo
            .list_by_shop(shop_id)
            .await
            .map_err(|e| format!("Failed to list categories by shop: {}", e))
    }

    pub async fn list_categories(&self) -> Result<Vec<Category>, String> {
        self.repo
            .list_all()
            .await
            .map_err(|e| format!("Failed to list categories: {}", e))
    }
}
