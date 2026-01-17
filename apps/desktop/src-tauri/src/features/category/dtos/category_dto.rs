use crate::features::category::models::category_model::Category;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCategoryDTO {
    pub shop_id: String,
    pub parent_id: Option<String>,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub image_url: Option<String>,
    pub banner_url: Option<String>,
    pub r#type: Option<String>,
    pub rules: Option<String>,
    pub is_visible: Option<bool>,
    pub sort_order: Option<i64>,
    pub seo_title: Option<String>,
    pub seo_description: Option<String>,
    pub template_suffix: Option<String>,
    pub metadata: Option<String>,
}

impl CreateCategoryDTO {
    pub fn into_model(self) -> Category {
        let now = Utc::now();
        Category {
            id: Uuid::new_v4().to_string(),
            shop_id: self.shop_id,
            parent_id: self.parent_id,
            name: self.name,
            slug: self.slug,
            description: self.description,
            image_url: self.image_url,
            banner_url: self.banner_url,
            r#type: self.r#type.or_else(|| Some("manual".to_string())),
            rules: self.rules.or_else(|| Some("[]".to_string())),
            is_visible: self.is_visible.unwrap_or(true),
            sort_order: self.sort_order.unwrap_or(0),
            seo_title: self.seo_title,
            seo_description: self.seo_description,
            template_suffix: self.template_suffix,
            metadata: self.metadata.or_else(|| Some("{}".to_string())),
            sync_status: Some("created".to_string()),
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateCategoryDTO {
    pub id: String,
    pub shop_id: Option<String>,
    pub parent_id: Option<String>,
    pub name: Option<String>,
    pub slug: Option<String>,
    pub description: Option<String>,
    pub image_url: Option<String>,
    pub banner_url: Option<String>,
    pub r#type: Option<String>,
    pub rules: Option<String>,
    pub is_visible: Option<bool>,
    pub sort_order: Option<i64>,
    pub seo_title: Option<String>,
    pub seo_description: Option<String>,
    pub template_suffix: Option<String>,
    pub metadata: Option<String>,
}

impl UpdateCategoryDTO {
    pub fn apply_to_model(self, mut category: Category) -> Category {
        let now = Utc::now();
        if let Some(shop_id) = self.shop_id {
            category.shop_id = shop_id;
        }
        if let Some(parent_id) = self.parent_id {
            category.parent_id = Some(parent_id);
        }
        if let Some(name) = self.name {
            category.name = name;
        }
        if let Some(slug) = self.slug {
            category.slug = slug;
        }
        if let Some(description) = self.description {
            category.description = Some(description);
        }
        if let Some(image_url) = self.image_url {
            category.image_url = Some(image_url);
        }
        if let Some(banner_url) = self.banner_url {
            category.banner_url = Some(banner_url);
        }
        if let Some(category_type) = self.r#type {
            category.r#type = Some(category_type);
        }
        if let Some(rules) = self.rules {
            category.rules = Some(rules);
        }
        if let Some(is_visible) = self.is_visible {
            category.is_visible = is_visible;
        }
        if let Some(sort_order) = self.sort_order {
            category.sort_order = sort_order;
        }
        if let Some(seo_title) = self.seo_title {
            category.seo_title = Some(seo_title);
        }
        if let Some(seo_description) = self.seo_description {
            category.seo_description = Some(seo_description);
        }
        if let Some(template_suffix) = self.template_suffix {
            category.template_suffix = Some(template_suffix);
        }
        if let Some(metadata) = self.metadata {
            category.metadata = Some(metadata);
        }
        category.sync_status = Some("updated".to_string());
        category.updated_at = now;
        category
    }
}
