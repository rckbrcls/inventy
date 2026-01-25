//! Repository factory for multi-database architecture
//!
//! Provides a centralized way to obtain repository instances that are
//! properly configured for the target database (registry or shop).

use crate::db::error::DbResult;
use crate::db::migrations::MigrationService;
use crate::db::pool_manager::{PoolManager, ShopPool};
use crate::db::types::DatabaseConfig;
use std::sync::Arc;

/// Factory for creating repository instances.
///
/// The RepositoryFactory provides:
/// - Registry repositories (always SQLite): shops, users, roles, modules
/// - Shop repositories (SQLite or Postgres): products, customers, orders, etc.
pub struct RepositoryFactory {
    pool_manager: Arc<PoolManager>,
}

impl RepositoryFactory {
    /// Create a new repository factory
    pub fn new(pool_manager: Arc<PoolManager>) -> Self {
        Self { pool_manager }
    }

    /// Get a reference to the pool manager
    pub fn pool_manager(&self) -> &Arc<PoolManager> {
        &self.pool_manager
    }

    // ============================================================
    // Registry Repositories (always SQLite)
    // ============================================================

    /// Get the SQLite pool for registry operations.
    ///
    /// Use this for: shops, users, roles, modules, shop_templates
    pub fn registry_pool(&self) -> &sqlx::SqlitePool {
        self.pool_manager.registry()
    }

    // ============================================================
    // Shop Repositories (SQLite or Postgres based on shop config)
    // ============================================================

    /// Get a shop's database pool (SQLite only, for backward compatibility).
    ///
    /// For Postgres shops, use shop_pool_with_config instead.
    /// This method will:
    /// 1. Check if the shop database exists
    /// 2. Create and migrate the database if needed
    /// 3. Return the SQLite pool
    pub async fn shop_pool(&self, shop_id: &str) -> DbResult<Arc<sqlx::SqlitePool>> {
        // Get shop configuration
        let config = self.pool_manager.get_shop_database_config(shop_id).await?;
        
        // If Postgres, return error (use shop_pool_with_config)
        if matches!(config.database_type, crate::db::types::DatabaseType::Postgres) {
            return Err(crate::db::error::DatabaseError::invalid_config(
                "Shop uses Postgres database. Use shop_pool_with_config() instead."
            ));
        }

        // Check if we need to migrate this shop's database
        if !self.pool_manager.shop_db_exists(shop_id) {
            // New shop database - need to run migrations
            let pool = self.pool_manager.get_shop_pool(shop_id).await?;

            // Run migrations
            let migration_service = MigrationService::new(self.pool_manager.clone());
            migration_service.migrate_shop(shop_id).await?;

            // Initialize shop_config table with shop_id
            sqlx::query(
                "INSERT OR REPLACE INTO shop_config (id, shop_id, initialized_at, schema_version) VALUES ('config', ?, datetime('now'), 1)"
            )
            .bind(shop_id)
            .execute(&*pool)
            .await?;

            return Ok(pool);
        }

        self.pool_manager.get_shop_pool(shop_id).await
    }

    /// Get a shop's database pool with configuration (supports both SQLite and Postgres).
    ///
    /// This method will:
    /// 1. Get shop configuration from registry
    /// 2. Create pool with correct type
    /// 3. Run migrations if needed
    /// 4. Return the appropriate pool type
    pub async fn shop_pool_with_config(&self, shop_id: &str) -> DbResult<ShopPool> {
        // Get shop configuration
        let config = self.pool_manager.get_shop_database_config(shop_id).await?;
        
        // Get or create pool with configuration
        let shop_pool = self.pool_manager.get_shop_pool_with_config(shop_id, &config).await?;

        // Check if we need to migrate (for SQLite, check file existence; for Postgres, always check)
        let needs_migration = match config.database_type {
            crate::db::types::DatabaseType::Sqlite => !self.pool_manager.shop_db_exists(shop_id),
            crate::db::types::DatabaseType::Postgres => {
                // For Postgres, we'll check migration version in migrate_shop
                true
            }
        };

        if needs_migration {
            // Run migrations
            let migration_service = MigrationService::new(self.pool_manager.clone());
            migration_service.migrate_shop(shop_id).await?;

            // Initialize shop_config table with shop_id
            match &shop_pool {
                ShopPool::Sqlite(pool) => {
                    sqlx::query(
                        "INSERT OR REPLACE INTO shop_config (id, shop_id, initialized_at, schema_version) VALUES ('config', ?, datetime('now'), 1)"
                    )
                    .bind(shop_id)
                    .execute(pool.as_ref())
                    .await?;
                }
                ShopPool::Postgres(pool) => {
                    sqlx::query(
                        "INSERT INTO shop_config (id, shop_id, initialized_at, schema_version) VALUES ('config', $1, CURRENT_TIMESTAMP, 1) ON CONFLICT (id) DO UPDATE SET shop_id = $1, initialized_at = CURRENT_TIMESTAMP"
                    )
                    .bind(shop_id)
                    .execute(pool.as_ref())
                    .await?;
                }
            }
        }

        Ok(shop_pool)
    }

    /// Get a shop's database pool without auto-migration.
    ///
    /// Use this when you know the shop database already exists and is migrated.
    /// This is faster but will fail if the database doesn't exist.
    pub async fn shop_pool_unchecked(&self, shop_id: &str) -> DbResult<Arc<sqlx::SqlitePool>> {
        self.pool_manager.get_shop_pool(shop_id).await
    }

    // ============================================================
    // Shop Lifecycle Management
    // ============================================================

    /// Provision a new shop's database.
    ///
    /// This creates the database and runs migrations.
    /// Call this when creating a new shop.
    /// 
    /// If config is provided, uses it; otherwise reads from shop registry.
    pub async fn provision_shop_database(&self, shop_id: &str) -> DbResult<()> {
        // Get shop configuration (from registry or use default)
        let config = self.pool_manager.get_shop_database_config(shop_id).await
            .unwrap_or_else(|_| DatabaseConfig::default());

        // Get/create the pool with configuration
        let shop_pool = self.pool_manager.get_shop_pool_with_config(shop_id, &config).await?;

        // Run migrations
        let migration_service = MigrationService::new(self.pool_manager.clone());
        migration_service.migrate_shop(shop_id).await?;

        // Initialize shop_config
        match shop_pool {
            ShopPool::Sqlite(pool) => {
                sqlx::query(
                    "INSERT OR REPLACE INTO shop_config (id, shop_id, initialized_at, schema_version) VALUES ('config', ?, datetime('now'), 1)"
                )
                .bind(shop_id)
                .execute(&*pool)
                .await?;
            }
            ShopPool::Postgres(pool) => {
                sqlx::query(
                    "INSERT INTO shop_config (id, shop_id, initialized_at, schema_version) VALUES ('config', $1, CURRENT_TIMESTAMP, 1) ON CONFLICT (id) DO UPDATE SET shop_id = $1, initialized_at = CURRENT_TIMESTAMP"
                )
                .bind(shop_id)
                .execute(&*pool)
                .await?;
            }
        }

        Ok(())
    }

    /// Delete a shop's database.
    ///
    /// This closes the pool and removes the database file.
    /// Call this when deleting a shop (after soft-deleting from registry).
    pub async fn delete_shop_database(&self, shop_id: &str) -> DbResult<()> {
        // Close and remove the pool
        self.pool_manager.invalidate_shop_pool(shop_id).await;

        // Delete the database file
        self.pool_manager.delete_shop_db(shop_id)?;

        Ok(())
    }

    /// Check if a shop's database exists.
    pub fn shop_database_exists(&self, shop_id: &str) -> bool {
        self.pool_manager.shop_db_exists(shop_id)
    }

    // ============================================================
    // Migration Utilities
    // ============================================================

    /// Get a migration service for running migrations
    pub fn migration_service(&self) -> MigrationService {
        MigrationService::new(self.pool_manager.clone())
    }
}

impl std::fmt::Debug for RepositoryFactory {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("RepositoryFactory")
            .field("pool_manager", &self.pool_manager)
            .finish()
    }
}
