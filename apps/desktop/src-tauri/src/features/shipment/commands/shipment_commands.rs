use crate::features::shipment::dtos::shipment_dto::CreateShipmentDTO;
use crate::features::shipment::models::shipment_model::Shipment;
use crate::features::shipment::services::shipment_service::ShipmentService;
use tauri::State;
use sqlx::SqlitePool;

#[tauri::command]
pub async fn create_shipment(
    pool: State<'_, SqlitePool>,
    payload: CreateShipmentDTO,
) -> Result<Shipment, String> {
    let service = ShipmentService::new(pool.inner().clone());
    service.create_shipment(payload).await
}

#[tauri::command]
pub async fn delete_shipment(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    let service = ShipmentService::new(pool.inner().clone());
    service.delete_shipment(&id).await
}

#[tauri::command]
pub async fn get_shipment(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<Shipment>, String> {
    let service = ShipmentService::new(pool.inner().clone());
    service.get_shipment(&id).await
}

#[tauri::command]
pub async fn list_shipments(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<Shipment>, String> {
    let service = ShipmentService::new(pool.inner().clone());
    service.list_shipments().await
}
