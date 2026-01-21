use crate::features::shop_template::dtos::shop_template_dto::ShopTemplateDto;
use crate::features::shop_template::repositories::shop_templates_repository::ShopTemplatesRepository;
use sqlx::SqlitePool;

pub struct ShopTemplatesService {
    repo: ShopTemplatesRepository,
}

impl ShopTemplatesService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = ShopTemplatesRepository::new(pool);
        Self { repo }
    }

    pub async fn get_template(&self, id: &str) -> Result<Option<ShopTemplateDto>, String> {
        self.repo
            .find_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch template: {}", e))
            .map(|opt| opt.map(ShopTemplateDto::from))
    }

    pub async fn get_template_by_code(&self, code: &str) -> Result<Option<ShopTemplateDto>, String> {
        self.repo
            .find_by_code(code)
            .await
            .map_err(|e| format!("Failed to fetch template by code: {}", e))
            .map(|opt| opt.map(ShopTemplateDto::from))
    }

    pub async fn list_templates(&self) -> Result<Vec<ShopTemplateDto>, String> {
        self.repo
            .list_all()
            .await
            .map_err(|e| format!("Failed to list templates: {}", e))
            .map(|templates| templates.into_iter().map(ShopTemplateDto::from).collect())
    }

    pub async fn list_templates_by_category(&self, category: &str) -> Result<Vec<ShopTemplateDto>, String> {
        self.repo
            .list_by_category(category)
            .await
            .map_err(|e| format!("Failed to list templates by category: {}", e))
            .map(|templates| templates.into_iter().map(ShopTemplateDto::from).collect())
    }
}
