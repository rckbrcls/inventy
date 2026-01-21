use crate::features::module::models::module_model::Module;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModuleDto {
    pub id: String,
    pub code: String,
    pub name: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub icon: Option<String>,
    pub version: Option<String>,
    pub required_modules: Option<String>,
    pub conflicts_with: Option<String>,
    pub tables_used: Option<String>,
    pub is_core: bool,
    pub metadata: Option<String>,
}

impl From<Module> for ModuleDto {
    fn from(module: Module) -> Self {
        Self {
            id: module.id,
            code: module.code,
            name: module.name,
            description: module.description,
            category: module.category,
            icon: module.icon,
            version: module.version,
            required_modules: module.required_modules,
            conflicts_with: module.conflicts_with,
            tables_used: module.tables_used,
            is_core: module.is_core,
            metadata: module.metadata,
        }
    }
}
