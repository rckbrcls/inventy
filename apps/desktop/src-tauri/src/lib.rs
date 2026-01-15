#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let migrations = vec![
    tauri_plugin_sql::Migration {
      version: 1,
      description: "create_initial_schema",
      sql: r#"
        -- Inventory Items
        CREATE TABLE IF NOT EXISTS inventory_items (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          sku TEXT,
          category TEXT,
          description TEXT,
          quantity REAL NOT NULL DEFAULT 0,
          min_stock_level REAL DEFAULT 5,
          location TEXT,
          cost_price REAL,
          selling_price REAL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted_at TEXT
        );

        -- Debtors
        CREATE TABLE IF NOT EXISTS debtors (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          phone TEXT,
          email TEXT,
          notes TEXT,
          current_balance REAL DEFAULT 0,
          status TEXT DEFAULT 'active',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          deleted_at TEXT
        );

        -- Inventory Movements
        CREATE TABLE IF NOT EXISTS inventory_movements (
          id TEXT PRIMARY KEY NOT NULL,
          item_id TEXT NOT NULL REFERENCES inventory_items(id),
          debtor_id TEXT REFERENCES debtors(id),
          type TEXT NOT NULL,
          quantity_change REAL NOT NULL,
          unit_price_snapshot REAL,
          reason TEXT,
          occurred_at TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        -- Indices
        CREATE INDEX IF NOT EXISTS idx_items_updated_at ON inventory_items (updated_at);
        CREATE INDEX IF NOT EXISTS idx_items_name_sku ON inventory_items (name, sku);
        CREATE INDEX IF NOT EXISTS idx_movements_item ON inventory_movements (item_id);
      "#,
      kind: tauri_plugin_sql::MigrationKind::Up,
    }
  ];

  tauri::Builder::default()
    .plugin(
      tauri_plugin_sql::Builder::default()
        .add_migrations("sqlite:inventy.db", migrations)
        .build(),
    )
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
