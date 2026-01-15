use crate::dtos::shipment_dto::CreateShipmentDTO;
use crate::models::shipment_model::Shipment;
use crate::repositories::shipment_events_repository::ShipmentEventsRepository;
use crate::repositories::shipment_items_repository::ShipmentItemsRepository;
use crate::repositories::shipments_repository::ShipmentsRepository;
use sqlx::SqlitePool;

pub struct ShipmentService {
    repo: ShipmentsRepository,
    items_repo: ShipmentItemsRepository,
    events_repo: ShipmentEventsRepository,
}

impl ShipmentService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = ShipmentsRepository::new(pool.clone());
        let items_repo = ShipmentItemsRepository::new(pool.clone());
        let events_repo = ShipmentEventsRepository::new(pool);
        Self {
            repo,
            items_repo,
            events_repo,
        }
    }

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

        // events are usually empty on creation or separate, but if payload had them:
        // logic for events wasn't passed from payload loop in original create?
        // Ah, original command passed Vec::new() logic? No, create took (shipment, items, events).
        // My previous view of `shipment_service.rs` showed `self.repo.create(shipment, items, Vec::new())`.
        // So events were empty. But if I want to support them in future or if logic changes:
        // I'll ignore events for now as payload didn't seem to produce them (into_models return 2-tuple).
        // Wait, check `shipment_service.rs` again logic in `create_shipment`.
        // `let (shipment, items) = payload.into_models();` -> 2 items.
        // So events created separatedly.

        Ok(created_shipment)
    }

    pub async fn delete_shipment(&self, id: &str) -> Result<(), String> {
        self.items_repo
            .delete_by_shipment_id(id)
            .await
            .map_err(|e| format!("Erro ao deletar itens do envio: {}", e))?;
        self.events_repo
            .delete_by_shipment_id(id)
            .await
            .map_err(|e| format!("Erro ao deletear eventos do envio: {}", e))?;
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Erro ao deletar envio: {}", e))
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
}
