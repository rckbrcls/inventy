use crate::features::brand::models::brand_model::Brand;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateBrandDTO {
    pub shop_id: String,
    pub name: String,
    pub slug: String,
    pub logo_url: Option<String>,
    pub banner_url: Option<String>,
    pub description: Option<String>,
    pub rich_description: Option<String>,
    pub website_url: Option<String>,
    pub status: Option<String>,
    pub is_featured: Option<bool>,
    pub sort_order: Option<i32>,
    pub seo_title: Option<String>,
    pub seo_keywords: Option<String>,
    pub metadata: Option<String>,
}

impl CreateBrandDTO {
    pub fn into_model(self) -> Brand {
        let now = Utc::now();
        Brand {
            id: Uuid::new_v4().to_string(),
            shop_id: self.shop_id,
            name: self.name,
            slug: self.slug,
            logo_url: self.logo_url,
            banner_url: self.banner_url,
            description: self.description,
            rich_description: self.rich_description,
            website_url: self.website_url,
            status: self.status.unwrap_or_else(|| "active".to_string()),
            is_featured: self.is_featured.unwrap_or(false),
            sort_order: self.sort_order.unwrap_or(0),
            seo_title: self.seo_title,
            seo_keywords: self.seo_keywords,
            metadata: self.metadata,
            sync_status: "created".to_string(),
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateBrandDTO {
    pub id: String,
    pub shop_id: Option<String>,
    pub name: Option<String>,
    pub slug: Option<String>,
    pub logo_url: Option<String>,
    pub banner_url: Option<String>,
    pub description: Option<String>,
    pub rich_description: Option<String>,
    pub website_url: Option<String>,
    pub status: Option<String>,
    pub is_featured: Option<bool>,
    pub sort_order: Option<i32>,
    pub seo_title: Option<String>,
    pub seo_keywords: Option<String>,
    pub metadata: Option<String>,
}

impl UpdateBrandDTO {
    pub fn apply_to_model(self, mut brand: Brand) -> Brand {
        let now = Utc::now();
        if let Some(shop_id) = self.shop_id {
            brand.shop_id = shop_id;
        }
        if let Some(name) = self.name {
            brand.name = name;
        }
        if let Some(slug) = self.slug {
            brand.slug = slug;
        }
        if let Some(logo_url) = self.logo_url {
            brand.logo_url = Some(logo_url);
        }
        if let Some(banner_url) = self.banner_url {
            brand.banner_url = Some(banner_url);
        }
        if let Some(description) = self.description {
            brand.description = Some(description);
        }
        if let Some(rich_description) = self.rich_description {
            brand.rich_description = Some(rich_description);
        }
        if let Some(website_url) = self.website_url {
            brand.website_url = Some(website_url);
        }
        if let Some(status) = self.status {
            brand.status = status;
        }
        if let Some(is_featured) = self.is_featured {
            brand.is_featured = is_featured;
        }
        if let Some(sort_order) = self.sort_order {
            brand.sort_order = sort_order;
        }
        if let Some(seo_title) = self.seo_title {
            brand.seo_title = Some(seo_title);
        }
        if let Some(seo_keywords) = self.seo_keywords {
            brand.seo_keywords = Some(seo_keywords);
        }
        if let Some(metadata) = self.metadata {
            brand.metadata = Some(metadata);
        }
        brand.sync_status = "updated".to_string();
        brand.updated_at = now;
        brand
    }
}
