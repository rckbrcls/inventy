use crate::features::inquiry::dtos::inquiry_dto::CreateInquiryDTO;
use crate::features::inquiry::models::inquiry_model::{Inquiry, InquiryMessage};
use crate::features::inquiry::repositories::inquiries_repository::InquiriesRepository;
use crate::features::inquiry::repositories::inquiry_messages_repository::InquiryMessagesRepository;
use chrono::Utc;
use sqlx::SqlitePool;
use uuid::Uuid;

pub struct InquiryService {
    pool: SqlitePool,
    repo: InquiriesRepository,
    messages_repo: InquiryMessagesRepository,
}

impl InquiryService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = InquiriesRepository::new(pool.clone());
        let messages_repo = InquiryMessagesRepository::new(pool.clone());
        Self {
            pool,
            repo,
            messages_repo,
        }
    }

    // ============================================================
    // Transactional methods (atomic operations)
    // ============================================================

    /// Create an inquiry with an initial message atomically
    pub async fn create_with_message(
        &self,
        inquiry: Inquiry,
        initial_message: InquiryMessage,
    ) -> Result<Inquiry, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Create inquiry
        let created_inquiry = InquiriesRepository::create_with_tx(&mut tx, inquiry)
            .await
            .map_err(|e| format!("Erro ao criar inquiry: {}", e))?;

        // Create initial message
        InquiryMessagesRepository::create_with_tx(&mut tx, initial_message)
            .await
            .map_err(|e| format!("Erro ao criar mensagem inicial: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(created_inquiry)
    }

    /// Add a message to an inquiry
    pub async fn add_message(
        &self,
        inquiry_id: &str,
        mut message: InquiryMessage,
    ) -> Result<InquiryMessage, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Verify inquiry exists
        let _inquiry = InquiriesRepository::get_by_id_with_tx(&mut tx, inquiry_id)
            .await
            .map_err(|e| format!("Erro ao buscar inquiry: {}", e))?
            .ok_or_else(|| "Inquiry não encontrada".to_string())?;

        // Set inquiry_id and generate ID if needed
        message.inquiry_id = inquiry_id.to_string();
        if message.id.is_empty() {
            message.id = Uuid::new_v4().to_string();
        }
        if message.created_at.is_none() {
            message.created_at = Some(Utc::now());
        }
        if message.updated_at.is_none() {
            message.updated_at = Some(Utc::now());
        }

        let created_message = InquiryMessagesRepository::create_with_tx(&mut tx, message)
            .await
            .map_err(|e| format!("Erro ao criar mensagem: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(created_message)
    }

    /// Update inquiry status
    pub async fn update_status(&self, inquiry_id: &str, status: &str) -> Result<Inquiry, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        let updated_inquiry =
            InquiriesRepository::update_status_with_tx(&mut tx, inquiry_id, status)
                .await
                .map_err(|e| format!("Erro ao atualizar status: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(updated_inquiry)
    }

    /// Resolve an inquiry with optional resolution message
    pub async fn resolve(
        &self,
        inquiry_id: &str,
        resolution_message: Option<InquiryMessage>,
    ) -> Result<Inquiry, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Verify inquiry exists
        let inquiry = InquiriesRepository::get_by_id_with_tx(&mut tx, inquiry_id)
            .await
            .map_err(|e| format!("Erro ao buscar inquiry: {}", e))?
            .ok_or_else(|| "Inquiry não encontrada".to_string())?;

        if inquiry.status.as_deref() == Some("resolved") {
            return Err("Inquiry já está resolvida".to_string());
        }

        // Add resolution message if provided
        if let Some(mut message) = resolution_message {
            message.inquiry_id = inquiry_id.to_string();
            if message.id.is_empty() {
                message.id = Uuid::new_v4().to_string();
            }
            if message.created_at.is_none() {
                message.created_at = Some(Utc::now());
            }
            if message.updated_at.is_none() {
                message.updated_at = Some(Utc::now());
            }

            InquiryMessagesRepository::create_with_tx(&mut tx, message)
                .await
                .map_err(|e| format!("Erro ao criar mensagem de resolução: {}", e))?;
        }

        // Resolve the inquiry
        let resolved_inquiry = InquiriesRepository::resolve_with_tx(&mut tx, inquiry_id)
            .await
            .map_err(|e| format!("Erro ao resolver inquiry: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(resolved_inquiry)
    }

    /// Assign inquiry to a staff member
    pub async fn assign_to_staff(
        &self,
        inquiry_id: &str,
        staff_id: &str,
    ) -> Result<Inquiry, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        let updated_inquiry =
            InquiriesRepository::assign_staff_with_tx(&mut tx, inquiry_id, staff_id)
                .await
                .map_err(|e| format!("Erro ao atribuir funcionário: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(updated_inquiry)
    }

    /// Find inquiries by status
    pub async fn find_by_status(&self, status: &str) -> Result<Vec<Inquiry>, String> {
        self.repo
            .find_by_status(status)
            .await
            .map_err(|e| format!("Erro ao buscar inquiries por status: {}", e))
    }

    // ============================================================
    // Non-transactional methods (legacy/simple operations)
    // ============================================================

    pub async fn create_inquiry(&self, payload: CreateInquiryDTO) -> Result<Inquiry, String> {
        let (inquiry, messages) = payload.into_models();
        
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Create inquiry
        let created_inquiry = InquiriesRepository::create_with_tx(&mut tx, inquiry)
            .await
            .map_err(|e| format!("Erro ao criar inquiry: {}", e))?;

        // Create messages if any
        if !messages.is_empty() {
            for message in messages {
                InquiryMessagesRepository::create_with_tx(&mut tx, message)
                    .await
                    .map_err(|e| format!("Erro ao criar mensagens: {}", e))?;
            }
        }

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(created_inquiry)
    }

    pub async fn delete_inquiry(&self, id: &str) -> Result<(), String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Delete messages
        sqlx::query("DELETE FROM inquiry_messages WHERE inquiry_id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar mensagens: {}", e))?;

        // Delete inquiry
        sqlx::query("DELETE FROM inquiries WHERE id = $1")
            .bind(id)
            .execute(&mut *tx)
            .await
            .map_err(|e| format!("Erro ao deletar inquiry: {}", e))?;

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar exclusão: {}", e))?;

        Ok(())
    }

    pub async fn get_inquiry(&self, id: &str) -> Result<Option<Inquiry>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Erro ao buscar inquiry: {}", e))
    }

    pub async fn list_inquiries(&self) -> Result<Vec<Inquiry>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Erro ao listar inquiries: {}", e))
    }

    pub async fn get_inquiry_messages(
        &self,
        inquiry_id: &str,
    ) -> Result<Vec<InquiryMessage>, String> {
        self.messages_repo
            .find_by_inquiry_id(inquiry_id)
            .await
            .map_err(|e| format!("Erro ao buscar mensagens: {}", e))
    }
}
