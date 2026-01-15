use crate::dtos::user_dto::CreateUserDTO;
use crate::models::user_model::User;
use crate::repositories::user_identities_repository::UserIdentitiesRepository;
use crate::repositories::user_repository::UserRepository;
use crate::repositories::user_roles_repository::UserRolesRepository;
use crate::repositories::user_sessions_repository::UserSessionsRepository;
use sqlx::SqlitePool;

pub struct UserService {
    repo: UserRepository,
    identities_repo: UserIdentitiesRepository,
    roles_repo: UserRolesRepository,
    sessions_repo: UserSessionsRepository,
}

impl UserService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = UserRepository::new(pool.clone());
        let identities_repo = UserIdentitiesRepository::new(pool.clone());
        let roles_repo = UserRolesRepository::new(pool.clone());
        let sessions_repo = UserSessionsRepository::new(pool);
        Self {
            repo,
            identities_repo,
            roles_repo,
            sessions_repo,
        }
    }

    pub async fn create_user(&self, payload: CreateUserDTO) -> Result<User, String> {
        let (user, roles) = payload.into_models();
        let created_user = self
            .repo
            .create(user)
            .await
            .map_err(|e| format!("Erro ao criar usuário: {}", e))?;

        // original call passed Vec::new() for identities (2nd arg) and roles (3rd arg).
        // Wait, logic in user_service.rs: self.repo.create(user, Vec::new(), roles)
        // So identities empty, roles present.

        if !roles.is_empty() {
            self.roles_repo
                .create_many(roles)
                .await
                .map_err(|e| format!("Erro ao criar roles do usuário: {}", e))?;
        }

        // identities passed as empty in original service call.

        Ok(created_user)
    }

    pub async fn delete_user(&self, id: &str) -> Result<(), String> {
        self.identities_repo
            .delete_by_user_id(id)
            .await
            .map_err(|e| format!("Erro ao deletar identidades: {}", e))?;
        self.roles_repo
            .delete_by_user_id(id)
            .await
            .map_err(|e| format!("Erro ao deletar roles: {}", e))?;
        self.sessions_repo
            .delete_by_user_id(id)
            .await
            .map_err(|e| format!("Erro ao deletar sessões: {}", e))?;
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Erro ao deletar usuário: {}", e))
    }

    pub async fn get_user(&self, id: &str) -> Result<Option<User>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Erro ao buscar usuário: {}", e))
    }

    pub async fn list_users(&self) -> Result<Vec<User>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Erro ao listar usuários: {}", e))
    }
}
