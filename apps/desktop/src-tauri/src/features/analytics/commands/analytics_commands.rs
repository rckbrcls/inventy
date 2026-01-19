use sqlx::SqlitePool;
use tauri::State;

use crate::features::analytics::dtos::analytics_dto::*;
use crate::features::analytics::services::analytics_service::AnalyticsService;

// Existing commands
#[tauri::command]
pub async fn get_dashboard_stats(
    pool: State<'_, SqlitePool>,
    shop_id: String,
) -> Result<DashboardStatsDto, String> {
    eprintln!("[get_dashboard_stats command] Received shop_id: {:?} (type: String)", shop_id);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_dashboard_stats(Some(shop_id)).await
}

#[tauri::command]
pub async fn get_stock_movements(
    pool: State<'_, SqlitePool>,
    shop_id: String,
    payload: StockMovementsFilterDto,
) -> Result<Vec<DailyMovementStatDto>, String> {
    eprintln!("[get_stock_movements command] Received shop_id: {:?}", shop_id);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_stock_movements(Some(shop_id), payload).await
}

// Area Chart Commands
#[tauri::command]
pub async fn get_cumulative_revenue(
    pool: State<'_, SqlitePool>,
    shop_id: String,
    days: Option<i64>,
) -> Result<Vec<CumulativeRevenueDto>, String> {
    eprintln!("[get_cumulative_revenue command] Received shop_id: {:?}, days: {:?}", shop_id, days);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_cumulative_revenue(Some(shop_id), days).await
}

#[tauri::command]
pub async fn get_stock_movements_area(
    pool: State<'_, SqlitePool>,
    shop_id: String,
    days: Option<i64>,
) -> Result<Vec<StockMovementsAreaDto>, String> {
    eprintln!("[get_stock_movements_area command] Received shop_id: {:?}, days: {:?}", shop_id, days);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_stock_movements_area(Some(shop_id), days).await
}

#[tauri::command]
pub async fn get_revenue_by_payment_method(
    pool: State<'_, SqlitePool>,
    shop_id: String,
    days: Option<i64>,
) -> Result<Vec<RevenueByPaymentMethodDto>, String> {
    eprintln!("[get_revenue_by_payment_method command] Received shop_id: {:?}, days: {:?}", shop_id, days);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_revenue_by_payment_method(Some(shop_id), days).await
}

// Bar Chart Commands
#[tauri::command]
pub async fn get_top_products(
    pool: State<'_, SqlitePool>,
    shop_id: String,
    days: Option<i64>,
    limit: Option<i64>,
) -> Result<Vec<TopProductDto>, String> {
    eprintln!("[get_top_products command] Received shop_id: {:?}, days: {:?}, limit: {:?}", shop_id, days, limit);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_top_products(Some(shop_id), days, limit).await
}

#[tauri::command]
pub async fn get_revenue_by_category(
    pool: State<'_, SqlitePool>,
    shop_id: String,
) -> Result<Vec<RevenueByCategoryDto>, String> {
    eprintln!("[get_revenue_by_category command] Received shop_id: {:?}", shop_id);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_revenue_by_category(Some(shop_id)).await
}

#[tauri::command]
pub async fn get_monthly_sales(
    pool: State<'_, SqlitePool>,
    shop_id: String,
    months: Option<i64>,
) -> Result<Vec<MonthlySalesDto>, String> {
    eprintln!("[get_monthly_sales command] Received shop_id: {:?}, months: {:?}", shop_id, months);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_monthly_sales(Some(shop_id), months).await
}

#[tauri::command]
pub async fn get_stock_status(
    pool: State<'_, SqlitePool>,
    shop_id: String,
) -> Result<Vec<StockStatusDto>, String> {
    eprintln!("[get_stock_status command] Received shop_id: {:?}", shop_id);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_stock_status(Some(shop_id)).await
}

// Line Chart Commands
#[tauri::command]
pub async fn get_daily_sales_trend(
    pool: State<'_, SqlitePool>,
    shop_id: String,
    days: Option<i64>,
) -> Result<Vec<DailySalesTrendDto>, String> {
    eprintln!("[get_daily_sales_trend command] Received shop_id: {:?}, days: {:?}", shop_id, days);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_daily_sales_trend(Some(shop_id), days).await
}

#[tauri::command]
pub async fn get_customer_growth(
    pool: State<'_, SqlitePool>,
    shop_id: String,
    months: Option<i64>,
) -> Result<Vec<CustomerGrowthDto>, String> {
    eprintln!("[get_customer_growth command] Received shop_id: {:?}, months: {:?}", shop_id, months);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_customer_growth(Some(shop_id), months).await
}

#[tauri::command]
pub async fn get_average_order_value(
    pool: State<'_, SqlitePool>,
    shop_id: String,
    months: Option<i64>,
) -> Result<Vec<AverageOrderValueDto>, String> {
    eprintln!("[get_average_order_value command] Received shop_id: {:?}, months: {:?}", shop_id, months);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_average_order_value(Some(shop_id), months).await
}

// Pie Chart Commands
#[tauri::command]
pub async fn get_payment_method_distribution(
    pool: State<'_, SqlitePool>,
    shop_id: String,
    days: Option<i64>,
) -> Result<Vec<PaymentMethodDistributionDto>, String> {
    eprintln!("[get_payment_method_distribution command] Received shop_id: {:?}, days: {:?}", shop_id, days);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_payment_method_distribution(Some(shop_id), days).await
}

#[tauri::command]
pub async fn get_category_distribution(
    pool: State<'_, SqlitePool>,
    shop_id: String,
) -> Result<Vec<CategoryDistributionDto>, String> {
    eprintln!("[get_category_distribution command] Received shop_id: {:?}", shop_id);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_category_distribution(Some(shop_id)).await
}

#[tauri::command]
pub async fn get_order_status_distribution(
    pool: State<'_, SqlitePool>,
    shop_id: String,
    days: Option<i64>,
) -> Result<Vec<OrderStatusDistributionDto>, String> {
    eprintln!("[get_order_status_distribution command] Received shop_id: {:?}, days: {:?}", shop_id, days);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_order_status_distribution(Some(shop_id), days).await
}

#[tauri::command]
pub async fn get_customer_group_distribution(
    pool: State<'_, SqlitePool>,
    shop_id: String,
) -> Result<Vec<CustomerGroupDistributionDto>, String> {
    eprintln!("[get_customer_group_distribution command] Received shop_id: {:?}", shop_id);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_customer_group_distribution(Some(shop_id)).await
}

// Radar Chart Commands
#[tauri::command]
pub async fn get_monthly_performance_metrics(
    pool: State<'_, SqlitePool>,
    shop_id: String,
    months: Option<i64>,
) -> Result<Vec<MonthlyPerformanceMetricsDto>, String> {
    eprintln!("[get_monthly_performance_metrics command] Received shop_id: {:?}, months: {:?}", shop_id, months);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_monthly_performance_metrics(Some(shop_id), months).await
}

#[tauri::command]
pub async fn get_product_metrics(
    pool: State<'_, SqlitePool>,
    shop_id: String,
    days: Option<i64>,
    limit: Option<i64>,
) -> Result<Vec<ProductMetricsDto>, String> {
    eprintln!("[get_product_metrics command] Received shop_id: {:?}, days: {:?}, limit: {:?}", shop_id, days, limit);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_product_metrics(Some(shop_id), days, limit).await
}

// Radial Chart Commands
#[tauri::command]
pub async fn get_monthly_sales_progress(
    pool: State<'_, SqlitePool>,
    shop_id: String,
    target_revenue: Option<f64>,
) -> Result<MonthlySalesProgressDto, String> {
    eprintln!("[get_monthly_sales_progress command] Received shop_id: {:?}, target_revenue: {:?}", shop_id, target_revenue);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_monthly_sales_progress(Some(shop_id), target_revenue).await
}

#[tauri::command]
pub async fn get_conversion_rate(
    pool: State<'_, SqlitePool>,
    shop_id: String,
    days: Option<i64>,
) -> Result<ConversionRateDto, String> {
    eprintln!("[get_conversion_rate command] Received shop_id: {:?}, days: {:?}", shop_id, days);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_conversion_rate(Some(shop_id), days).await
}

#[tauri::command]
pub async fn get_inventory_capacity(
    pool: State<'_, SqlitePool>,
    shop_id: String,
    capacity_limit: Option<f64>,
) -> Result<InventoryCapacityDto, String> {
    eprintln!("[get_inventory_capacity command] Received shop_id: {:?}, capacity_limit: {:?}", shop_id, capacity_limit);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_inventory_capacity(Some(shop_id), capacity_limit).await
}

// Advanced Queries Commands
#[tauri::command]
pub async fn get_product_ranking(
    pool: State<'_, SqlitePool>,
    shop_id: String,
    days: Option<i64>,
    limit: Option<i64>,
) -> Result<Vec<ProductRankingDto>, String> {
    eprintln!("[get_product_ranking command] Received shop_id: {:?}, days: {:?}, limit: {:?}", shop_id, days, limit);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_product_ranking(Some(shop_id), days, limit).await
}

#[tauri::command]
pub async fn get_month_over_month_growth(
    pool: State<'_, SqlitePool>,
    shop_id: String,
    months: Option<i64>,
) -> Result<Vec<MonthOverMonthGrowthDto>, String> {
    eprintln!("[get_month_over_month_growth command] Received shop_id: {:?}, months: {:?}", shop_id, months);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_month_over_month_growth(Some(shop_id), months).await
}

#[tauri::command]
pub async fn get_year_to_date_sales(
    pool: State<'_, SqlitePool>,
    shop_id: String,
) -> Result<Vec<YearToDateSalesDto>, String> {
    eprintln!("[get_year_to_date_sales command] Received shop_id: {:?}", shop_id);
    let service = AnalyticsService::new(pool.inner().clone());
    service.get_year_to_date_sales(Some(shop_id)).await
}
