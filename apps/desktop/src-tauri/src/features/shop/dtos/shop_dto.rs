use crate::features::shop::models::shop_model::Shop;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateShopDTO {
    pub name: String,
    pub slug: String,
    pub currency: String,
    pub timezone: String,
    pub locale: String,
    pub legal_name: Option<String>,
    pub status: Option<String>,
    pub features_config: Option<String>,
    pub mail_config: Option<String>,
    pub storage_config: Option<String>,
    pub settings: Option<String>,
    pub branding: Option<String>,
    pub owner_id: Option<String>,
}

impl CreateShopDTO {
    pub fn into_model(self) -> Shop {
        let now = Utc::now();
        Shop {
            id: Uuid::new_v4().to_string(),
            name: self.name,
            legal_name: self.legal_name,
            slug: self.slug,
            status: self.status.unwrap_or_else(|| "active".to_string()),
            features_config: self.features_config,
            mail_config: self.mail_config,
            storage_config: self.storage_config,
            settings: self.settings,
            branding: self.branding,
            currency: self.currency,
            timezone: self.timezone,
            locale: self.locale,
            owner_id: self.owner_id,
            sync_status: "created".to_string(),
            created_at: now,
            updated_at: now,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateShopDTO {
    pub id: String,
    pub name: Option<String>,
    pub legal_name: Option<String>,
    pub slug: Option<String>,
    pub status: Option<String>,
    pub features_config: Option<String>,
    pub mail_config: Option<String>,
    pub storage_config: Option<String>,
    pub settings: Option<String>,
    pub branding: Option<String>,
    pub currency: Option<String>,
    pub timezone: Option<String>,
    pub locale: Option<String>,
    pub owner_id: Option<String>,
}

impl UpdateShopDTO {
    pub fn apply_to_model(self, mut shop: Shop) -> Shop {
        let now = Utc::now();
        if let Some(name) = self.name {
            shop.name = name;
        }
        if let Some(legal_name) = self.legal_name {
            shop.legal_name = Some(legal_name);
        }
        if let Some(slug) = self.slug {
            shop.slug = slug;
        }
        if let Some(status) = self.status {
            shop.status = status;
        }
        if let Some(features_config) = self.features_config {
            shop.features_config = Some(features_config);
        }
        if let Some(mail_config) = self.mail_config {
            shop.mail_config = Some(mail_config);
        }
        if let Some(storage_config) = self.storage_config {
            shop.storage_config = Some(storage_config);
        }
        if let Some(settings) = self.settings {
            shop.settings = Some(settings);
        }
        if let Some(branding) = self.branding {
            shop.branding = Some(branding);
        }
        if let Some(currency) = self.currency {
            shop.currency = currency;
        }
        if let Some(timezone) = self.timezone {
            shop.timezone = timezone;
        }
        if let Some(locale) = self.locale {
            shop.locale = locale;
        }
        if let Some(owner_id) = self.owner_id {
            shop.owner_id = Some(owner_id);
        }
        shop.sync_status = "updated".to_string();
        shop.updated_at = now;
        shop
    }
}
