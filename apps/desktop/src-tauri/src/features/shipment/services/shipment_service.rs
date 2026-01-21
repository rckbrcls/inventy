use crate::features::shipment::dtos::shipment_dto::CreateShipmentDTO;
use crate::features::shipment::models::shipment_model::{Shipment, ShipmentEvent, ShipmentItem};
use crate::features::shipment::repositories::shipment_events_repository::ShipmentEventsRepository;
use crate::features::shipment::repositories::shipment_items_repository::ShipmentItemsRepository;
use crate::features::shipment::repositories::shipments_repository::ShipmentsRepository;
use chrono::Utc;
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct ShipmentService {
    pool: SqlitePool,
    repo: ShipmentsRepository,
    items_repo: ShipmentItemsRepository,
    events_repo: ShipmentEventsRepository,
}

impl ShipmentService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = ShipmentsRepository::new(pool.clone());
        let items_repo = ShipmentItemsRepository::new(pool.clone());
        let events_repo = ShipmentEventsRepository::new(pool.clone());
        Self {
            pool,
            repo,
            items_repo,
            events_repo,
        }
    }

    // ============================================================
    // Transactional methods (atomic operations)
    // ============================================================

    /// Create a full shipment with items atomically
    /// This creates the shipment and all its items in a single transaction
    pub async fn create_full_shipment(
        &self,
        shipment: Shipment,
        items: Vec<ShipmentItem>,
    ) -> Result<Shipment, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Create shipment
        let created_shipment = ShipmentsRepository::create_with_tx(&mut tx, shipment)
            .await
            .map_err(|e| format!("Erro ao criar envio: {}", e))?;

        // Create items if any
        if !items.is_empty() {
            ShipmentItemsRepository::create_many_with_tx(&mut tx, items)
                .await
                .map_err(|e| format!("Erro ao criar itens do envio: {}", e))?;
        }

        // Create initial event
        let initial_event = ShipmentEvent {
            id: Uuid::new_v4().to_string(),
            shipment_id: Some(created_shipment.id.clone()),
            status: Some("created".to_string()),
            description: Some("Envio criado".to_string()),
            location: None,
            happened_at: Some(Utc::now()),
            raw_data: None,
            sync_status: Some("created".to_string()),
            created_at: Some(Utc::now()),
            updated_at: Some(Utc::now()),
        };

        ShipmentEventsRepository::create_with_tx(&mut tx, initial_event)
            .await
            .map_err(|e| format!("Erro ao criar evento inicial: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(created_shipment)
    }

    /// Update shipment status and create a tracking event atomically
    pub async fn update_status(
        &self,
        shipment_id: &str,
        status: &str,
        description: Option<&str>,
    ) -> Result<Shipment, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Update status
        let updated_shipment =
            ShipmentsRepository::update_status_with_tx(&mut tx, shipment_id, status)
                .await
                .map_err(|e| format!("Erro ao atualizar status: {}", e))?;

        // Create tracking event
        let event = ShipmentEvent {
            id: Uuid::new_v4().to_string(),
            shipment_id: Some(shipment_id.to_string()),
            status: Some(status.to_string()),
            description: description.map(|d| d.to_string()),
            location: None,
            happened_at: Some(Utc::now()),
            raw_data: None,
            sync_status: Some("created".to_string()),
            created_at: Some(Utc::now()),
            updated_at: Some(Utc::now()),
        };

        ShipmentEventsRepository::create_with_tx(&mut tx, event)
            .await
            .map_err(|e| format!("Erro ao criar evento de rastreio: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(updated_shipment)
    }

    /// Mark shipment as shipped (sets shipped_at and creates event)
    pub async fn mark_as_shipped(
        &self,
        shipment_id: &str,
        tracking_number: Option<&str>,
    ) -> Result<Shipment, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Update shipped_at
        let updated_shipment =
            ShipmentsRepository::update_shipped_at_with_tx(&mut tx, shipment_id, tracking_number)
                .await
                .map_err(|e| format!("Erro ao marcar como enviado: {}", e))?;

        // Create tracking event
        let event = ShipmentEvent {
            id: Uuid::new_v4().to_string(),
            shipment_id: Some(shipment_id.to_string()),
            status: Some("shipped".to_string()),
            description: Some("Envio despachado".to_string()),
            location: None,
            happened_at: Some(Utc::now()),
            raw_data: None,
            sync_status: Some("created".to_string()),
            created_at: Some(Utc::now()),
            updated_at: Some(Utc::now()),
        };

        ShipmentEventsRepository::create_with_tx(&mut tx, event)
            .await
            .map_err(|e| format!("Erro ao criar evento de despacho: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(updated_shipment)
    }

    /// Mark shipment as delivered (sets delivered_at and creates event)
    pub async fn mark_as_delivered(&self, shipment_id: &str) -> Result<Shipment, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Update delivered_at
        let updated_shipment =
            ShipmentsRepository::update_delivered_at_with_tx(&mut tx, shipment_id)
                .await
                .map_err(|e| format!("Erro ao marcar como entregue: {}", e))?;

        // Create tracking event
        let event = ShipmentEvent {
            id: Uuid::new_v4().to_string(),
            shipment_id: Some(shipment_id.to_string()),
            status: Some("delivered".to_string()),
            description: Some("Envio entregue".to_string()),
            location: None,
            happened_at: Some(Utc::now()),
            raw_data: None,
            sync_status: Some("created".to_string()),
            created_at: Some(Utc::now()),
            updated_at: Some(Utc::now()),
        };

        ShipmentEventsRepository::create_with_tx(&mut tx, event)
            .await
            .map_err(|e| format!("Erro ao criar evento de entrega: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(updated_shipment)
    }

    /// Add a tracking event to a shipment
    pub async fn add_tracking_event(
        &self,
        shipment_id: &str,
        mut event: ShipmentEvent,
    ) -> Result<ShipmentEvent, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Ensure shipment exists
        let _shipment = ShipmentsRepository::get_by_id_with_tx(&mut tx, shipment_id)
            .await
            .map_err(|e| format!("Erro ao buscar envio: {}", e))?
            .ok_or_else(|| "Envio não encontrado".to_string())?;

        // Set shipment_id if not set
        if event.shipment_id.is_none() {
            event.shipment_id = Some(shipment_id.to_string());
        }

        // Generate ID if not set
        if event.id.is_empty() {
            event.id = Uuid::new_v4().to_string();
        }

        let created_event = ShipmentEventsRepository::create_with_tx(&mut tx, event)
            .await
            .map_err(|e| format!("Erro ao criar evento: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(created_event)
    }

    // ============================================================
    // Non-transactional methods (legacy/simple operations)
    // ============================================================

    pub async fn create_shipment(&self, payload: CreateShipmentDTO) -> Result<Shipment, String> {
        let (shipment, items) = payload.into_models();
        let created_shipment = self
            .repo
            .create(shipment)
            .await
            .map_err(|e| format!("Erro ao criar envio: {}", e))?;

        if !items.is_empty() {
            self.items_repo
                .create_many(items)
                .await
                .map_err(|e| format!("Erro ao criar itens do envio: {}", e))?;
        }

        Ok(created_shipment)
    }

    pub async fn delete_shipment(&self, id: &str) -> Result<(), String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Delete items
        sqlx::query("DELETE FROM shipment_items WHERE shipment_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar itens do envio: {}", e))?;

        // Delete events
        sqlx::query("DELETE FROM shipment_events WHERE shipment_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar eventos do envio: {}", e))?;

        // Delete shipment
        sqlx::query("DELETE FROM shipments WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar envio: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar exclusão: {}", e))?;

        Ok(())
    }

    pub async fn get_shipment(&self, id: &str) -> Result<Option<Shipment>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Erro ao buscar envio: {}", e))
    }

    pub async fn list_shipments(&self) -> Result<Vec<Shipment>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Erro ao listar envios: {}", e))
    }

    pub async fn get_shipment_items(&self, shipment_id: &str) -> Result<Vec<ShipmentItem>, String> {
        self.items_repo
            .find_by_shipment_id(shipment_id)
            .await
            .map_err(|e| format!("Erro ao buscar itens do envio: {}", e))
    }

    pub async fn get_shipment_events(
        &self,
        shipment_id: &str,
    ) -> Result<Vec<ShipmentEvent>, String> {
        self.events_repo
            .find_by_shipment_id(shipment_id)
            .await
            .map_err(|e| format!("Erro ao buscar eventos do envio: {}", e))
    }
}
