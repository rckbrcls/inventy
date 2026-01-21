use crate::features::module::dtos::module_dto::ModuleDto;
use crate::features::module::repositories::modules_repository::ModulesRepository;
use sqlx::SqlitePool;

pub struct ModulesService {
    repo: ModulesRepository,
}

impl ModulesService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = ModulesRepository::new(pool);
        Self { repo }
    }

    pub async fn get_module(&self, id: &str) -> Result<Option<ModuleDto>, String> {
        self.repo
            .find_by_id(id)
            .await
            .map_err(|e| format!("Failed to fetch module: {}", e))
            .map(|opt| opt.map(ModuleDto::from))
    }

    pub async fn get_module_by_code(&self, code: &str) -> Result<Option<ModuleDto>, String> {
        self.repo
            .find_by_code(code)
            .await
            .map_err(|e| format!("Failed to fetch module by code: {}", e))
            .map(|opt| opt.map(ModuleDto::from))
    }

    pub async fn list_modules(&self) -> Result<Vec<ModuleDto>, String> {
        self.repo
            .list_all()
            .await
            .map_err(|e| format!("Failed to list modules: {}", e))
            .map(|modules| modules.into_iter().map(ModuleDto::from).collect())
    }

    pub async fn list_modules_by_category(&self, category: &str) -> Result<Vec<ModuleDto>, String> {
        self.repo
            .list_by_category(category)
            .await
            .map_err(|e| format!("Failed to list modules by category: {}", e))
            .map(|modules| modules.into_iter().map(ModuleDto::from).collect())
    }

    pub async fn list_core_modules(&self) -> Result<Vec<ModuleDto>, String> {
        self.repo
            .list_core_modules()
            .await
            .map_err(|e| format!("Failed to list core modules: {}", e))
            .map(|modules| modules.into_iter().map(ModuleDto::from).collect())
    }
}
