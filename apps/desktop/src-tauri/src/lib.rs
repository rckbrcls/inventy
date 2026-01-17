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
use crate::features::checkout::commands::checkout_commands::{
    create_checkout, update_checkout, delete_checkout, get_checkout, get_checkout_by_token, list_checkouts,
};
use crate::features::refund::commands::refund_commands::{
    create_refund, update_refund, delete_refund, get_refund, list_refunds, list_refunds_by_payment, update_refund_status,
};
use crate::features::order::commands::order_commands::{
    create_order, update_order, delete_order, get_order, list_orders,
    update_order_payment_status, update_order_fulfillment_status, cancel_order,
};
use crate::features::customer::commands::customer_commands::{
    create_customer, update_customer, delete_customer, get_customer, list_customers,
};
use crate::features::customer_address::commands::customer_address_commands::{
    create_customer_address, update_customer_address, delete_customer_address,
    get_customer_address, list_customer_addresses, list_customer_addresses_by_customer,
};
use crate::features::customer_group::commands::customer_group_commands::{
    create_customer_group, update_customer_group, delete_customer_group,
    get_customer_group, list_customer_groups,
};
use crate::features::customer_group_membership::commands::customer_group_membership_commands::{
    assign_customer_groups, list_customer_group_memberships_by_customer,
    list_customer_group_memberships_by_group, delete_customer_group_membership,
};
use crate::features::transaction::commands::transaction_commands::{
    create_transaction, update_transaction, delete_transaction, get_transaction, list_transactions,
    update_transaction_status, complete_sale_transaction, cancel_transaction,
};
use crate::features::setting::commands::setting_commands::{
    get_setting, set_setting, get_all_settings, delete_setting,
};
use crate::features::transaction::commands::transaction_item_commands::{
    create_transaction_item, update_transaction_item, delete_transaction_item,
    get_transaction_item, list_transaction_items, list_transaction_items_by_transaction,
};
use crate::features::inventory::commands::inventory_level_commands::{
    create_inventory_level, update_inventory_level, delete_inventory_level,
    get_inventory_level, list_inventory_levels, adjust_stock, transfer_stock, get_available_quantity,
};
use crate::features::inventory::commands::inventory_movement_commands::{
    create_inventory_movement, list_inventory_movements,
    list_inventory_movements_by_transaction, list_inventory_movements_by_level,
};
use crate::features::location::commands::location_commands::{
    create_location, update_location, delete_location, get_location, list_locations,
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
            list_categories,
            // Orders
            create_order,
            update_order,
            delete_order,
            get_order,
            list_orders,
            update_order_payment_status,
            update_order_fulfillment_status,
            cancel_order,
            // Refunds
            create_refund,
            update_refund,
            delete_refund,
            get_refund,
            list_refunds,
            list_refunds_by_payment,
            update_refund_status,
            // Checkouts
            create_checkout,
            update_checkout,
            delete_checkout,
            get_checkout,
            get_checkout_by_token,
            list_checkouts,
            // Customers
            create_customer,
            update_customer,
            delete_customer,
            get_customer,
            list_customers,
            // Customer Addresses
            create_customer_address,
            update_customer_address,
            delete_customer_address,
            get_customer_address,
            list_customer_addresses,
            list_customer_addresses_by_customer,
            // Customer Groups
            create_customer_group,
            update_customer_group,
            delete_customer_group,
            get_customer_group,
            list_customer_groups,
            // Customer Group Memberships
            assign_customer_groups,
            list_customer_group_memberships_by_customer,
            list_customer_group_memberships_by_group,
            delete_customer_group_membership,
            // Transactions
            create_transaction,
            update_transaction,
            delete_transaction,
            get_transaction,
            list_transactions,
            update_transaction_status,
            complete_sale_transaction,
            cancel_transaction,
            // Transaction Items
            create_transaction_item,
            update_transaction_item,
            delete_transaction_item,
            get_transaction_item,
            list_transaction_items,
            list_transaction_items_by_transaction,
            // Settings
            get_setting,
            set_setting,
            get_all_settings,
            delete_setting,
            // Inventory Levels
            create_inventory_level,
            update_inventory_level,
            delete_inventory_level,
            get_inventory_level,
            list_inventory_levels,
            adjust_stock,
            transfer_stock,
            get_available_quantity,
            // Inventory Movements
            create_inventory_movement,
            list_inventory_movements,
            list_inventory_movements_by_transaction,
            list_inventory_movements_by_level,
            // Locations
            create_location,
            update_location,
            delete_location,
            get_location,
            list_locations
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
