use std::sync::Arc;
use tauri::State;

use crate::db::RepositoryFactory;
use crate::features::analytics::dtos::analytics_dto::*;
use crate::features::analytics::services::analytics_service::AnalyticsService;

async fn analytics_service(
    repo_factory: &RepositoryFactory,
    shop_id: &str,
) -> Result<AnalyticsService, String> {
    let registry = repo_factory.registry_pool().clone();
    let shop_pool = repo_factory
        .shop_pool(shop_id)
        .await
        .map_err(|e| format!("Failed to get shop pool: {}", e))?;
    Ok(AnalyticsService::new(registry, (*shop_pool).clone()))
}

#[tauri::command]
pub async fn get_dashboard_stats(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<DashboardStatsDto, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_dashboard_stats(Some(shop_id)).await
}

#[tauri::command]
pub async fn get_stock_movements(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    payload: StockMovementsFilterDto,
) -> Result<Vec<DailyMovementStatDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_stock_movements(Some(shop_id), payload).await
}

#[tauri::command]
pub async fn get_cumulative_revenue(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    days: Option<i64>,
) -> Result<Vec<CumulativeRevenueDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_cumulative_revenue(Some(shop_id), days).await
}

#[tauri::command]
pub async fn get_stock_movements_area(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    days: Option<i64>,
) -> Result<Vec<StockMovementsAreaDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_stock_movements_area(Some(shop_id), days).await
}

#[tauri::command]
pub async fn get_revenue_by_payment_method(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    days: Option<i64>,
) -> Result<Vec<RevenueByPaymentMethodDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_revenue_by_payment_method(Some(shop_id), days).await
}

#[tauri::command]
pub async fn get_top_products(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    days: Option<i64>,
    limit: Option<i64>,
) -> Result<Vec<TopProductDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_top_products(Some(shop_id), days, limit).await
}

#[tauri::command]
pub async fn get_revenue_by_category(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<RevenueByCategoryDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_revenue_by_category(Some(shop_id)).await
}

#[tauri::command]
pub async fn get_monthly_sales(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    months: Option<i64>,
) -> Result<Vec<MonthlySalesDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_monthly_sales(Some(shop_id), months).await
}

#[tauri::command]
pub async fn get_stock_status(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<StockStatusDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_stock_status(Some(shop_id)).await
}

#[tauri::command]
pub async fn get_payment_method_distribution(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    days: Option<i64>,
) -> Result<Vec<PaymentMethodDistributionDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_payment_method_distribution(Some(shop_id), days).await
}

#[tauri::command]
pub async fn get_category_distribution(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<CategoryDistributionDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_category_distribution(Some(shop_id)).await
}

#[tauri::command]
pub async fn get_order_status_distribution(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    days: Option<i64>,
) -> Result<Vec<OrderStatusDistributionDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_order_status_distribution(Some(shop_id), days).await
}

#[tauri::command]
pub async fn get_customer_group_distribution(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<CustomerGroupDistributionDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_customer_group_distribution(Some(shop_id)).await
}

#[tauri::command]
pub async fn get_daily_sales_trend(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    days: Option<i64>,
) -> Result<Vec<DailySalesTrendDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_daily_sales_trend(Some(shop_id), days).await
}

#[tauri::command]
pub async fn get_customer_growth(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    months: Option<i64>,
) -> Result<Vec<CustomerGrowthDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_customer_growth(Some(shop_id), months).await
}

#[tauri::command]
pub async fn get_average_order_value(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    months: Option<i64>,
) -> Result<Vec<AverageOrderValueDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_average_order_value(Some(shop_id), months).await
}

#[tauri::command]
pub async fn get_monthly_performance_metrics(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    months: Option<i64>,
) -> Result<Vec<MonthlyPerformanceMetricsDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_monthly_performance_metrics(Some(shop_id), months).await
}

#[tauri::command]
pub async fn get_product_metrics(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    days: Option<i64>,
    limit: Option<i64>,
) -> Result<Vec<ProductMetricsDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_product_metrics(Some(shop_id), days, limit).await
}

#[tauri::command]
pub async fn get_monthly_sales_progress(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    target_revenue: Option<f64>,
) -> Result<MonthlySalesProgressDto, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_monthly_sales_progress(Some(shop_id), target_revenue).await
}

#[tauri::command]
pub async fn get_conversion_rate(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    days: Option<i64>,
) -> Result<ConversionRateDto, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_conversion_rate(Some(shop_id), days).await
}

#[tauri::command]
pub async fn get_inventory_capacity(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    capacity_limit: Option<f64>,
) -> Result<InventoryCapacityDto, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_inventory_capacity(Some(shop_id), capacity_limit).await
}

#[tauri::command]
pub async fn get_product_ranking(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    days: Option<i64>,
    limit: Option<i64>,
) -> Result<Vec<ProductRankingDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_product_ranking(Some(shop_id), days, limit).await
}

#[tauri::command]
pub async fn get_month_over_month_growth(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    months: Option<i64>,
) -> Result<Vec<MonthOverMonthGrowthDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_month_over_month_growth(Some(shop_id), months).await
}

#[tauri::command]
pub async fn get_year_to_date_sales(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<YearToDateSalesDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_year_to_date_sales(Some(shop_id)).await
}

#[tauri::command]
pub async fn get_top_rated_products(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    limit: Option<i64>,
    min_reviews: Option<i64>,
) -> Result<Vec<TopRatedProductDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_top_rated_products(Some(shop_id), limit, min_reviews).await
}

#[tauri::command]
pub async fn get_product_review_analytics(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
    limit: Option<i64>,
) -> Result<Vec<ProductReviewAnalyticsDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_product_review_analytics(Some(shop_id), limit).await
}

#[tauri::command]
pub async fn get_review_stats_summary(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<ReviewStatsSummaryDto, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_review_stats_summary(Some(shop_id)).await
}

#[tauri::command]
pub async fn get_rating_distribution(
    repo_factory: State<'_, Arc<RepositoryFactory>>,
    shop_id: String,
) -> Result<Vec<RatingDistributionDto>, String> {
    let service = analytics_service(repo_factory.inner(), &shop_id).await?;
    service.get_rating_distribution(Some(shop_id)).await
}
