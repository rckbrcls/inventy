use crate::dtos::product_dto::{CreateProductDTO, UpdateProductDTO};
use crate::models::product_model::Product;
use crate::repositories::product_categories_repository::ProductCategoriesRepository;
use crate::repositories::product_repository::ProductRepository;
use sqlx::SqlitePool;

pub struct ProductService {
    repo: ProductRepository,
    categories_repo: ProductCategoriesRepository,
}

impl ProductService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = ProductRepository::new(pool.clone());
        let categories_repo = ProductCategoriesRepository::new(pool);
        Self {
            repo,
            categories_repo,
        }
    }

    pub async fn create_product(&self, payload: CreateProductDTO) -> Result<Product, String> {
        let (product, categories) = payload.into_models();
        let created_product = self
            .repo
            .create(product)
            .await
            .map_err(|e| format!("Erro ao criar produto: {}", e))?;

        if !categories.is_empty() {
            self.categories_repo
                .create_many(categories)
                .await
                .map_err(|e| format!("Erro ao criar categorias: {}", e))?;
        }

        Ok(created_product)
    }

    pub async fn update_product(&self, payload: UpdateProductDTO) -> Result<Product, String> {
        let (product, _) = payload.into_models();
        self.repo
            .update(product)
            .await
            .map_err(|e| format!("Erro ao atualizar produto: {}", e))
    }

    pub async fn delete_product(&self, id: &str) -> Result<(), String> {
        self.categories_repo
            .delete_by_product_id(id)
            .await
            .map_err(|e| format!("Erro ao deletar categorias: {}", e))?;
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Erro ao deletar produto: {}", e))
    }

    pub async fn get_product(&self, id: &str) -> Result<Option<Product>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Erro ao buscar produto: {}", e))
    }

    pub async fn list_products(&self) -> Result<Vec<Product>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Erro ao listar produtos: {}", e))
    }
}
