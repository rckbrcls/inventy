use crate::features::shop_template::models::shop_template_model::ShopTemplate;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ShopTemplateDto {
    pub id: String,
    pub code: String,
    pub name: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub icon: Option<String>,
    pub features_config: String,
    pub default_settings: Option<String>,
    pub recommended_modules: Option<String>,
    pub metadata: Option<String>,
}

impl From<ShopTemplate> for ShopTemplateDto {
    fn from(template: ShopTemplate) -> Self {
        Self {
            id: template.id,
            code: template.code,
            name: template.name,
            description: template.description,
            category: template.category,
            icon: template.icon,
            features_config: template.features_config,
            default_settings: template.default_settings,
            recommended_modules: template.recommended_modules,
            metadata: template.metadata,
        }
    }
}
