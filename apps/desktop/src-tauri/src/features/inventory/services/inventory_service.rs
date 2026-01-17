use crate::features::transaction::models::transaction_model::InventoryMovement;
use crate::features::inventory::repositories::inventory_levels_repository::InventoryLevelsRepository;
use crate::features::inventory::repositories::inventory_movements_repository::InventoryMovementsRepository;
use chrono::Utc;
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct InventoryService {
    pool: SqlitePool,
    #[allow(dead_code)]
    levels_repo: InventoryLevelsRepository,
}

impl InventoryService {
    pub fn new(pool: SqlitePool) -> Self {
        let levels_repo = InventoryLevelsRepository::new(pool.clone());
        Self { pool, levels_repo }
    }

    /// Transfer stock from one location to another atomically
    /// Creates two inventory movements (OUT from source, IN to destination)
    pub async fn transfer_stock(
        &self,
        product_id: &str,
        from_location_id: &str,
        to_location_id: &str,
        quantity: f64,
        _reason: Option<&str>,
    ) -> Result<(), String> {
        if quantity <= 0.0 {
            return Err("Quantidade deve ser maior que zero".to_string());
        }

        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Get source inventory level
        let source_level = InventoryLevelsRepository::find_by_product_and_location_with_tx(
            &mut tx,
            product_id,
            from_location_id,
        )
        .await
        .map_err(|e| format!("Erro ao buscar nível de estoque origem: {}", e))?
        .ok_or_else(|| {
            format!(
                "Nível de estoque não encontrado para produto {} na origem {}",
                product_id, from_location_id
            )
        })?;

        // Validate available quantity
        let available = source_level.quantity_on_hand - source_level.quantity_reserved;
        if available < quantity {
            return Err(format!(
                "Estoque insuficiente. Disponível: {}, Solicitado: {}",
                available, quantity
            ));
        }

        // Get or validate destination inventory level exists
        let dest_level =
            InventoryLevelsRepository::find_by_product_and_location_with_tx(&mut tx, product_id, to_location_id)
                .await
                .map_err(|e| format!("Erro ao buscar nível de estoque destino: {}", e))?
                .ok_or_else(|| {
                    format!(
                        "Nível de estoque não encontrado para produto {} no destino {}. Crie primeiro o nível de estoque.",
                        product_id, to_location_id
                    )
                })?;

        // Create OUT movement from source
        let movement_out = InventoryMovement {
            id: Uuid::new_v4().to_string(),
            transaction_id: None, // Transfer doesn't have a transaction
            inventory_level_id: Some(source_level.id.clone()),
            movement_type: Some("out".to_string()),
            quantity,
            previous_balance: Some(source_level.quantity_on_hand),
            new_balance: Some(source_level.quantity_on_hand - quantity),
            sync_status: Some("created".to_string()),
            created_at: Some(Utc::now()),
            updated_at: Some(Utc::now()),
        };

        InventoryMovementsRepository::create_with_tx(&mut tx, movement_out)
            .await
            .map_err(|e| format!("Erro ao criar movimento de saída: {}", e))?;

        // Create IN movement to destination
        let movement_in = InventoryMovement {
            id: Uuid::new_v4().to_string(),
            transaction_id: None,
            inventory_level_id: Some(dest_level.id.clone()),
            movement_type: Some("in".to_string()),
            quantity,
            previous_balance: Some(dest_level.quantity_on_hand),
            new_balance: Some(dest_level.quantity_on_hand + quantity),
            sync_status: Some("created".to_string()),
            created_at: Some(Utc::now()),
            updated_at: Some(Utc::now()),
        };

        InventoryMovementsRepository::create_with_tx(&mut tx, movement_in)
            .await
            .map_err(|e| format!("Erro ao criar movimento de entrada: {}", e))?;

        // Note: The database trigger 'trg_inventory_movement_update_level'
        // will automatically update inventory_levels.quantity_on_hand for both

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transferência: {}", e))?;

        Ok(())
    }

    /// Adjust stock quantity (for inventory counting/corrections)
    /// Creates an IN or OUT movement depending on the difference
    pub async fn adjust_stock(
        &self,
        product_id: &str,
        location_id: &str,
        new_quantity: f64,
        _reason: Option<&str>,
    ) -> Result<(), String> {
        if new_quantity < 0.0 {
            return Err("Quantidade não pode ser negativa".to_string());
        }

        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Get current inventory level
        let level = InventoryLevelsRepository::find_by_product_and_location_with_tx(
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

        let current_quantity = level.quantity_on_hand;
        let difference = new_quantity - current_quantity;

        if difference.abs() < 0.001 {
            // No change needed
            return Ok(());
        }

        // Determine movement type
        let (movement_type, movement_quantity) = if difference > 0.0 {
            ("in", difference)
        } else {
            ("out", difference.abs())
        };

        // Create adjustment movement
        let movement = InventoryMovement {
            id: Uuid::new_v4().to_string(),
            transaction_id: None, // Adjustment doesn't have a transaction
            inventory_level_id: Some(level.id.clone()),
            movement_type: Some(movement_type.to_string()),
            quantity: movement_quantity,
            previous_balance: Some(current_quantity),
            new_balance: Some(new_quantity),
            sync_status: Some("created".to_string()),
            created_at: Some(Utc::now()),
            updated_at: Some(Utc::now()),
        };

        InventoryMovementsRepository::create_with_tx(&mut tx, movement)
            .await
            .map_err(|e| format!("Erro ao criar movimento de ajuste: {}", e))?;

        // Note: The database trigger will update the actual quantity_on_hand

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar ajuste: {}", e))?;

        Ok(())
    }

    /// Get available quantity (on_hand - reserved)
    pub async fn get_available_quantity(
        &self,
        product_id: &str,
        location_id: &str,
    ) -> Result<f64, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        let level = InventoryLevelsRepository::find_by_product_and_location_with_tx(
            &mut tx,
            product_id,
            location_id,
        )
        .await
        .map_err(|e| format!("Erro ao buscar nível de estoque: {}", e))?;

        match level {
            Some(l) => Ok(l.quantity_on_hand - l.quantity_reserved),
            None => Ok(0.0),
        }
    }
}
