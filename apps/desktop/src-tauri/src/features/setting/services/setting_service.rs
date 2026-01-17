use crate::features::setting::dtos::setting_dto::SetSettingDTO;
use crate::features::setting::models::setting_model::Setting;
use crate::features::setting::repositories::settings_repository::SettingsRepository;
use chrono::Utc;
use sqlx::SqlitePool;
use std::collections::HashMap;
use uuid::Uuid;

pub struct SettingService {
    repository: SettingsRepository,
}

impl SettingService {
    pub fn new(pool: SqlitePool) -> Self {
        Self {
            repository: SettingsRepository::new(pool),
        }
    }

    pub async fn get_setting(&self, key: &str) -> Result<Option<String>, String> {
        self.repository
            .get_by_key(key)
            .await
            .map(|opt| opt.and_then(|s| s.value))
            .map_err(|e| e.to_string())
    }

    pub async fn set_setting(&self, dto: SetSettingDTO) -> Result<(), String> {
        let now = Utc::now();
        let setting = Setting {
            id: Uuid::new_v4().to_string(),
            key: dto.key,
            value: Some(dto.value),
            sync_status: "created".to_string(),
            created_at: now,
            updated_at: now,
        };

        self.repository
            .set(setting)
            .await
            .map(|_| ())
            .map_err(|e| e.to_string())
    }

    pub async fn get_all_settings(&self) -> Result<HashMap<String, String>, String> {
        let settings = self.repository.list().await.map_err(|e| e.to_string())?;

        let map: HashMap<String, String> = settings
            .into_iter()
            .filter_map(|s| s.value.map(|v| (s.key, v)))
            .collect();

        Ok(map)
    }

    pub async fn delete_setting(&self, key: &str) -> Result<(), String> {
        self.repository
            .delete(key)
            .await
            .map_err(|e| e.to_string())
    }
}
