use sqlx::SqlitePool;
use tauri::State;

use crate::features::analytics::dtos::analytics_dto::*;
use crate::features::analytics::services::analytics_service::AnalyticsService;

// Existing commands
#[tauri::command]
pub async fn get_dashboard_stats(
    pool: State<'_, SqlitePool>,
    shop_id: Option<String>,
) -> Result<DashboardStatsDto, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_dashboard_stats(shop_id).await
}

#[tauri::command]
pub async fn get_stock_movements(
    pool: State<'_, SqlitePool>,
    shop_id: Option<String>,
    payload: StockMovementsFilterDto,
) -> Result<Vec<DailyMovementStatDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_stock_movements(shop_id, payload).await
}

// Area Chart Commands
#[tauri::command]
pub async fn get_cumulative_revenue(
    pool: State<'_, SqlitePool>,
    shop_id: Option<String>,
    days: Option<i64>,
) -> Result<Vec<CumulativeRevenueDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_cumulative_revenue(shop_id, days).await
}

#[tauri::command]
pub async fn get_stock_movements_area(
    pool: State<'_, SqlitePool>,
    shop_id: Option<String>,
    days: Option<i64>,
) -> Result<Vec<StockMovementsAreaDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_stock_movements_area(shop_id, days).await
}

#[tauri::command]
pub async fn get_revenue_by_payment_method(
    pool: State<'_, SqlitePool>,
    shop_id: Option<String>,
    days: Option<i64>,
) -> Result<Vec<RevenueByPaymentMethodDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_revenue_by_payment_method(shop_id, days).await
}

// Bar Chart Commands
#[tauri::command]
pub async fn get_top_products(
    pool: State<'_, SqlitePool>,
    shop_id: Option<String>,
    days: Option<i64>,
    limit: Option<i64>,
) -> Result<Vec<TopProductDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_top_products(shop_id, days, limit).await
}

#[tauri::command]
pub async fn get_revenue_by_category(
    pool: State<'_, SqlitePool>,
    shop_id: Option<String>,
) -> Result<Vec<RevenueByCategoryDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_revenue_by_category(shop_id).await
}

#[tauri::command]
pub async fn get_monthly_sales(
    pool: State<'_, SqlitePool>,
    shop_id: Option<String>,
    months: Option<i64>,
) -> Result<Vec<MonthlySalesDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_monthly_sales(shop_id, months).await
}

#[tauri::command]
pub async fn get_stock_status(
    pool: State<'_, SqlitePool>,
    shop_id: Option<String>,
) -> Result<Vec<StockStatusDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_stock_status(shop_id).await
}

// Line Chart Commands
#[tauri::command]
pub async fn get_daily_sales_trend(
    pool: State<'_, SqlitePool>,
    shop_id: Option<String>,
    days: Option<i64>,
) -> Result<Vec<DailySalesTrendDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_daily_sales_trend(shop_id, days).await
}

#[tauri::command]
pub async fn get_customer_growth(
    pool: State<'_, SqlitePool>,
    shop_id: Option<String>,
    months: Option<i64>,
) -> Result<Vec<CustomerGrowthDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_customer_growth(shop_id, months).await
}

#[tauri::command]
pub async fn get_average_order_value(
    pool: State<'_, SqlitePool>,
    shop_id: Option<String>,
    months: Option<i64>,
) -> Result<Vec<AverageOrderValueDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_average_order_value(shop_id, months).await
}

// Pie Chart Commands
#[tauri::command]
pub async fn get_payment_method_distribution(
    pool: State<'_, SqlitePool>,
    shop_id: Option<String>,
    days: Option<i64>,
) -> Result<Vec<PaymentMethodDistributionDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_payment_method_distribution(shop_id, days).await
}

#[tauri::command]
pub async fn get_category_distribution(
    pool: State<'_, SqlitePool>,
    shop_id: Option<String>,
) -> Result<Vec<CategoryDistributionDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_category_distribution(shop_id).await
}

#[tauri::command]
pub async fn get_order_status_distribution(
    pool: State<'_, SqlitePool>,
    shop_id: Option<String>,
    days: Option<i64>,
) -> Result<Vec<OrderStatusDistributionDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_order_status_distribution(shop_id, days).await
}

#[tauri::command]
pub async fn get_customer_group_distribution(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<CustomerGroupDistributionDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_customer_group_distribution().await
}

// Radar Chart Commands
#[tauri::command]
pub async fn get_monthly_performance_metrics(
    pool: State<'_, SqlitePool>,
    months: Option<i64>,
) -> Result<Vec<MonthlyPerformanceMetricsDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_monthly_performance_metrics(months).await
}

#[tauri::command]
pub async fn get_product_metrics(
    pool: State<'_, SqlitePool>,
    days: Option<i64>,
    limit: Option<i64>,
) -> Result<Vec<ProductMetricsDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_product_metrics(days, limit).await
}

// Radial Chart Commands
#[tauri::command]
pub async fn get_monthly_sales_progress(
    pool: State<'_, SqlitePool>,
    target_revenue: Option<f64>,
) -> Result<MonthlySalesProgressDto, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_monthly_sales_progress(target_revenue).await
}

#[tauri::command]
pub async fn get_conversion_rate(
    pool: State<'_, SqlitePool>,
    shop_id: Option<String>,
    days: Option<i64>,
) -> Result<ConversionRateDto, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_conversion_rate(shop_id, days).await
}

#[tauri::command]
pub async fn get_inventory_capacity(
    pool: State<'_, SqlitePool>,
    shop_id: Option<String>,
    capacity_limit: Option<f64>,
) -> Result<InventoryCapacityDto, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_inventory_capacity(shop_id, capacity_limit).await
}

// Advanced Queries Commands
#[tauri::command]
pub async fn get_product_ranking(
    pool: State<'_, SqlitePool>,
    days: Option<i64>,
    limit: Option<i64>,
) -> Result<Vec<ProductRankingDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_product_ranking(days, limit).await
}

#[tauri::command]
pub async fn get_month_over_month_growth(
    pool: State<'_, SqlitePool>,
    months: Option<i64>,
) -> Result<Vec<MonthOverMonthGrowthDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_month_over_month_growth(months).await
}

#[tauri::command]
pub async fn get_year_to_date_sales(
    pool: State<'_, SqlitePool>,
) -> Result<Vec<YearToDateSalesDto>, String> {
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_year_to_date_sales().await
}
