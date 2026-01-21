use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DashboardStatsDto {
    pub total_items: f64,
    pub low_stock_items: i64,
    pub total_inventory_value: f64,
    pub total_items_growth: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DailyMovementStatDto {
    pub date: String,
    pub stock_in: f64,
    pub stock_out: f64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StockMovementsFilterDto {
    pub time_range: String,
}

// Area Chart DTOs
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CumulativeRevenueDto {
    pub date: String,
    pub cumulative_revenue: f64,
    pub total_revenue: f64,
    pub daily_revenue: f64,
    pub daily_refunds: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StockMovementsAreaDto {
    pub date: String,
    pub cumulative_stock_in: f64,
    pub cumulative_stock_out: f64,
    pub daily_stock_in: f64,
    pub daily_stock_out: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RevenueByPaymentMethodDto {
    pub date: String,
    pub payment_method: String,
    pub daily_amount: f64,
    pub cumulative_amount_by_method: f64,
}

// Bar Chart DTOs
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TopProductDto {
    pub product_id: String,
    pub product_name: String,
    pub total_quantity: f64,
    pub total_revenue: f64,
    pub order_count: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RevenueByCategoryDto {
    pub category_name: String,
    pub total_revenue: f64,
    pub product_count: i64,
    pub order_count: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MonthlySalesDto {
    pub month: String,
    pub monthly_revenue: f64,
    pub order_count: i64,
    pub avg_order_value: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StockStatusDto {
    pub stock_status: String,
    pub product_count: i64,
    pub total_quantity: f64,
}

// Line Chart DTOs
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DailySalesTrendDto {
    pub date: String,
    pub daily_orders: i64,
    pub daily_revenue: f64,
    pub moving_avg_7d_revenue: Option<f64>,
    pub moving_avg_7d_orders: Option<f64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CustomerGrowthDto {
    pub month: String,
    pub new_customers: i64,
    pub cumulative_customers: i64,
    pub previous_month: Option<i64>,
    pub growth_percentage: Option<f64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AverageOrderValueDto {
    pub month: String,
    pub order_count: i64,
    pub avg_order_value: f64,
    pub previous_avg: Option<f64>,
    pub avg_change_percentage: Option<f64>,
}

// Pie Chart DTOs
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaymentMethodDistributionDto {
    pub payment_method: String,
    pub total_amount: f64,
    pub transaction_count: i64,
    pub percentage: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CategoryDistributionDto {
    pub category_name: String,
    pub product_count: i64,
    pub percentage: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderStatusDistributionDto {
    pub payment_status: String,
    pub order_count: i64,
    pub total_revenue: f64,
    pub order_percentage: f64,
    pub revenue_percentage: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CustomerGroupDistributionDto {
    pub group_name: String,
    pub customer_count: i64,
    pub percentage: f64,
}

// Radar Chart DTOs
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MonthlyPerformanceMetricsDto {
    pub month: String,
    pub normalized_orders: f64,
    pub normalized_revenue: f64,
    pub normalized_customers: f64,
    pub normalized_stock_sold: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProductMetricsDto {
    pub product_name: String,
    pub normalized_quantity: f64,
    pub normalized_revenue: f64,
    pub normalized_margin: f64,
    pub normalized_stock: f64,
}

// Radial Chart DTOs
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MonthlySalesProgressDto {
    pub current_revenue: f64,
    pub target_revenue: f64,
    pub progress_percentage: f64,
    pub remaining: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConversionRateDto {
    pub total_checkouts: i64,
    pub completed_orders: i64,
    pub conversion_rate: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InventoryCapacityDto {
    pub current_stock: f64,
    pub capacity_limit: f64,
    pub usage_percentage: f64,
}

// Advanced Queries DTOs
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProductRankingDto {
    pub product_name: String,
    pub total_revenue: f64,
    pub revenue_rank: i64,
    pub revenue_percentile: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MonthOverMonthGrowthDto {
    pub month: String,
    pub monthly_revenue: f64,
    pub previous_month_revenue: Option<f64>,
    pub mom_growth_percentage: Option<f64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct YearToDateSalesDto {
    pub month: String,
    pub monthly_revenue: f64,
    pub ytd_revenue: f64,
    pub monthly_orders: i64,
    pub ytd_orders: i64,
}

// Filter DTOs
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DateRangeFilterDto {
    pub days: Option<i64>,
    pub months: Option<i64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MonthlySalesProgressFilterDto {
    pub target_revenue: Option<f64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InventoryCapacityFilterDto {
    pub capacity_limit: Option<f64>,
}
