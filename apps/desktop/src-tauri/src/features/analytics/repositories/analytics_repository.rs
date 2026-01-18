use sqlx::SqlitePool;
use crate::features::analytics::utils::module_checker;

#[derive(Debug, sqlx::FromRow)]
pub struct DashboardStatsRow {
    pub total_items: f64,
    pub low_stock_items: i64,
    pub total_inventory_value: f64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct StockMovementRow {
    pub bucket: String,
    pub stock_in: f64,
    pub stock_out: f64,
}

// Area Chart Rows
#[derive(Debug, sqlx::FromRow)]
pub struct CumulativeRevenueRow {
    pub date: String,
    pub cumulative_revenue: f64,
    pub total_revenue: f64,
    pub daily_revenue: f64,
    pub daily_refunds: f64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct StockMovementsAreaRow {
    pub date: String,
    pub cumulative_stock_in: f64,
    pub cumulative_stock_out: f64,
    pub daily_stock_in: f64,
    pub daily_stock_out: f64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct RevenueByPaymentMethodRow {
    pub date: String,
    pub payment_method: String,
    pub daily_amount: f64,
    pub cumulative_amount_by_method: f64,
}

// Bar Chart Rows
#[derive(Debug, sqlx::FromRow)]
pub struct TopProductRow {
    pub product_id: String,
    pub product_name: String,
    pub total_quantity: f64,
    pub total_revenue: f64,
    pub order_count: i64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct RevenueByCategoryRow {
    pub category_name: String,
    pub total_revenue: f64,
    pub product_count: i64,
    pub order_count: i64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct MonthlySalesRow {
    pub month: String,
    pub monthly_revenue: f64,
    pub order_count: i64,
    pub avg_order_value: f64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct StockStatusRow {
    pub stock_status: String,
    pub product_count: i64,
    pub total_quantity: f64,
}

// Line Chart Rows
#[derive(Debug, sqlx::FromRow)]
pub struct DailySalesTrendRow {
    pub date: String,
    pub daily_orders: i64,
    pub daily_revenue: f64,
    pub moving_avg_7d_revenue: Option<f64>,
    pub moving_avg_7d_orders: Option<f64>,
}

#[derive(Debug, sqlx::FromRow)]
pub struct CustomerGrowthRow {
    pub month: String,
    pub new_customers: i64,
    pub cumulative_customers: i64,
    pub previous_month: Option<i64>,
    pub growth_percentage: Option<f64>,
}

#[derive(Debug, sqlx::FromRow)]
pub struct AverageOrderValueRow {
    pub month: String,
    pub order_count: i64,
    pub avg_order_value: f64,
    pub previous_avg: Option<f64>,
    pub avg_change_percentage: Option<f64>,
}

// Pie Chart Rows
#[derive(Debug, sqlx::FromRow)]
pub struct PaymentMethodDistributionRow {
    pub payment_method: String,
    pub total_amount: f64,
    pub transaction_count: i64,
    pub percentage: f64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct CategoryDistributionRow {
    pub category_name: String,
    pub product_count: i64,
    pub percentage: f64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct OrderStatusDistributionRow {
    pub payment_status: String,
    pub order_count: i64,
    pub total_revenue: f64,
    pub order_percentage: f64,
    pub revenue_percentage: f64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct CustomerGroupDistributionRow {
    pub group_name: String,
    pub customer_count: i64,
    pub percentage: f64,
}

// Radar Chart Rows
#[derive(Debug, sqlx::FromRow)]
pub struct MonthlyPerformanceMetricsRow {
    pub month: String,
    pub normalized_orders: f64,
    pub normalized_revenue: f64,
    pub normalized_customers: f64,
    pub normalized_stock_sold: f64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct ProductMetricsRow {
    pub product_name: String,
    pub normalized_quantity: f64,
    pub normalized_revenue: f64,
    pub normalized_margin: f64,
    pub normalized_stock: f64,
}

// Radial Chart Rows
#[derive(Debug, sqlx::FromRow)]
pub struct MonthlySalesProgressRow {
    pub current_revenue: f64,
    pub target_revenue: f64,
    pub progress_percentage: f64,
    pub remaining: f64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct ConversionRateRow {
    pub total_checkouts: i64,
    pub completed_orders: i64,
    pub conversion_rate: f64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct InventoryCapacityRow {
    pub current_stock: f64,
    pub capacity_limit: f64,
    pub usage_percentage: f64,
}

// Advanced Queries Rows
#[derive(Debug, sqlx::FromRow)]
pub struct ProductRankingRow {
    pub product_name: String,
    pub total_revenue: f64,
    pub revenue_rank: i64,
    pub revenue_percentile: f64,
}

#[derive(Debug, sqlx::FromRow)]
pub struct MonthOverMonthGrowthRow {
    pub month: String,
    pub monthly_revenue: f64,
    pub previous_month_revenue: Option<f64>,
    pub mom_growth_percentage: Option<f64>,
}

#[derive(Debug, sqlx::FromRow)]
pub struct YearToDateSalesRow {
    pub month: String,
    pub monthly_revenue: f64,
    pub ytd_revenue: f64,
    pub monthly_orders: i64,
    pub ytd_orders: i64,
}

pub struct AnalyticsRepository {
    pool: SqlitePool,
}

impl AnalyticsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    fn check_module_required(&self, features_config: Option<&str>, module_code: &str) -> sqlx::Result<()> {
        if !module_checker::is_module_enabled_or_core(features_config, module_code) {
            return Err(sqlx::Error::Configuration(
                format!("Module '{}' is not enabled", module_code).into()
            ));
        }
        Ok(())
    }

    pub async fn get_dashboard_stats(
        &self,
        features_config: Option<&str>,
        low_stock_threshold: f64,
    ) -> sqlx::Result<DashboardStatsRow> {
        self.check_module_required(features_config, "inventory")?;
        let sql = r#"
            SELECT
                COALESCE(SUM(inventory_levels.quantity_on_hand), 0) AS total_items,
                COALESCE(SUM(CASE WHEN inventory_levels.quantity_on_hand <= $1 THEN 1 ELSE 0 END), 0) AS low_stock_items,
                COALESCE(SUM(inventory_levels.quantity_on_hand * COALESCE(products.cost_price, products.price, 0)), 0) AS total_inventory_value
            FROM inventory_levels
            LEFT JOIN products ON products.id = inventory_levels.product_id
            WHERE inventory_levels._status != 'deleted'
        "#;

        sqlx::query_as::<_, DashboardStatsRow>(sql)
            .bind(low_stock_threshold)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn get_stock_movements(
        &self,
        features_config: Option<&str>,
        bucket_format: &str,
        start_at: Option<String>,
    ) -> sqlx::Result<Vec<StockMovementRow>> {
        self.check_module_required(features_config, "inventory")?;
        let bucket_expr = format!("strftime('{}', created_at)", bucket_format);

        let sql = if start_at.is_some() {
            format!(
                r#"
                SELECT
                    {bucket_expr} AS bucket,
                    COALESCE(SUM(CASE WHEN type = 'in' THEN quantity ELSE 0 END), 0) AS stock_in,
                    COALESCE(SUM(CASE WHEN type = 'out' THEN quantity ELSE 0 END), 0) AS stock_out
                FROM inventory_movements
                WHERE _status != 'deleted' AND created_at >= $1
                GROUP BY bucket
                ORDER BY bucket ASC
                "#
            )
        } else {
            format!(
                r#"
                SELECT
                    {bucket_expr} AS bucket,
                    COALESCE(SUM(CASE WHEN type = 'in' THEN quantity ELSE 0 END), 0) AS stock_in,
                    COALESCE(SUM(CASE WHEN type = 'out' THEN quantity ELSE 0 END), 0) AS stock_out
                FROM inventory_movements
                WHERE _status != 'deleted'
                GROUP BY bucket
                ORDER BY bucket ASC
                "#
            )
        };

        let mut query = sqlx::query_as::<_, StockMovementRow>(&sql);
        if let Some(start_at) = start_at {
            query = query.bind(start_at);
        }

        query.fetch_all(&self.pool).await
    }

    // ============================================================
    // Area Chart Queries
    // ============================================================

    /// Query 1: Receita Acumulada por Dia (com Múltiplas Séries: Vendas vs Devoluções)
    pub async fn get_cumulative_revenue(&self, days: i64) -> sqlx::Result<Vec<CumulativeRevenueRow>> {
        let sql = r#"
            SELECT 
                DATE(created_at) AS date,
                SUM(SUM(CASE WHEN payment_status = 'paid' THEN total_price ELSE 0 END)) 
                    OVER (ORDER BY DATE(created_at)) AS cumulative_revenue,
                SUM(SUM(CASE WHEN payment_status = 'paid' THEN total_price ELSE 0 END)) 
                    OVER () AS total_revenue,
                SUM(CASE WHEN payment_status = 'paid' THEN total_price ELSE 0 END) AS daily_revenue,
                SUM(CASE WHEN status = 'cancelled' THEN total_price ELSE 0 END) AS daily_refunds
            FROM orders
            WHERE _status != 'deleted'
              AND created_at >= date('now', '-' || $1 || ' days')
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        "#;

        sqlx::query_as::<_, CumulativeRevenueRow>(sql)
            .bind(days)
            .fetch_all(&self.pool)
            .await
    }

    /// Query 2: Vendas e Estoque Movimentado ao Longo do Tempo (Stacked Area)
    pub async fn get_stock_movements_area(
        &self,
        features_config: Option<&str>,
        days: i64,
    ) -> sqlx::Result<Vec<StockMovementsAreaRow>> {
        self.check_module_required(features_config, "inventory")?;
        let sql = r#"
            SELECT 
                DATE(created_at) AS date,
                SUM(SUM(CASE WHEN type = 'in' THEN quantity ELSE 0 END)) 
                    OVER (ORDER BY DATE(created_at)) AS cumulative_stock_in,
                SUM(SUM(CASE WHEN type = 'out' THEN quantity ELSE 0 END)) 
                    OVER (ORDER BY DATE(created_at)) AS cumulative_stock_out,
                SUM(CASE WHEN type = 'in' THEN quantity ELSE 0 END) AS daily_stock_in,
                SUM(CASE WHEN type = 'out' THEN quantity ELSE 0 END) AS daily_stock_out
            FROM inventory_movements
            WHERE _status != 'deleted'
              AND created_at >= date('now', '-' || $1 || ' days')
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        "#;

        sqlx::query_as::<_, StockMovementsAreaRow>(sql)
            .bind(days)
            .fetch_all(&self.pool)
            .await
    }

    /// Query 3: Receita por Método de Pagamento ao Longo do Tempo
    pub async fn get_revenue_by_payment_method(&self, days: i64) -> sqlx::Result<Vec<RevenueByPaymentMethodRow>> {
        let sql = r#"
            SELECT 
                DATE(p.created_at) AS date,
                p.method AS payment_method,
                SUM(p.amount) AS daily_amount,
                SUM(SUM(p.amount)) OVER (
                    PARTITION BY p.method 
                    ORDER BY DATE(p.created_at)
                ) AS cumulative_amount_by_method
            FROM payments p
            INNER JOIN transactions t ON t.id = p.transaction_id
            WHERE p.status = 'captured'
              AND p._status != 'deleted'
              AND p.created_at >= date('now', '-' || $1 || ' days')
            GROUP BY DATE(p.created_at), p.method
            ORDER BY date ASC, payment_method
        "#;

        sqlx::query_as::<_, RevenueByPaymentMethodRow>(sql)
            .bind(days)
            .fetch_all(&self.pool)
            .await
    }

    // ============================================================
    // Bar Chart Queries
    // ============================================================

    /// Query 4: Top 10 Produtos Mais Vendidos (por Quantidade)
    pub async fn get_top_products(&self, days: i64, limit: i64) -> sqlx::Result<Vec<TopProductRow>> {
        let sql = r#"
            SELECT 
                ti.product_id,
                COALESCE(ti.name_snapshot, p.name) AS product_name,
                SUM(ti.quantity) AS total_quantity,
                SUM(ti.total_line) AS total_revenue,
                COUNT(DISTINCT t.id) AS order_count
            FROM transaction_items ti
            LEFT JOIN products p ON p.id = ti.product_id
            INNER JOIN transactions t ON t.id = ti.transaction_id
            WHERE t.type = 'sale'
              AND t.status = 'completed'
              AND t._status != 'deleted'
              AND t.created_at >= date('now', '-' || $1 || ' days')
            GROUP BY ti.product_id, COALESCE(ti.name_snapshot, p.name)
            ORDER BY total_quantity DESC
            LIMIT $2
        "#;

        sqlx::query_as::<_, TopProductRow>(sql)
            .bind(days)
            .bind(limit)
            .fetch_all(&self.pool)
            .await
    }

    /// Query 5: Receita por Categoria
    pub async fn get_revenue_by_category(&self) -> sqlx::Result<Vec<RevenueByCategoryRow>> {
        let sql = r#"
            SELECT 
                c.name AS category_name,
                SUM(ti.total_line) AS total_revenue,
                COUNT(DISTINCT ti.product_id) AS product_count,
                COUNT(DISTINCT t.id) AS order_count
            FROM transaction_items ti
            INNER JOIN transactions t ON t.id = ti.transaction_id
            INNER JOIN products p ON p.id = ti.product_id
            INNER JOIN product_categories pc ON pc.product_id = p.id
            INNER JOIN categories c ON c.id = pc.category_id
            WHERE t.type = 'sale'
              AND t.status = 'completed'
              AND t._status != 'deleted'
            GROUP BY c.id, c.name
            ORDER BY total_revenue DESC
        "#;

        sqlx::query_as::<_, RevenueByCategoryRow>(sql)
            .fetch_all(&self.pool)
            .await
    }

    /// Query 6: Vendas Mensais (Últimos 12 Meses)
    pub async fn get_monthly_sales(&self, months: i64) -> sqlx::Result<Vec<MonthlySalesRow>> {
        let sql = r#"
            SELECT 
                strftime('%Y-%m', created_at) AS month,
                SUM(total_price) AS monthly_revenue,
                COUNT(*) AS order_count,
                AVG(total_price) AS avg_order_value
            FROM orders
            WHERE payment_status = 'paid'
              AND _status != 'deleted'
              AND created_at >= date('now', '-' || $1 || ' months')
            GROUP BY strftime('%Y-%m', created_at)
            ORDER BY month ASC
        "#;

        sqlx::query_as::<_, MonthlySalesRow>(sql)
            .bind(months)
            .fetch_all(&self.pool)
            .await
    }

    /// Query 7: Produtos por Status de Estoque (Baixo, Médio, Alto)
    pub async fn get_stock_status(
        &self,
        features_config: Option<&str>,
    ) -> sqlx::Result<Vec<StockStatusRow>> {
        self.check_module_required(features_config, "inventory")?;
        let sql = r#"
            SELECT 
                CASE 
                    WHEN SUM(il.quantity_on_hand) = 0 THEN 'Out of Stock'
                    WHEN SUM(il.quantity_on_hand) < 10 THEN 'Low Stock'
                    WHEN SUM(il.quantity_on_hand) < 50 THEN 'Medium Stock'
                    ELSE 'High Stock'
                END AS stock_status,
                COUNT(DISTINCT il.product_id) AS product_count,
                SUM(il.quantity_on_hand) AS total_quantity
            FROM inventory_levels il
            INNER JOIN products p ON p.id = il.product_id
            WHERE il._status != 'deleted'
              AND il.stock_status = 'sellable'
            GROUP BY 
                CASE 
                    WHEN SUM(il.quantity_on_hand) = 0 THEN 'Out of Stock'
                    WHEN SUM(il.quantity_on_hand) < 10 THEN 'Low Stock'
                    WHEN SUM(il.quantity_on_hand) < 50 THEN 'Medium Stock'
                    ELSE 'High Stock'
                END
            ORDER BY 
                CASE stock_status
                    WHEN 'Out of Stock' THEN 1
                    WHEN 'Low Stock' THEN 2
                    WHEN 'Medium Stock' THEN 3
                    ELSE 4
                END
        "#;

        sqlx::query_as::<_, StockStatusRow>(sql)
            .fetch_all(&self.pool)
            .await
    }

    // ============================================================
    // Line Chart Queries
    // ============================================================

    /// Query 8: Tendência de Vendas Diárias (com Média Móvel de 7 dias)
    pub async fn get_daily_sales_trend(&self, days: i64) -> sqlx::Result<Vec<DailySalesTrendRow>> {
        let sql = r#"
            SELECT 
                DATE(created_at) AS date,
                COUNT(*) AS daily_orders,
                SUM(total_price) AS daily_revenue,
                AVG(SUM(total_price)) OVER (
                    ORDER BY DATE(created_at) 
                    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
                ) AS moving_avg_7d_revenue,
                AVG(COUNT(*)) OVER (
                    ORDER BY DATE(created_at) 
                    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
                ) AS moving_avg_7d_orders
            FROM orders
            WHERE payment_status = 'paid'
              AND _status != 'deleted'
              AND created_at >= date('now', '-' || $1 || ' days')
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        "#;

        sqlx::query_as::<_, DailySalesTrendRow>(sql)
            .bind(days)
            .fetch_all(&self.pool)
            .await
    }

    /// Query 9: Crescimento de Clientes ao Longo do Tempo
    pub async fn get_customer_growth(&self, months: i64) -> sqlx::Result<Vec<CustomerGrowthRow>> {
        let sql = r#"
            SELECT 
                strftime('%Y-%m', created_at) AS month,
                COUNT(*) AS new_customers,
                SUM(COUNT(*)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS cumulative_customers,
                LAG(COUNT(*)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS previous_month,
                ROUND(
                    (COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY strftime('%Y-%m', created_at))) * 100.0 
                    / NULLIF(LAG(COUNT(*)) OVER (ORDER BY strftime('%Y-%m', created_at)), 0),
                    2
                ) AS growth_percentage
            FROM customers
            WHERE _status != 'deleted'
              AND created_at >= date('now', '-' || $1 || ' months')
            GROUP BY strftime('%Y-%m', created_at)
            ORDER BY month ASC
        "#;

        sqlx::query_as::<_, CustomerGrowthRow>(sql)
            .bind(months)
            .fetch_all(&self.pool)
            .await
    }

    /// Query 10: Ticket Médio ao Longo do Tempo
    pub async fn get_average_order_value(&self, months: i64) -> sqlx::Result<Vec<AverageOrderValueRow>> {
        let sql = r#"
            SELECT 
                strftime('%Y-%m', created_at) AS month,
                COUNT(*) AS order_count,
                AVG(total_price) AS avg_order_value,
                LAG(AVG(total_price)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS previous_avg,
                ROUND(
                    (AVG(total_price) - LAG(AVG(total_price)) OVER (ORDER BY strftime('%Y-%m', created_at))) * 100.0
                    / NULLIF(LAG(AVG(total_price)) OVER (ORDER BY strftime('%Y-%m', created_at)), 0),
                    2
                ) AS avg_change_percentage
            FROM orders
            WHERE payment_status = 'paid'
              AND _status != 'deleted'
              AND created_at >= date('now', '-' || $1 || ' months')
            GROUP BY strftime('%Y-%m', created_at)
            ORDER BY month ASC
        "#;

        sqlx::query_as::<_, AverageOrderValueRow>(sql)
            .bind(months)
            .fetch_all(&self.pool)
            .await
    }

    // ============================================================
    // Pie Chart Queries
    // ============================================================

    /// Query 11: Distribuição de Vendas por Método de Pagamento
    pub async fn get_payment_method_distribution(&self, days: i64) -> sqlx::Result<Vec<PaymentMethodDistributionRow>> {
        let sql = r#"
            SELECT 
                p.method AS payment_method,
                SUM(p.amount) AS total_amount,
                COUNT(*) AS transaction_count,
                ROUND(
                    SUM(p.amount) * 100.0 / SUM(SUM(p.amount)) OVER (),
                    2
                ) AS percentage
            FROM payments p
            INNER JOIN transactions t ON t.id = p.transaction_id
            WHERE p.status = 'captured'
              AND p._status != 'deleted'
              AND p.created_at >= date('now', '-' || $1 || ' days')
            GROUP BY p.method
            ORDER BY total_amount DESC
        "#;

        sqlx::query_as::<_, PaymentMethodDistributionRow>(sql)
            .bind(days)
            .fetch_all(&self.pool)
            .await
    }

    /// Query 12: Distribuição de Produtos por Categoria
    pub async fn get_category_distribution(&self) -> sqlx::Result<Vec<CategoryDistributionRow>> {
        let sql = r#"
            SELECT 
                c.name AS category_name,
                COUNT(DISTINCT pc.product_id) AS product_count,
                ROUND(
                    COUNT(DISTINCT pc.product_id) * 100.0 / SUM(COUNT(DISTINCT pc.product_id)) OVER (),
                    2
                ) AS percentage
            FROM product_categories pc
            INNER JOIN categories c ON c.id = pc.category_id
            INNER JOIN products p ON p.id = pc.product_id
            WHERE p._status != 'deleted'
            GROUP BY c.id, c.name
            ORDER BY product_count DESC
        "#;

        sqlx::query_as::<_, CategoryDistributionRow>(sql)
            .fetch_all(&self.pool)
            .await
    }

    /// Query 13: Distribuição de Pedidos por Status
    pub async fn get_order_status_distribution(&self, days: i64) -> sqlx::Result<Vec<OrderStatusDistributionRow>> {
        let sql = r#"
            SELECT 
                payment_status,
                COUNT(*) AS order_count,
                SUM(total_price) AS total_revenue,
                ROUND(
                    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (),
                    2
                ) AS order_percentage,
                ROUND(
                    SUM(total_price) * 100.0 / SUM(SUM(total_price)) OVER (),
                    2
                ) AS revenue_percentage
            FROM orders
            WHERE _status != 'deleted'
              AND created_at >= date('now', '-' || $1 || ' days')
            GROUP BY payment_status
            ORDER BY order_count DESC
        "#;

        sqlx::query_as::<_, OrderStatusDistributionRow>(sql)
            .bind(days)
            .fetch_all(&self.pool)
            .await
    }

    /// Query 14: Distribuição de Clientes por Grupo
    pub async fn get_customer_group_distribution(&self) -> sqlx::Result<Vec<CustomerGroupDistributionRow>> {
        let sql = r#"
            SELECT 
                COALESCE(cg.name, 'Sem Grupo') AS group_name,
                COUNT(DISTINCT cgm.customer_id) AS customer_count,
                ROUND(
                    COUNT(DISTINCT cgm.customer_id) * 100.0 / 
                    NULLIF(SUM(COUNT(DISTINCT cgm.customer_id)) OVER (), 0),
                    2
                ) AS percentage
            FROM customer_group_memberships cgm
            INNER JOIN customer_groups cg ON cg.id = cgm.customer_group_id
            INNER JOIN customers c ON c.id = cgm.customer_id
            WHERE c._status != 'deleted'
            GROUP BY cg.id, COALESCE(cg.name, 'Sem Grupo')
            ORDER BY customer_count DESC
        "#;

        sqlx::query_as::<_, CustomerGroupDistributionRow>(sql)
            .fetch_all(&self.pool)
            .await
    }

    // ============================================================
    // Radar Chart Queries
    // ============================================================

    /// Query 15: Métricas de Performance por Mês (Vendas, Receita, Clientes, Estoque)
    pub async fn get_monthly_performance_metrics(&self, months: i64) -> sqlx::Result<Vec<MonthlyPerformanceMetricsRow>> {
        let sql = r#"
            WITH monthly_metrics AS (
                SELECT 
                    strftime('%Y-%m', o.created_at) AS month,
                    COUNT(DISTINCT o.id) AS orders,
                    SUM(o.total_price) AS revenue,
                    COUNT(DISTINCT o.customer_id) AS customers,
                    COALESCE((
                        SELECT SUM(im.quantity)
                        FROM transactions t
                        INNER JOIN inventory_movements im ON im.transaction_id = t.id
                        WHERE t.type = 'sale'
                          AND t.status = 'completed'
                          AND t._status != 'deleted'
                          AND strftime('%Y-%m', t.created_at) = strftime('%Y-%m', o.created_at)
                          AND im.type = 'out'
                    ), 0) AS stock_sold
                FROM orders o
                WHERE o._status != 'deleted'
                  AND o.created_at >= date('now', '-' || $1 || ' months')
                GROUP BY strftime('%Y-%m', o.created_at)
            ),
            normalized AS (
                SELECT 
                    month,
                    ROUND(
                        (orders * 100.0 / MAX(orders) OVER ()),
                        2
                    ) AS normalized_orders,
                    ROUND(
                        (revenue * 100.0 / MAX(revenue) OVER ()),
                        2
                    ) AS normalized_revenue,
                    ROUND(
                        (customers * 100.0 / MAX(customers) OVER ()),
                        2
                    ) AS normalized_customers,
                    ROUND(
                        (stock_sold * 100.0 / NULLIF(MAX(stock_sold) OVER (), 0)),
                        2
                    ) AS normalized_stock_sold
                FROM monthly_metrics
            )
            SELECT * FROM normalized ORDER BY month ASC
        "#;

        sqlx::query_as::<_, MonthlyPerformanceMetricsRow>(sql)
            .bind(months)
            .fetch_all(&self.pool)
            .await
    }

    /// Query 16: Métricas por Produto (Vendas, Receita, Margem, Estoque)
    pub async fn get_product_metrics(&self, days: i64, limit: i64) -> sqlx::Result<Vec<ProductMetricsRow>> {
        let sql = r#"
            WITH product_metrics AS (
                SELECT 
                    p.id,
                    COALESCE(ti.name_snapshot, p.name) AS product_name,
                    SUM(ti.quantity) AS total_quantity_sold,
                    SUM(ti.total_line) AS total_revenue,
                    SUM((ti.unit_price - COALESCE(ti.unit_cost, 0)) * ti.quantity) AS total_margin,
                    COALESCE(SUM(il.quantity_on_hand), 0) AS current_stock
                FROM products p
                LEFT JOIN transaction_items ti ON ti.product_id = p.id
                LEFT JOIN transactions t ON t.id = ti.transaction_id AND t.type = 'sale'
                LEFT JOIN inventory_levels il ON il.product_id = p.id AND il._status != 'deleted'
                WHERE p._status != 'deleted'
                  AND (t.created_at >= date('now', '-' || $1 || ' days') OR t.created_at IS NULL)
                GROUP BY p.id, COALESCE(ti.name_snapshot, p.name)
                HAVING total_quantity_sold > 0
                LIMIT $2
            )
            SELECT 
                product_name,
                ROUND(total_quantity_sold * 100.0 / MAX(total_quantity_sold) OVER (), 2) AS normalized_quantity,
                ROUND(total_revenue * 100.0 / MAX(total_revenue) OVER (), 2) AS normalized_revenue,
                ROUND(total_margin * 100.0 / NULLIF(MAX(total_margin) OVER (), 0), 2) AS normalized_margin,
                ROUND(current_stock * 100.0 / NULLIF(MAX(current_stock) OVER (), 0), 2) AS normalized_stock
            FROM product_metrics
            ORDER BY total_revenue DESC
        "#;

        sqlx::query_as::<_, ProductMetricsRow>(sql)
            .bind(days)
            .bind(limit)
            .fetch_all(&self.pool)
            .await
    }

    // ============================================================
    // Radial Chart Queries
    // ============================================================

    /// Query 17: Progresso de Meta de Vendas Mensal
    pub async fn get_monthly_sales_progress(&self, target_revenue: f64) -> sqlx::Result<MonthlySalesProgressRow> {
        let sql = r#"
            WITH monthly_target AS (
                SELECT 
                    SUM(total_price) AS current_revenue,
                    $1 AS target_revenue
                FROM orders
                WHERE payment_status = 'paid'
                  AND _status != 'deleted'
                  AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
            )
            SELECT 
                current_revenue,
                target_revenue,
                ROUND(
                    (current_revenue * 100.0 / target_revenue),
                    2
                ) AS progress_percentage,
                ROUND(target_revenue - current_revenue, 2) AS remaining
            FROM monthly_target
        "#;

        sqlx::query_as::<_, MonthlySalesProgressRow>(sql)
            .bind(target_revenue)
            .fetch_one(&self.pool)
            .await
    }

    /// Query 18: Taxa de Conversão de Carrinhos para Pedidos
    pub async fn get_conversion_rate(
        &self,
        features_config: Option<&str>,
        days: i64,
    ) -> sqlx::Result<ConversionRateRow> {
        self.check_module_required(features_config, "checkout")?;
        let sql = r#"
            WITH conversion_metrics AS (
                SELECT 
                    COUNT(DISTINCT c.id) AS total_checkouts,
                    COUNT(DISTINCT o.id) AS completed_orders
                FROM checkouts c
                LEFT JOIN orders o ON o.created_at >= c.created_at 
                    AND o.created_at <= datetime(c.created_at, '+1 day')
                    AND o._status != 'deleted'
                WHERE c._status != 'deleted'
                  AND c.created_at >= date('now', '-' || $1 || ' days')
            )
            SELECT 
                total_checkouts,
                completed_orders,
                ROUND(
                    (completed_orders * 100.0 / NULLIF(total_checkouts, 0)),
                    2
                ) AS conversion_rate
            FROM conversion_metrics
        "#;

        sqlx::query_as::<_, ConversionRateRow>(sql)
            .bind(days)
            .fetch_one(&self.pool)
            .await
    }

    /// Query 19: Percentual de Estoque Ocupado (Capacidade)
    pub async fn get_inventory_capacity(
        &self,
        features_config: Option<&str>,
        capacity_limit: f64,
    ) -> sqlx::Result<InventoryCapacityRow> {
        self.check_module_required(features_config, "inventory")?;
        let sql = r#"
            WITH inventory_capacity AS (
                SELECT 
                    SUM(il.quantity_on_hand) AS current_stock,
                    $1 AS capacity_limit
                FROM inventory_levels il
                WHERE il._status != 'deleted'
                  AND il.stock_status = 'sellable'
            )
            SELECT 
                current_stock,
                capacity_limit,
                ROUND(
                    (current_stock * 100.0 / capacity_limit),
                    2
                ) AS usage_percentage
            FROM inventory_capacity
        "#;

        sqlx::query_as::<_, InventoryCapacityRow>(sql)
            .bind(capacity_limit)
            .fetch_one(&self.pool)
            .await
    }

    // ============================================================
    // Advanced Queries
    // ============================================================

    /// Query 20: Ranking de Produtos com Percentil
    pub async fn get_product_ranking(&self, days: i64, limit: i64) -> sqlx::Result<Vec<ProductRankingRow>> {
        let sql = r#"
            SELECT 
                COALESCE(ti.name_snapshot, p.name) AS product_name,
                SUM(ti.total_line) AS total_revenue,
                RANK() OVER (ORDER BY SUM(ti.total_line) DESC) AS revenue_rank,
                ROUND(
                    PERCENT_RANK() OVER (ORDER BY SUM(ti.total_line)) * 100,
                    2
                ) AS revenue_percentile
            FROM transaction_items ti
            LEFT JOIN products p ON p.id = ti.product_id
            INNER JOIN transactions t ON t.id = ti.transaction_id
            WHERE t.type = 'sale'
              AND t.status = 'completed'
              AND t._status != 'deleted'
              AND t.created_at >= date('now', '-' || $1 || ' days')
            GROUP BY ti.product_id, COALESCE(ti.name_snapshot, p.name)
            ORDER BY total_revenue DESC
            LIMIT $2
        "#;

        sqlx::query_as::<_, ProductRankingRow>(sql)
            .bind(days)
            .bind(limit)
            .fetch_all(&self.pool)
            .await
    }

    /// Query 21: Comparação Mês a Mês (MoM - Month over Month)
    pub async fn get_month_over_month_growth(&self, months: i64) -> sqlx::Result<Vec<MonthOverMonthGrowthRow>> {
        let sql = r#"
            SELECT 
                strftime('%Y-%m', created_at) AS month,
                SUM(total_price) AS monthly_revenue,
                LAG(SUM(total_price)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS previous_month_revenue,
                ROUND(
                    ((SUM(total_price) - LAG(SUM(total_price)) OVER (ORDER BY strftime('%Y-%m', created_at))) * 100.0)
                    / NULLIF(LAG(SUM(total_price)) OVER (ORDER BY strftime('%Y-%m', created_at)), 0),
                    2
                ) AS mom_growth_percentage
            FROM orders
            WHERE payment_status = 'paid'
              AND _status != 'deleted'
              AND created_at >= date('now', '-' || $1 || ' months')
            GROUP BY strftime('%Y-%m', created_at)
            ORDER BY month ASC
        "#;

        sqlx::query_as::<_, MonthOverMonthGrowthRow>(sql)
            .bind(months)
            .fetch_all(&self.pool)
            .await
    }

    /// Query 22: Vendas Acumuladas por Período (YTD - Year to Date)
    pub async fn get_year_to_date_sales(&self) -> sqlx::Result<Vec<YearToDateSalesRow>> {
        let sql = r#"
            SELECT 
                strftime('%Y-%m', created_at) AS month,
                SUM(total_price) AS monthly_revenue,
                SUM(SUM(total_price)) OVER (
                    PARTITION BY strftime('%Y', created_at)
                    ORDER BY strftime('%Y-%m', created_at)
                ) AS ytd_revenue,
                COUNT(*) AS monthly_orders,
                SUM(COUNT(*)) OVER (
                    PARTITION BY strftime('%Y', created_at)
                    ORDER BY strftime('%Y-%m', created_at)
                ) AS ytd_orders
            FROM orders
            WHERE payment_status = 'paid'
              AND _status != 'deleted'
              AND strftime('%Y', created_at) = strftime('%Y', 'now')
            GROUP BY strftime('%Y-%m', created_at)
            ORDER BY month ASC
        "#;

        sqlx::query_as::<_, YearToDateSalesRow>(sql)
            .fetch_all(&self.pool)
            .await
    }
}
