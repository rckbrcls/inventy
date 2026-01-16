use crate::dtos::shop_dto::{CreateShopDTO, UpdateShopDTO};
use crate::models::shop_model::Shop;
use crate::repositories::shop_repository::ShopsRepository;
use sqlx::SqlitePool;

pub struct ShopService {
    pool: SqlitePool,
    repo: ShopsRepository,
}

impl ShopService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = ShopsRepository::new(pool.clone());
        Self { pool, repo }
    }

    pub async fn create_shop(&self, payload: CreateShopDTO) -> Result<Shop, String> {
        let shop = payload.into_model();
        self.repo
            .create(shop)
            .await
            .map_err(|e| format!("Erro ao criar loja: {}", e))
    }

    pub async fn update_shop(&self, payload: UpdateShopDTO) -> Result<Shop, String> {
        let existing = self
            .repo
            .find_by_id(&payload.id)
            .await
            .map_err(|e| format!("Erro ao buscar loja: {}", e))?
            .ok_or_else(|| format!("Loja não encontrada: {}", payload.id))?;

        let updated_shop = payload.apply_to_model(existing);
        self.repo
            .update(updated_shop)
            .await
            .map_err(|e| format!("Erro ao atualizar loja: {}", e))
    }

    pub async fn delete_shop(&self, id: &str) -> Result<(), String> {
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Erro ao deletar loja: {}", e))
    }

    pub async fn get_shop(&self, id: &str) -> Result<Option<Shop>, String> {
        self.repo
            .find_by_id(id)
            .await
            .map_err(|e| format!("Erro ao buscar loja: {}", e))
    }

    pub async fn list_shops(&self) -> Result<Vec<Shop>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Erro ao listar lojas: {}", e))
    }

    /// Returns the default shop (is_default = true)
    pub async fn get_default_shop(&self) -> Result<Option<Shop>, String> {
        let shops = self
            .repo
            .list()
            .await
            .map_err(|e| format!("Erro ao buscar loja padrão: {}", e))?;

        Ok(shops.into_iter().find(|s| s.is_default))
    }

    /// Sets a shop as default and removes default from all others (atomic operation)
    pub async fn set_default_shop(&self, id: &str) -> Result<Shop, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Remove default from all shops
        sqlx::query("UPDATE shops SET is_default = 0, updated_at = datetime('now')")
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao remover padrão das lojas: {}", e))?;

        // Set the specified shop as default
        let shop = sqlx::query_as::<_, Shop>(
            r#"UPDATE shops SET is_default = 1, updated_at = datetime('now')
               WHERE id = $1 RETURNING *"#,
        )
        .bind(id)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| format!("Erro ao definir loja padrão: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(shop)
    }
}
