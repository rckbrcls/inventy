use sqlx::{Sqlite, Transaction};

/// Type alias for SQLite connection pool
pub type DbPool = sqlx::SqlitePool;

/// Type alias for SQLite transaction
pub type DbTransaction<'a> = Transaction<'a, Sqlite>;
