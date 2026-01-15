use crate::dtos::inquiry_dto::CreateInquiryDTO;
use crate::models::inquiry_model::Inquiry;
use crate::repositories::inquiries_repository::InquiriesRepository;
use crate::repositories::inquiry_messages_repository::InquiryMessagesRepository;
use sqlx::SqlitePool;

pub struct InquiryService {
    repo: InquiriesRepository,
    messages_repo: InquiryMessagesRepository,
}

impl InquiryService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = InquiriesRepository::new(pool.clone());
        let messages_repo = InquiryMessagesRepository::new(pool);
        Self {
            repo,
            messages_repo,
        }
    }

    pub async fn create_inquiry(&self, payload: CreateInquiryDTO) -> Result<Inquiry, String> {
        let (inquiry, messages) = payload.into_models();
        let created_inquiry = self
            .repo
            .create(inquiry)
            .await
            .map_err(|e| format!("Erro ao criar inquiry: {}", e))?;

        if !messages.is_empty() {
            self.messages_repo
                .create_many(messages)
                .await
                .map_err(|e| format!("Erro ao criar mensagens: {}", e))?;
        }

        Ok(created_inquiry)
    }

    pub async fn delete_inquiry(&self, id: &str) -> Result<(), String> {
        self.messages_repo
            .delete_by_inquiry_id(id)
            .await
            .map_err(|e| format!("Erro ao deletar mensagens: {}", e))?;
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Erro ao deletar inquiry: {}", e))
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
}
