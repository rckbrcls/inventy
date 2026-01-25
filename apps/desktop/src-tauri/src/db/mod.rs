//! Database module for multi-database architecture
//!
//! This module provides:
//! - PoolManager: Manages registry and shop database pools
//! - DatabaseError: Unified error handling
//! - Repository traits: Base traits for database operations
//! - Migration service: Handles schema migrations

pub mod error;
pub mod migrations;
pub mod pool_manager;
pub mod repository_factory;
pub mod traits;
pub mod types;

// Re-exports for convenience
pub use error::DatabaseError;
pub use migrations::MigrationService;
pub use pool_manager::{PoolManager, ShopPool};
pub use repository_factory::RepositoryFactory;
pub use traits::*;
pub use types::*;

// Legacy type aliases for backward compatibility during migration
use sqlx::{Sqlite, Transaction};

/// Type alias for SQLite connection pool (legacy, use PoolManager instead)
pub type DbPool = sqlx::SqlitePool;

/// Type alias for SQLite transaction
pub type DbTransaction<'a> = Transaction<'a, Sqlite>;
