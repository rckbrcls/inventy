use crate::dtos::product_dto::{CreateProductDTO, ProductListFilterDTO, UpdateProductDTO};
use crate::models::product_model::Product;
use crate::repositories::product_categories_repository::ProductCategoriesRepository;
use crate::repositories::product_repository::ProductRepository;
use sqlx::SqlitePool;

pub struct ProductService {
    pool: SqlitePool,
    repo: ProductRepository,
    categories_repo: ProductCategoriesRepository,
}

impl ProductService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = ProductRepository::new(pool.clone());
        let categories_repo = ProductCategoriesRepository::new(pool.clone());
        Self {
            pool,
            repo,
            categories_repo,
        }
    }

    pub async fn create_product(&self, payload: CreateProductDTO) -> Result<Product, String> {
        let (product, categories) = payload.into_models();
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Failed to start transaction: {}", e))?;

        let created_product = self
            .repo
            .create_in_tx(&mut tx, &product)
            .await
            .map_err(|e| format!("Failed to create product: {}", e))?;

        if !categories.is_empty() {
            self.categories_repo
                .create_many_in_tx(&mut tx, categories)
                .await
                .map_err(|e| format!("Failed to create product categories: {}", e))?;
        }

        tx.commit()
            .await
            .map_err(|e| format!("Failed to commit transaction: {}", e))?;

        Ok(created_product)
    }

    pub async fn update_product(&self, payload: UpdateProductDTO) -> Result<Product, String> {
        let (product, _) = payload.into_models();
        self.repo
            .update(product)
            .await
            .map_err(|e| format!("Failed to update product: {}", e))
    }

    pub async fn delete_product(&self, id: &str) -> Result<(), String> {
        self.categories_repo
            .delete_by_product_id(id)
            .await
            .map_err(|e| format!("Failed to delete product categories: {}", e))?;
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Failed to delete product: {}", e))
    }

    pub async fn get_product(&self, id: &str) -> Result<Option<Product>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch product: {}", e))
    }

    pub async fn list_products(&self) -> Result<Vec<Product>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Failed to list products: {}", e))
    }

    pub async fn list_products_by_shop(&self, shop_id: &str) -> Result<Vec<Product>, String> {
        self.repo
            .list_by_shop(shop_id)
            .await
            .map_err(|e| format!("Failed to list products by shop: {}", e))
    }

    pub async fn list_products_filtered(
        &self,
        filters: ProductListFilterDTO,
    ) -> Result<Vec<Product>, String> {
        let page = filters.page.unwrap_or(1).max(1);
        let per_page = filters.per_page.unwrap_or(20).clamp(1, 100);
        let offset = ((page - 1) * per_page) as i64;

        self.repo
            .list_filtered(
                filters.shop_id.as_deref(),
                filters.status.as_deref(),
                filters.category_id.as_deref(),
                filters.brand_id.as_deref(),
                filters.query.as_deref(),
                filters.is_shippable,
                filters.min_price,
                filters.max_price,
                per_page as i64,
                offset,
            )
            .await
            .map_err(|e| format!("Failed to list filtered products: {}", e))
    }
}
