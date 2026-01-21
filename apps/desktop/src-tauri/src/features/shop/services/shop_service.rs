use crate::features::shop::dtos::shop_dto::{CreateShopDTO, UpdateShopDTO};
use crate::features::shop::models::shop_model::Shop;
use crate::features::shop::repositories::shop_repository::ShopsRepository;
use crate::features::shop_template::services::shop_templates_service::ShopTemplatesService;
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

    /// Cria uma shop a partir de um template
    pub async fn create_shop_from_template(
        &self,
        payload: CreateShopDTO,
        template_code: Option<String>,
    ) -> Result<Shop, String> {
        let mut create_payload = payload;

        // Se um template foi especificado, buscar e aplicar sua configuração
        if let Some(template_code) = template_code {
            let template_service = ShopTemplatesService::new(self.pool.clone());
            let template = template_service
                .get_template_by_code(&template_code)
                .await
                .map_err(|e| format!("Erro ao buscar template: {}", e))?
                .ok_or_else(|| format!("Template não encontrado: {}", template_code))?;

            // Aplicar features_config do template se não foi especificado
            if create_payload.features_config.is_none() {
                create_payload.features_config = Some(template.features_config);
            }

            // Aplicar default_settings do template se settings não foi especificado
            if create_payload.settings.is_none() && template.default_settings.is_some() {
                create_payload.settings = template.default_settings;
            }
        }

        self.create_shop(create_payload).await
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
        // Verificar se a loja existe
        let shop = self
            .repo
            .find_by_id(id)
            .await
            .map_err(|e| format!("Erro ao buscar loja: {}", e))?
            .ok_or_else(|| format!("Loja não encontrada: {}", id))?;

        // Iniciar transação para exclusão em cascata
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Ordem de exclusão para respeitar foreign keys:
        // 1. Tabelas que dependem de orders (shipments, shipment_items, shipment_events, reviews)
        // 2. orders
        // 3. customer_group_memberships (join table)
        // 4. customer_groups
        // 5. transaction_items (já tem CASCADE, mas vamos garantir)
        // 6. inventory_levels (que dependem de products)
        // 7. inventory_movements (que dependem de inventory_levels)
        // 8. product_categories (join table)
        // 9. products
        // 10. brands
        // 11. categories
        // 12. shop

        // 1. Deletar shipments e dependências (via CASCADE)
        sqlx::query("DELETE FROM shipments WHERE order_id IN (SELECT id FROM orders WHERE shop_id = $1)")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar envios: {}", e))?;

        // 2. Deletar reviews relacionados a orders
        sqlx::query("DELETE FROM reviews WHERE order_id IN (SELECT id FROM orders WHERE shop_id = $1)")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar avaliações: {}", e))?;

        // 3. Deletar orders
        sqlx::query("DELETE FROM orders WHERE shop_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar pedidos: {}", e))?;

        // 4. Deletar customer_group_memberships (join table)
        sqlx::query("DELETE FROM customer_group_memberships WHERE customer_group_id IN (SELECT id FROM customer_groups WHERE shop_id = $1)")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar membros de grupos: {}", e))?;

        // 5. Deletar customer_groups
        sqlx::query("DELETE FROM customer_groups WHERE shop_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar grupos de clientes: {}", e))?;

        // 6. Deletar inventory_movements (que dependem de inventory_levels)
        sqlx::query(
            "DELETE FROM inventory_movements WHERE inventory_level_id IN (
                SELECT il.id FROM inventory_levels il
                INNER JOIN products p ON p.id = il.product_id
                INNER JOIN categories c ON c.id = p.category_id
                WHERE c.shop_id = $1
                UNION
                SELECT il.id FROM inventory_levels il
                INNER JOIN products p ON p.id = il.product_id
                INNER JOIN brands b ON b.id = p.brand_id
                WHERE b.shop_id = $1
            )"
        )
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar movimentações de estoque: {}", e))?;

        // 7. Deletar inventory_levels relacionados a products
        sqlx::query(
            "DELETE FROM inventory_levels WHERE product_id IN (
                SELECT p.id FROM products p
                INNER JOIN categories c ON c.id = p.category_id
                WHERE c.shop_id = $1
                UNION
                SELECT p.id FROM products p
                INNER JOIN brands b ON b.id = p.brand_id
                WHERE b.shop_id = $1
            )"
        )
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar níveis de estoque: {}", e))?;

        // 8. Deletar product_categories (join table)
        sqlx::query(
            "DELETE FROM product_categories WHERE category_id IN (SELECT id FROM categories WHERE shop_id = $1)
             OR product_id IN (
                 SELECT p.id FROM products p
                 INNER JOIN categories c ON c.id = p.category_id
                 WHERE c.shop_id = $1
                 UNION
                 SELECT p.id FROM products p
                 INNER JOIN brands b ON b.id = p.brand_id
                 WHERE b.shop_id = $1
             )"
        )
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar categorias de produtos: {}", e))?;

        // 9. Deletar transaction_items relacionados (produtos serão SET NULL)
        sqlx::query(
            "UPDATE transaction_items SET product_id = NULL WHERE product_id IN (
                SELECT p.id FROM products p
                INNER JOIN categories c ON c.id = p.category_id
                WHERE c.shop_id = $1
                UNION
                SELECT p.id FROM products p
                INNER JOIN brands b ON b.id = p.brand_id
                WHERE b.shop_id = $1
            )"
        )
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao atualizar itens de transação: {}", e))?;

        // 10. Deletar products (categoria e marca serão SET NULL automaticamente)
        sqlx::query(
            "DELETE FROM products WHERE id IN (
                SELECT p.id FROM products p
                INNER JOIN categories c ON c.id = p.category_id
                WHERE c.shop_id = $1
                UNION
                SELECT p.id FROM products p
                INNER JOIN brands b ON b.id = p.brand_id
                WHERE b.shop_id = $1
            )"
        )
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar produtos: {}", e))?;

        // 11. Deletar brands
        sqlx::query("DELETE FROM brands WHERE shop_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar marcas: {}", e))?;

        // 12. Deletar categories
        sqlx::query("DELETE FROM categories WHERE shop_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar categorias: {}", e))?;

        // 13. Por fim, deletar o shop
        sqlx::query("DELETE FROM shops WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar loja: {}", e))?;

        // Confirmar transação
        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(())
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
}
