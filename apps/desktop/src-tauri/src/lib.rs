pub mod db;
pub mod features;

use crate::features::analytics::commands::analytics_commands::{
    get_dashboard_stats, get_stock_movements,
};
use crate::features::product::commands::product_commands::{
    create_product, update_product, delete_product, get_product, list_products, list_products_filtered,
};
use crate::features::brand::commands::brand_commands::{
    create_brand, update_brand, delete_brand, get_brand, list_brands,
};
use crate::features::category::commands::category_commands::{
    create_category, update_category, delete_category, get_category, list_categories_by_shop, list_categories,
};
use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
use tauri::Manager;
use std::fs;
use std::fs::OpenOptions;
use std::str::FromStr;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // Analytics
            get_dashboard_stats,
            get_stock_movements,
            // Products
            create_product,
            update_product,
            delete_product,
            get_product,
            list_products,
            list_products_filtered,
            // Brands
            create_brand,
            update_brand,
            delete_brand,
            get_brand,
            list_brands,
            // Categories
            create_category,
            update_category,
            delete_category,
            get_category,
            list_categories_by_shop,
            list_categories
        ])
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir()?;
            fs::create_dir_all(&app_data_dir)?;
            let db_path = app_data_dir.join("inventy.db");
            if !db_path.exists() {
                OpenOptions::new()
                    .create(true)
                    .write(true)
                    .open(&db_path)?;
            }
            let db_url = format!(
                "sqlite:{}?mode=rwc",
                db_path.to_string_lossy().replace(' ', "%20")
            );

            let migrations = vec![tauri_plugin_sql::Migration {
                version: 1,
                description: "create_initial_schema",
                sql: include_str!("../migrations/001_initial_schema.sql"),
                kind: tauri_plugin_sql::MigrationKind::Up,
            }];

            app.handle().plugin(
                tauri_plugin_sql::Builder::default()
                    .add_migrations(&db_url, migrations)
                    .build(),
            )?;

            let connect_options = SqliteConnectOptions::from_str(&db_url)?
                .create_if_missing(true);
            let pool = tauri::async_runtime::block_on(async {
                SqlitePoolOptions::new()
                    .max_connections(5)
                    .connect_with(connect_options)
                    .await
            })?;
            app.manage(pool);

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
