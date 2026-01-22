use crate::features::inquiry::dtos::inquiry_dto::CreateInquiryDTO;
use crate::features::inquiry::models::inquiry_model::Inquiry;
use crate::features::inquiry::services::inquiry_service::InquiryService;
use tauri::State;
use sqlx::SqlitePool;

#[tauri::command]
pub async fn create_inquiry(
    pool: State<'_, SqlitePool>,
    payload: CreateInquiryDTO,
) -> Result<Inquiry, String> {
    let service = InquiryService::new(pool.inner().clone());
    service.create_inquiry(payload).await
}

#[tauri::command]
pub async fn delete_inquiry(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<(), String> {
    let service = InquiryService::new(pool.inner().clone());
    service.delete_inquiry(&id).await
}

#[tauri::command]
pub async fn get_inquiry(
    pool: State<'_, SqlitePool>,
    id: String,
) -> Result<Option<Inquiry>, String> {
    let service = InquiryService::new(pool.inner().clone());
    service.get_inquiry(&id).await
}

#[tauri::command]
pub async fn list_inquiries(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<Inquiry>, String> {
    let service = InquiryService::new(pool.inner().clone());
    service.list_inquiries().await
}

#[tauri::command]
pub async fn list_inquiries_by_shop(
    pool: State<'_, SqlitePool>,
    shop_id: String,
) -> Result<Vec<Inquiry>, String> {
    let service = InquiryService::new(pool.inner().clone());
    service.get_shop_inquiries(&shop_id).await
}
