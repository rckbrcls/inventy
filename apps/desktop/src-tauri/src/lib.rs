pub mod db;
pub mod features;

use crate::db::{MigrationService, PoolManager, RepositoryFactory};

use crate::features::analytics::commands::analytics_commands::{
    get_average_order_value,
    get_category_distribution,
    get_conversion_rate,
    get_cumulative_revenue,
    get_customer_group_distribution,
    get_customer_growth,
    get_daily_sales_trend,
    get_dashboard_stats,
    get_inventory_capacity,
    get_month_over_month_growth,
    get_monthly_performance_metrics,
    get_monthly_sales,
    get_monthly_sales_progress,
    get_order_status_distribution,
    get_payment_method_distribution,
    get_product_metrics,
    get_product_ranking,
    get_product_review_analytics,
    get_rating_distribution,
    get_revenue_by_category,
    get_revenue_by_payment_method,
    get_review_stats_summary,
    get_stock_movements,
    get_stock_movements_area,
    get_stock_status,
    get_top_products,
    // Product Review Analytics
    get_top_rated_products,
    get_year_to_date_sales,
};
use crate::features::brand::commands::brand_commands::{
    create_brand, delete_brand, get_brand, list_brands, list_brands_by_shop, update_brand,
};
use crate::features::category::commands::category_commands::{
    create_category, delete_category, get_category, list_categories, list_categories_by_shop,
    update_category,
};
use crate::features::checkout::commands::checkout_commands::{
    create_checkout, delete_checkout, get_checkout, get_checkout_by_token, list_checkouts,
    list_checkouts_by_shop, update_checkout,
};
use crate::features::customer::commands::customer_commands::{
    create_customer, delete_customer, get_customer, list_customers, list_customers_by_shop,
    update_customer,
};
use crate::features::customer_address::commands::customer_address_commands::{
    create_customer_address, delete_customer_address, get_customer_address,
    list_customer_addresses, list_customer_addresses_by_customer, update_customer_address,
};
use crate::features::customer_group::commands::customer_group_commands::{
    create_customer_group, delete_customer_group, get_customer_group, list_customer_groups,
    list_customer_groups_by_shop, update_customer_group,
};
use crate::features::customer_group_membership::commands::customer_group_membership_commands::{
    assign_customer_groups, delete_customer_group_membership,
    list_customer_group_memberships_by_customer, list_customer_group_memberships_by_group,
};
use crate::features::inquiry::commands::inquiry_commands::{
    create_inquiry, delete_inquiry, get_inquiry, list_inquiries, list_inquiries_by_shop,
};
use crate::features::module::commands::modules_commands::{
    get_module, get_module_by_code, list_core_modules, list_modules, list_modules_by_category,
};
use crate::features::order::commands::order_commands::{
    cancel_order, create_order, delete_order, get_order, list_orders, list_orders_by_shop,
    update_order, update_order_fulfillment_status, update_order_payment_status,
};
use crate::features::payment::commands::payment_commands::{
    get_payment, list_payments, list_payments_by_shop, update_payment_status,
};
use crate::features::product::commands::product_commands::{
    create_product, delete_product, get_product, list_products, list_products_filtered,
    update_product,
};
use crate::features::refund::commands::refund_commands::{
    create_refund, delete_refund, get_refund, list_refunds, list_refunds_by_payment, update_refund,
    update_refund_status,
};
use crate::features::shop::commands::shop_commands::{
    create_shop, create_shop_from_template, delete_shop, get_shop, list_shops, update_shop,
};
use crate::features::shop_template::commands::shop_templates_commands::{
    get_shop_template, get_shop_template_by_code, list_shop_templates,
    list_shop_templates_by_category,
};
use crate::features::transaction::commands::transaction_commands::{
    cancel_transaction, complete_sale_transaction, create_transaction, delete_transaction,
    get_transaction, list_transactions, list_transactions_by_shop, update_transaction,
    update_transaction_status,
};

use crate::features::inventory::commands::inventory_level_commands::{
    adjust_stock, create_inventory_level, delete_inventory_level, get_available_quantity,
    get_inventory_level, list_inventory_levels_by_shop, transfer_stock, update_inventory_level,
};
use crate::features::inventory::commands::inventory_movement_commands::{
    create_inventory_movement, list_inventory_movements, list_inventory_movements_by_level,
    list_inventory_movements_by_shop, list_inventory_movements_by_transaction,
};
use crate::features::location::commands::location_commands::{
    create_location, delete_location, get_location, list_locations, list_locations_by_type,
    list_sellable_locations, update_location,
};
use crate::features::pos_session::commands::pos_session_commands::{
    close_pos_session, create_pos_session, delete_pos_session, get_open_pos_session_by_operator,
    get_pos_session, list_pos_sessions, list_pos_sessions_by_shop, update_pos_session,
};
use crate::features::review::commands::review_commands::{
    create_review, delete_review, get_review, list_reviews, list_reviews_by_shop, update_review,
};
use crate::features::shipment::commands::shipment_commands::{
    create_shipment, delete_shipment, get_shipment, list_shipments, list_shipments_by_shop,
    update_shipment,
};
use crate::features::transaction::commands::transaction_item_commands::{
    create_transaction_item, delete_transaction_item, get_transaction_item, list_transaction_items,
    list_transaction_items_by_transaction, update_transaction_item,
};
use crate::features::user::commands::user_commands::{
    create_user, delete_user, get_user, list_users, update_user,
};
use std::fs;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_stronghold::Builder::new(|_pass| todo!()).build())
        .invoke_handler(tauri::generate_handler![
            // Analytics
            get_dashboard_stats,
            get_stock_movements,
            // Area Chart
            get_cumulative_revenue,
            get_stock_movements_area,
            get_revenue_by_payment_method,
            // Bar Chart
            get_top_products,
            get_revenue_by_category,
            get_monthly_sales,
            get_stock_status,
            // Line Chart
            get_daily_sales_trend,
            get_customer_growth,
            get_average_order_value,
            // Pie Chart
            get_payment_method_distribution,
            get_category_distribution,
            get_order_status_distribution,
            get_customer_group_distribution,
            // Radar Chart
            get_monthly_performance_metrics,
            get_product_metrics,
            // Radial Chart
            get_monthly_sales_progress,
            get_conversion_rate,
            get_inventory_capacity,
            // Advanced Queries
            get_product_ranking,
            get_month_over_month_growth,
            get_year_to_date_sales,
            // Product Review Analytics
            get_top_rated_products,
            get_product_review_analytics,
            get_review_stats_summary,
            get_rating_distribution,
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
            list_brands_by_shop,
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
            list_orders_by_shop,
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
            // Payments
            list_payments,
            list_payments_by_shop,
            get_payment,
            update_payment_status,
            // Checkouts
            create_checkout,
            update_checkout,
            delete_checkout,
            get_checkout,
            get_checkout_by_token,
            list_checkouts,
            list_checkouts_by_shop,
            // Customers
            create_customer,
            update_customer,
            delete_customer,
            get_customer,
            list_customers,
            list_customers_by_shop,
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
            list_customer_groups_by_shop,
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
            list_transactions_by_shop,
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
            // Inventory Levels
            create_inventory_level,
            update_inventory_level,
            delete_inventory_level,
            get_inventory_level,
            list_inventory_levels_by_shop,
            adjust_stock,
            transfer_stock,
            get_available_quantity,
            // Inventory Movements
            create_inventory_movement,
            list_inventory_movements,
            list_inventory_movements_by_transaction,
            list_inventory_movements_by_level,
            list_inventory_movements_by_shop,
            // Locations
            create_location,
            update_location,
            delete_location,
            get_location,
            list_locations,
            list_locations_by_type,
            list_sellable_locations,
            // Shipments
            create_shipment,
            update_shipment,
            delete_shipment,
            get_shipment,
            list_shipments,
            list_shipments_by_shop,
            // Reviews
            list_reviews_by_shop,
            list_reviews,
            delete_review,
            get_review,
            create_review,
            update_review,
            // Inquiries
            create_inquiry,
            delete_inquiry,
            get_inquiry,
            list_inquiries,
            list_inquiries_by_shop,
            // Modules
            get_module,
            get_module_by_code,
            list_modules,
            list_modules_by_category,
            list_core_modules,
            // Shop Templates
            get_shop_template,
            get_shop_template_by_code,
            list_shop_templates,
            list_shop_templates_by_category,
            // POS Sessions
            create_pos_session,
            update_pos_session,
            close_pos_session,
            delete_pos_session,
            get_pos_session,
            list_pos_sessions,
            list_pos_sessions_by_shop,
            get_open_pos_session_by_operator,
            // Shops
            create_shop,
            create_shop_from_template,
            update_shop,
            delete_shop,
            get_shop,
            list_shops,
            // Users
            create_user,
            update_user,
            delete_user,
            get_user,
            list_users
        ])
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir()?;
            fs::create_dir_all(&app_data_dir)?;

            // ============================================================
            // Multi-Database Architecture Setup
            // ============================================================
            // Initialize PoolManager for the new multi-database architecture
            // This manages:
            // - Registry database (shops, users, roles, modules)
            // - Per-shop databases (products, customers, orders, etc.)
            let pool_manager = tauri::async_runtime::block_on(async {
                PoolManager::initialize(app_data_dir.clone()).await
            })
            .map_err(|e| format!("Failed to initialize PoolManager: {}", e))?;

            let pool_manager = std::sync::Arc::new(pool_manager);

            // Run registry migrations
            let migration_service = MigrationService::new(pool_manager.clone());
            tauri::async_runtime::block_on(async {
                migration_service.migrate_registry().await
            })
            .map_err(|e| format!("Failed to run registry migrations: {}", e))?;

            // Create RepositoryFactory for dependency injection
            let repo_factory = std::sync::Arc::new(RepositoryFactory::new(pool_manager.clone()));

            // Manage the new infrastructure
            app.manage(pool_manager.clone());
            app.manage(repo_factory);

            // ============================================================
            // Registry Pool (shops, users, roles, modules, shop_templates)
            // ============================================================
            // Exposed as SqlitePool for registry-only commands. Shop data
            // uses RepositoryFactory + shop_pool(shop_id) per multi-DB architecture.
            let registry_pool = pool_manager.registry().clone();
            app.manage(registry_pool);

            // Legacy tauri-plugin-sql setup (for frontend SQL access if needed)
            // Note: Migrations are now handled by MigrationService, so we don't add them here
            let registry_db_path = app_data_dir.join("registry.db");
            let registry_db_url = format!(
                "sqlite:{}?mode=rwc",
                registry_db_path.to_string_lossy().replace(' ', "%20")
            );

            app.handle().plugin(
                tauri_plugin_sql::Builder::default()
                    .add_migrations(&registry_db_url, vec![])
                    .build(),
            )?;

            // Register store plugin for app settings
            app.handle()
                .plugin(tauri_plugin_store::Builder::new().build())?;

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
