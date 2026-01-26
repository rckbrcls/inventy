use chrono::{DateTime, Duration, Utc};
use sqlx::SqlitePool;

use crate::features::analytics::dtos::analytics_dto::*;
use crate::features::analytics::repositories::analytics_repository::*;
use crate::features::shop::services::shop_service::ShopService;

const LOW_STOCK_THRESHOLD: f64 = 5.0;

enum TimeBucket {
    Minute,
    Day,
}

impl TimeBucket {
    fn sqlite_format(&self) -> &'static str {
        match self {
            TimeBucket::Minute => "%Y-%m-%d %H:%M:00",
            TimeBucket::Day => "%Y-%m-%d",
        }
    }
}

struct ParsedTimeRange {
    start_at: Option<DateTime<Utc>>,
    bucket: TimeBucket,
}

pub struct AnalyticsService {
    repo: AnalyticsRepository,
    shop_service: ShopService,
}

impl AnalyticsService {
    /// registry_pool: for shop metadata (features_config). shop_pool: for analytics queries.
    pub fn new(registry_pool: SqlitePool, shop_pool: SqlitePool) -> Self {
        Self {
            repo: AnalyticsRepository::new(shop_pool),
            shop_service: ShopService::new(registry_pool),
        }
    }

    async fn get_features_config(&self, shop_id: Option<String>) -> Option<String> {
        if let Some(shop_id) = shop_id {
            if let Ok(Some(shop)) = self.shop_service.get_shop(&shop_id).await {
                return shop.features_config;
            }
        }

        None
    }

    async fn get_or_resolve_shop_id(&self, shop_id: Option<String>) -> Result<String, String> {
        if let Some(shop_id) = shop_id {
            eprintln!("[get_or_resolve_shop_id] Shop ID provided: {}", shop_id);
            return Ok(shop_id);
        }

        eprintln!("[get_or_resolve_shop_id] ERROR: No shop_id provided");
        Err("No shop_id provided".to_string())
    }

    pub async fn get_dashboard_stats(
        &self,
        shop_id: Option<String>,
    ) -> Result<DashboardStatsDto, String> {
        let shop_id = self.get_or_resolve_shop_id(shop_id).await?;
        let features_config = self.get_features_config(Some(shop_id.clone())).await;
        let features_config_str = features_config.as_deref();

        let stats = self
            .repo
            .get_dashboard_stats(features_config_str, LOW_STOCK_THRESHOLD)
            .await
            .map_err(|e| format!("Failed to fetch dashboard stats: {}", e))?;

        Ok(Self::to_dashboard_stats(stats))
    }

    pub async fn get_stock_movements(
        &self,
        shop_id: Option<String>,
        payload: StockMovementsFilterDto,
    ) -> Result<Vec<DailyMovementStatDto>, String> {
        let shop_id = self.get_or_resolve_shop_id(shop_id).await?;
        let features_config = self.get_features_config(Some(shop_id)).await;
        let features_config_str = features_config.as_deref();

        let parsed = parse_time_range(&payload.time_range)?;
        let bucket_format = parsed.bucket.sqlite_format();
        let start_at = parsed.start_at.map(format_sqlite_datetime);

        let rows = self
            .repo
            .get_stock_movements(features_config_str, bucket_format, start_at)
            .await
            .map_err(|e| format!("Failed to fetch stock movements: {}", e))?;

        Ok(rows.into_iter().map(Self::to_movement_stat).collect())
    }

    fn to_dashboard_stats(stats: DashboardStatsRow) -> DashboardStatsDto {
        DashboardStatsDto {
            total_items: stats.total_items,
            low_stock_items: stats.low_stock_items,
            total_inventory_value: stats.total_inventory_value,
            total_items_growth: 0.0,
        }
    }

    fn to_movement_stat(row: StockMovementRow) -> DailyMovementStatDto {
        DailyMovementStatDto {
            date: row.bucket,
            stock_in: row.stock_in,
            stock_out: row.stock_out,
        }
    }

    // ============================================================
    // Area Chart Methods
    // ============================================================

    /// Query 1: Receita Acumulada por Dia (com Múltiplas Séries: Vendas vs Devoluções)
    pub async fn get_cumulative_revenue(
        &self,
        shop_id: Option<String>,
        days: Option<i64>,
    ) -> Result<Vec<CumulativeRevenueDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let days = days.unwrap_or(90);

        let rows = self
            .repo
            .get_cumulative_revenue(days)
            .await
            .map_err(|e| format!("Failed to fetch cumulative revenue: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| CumulativeRevenueDto {
                date: row.date,
                cumulative_revenue: row.cumulative_revenue,
                total_revenue: row.total_revenue,
                daily_revenue: row.daily_revenue,
                daily_refunds: row.daily_refunds,
            })
            .collect())
    }

    /// Query 2: Vendas e Estoque Movimentado ao Longo do Tempo (Stacked Area)
    pub async fn get_stock_movements_area(
        &self,
        shop_id: Option<String>,
        days: Option<i64>,
    ) -> Result<Vec<StockMovementsAreaDto>, String> {
        let shop_id = self.get_or_resolve_shop_id(shop_id).await?;
        let features_config = self.get_features_config(Some(shop_id)).await;
        let features_config_str = features_config.as_deref();
        let days = days.unwrap_or(90);
        let rows = self
            .repo
            .get_stock_movements_area(features_config_str, days)
            .await
            .map_err(|e| format!("Failed to fetch stock movements area: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| StockMovementsAreaDto {
                date: row.date,
                cumulative_stock_in: row.cumulative_stock_in,
                cumulative_stock_out: row.cumulative_stock_out,
                daily_stock_in: row.daily_stock_in,
                daily_stock_out: row.daily_stock_out,
            })
            .collect())
    }

    /// Query 3: Receita por Método de Pagamento ao Longo do Tempo
    pub async fn get_revenue_by_payment_method(
        &self,
        shop_id: Option<String>,
        days: Option<i64>,
    ) -> Result<Vec<RevenueByPaymentMethodDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let days = days.unwrap_or(90);
        let rows = self
            .repo
            .get_revenue_by_payment_method(days)
            .await
            .map_err(|e| format!("Failed to fetch revenue by payment method: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| RevenueByPaymentMethodDto {
                date: row.date,
                payment_method: row.payment_method,
                daily_amount: row.daily_amount,
                cumulative_amount_by_method: row.cumulative_amount_by_method,
            })
            .collect())
    }

    // ============================================================
    // Bar Chart Methods
    // ============================================================

    /// Query 4: Top 10 Produtos Mais Vendidos (por Quantidade)
    pub async fn get_top_products(
        &self,
        shop_id: Option<String>,
        days: Option<i64>,
        limit: Option<i64>,
    ) -> Result<Vec<TopProductDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let days = days.unwrap_or(30);
        let limit = limit.unwrap_or(10);

        let rows = self
            .repo
            .get_top_products(days, limit)
            .await
            .map_err(|e| format!("Failed to fetch top products: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| TopProductDto {
                product_id: row.product_id,
                product_name: row.product_name,
                total_quantity: row.total_quantity,
                total_revenue: row.total_revenue,
                order_count: row.order_count,
            })
            .collect())
    }

    /// Query 5: Receita por Categoria
    pub async fn get_revenue_by_category(
        &self,
        shop_id: Option<String>,
    ) -> Result<Vec<RevenueByCategoryDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;

        let rows = self
            .repo
            .get_revenue_by_category()
            .await
            .map_err(|e| format!("Failed to fetch revenue by category: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| RevenueByCategoryDto {
                category_name: row.category_name,
                total_revenue: row.total_revenue,
                product_count: row.product_count,
                order_count: row.order_count,
            })
            .collect())
    }

    /// Query 6: Vendas Mensais (Últimos 12 Meses)
    pub async fn get_monthly_sales(
        &self,
        shop_id: Option<String>,
        months: Option<i64>,
    ) -> Result<Vec<MonthlySalesDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let months = months.unwrap_or(12);

        let rows = self
            .repo
            .get_monthly_sales(months)
            .await
            .map_err(|e| format!("Failed to fetch monthly sales: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| MonthlySalesDto {
                month: row.month,
                monthly_revenue: row.monthly_revenue,
                order_count: row.order_count,
                avg_order_value: row.avg_order_value,
            })
            .collect())
    }

    /// Query 7: Produtos por Status de Estoque (Baixo, Médio, Alto)
    pub async fn get_stock_status(
        &self,
        shop_id: Option<String>,
    ) -> Result<Vec<StockStatusDto>, String> {
        let shop_id = self.get_or_resolve_shop_id(shop_id).await?;
        let features_config = self.get_features_config(Some(shop_id)).await;
        let features_config_str = features_config.as_deref();
        let rows = self
            .repo
            .get_stock_status(features_config_str)
            .await
            .map_err(|e| format!("Failed to fetch stock status: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| StockStatusDto {
                stock_status: row.stock_status,
                product_count: row.product_count,
                total_quantity: row.total_quantity,
            })
            .collect())
    }

    // ============================================================
    // Line Chart Methods
    // ============================================================

    /// Query 8: Tendência de Vendas Diárias (com Média Móvel de 7 dias)
    pub async fn get_daily_sales_trend(
        &self,
        shop_id: Option<String>,
        days: Option<i64>,
    ) -> Result<Vec<DailySalesTrendDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let days = days.unwrap_or(90);
        let rows = self
            .repo
            .get_daily_sales_trend(days)
            .await
            .map_err(|e| format!("Failed to fetch daily sales trend: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| DailySalesTrendDto {
                date: row.date,
                daily_orders: row.daily_orders,
                daily_revenue: row.daily_revenue,
                moving_avg_7d_revenue: row.moving_avg_7d_revenue,
                moving_avg_7d_orders: row.moving_avg_7d_orders,
            })
            .collect())
    }

    /// Query 9: Crescimento de Clientes ao Longo do Tempo
    pub async fn get_customer_growth(
        &self,
        shop_id: Option<String>,
        months: Option<i64>,
    ) -> Result<Vec<CustomerGrowthDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let months = months.unwrap_or(24);
        let rows = self
            .repo
            .get_customer_growth(months)
            .await
            .map_err(|e| format!("Failed to fetch customer growth: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| CustomerGrowthDto {
                month: row.month,
                new_customers: row.new_customers,
                cumulative_customers: row.cumulative_customers,
                previous_month: row.previous_month,
                growth_percentage: row.growth_percentage,
            })
            .collect())
    }

    /// Query 10: Ticket Médio ao Longo do Tempo
    pub async fn get_average_order_value(
        &self,
        shop_id: Option<String>,
        months: Option<i64>,
    ) -> Result<Vec<AverageOrderValueDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let months = months.unwrap_or(12);
        let rows = self
            .repo
            .get_average_order_value(months)
            .await
            .map_err(|e| format!("Failed to fetch average order value: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| AverageOrderValueDto {
                month: row.month,
                order_count: row.order_count,
                avg_order_value: row.avg_order_value,
                previous_avg: row.previous_avg,
                avg_change_percentage: row.avg_change_percentage,
            })
            .collect())
    }

    // ============================================================
    // Pie Chart Methods
    // ============================================================

    /// Query 11: Distribuição de Vendas por Método de Pagamento
    pub async fn get_payment_method_distribution(
        &self,
        shop_id: Option<String>,
        days: Option<i64>,
    ) -> Result<Vec<PaymentMethodDistributionDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let days = days.unwrap_or(30);
        let rows = self
            .repo
            .get_payment_method_distribution(days)
            .await
            .map_err(|e| format!("Failed to fetch payment method distribution: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| PaymentMethodDistributionDto {
                payment_method: row.payment_method,
                total_amount: row.total_amount,
                transaction_count: row.transaction_count,
                percentage: row.percentage,
            })
            .collect())
    }

    /// Query 12: Distribuição de Produtos por Categoria
    pub async fn get_category_distribution(
        &self,
        shop_id: Option<String>,
    ) -> Result<Vec<CategoryDistributionDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let rows = self
            .repo
            .get_category_distribution()
            .await
            .map_err(|e| format!("Failed to fetch category distribution: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| CategoryDistributionDto {
                category_name: row.category_name,
                product_count: row.product_count,
                percentage: row.percentage,
            })
            .collect())
    }

    /// Query 13: Distribuição de Pedidos por Status
    pub async fn get_order_status_distribution(
        &self,
        shop_id: Option<String>,
        days: Option<i64>,
    ) -> Result<Vec<OrderStatusDistributionDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let days = days.unwrap_or(30);
        let rows = self
            .repo
            .get_order_status_distribution(days)
            .await
            .map_err(|e| format!("Failed to fetch order status distribution: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| OrderStatusDistributionDto {
                payment_status: row.payment_status,
                order_count: row.order_count,
                total_revenue: row.total_revenue,
                order_percentage: row.order_percentage,
                revenue_percentage: row.revenue_percentage,
            })
            .collect())
    }

    /// Query 14: Distribuição de Clientes por Grupo
    pub async fn get_customer_group_distribution(
        &self,
        shop_id: Option<String>,
    ) -> Result<Vec<CustomerGroupDistributionDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let rows = self
            .repo
            .get_customer_group_distribution()
            .await
            .map_err(|e| format!("Failed to fetch customer group distribution: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| CustomerGroupDistributionDto {
                group_name: row.group_name,
                customer_count: row.customer_count,
                percentage: row.percentage,
            })
            .collect())
    }

    // ============================================================
    // Radar Chart Methods
    // ============================================================

    /// Query 15: Métricas de Performance por Mês (Vendas, Receita, Clientes, Estoque)
    pub async fn get_monthly_performance_metrics(
        &self,
        shop_id: Option<String>,
        months: Option<i64>,
    ) -> Result<Vec<MonthlyPerformanceMetricsDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let months = months.unwrap_or(12);
        let rows = self
            .repo
            .get_monthly_performance_metrics(months)
            .await
            .map_err(|e| format!("Failed to fetch monthly performance metrics: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| MonthlyPerformanceMetricsDto {
                month: row.month,
                normalized_orders: row.normalized_orders,
                normalized_revenue: row.normalized_revenue,
                normalized_customers: row.normalized_customers,
                normalized_stock_sold: row.normalized_stock_sold,
            })
            .collect())
    }

    /// Query 16: Métricas por Produto (Vendas, Receita, Margem, Estoque)
    pub async fn get_product_metrics(
        &self,
        shop_id: Option<String>,
        days: Option<i64>,
        limit: Option<i64>,
    ) -> Result<Vec<ProductMetricsDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let days = days.unwrap_or(30);
        let limit = limit.unwrap_or(10);
        let rows = self
            .repo
            .get_product_metrics(days, limit)
            .await
            .map_err(|e| format!("Failed to fetch product metrics: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| ProductMetricsDto {
                product_name: row.product_name,
                normalized_quantity: row.normalized_quantity,
                normalized_revenue: row.normalized_revenue,
                normalized_margin: row.normalized_margin,
                normalized_stock: row.normalized_stock,
            })
            .collect())
    }

    // ============================================================
    // Radial Chart Methods
    // ============================================================

    /// Query 17: Progresso de Meta de Vendas Mensal
    pub async fn get_monthly_sales_progress(
        &self,
        shop_id: Option<String>,
        target_revenue: Option<f64>,
    ) -> Result<MonthlySalesProgressDto, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let target_revenue = target_revenue.unwrap_or(100000.0);
        let row = self
            .repo
            .get_monthly_sales_progress(target_revenue)
            .await
            .map_err(|e| format!("Failed to fetch monthly sales progress: {}", e))?;

        Ok(MonthlySalesProgressDto {
            current_revenue: row.current_revenue,
            target_revenue: row.target_revenue,
            progress_percentage: row.progress_percentage,
            remaining: row.remaining,
        })
    }

    /// Query 18: Taxa de Conversão de Carrinhos para Pedidos
    pub async fn get_conversion_rate(
        &self,
        shop_id: Option<String>,
        days: Option<i64>,
    ) -> Result<ConversionRateDto, String> {
        let shop_id = self.get_or_resolve_shop_id(shop_id).await?;
        let features_config = self.get_features_config(Some(shop_id)).await;
        let features_config_str = features_config.as_deref();
        let days = days.unwrap_or(30);
        let row = self
            .repo
            .get_conversion_rate(features_config_str, days)
            .await
            .map_err(|e| format!("Failed to fetch conversion rate: {}", e))?;

        Ok(ConversionRateDto {
            total_checkouts: row.total_checkouts,
            completed_orders: row.completed_orders,
            conversion_rate: row.conversion_rate,
        })
    }

    /// Query 19: Percentual de Estoque Ocupado (Capacidade)
    pub async fn get_inventory_capacity(
        &self,
        shop_id: Option<String>,
        capacity_limit: Option<f64>,
    ) -> Result<InventoryCapacityDto, String> {
        let shop_id = self.get_or_resolve_shop_id(shop_id).await?;
        let features_config = self.get_features_config(Some(shop_id)).await;
        let features_config_str = features_config.as_deref();
        let capacity_limit = capacity_limit.unwrap_or(10000.0);
        let row = self
            .repo
            .get_inventory_capacity(features_config_str, capacity_limit)
            .await
            .map_err(|e| format!("Failed to fetch inventory capacity: {}", e))?;

        Ok(InventoryCapacityDto {
            current_stock: row.current_stock,
            capacity_limit: row.capacity_limit,
            usage_percentage: row.usage_percentage,
        })
    }

    // ============================================================
    // Advanced Queries Methods
    // ============================================================

    /// Query 20: Ranking de Produtos com Percentil
    pub async fn get_product_ranking(
        &self,
        shop_id: Option<String>,
        days: Option<i64>,
        limit: Option<i64>,
    ) -> Result<Vec<ProductRankingDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let days = days.unwrap_or(30);
        let limit = limit.unwrap_or(20);
        let rows = self
            .repo
            .get_product_ranking(days, limit)
            .await
            .map_err(|e| format!("Failed to fetch product ranking: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| ProductRankingDto {
                product_name: row.product_name,
                total_revenue: row.total_revenue,
                revenue_rank: row.revenue_rank,
                revenue_percentile: row.revenue_percentile,
            })
            .collect())
    }

    /// Query 21: Comparação Mês a Mês (MoM - Month over Month)
    pub async fn get_month_over_month_growth(
        &self,
        shop_id: Option<String>,
        months: Option<i64>,
    ) -> Result<Vec<MonthOverMonthGrowthDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let months = months.unwrap_or(12);
        let rows = self
            .repo
            .get_month_over_month_growth(months)
            .await
            .map_err(|e| format!("Failed to fetch month over month growth: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| MonthOverMonthGrowthDto {
                month: row.month,
                monthly_revenue: row.monthly_revenue,
                previous_month_revenue: row.previous_month_revenue,
                mom_growth_percentage: row.mom_growth_percentage,
            })
            .collect())
    }

    /// Query 22: Vendas Acumuladas por Período (YTD - Year to Date)
    pub async fn get_year_to_date_sales(
        &self,
        shop_id: Option<String>,
    ) -> Result<Vec<YearToDateSalesDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let rows = self
            .repo
            .get_year_to_date_sales()
            .await
            .map_err(|e| format!("Failed to fetch year to date sales: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| YearToDateSalesDto {
                month: row.month,
                monthly_revenue: row.monthly_revenue,
                ytd_revenue: row.ytd_revenue,
                monthly_orders: row.monthly_orders,
                ytd_orders: row.ytd_orders,
            })
            .collect())
    }

    // ============================================================
    // Product Review Analytics Methods (using product_metrics table)
    // ============================================================

    /// Query 23: Top Produtos por Avaliação Média
    pub async fn get_top_rated_products(
        &self,
        shop_id: Option<String>,
        limit: Option<i64>,
        min_reviews: Option<i64>,
    ) -> Result<Vec<TopRatedProductDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let limit = limit.unwrap_or(10);
        let min_reviews = min_reviews.unwrap_or(1);

        let rows = self
            .repo
            .get_top_rated_products(limit, min_reviews)
            .await
            .map_err(|e| format!("Failed to fetch top rated products: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| TopRatedProductDto {
                product_id: row.product_id,
                product_name: row.product_name,
                average_rating: row.average_rating,
                review_count: row.review_count,
                rating_rank: row.rating_rank,
            })
            .collect())
    }

    /// Query 24: Analytics de Reviews por Produto
    pub async fn get_product_review_analytics(
        &self,
        shop_id: Option<String>,
        limit: Option<i64>,
    ) -> Result<Vec<ProductReviewAnalyticsDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;
        let limit = limit.unwrap_or(20);

        let rows = self
            .repo
            .get_product_review_analytics(limit)
            .await
            .map_err(|e| format!("Failed to fetch product review analytics: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| ProductReviewAnalyticsDto {
                product_id: row.product_id,
                product_name: row.product_name,
                average_rating: row.average_rating,
                review_count: row.review_count,
                rating_distribution: row.rating_distribution,
            })
            .collect())
    }

    /// Query 25: Resumo Geral de Reviews da Loja
    pub async fn get_review_stats_summary(
        &self,
        shop_id: Option<String>,
    ) -> Result<ReviewStatsSummaryDto, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;

        let row = self
            .repo
            .get_review_stats_summary()
            .await
            .map_err(|e| format!("Failed to fetch review stats summary: {}", e))?;

        Ok(ReviewStatsSummaryDto {
            total_reviews: row.total_reviews,
            average_rating: row.average_rating,
            products_with_reviews: row.products_with_reviews,
            five_star_count: row.five_star_count,
            four_star_count: row.four_star_count,
            three_star_count: row.three_star_count,
            two_star_count: row.two_star_count,
            one_star_count: row.one_star_count,
        })
    }

    /// Query 26: Distribuição de Ratings
    pub async fn get_rating_distribution(
        &self,
        shop_id: Option<String>,
    ) -> Result<Vec<RatingDistributionDto>, String> {
        let _ = self.get_or_resolve_shop_id(shop_id).await?;

        let rows = self
            .repo
            .get_rating_distribution()
            .await
            .map_err(|e| format!("Failed to fetch rating distribution: {}", e))?;

        Ok(rows
            .into_iter()
            .map(|row| RatingDistributionDto {
                rating: row.rating,
                count: row.count,
                percentage: row.percentage,
            })
            .collect())
    }
}

fn parse_time_range(value: &str) -> Result<ParsedTimeRange, String> {
    let now = Utc::now();
    let parsed = match value {
        "30m" => ParsedTimeRange {
            start_at: Some(now - Duration::minutes(30)),
            bucket: TimeBucket::Minute,
        },
        "1h" => ParsedTimeRange {
            start_at: Some(now - Duration::hours(1)),
            bucket: TimeBucket::Minute,
        },
        "2h" => ParsedTimeRange {
            start_at: Some(now - Duration::hours(2)),
            bucket: TimeBucket::Minute,
        },
        "7d" => ParsedTimeRange {
            start_at: Some(now - Duration::days(7)),
            bucket: TimeBucket::Day,
        },
        "30d" => ParsedTimeRange {
            start_at: Some(now - Duration::days(30)),
            bucket: TimeBucket::Day,
        },
        "90d" => ParsedTimeRange {
            start_at: Some(now - Duration::days(90)),
            bucket: TimeBucket::Day,
        },
        "1y" => ParsedTimeRange {
            start_at: Some(now - Duration::days(365)),
            bucket: TimeBucket::Day,
        },
        "all" => ParsedTimeRange {
            start_at: None,
            bucket: TimeBucket::Day,
        },
        _ => {
            return Err("Invalid time range value".to_string());
        }
    };

    Ok(parsed)
}

fn format_sqlite_datetime(value: DateTime<Utc>) -> String {
    value.format("%Y-%m-%d %H:%M:%S").to_string()
}
