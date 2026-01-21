use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SetSettingDTO {
    pub key: String,
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SettingsMap {
    #[serde(flatten)]
    pub settings: std::collections::HashMap<String, String>,
}
