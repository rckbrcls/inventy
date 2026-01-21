use crate::features::location::models::location_model::Location;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateLocationDTO {
    pub name: String,
    pub r#type: String,
    pub is_sellable: Option<bool>,
    pub address_data: Option<String>,
}

impl CreateLocationDTO {
    pub fn into_model(self) -> Location {
        Location {
            id: Uuid::new_v4().to_string(),
            name: self.name,
            type_: self.r#type,
            is_sellable: self.is_sellable.unwrap_or(true),
            address_data: self.address_data,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateLocationDTO {
    pub id: String,
    pub name: Option<String>,
    pub r#type: Option<String>,
    pub is_sellable: Option<bool>,
    pub address_data: Option<String>,
}

impl UpdateLocationDTO {
    pub fn apply_to_model(self, mut location: Location) -> Location {
        if let Some(name) = self.name {
            location.name = name;
        }
        if let Some(location_type) = self.r#type {
            location.type_ = location_type;
        }
        if let Some(is_sellable) = self.is_sellable {
            location.is_sellable = is_sellable;
        }
        if let Some(address_data) = self.address_data {
            location.address_data = Some(address_data);
        }
        location
    }
}
