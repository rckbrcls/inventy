use crate::features::product::models::product_model::{Product, ProductCategory};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProductCategoryDTO {
    pub category_id: String,
    pub position: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProductDTO {
    pub sku: String,
    pub r#type: String,
    pub status: Option<String>,
    pub name: String,
    pub slug: Option<String>,
    pub gtin_ean: Option<String>,
    pub price: f64,
    pub promotional_price: Option<f64>,
    pub cost_price: Option<f64>,
    pub currency: Option<String>,
    pub tax_ncm: Option<String>,
    pub is_shippable: bool,
    pub weight_g: i64,
    pub width_mm: i64,
    pub height_mm: i64,
    pub depth_mm: i64,
    pub attributes: Option<String>,
    pub metadata: Option<String>,
    pub category_id: Option<String>,
    pub brand_id: Option<String>,
    pub parent_id: Option<String>,
    pub categories: Vec<CreateProductCategoryDTO>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateProductDTO {
    pub id: String,
    pub sku: Option<String>,
    pub r#type: Option<String>,
    pub status: Option<String>,
    pub name: Option<String>,
    pub slug: Option<String>,
    pub gtin_ean: Option<String>,
    pub price: Option<f64>,
    pub promotional_price: Option<f64>,
    pub cost_price: Option<f64>,
    pub currency: Option<String>,
    pub tax_ncm: Option<String>,
    pub is_shippable: Option<bool>,
    pub weight_g: Option<i64>,
    pub width_mm: Option<i64>,
    pub height_mm: Option<i64>,
    pub depth_mm: Option<i64>,
    pub attributes: Option<String>,
    pub metadata: Option<String>,
    pub category_id: Option<String>,
    pub brand_id: Option<String>,
    pub parent_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductListFilterDTO {
    pub shop_id: Option<String>,
    pub status: Option<String>,
    pub category_id: Option<String>,
    pub brand_id: Option<String>,
    pub query: Option<String>,
    pub is_shippable: Option<bool>,
    pub min_price: Option<f64>,
    pub max_price: Option<f64>,
    pub page: Option<u32>,
    pub per_page: Option<u32>,
}

impl CreateProductDTO {
    pub fn into_models(self) -> (Product, Vec<ProductCategory>) {
        let product_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        let product = Product {
            id: product_id.clone(),
            sku: self.sku,
            r#type: self.r#type,
            status: self.status.or(Some("draft".to_string())),
            name: self.name,
            slug: self.slug,
            gtin_ean: self.gtin_ean,
            price: self.price,
            promotional_price: self.promotional_price,
            cost_price: self.cost_price,
            currency: self.currency.or(Some("BRL".to_string())),
            tax_ncm: self.tax_ncm,
            is_shippable: self.is_shippable,
            weight_g: self.weight_g,
            width_mm: self.width_mm,
            height_mm: self.height_mm,
            depth_mm: self.depth_mm,
            attributes: self.attributes,
            metadata: self.metadata,
            category_id: self.category_id,
            brand_id: self.brand_id,
            parent_id: self.parent_id,
            sync_status: Some("created".to_string()),
            created_at: Some(now),
            updated_at: Some(now),
        };

        let categories = self
            .categories
            .into_iter()
            .map(|c| ProductCategory {
                product_id: product_id.clone(),
                category_id: c.category_id,
                position: c.position,
                sync_status: Some("created".to_string()),
                created_at: Some(now),
                updated_at: Some(now),
            })
            .collect();

        (product, categories)
    }
}

impl UpdateProductDTO {
    pub fn into_models(self) -> (Product, Vec<ProductCategory>) {
        let now = Utc::now();
        let product = Product {
            id: self.id,
            sku: self.sku.unwrap_or_default(),
            r#type: self.r#type.unwrap_or_default(),
            status: self.status,
            name: self.name.unwrap_or_default(),
            slug: self.slug,
            gtin_ean: self.gtin_ean,
            price: self.price.unwrap_or_default(),
            promotional_price: self.promotional_price,
            cost_price: self.cost_price,
            currency: self.currency,
            tax_ncm: self.tax_ncm,
            is_shippable: self.is_shippable.unwrap_or_default(),
            weight_g: self.weight_g.unwrap_or_default(),
            width_mm: self.width_mm.unwrap_or_default(),
            height_mm: self.height_mm.unwrap_or_default(),
            depth_mm: self.depth_mm.unwrap_or_default(),
            attributes: self.attributes,
            metadata: self.metadata,
            category_id: self.category_id,
            brand_id: self.brand_id,
            parent_id: self.parent_id,
            sync_status: Some("updated".to_string()),
            created_at: None,
            updated_at: Some(now),
        };

        (product, Vec::new())
    }
}
