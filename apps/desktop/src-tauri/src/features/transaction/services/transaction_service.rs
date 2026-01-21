use crate::features::transaction::dtos::transaction_dto::CreateTransactionDTO;
use crate::features::transaction::models::transaction_model::{InventoryMovement, Transaction};
use crate::features::customer::repositories::customer_repository::CustomerRepository;
use crate::features::inventory::repositories::inventory_levels_repository::InventoryLevelsRepository;
use crate::features::inventory::repositories::inventory_movements_repository::InventoryMovementsRepository;
use crate::features::transaction::repositories::transaction_items_repository::TransactionItemsRepository;
use crate::features::transaction::repositories::transactions_repository::TransactionsRepository;
use chrono::Utc;
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct TransactionService {
    pool: SqlitePool,
    repo: TransactionsRepository,
    items_repo: TransactionItemsRepository,
    movements_repo: InventoryMovementsRepository,
}

impl TransactionService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = TransactionsRepository::new(pool.clone());
        let items_repo = TransactionItemsRepository::new(pool.clone());
        let movements_repo = InventoryMovementsRepository::new(pool.clone());
        Self {
            pool,
            repo,
            items_repo,
            movements_repo,
        }
    }

    /// Create a new transaction (draft state)
    pub async fn create_transaction(
        &self,
        payload: CreateTransactionDTO,
    ) -> Result<Transaction, String> {
        let _location_id = payload
            .location_id
            .clone()
            .ok_or("Location ID is required".to_string())?;
        let (transaction, items) = payload.into_models();

        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Create transaction
        let created_transaction = sqlx::query_as::<_, Transaction>(r#"
            INSERT INTO transactions (
                id, type, status, channel, customer_id, supplier_id, staff_id,
                currency, total_items, total_shipping, total_discount, total_net,
                shipping_method, shipping_address, billing_address, _status,
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *
        "#)
            .bind(&transaction.id)
            .bind(&transaction.r#type)
            .bind(&transaction.status)
            .bind(&transaction.channel)
            .bind(&transaction.customer_id)
            .bind(&transaction.supplier_id)
            .bind(&transaction.staff_id)
            .bind(&transaction.currency)
            .bind(&transaction.total_items)
            .bind(&transaction.total_shipping)
            .bind(&transaction.total_discount)
            .bind(&transaction.total_net)
            .bind(&transaction.shipping_method)
            .bind(&transaction.shipping_address)
            .bind(&transaction.billing_address)
            .bind(&transaction.sync_status)
            .bind(&transaction.created_at)
            .bind(&transaction.updated_at)
            .fetch_one(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao criar transação: {}", e))?;

        // Create items if any
        if !items.is_empty() {
            for item in items {
                sqlx::query(r#"
                    INSERT INTO transaction_items (
                        id, transaction_id, product_id, sku_snapshot, name_snapshot,
                        quantity, unit_price, unit_cost, attributes_snapshot, tax_details,
                        _status, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                "#)
                    .bind(item.id)
                    .bind(item.transaction_id)
                    .bind(item.product_id)
                    .bind(item.sku_snapshot)
                    .bind(item.name_snapshot)
                    .bind(item.quantity)
                    .bind(item.unit_price)
                    .bind(item.unit_cost)
                    .bind(item.attributes_snapshot)
                    .bind(item.tax_details)
                    .bind(item.sync_status)
                    .bind(item.created_at)
                    .bind(item.updated_at)
                    .execute(&mut *tx)
                    .await
                    .map_err(|e| format!("Erro ao criar itens da transação: {}", e))?;
            }
        }

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(created_transaction)
    }

    /// Complete a sale transaction atomically
    /// This method:
    /// 1. Updates transaction status to 'completed'
    /// 2. Creates inventory movements for each item
    /// 3. Updates customer stats (total_spent, orders_count)
    ///
    /// All operations are wrapped in a database transaction for atomicity
    pub async fn complete_sale(
        &self,
        transaction_id: &str,
        location_id: &str,
    ) -> Result<Transaction, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // 1. Get and validate the transaction
        let transaction = TransactionsRepository::get_by_id_with_tx(&mut tx, transaction_id)
            .await
            .map_err(|e| format!("Erro ao buscar transação: {}", e))?
            .ok_or_else(|| "Transação não encontrada".to_string())?;

        if transaction.r#type != "sale" {
            return Err(
                "Apenas transações de venda podem ser completadas com este método".to_string(),
            );
        }

        if transaction.status == "completed" {
            return Err("Transação já está completada".to_string());
        }

        // 2. Get all items for this transaction
        let items =
            TransactionItemsRepository::find_by_transaction_id_with_tx(&mut tx, transaction_id)
                .await
                .map_err(|e| format!("Erro ao buscar itens: {}", e))?;

        // 3. For each item, create inventory movement and update stock
        for item in &items {
            if let Some(ref product_id) = item.product_id {
                // Find inventory level for this product at the specified location
                let inventory_level =
                    InventoryLevelsRepository::find_by_product_and_location_with_tx(
                        &mut tx,
                        product_id,
                        location_id,
                    )
                    .await
                    .map_err(|e| format!("Erro ao buscar nível de estoque: {}", e))?
                    .ok_or_else(|| {
                        format!(
                            "Nível de estoque não encontrado para produto {} na localização {}",
                            product_id, location_id
                        )
                    })?;

                // Create inventory movement (OUT)
                let movement = InventoryMovement {
                    id: Uuid::new_v4().to_string(),
                    transaction_id: Some(transaction_id.to_string()),
                    inventory_level_id: Some(inventory_level.id.clone()),
                    movement_type: Some("out".to_string()),
                    quantity: item.quantity,
                    previous_balance: Some(inventory_level.quantity_on_hand),
                    new_balance: Some(inventory_level.quantity_on_hand - item.quantity),
                    sync_status: Some("created".to_string()),
                    created_at: Some(Utc::now()),
                    updated_at: Some(Utc::now()),
                };

                InventoryMovementsRepository::create_with_tx(&mut tx, movement)
                    .await
                    .map_err(|e| format!("Erro ao criar movimento de estoque: {}", e))?;

                // Note: The database trigger 'trg_inventory_movement_update_level'
                // will automatically update inventory_levels.quantity_on_hand
            }
        }

        // 4. Update transaction status to completed
        let updated_transaction =
            TransactionsRepository::update_status_with_tx(&mut tx, transaction_id, "completed")
                .await
                .map_err(|e| format!("Erro ao atualizar status da transação: {}", e))?;

        // 5. Update customer stats if customer exists
        if let Some(ref customer_id) = updated_transaction.customer_id {
            let total = updated_transaction.total_net.unwrap_or(0.0);
            CustomerRepository::increment_stats_with_tx(&mut tx, customer_id, total)
                .await
                .map_err(|e| format!("Erro ao atualizar estatísticas do cliente: {}", e))?;
        }

        // 6. Commit the transaction
        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(updated_transaction)
    }

    /// Cancel a transaction atomically
    /// This method handles releasing any reserved stock
    pub async fn cancel_transaction(&self, transaction_id: &str) -> Result<Transaction, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Get the transaction
        let transaction = TransactionsRepository::get_by_id_with_tx(&mut tx, transaction_id)
            .await
            .map_err(|e| format!("Erro ao buscar transação: {}", e))?
            .ok_or_else(|| "Transação não encontrada".to_string())?;

        if transaction.status == "completed" {
            return Err(
                "Não é possível cancelar uma transação já completada. Use devolução.".to_string(),
            );
        }

        if transaction.status == "cancelled" {
            return Err("Transação já está cancelada".to_string());
        }

        // Update status to cancelled
        let updated =
            TransactionsRepository::update_status_with_tx(&mut tx, transaction_id, "cancelled")
                .await
                .map_err(|e| format!("Erro ao cancelar transação: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar cancelamento: {}", e))?;

        Ok(updated)
    }

    pub async fn delete_transaction(&self, id: &str) -> Result<(), String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Delete transaction items
        sqlx::query("DELETE FROM transaction_items WHERE transaction_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar itens da transação: {}", e))?;

        // Delete inventory movements
        sqlx::query("DELETE FROM inventory_movements WHERE transaction_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar movimentos da transação: {}", e))?;

        // Delete transaction
        sqlx::query("DELETE FROM transactions WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar transação: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar exclusão: {}", e))?;

        Ok(())
    }

    pub async fn get_transaction(&self, id: &str) -> Result<Option<Transaction>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Erro ao buscar transação: {}", e))
    }

    pub async fn list_transactions(&self) -> Result<Vec<Transaction>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Erro ao listar transações: {}", e))
    }

    pub async fn list_transactions_by_shop(&self, shop_id: &str) -> Result<Vec<Transaction>, String> {
        self.repo
            .list_by_shop(shop_id)
            .await
            .map_err(|e| format!("Erro ao listar transações por shop: {}", e))
    }
}
