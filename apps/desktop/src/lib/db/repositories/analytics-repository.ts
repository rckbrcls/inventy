import { invoke } from "@tauri-apps/api/core"

// Existing types
export type DashboardStats = {
  totalItems: number
  lowStockItems: number
  totalInventoryValue: number
  totalItemsGrowth: number
}

export type DailyMovementStat = {
  date: string
  stockIn: number
  stockOut: number
}

type StockMovementsFilter = {
  timeRange: string
}

// Area Chart Types
export type CumulativeRevenue = {
  date: string
  cumulativeRevenue: number
  totalRevenue: number
  dailyRevenue: number
  dailyRefunds: number
}

export type StockMovementsArea = {
  date: string
  cumulativeStockIn: number
  cumulativeStockOut: number
  dailyStockIn: number
  dailyStockOut: number
}

export type RevenueByPaymentMethod = {
  date: string
  paymentMethod: string
  dailyAmount: number
  cumulativeAmountByMethod: number
}

// Bar Chart Types
export type TopProduct = {
  productId: string
  productName: string
  totalQuantity: number
  totalRevenue: number
  orderCount: number
}

export type RevenueByCategory = {
  categoryName: string
  totalRevenue: number
  productCount: number
  orderCount: number
}

export type MonthlySales = {
  month: string
  monthlyRevenue: number
  orderCount: number
  avgOrderValue: number
}

export type StockStatus = {
  stockStatus: string
  productCount: number
  totalQuantity: number
}

// Line Chart Types
export type DailySalesTrend = {
  date: string
  dailyOrders: number
  dailyRevenue: number
  movingAvg7dRevenue: number | null
  movingAvg7dOrders: number | null
}

export type CustomerGrowth = {
  month: string
  newCustomers: number
  cumulativeCustomers: number
  previousMonth: number | null
  growthPercentage: number | null
}

export type AverageOrderValue = {
  month: string
  orderCount: number
  avgOrderValue: number
  previousAvg: number | null
  avgChangePercentage: number | null
}

// Pie Chart Types
export type PaymentMethodDistribution = {
  paymentMethod: string
  totalAmount: number
  transactionCount: number
  percentage: number
}

export type CategoryDistribution = {
  categoryName: string
  productCount: number
  percentage: number
}

export type OrderStatusDistribution = {
  paymentStatus: string
  orderCount: number
  totalRevenue: number
  orderPercentage: number
  revenuePercentage: number
}

export type CustomerGroupDistribution = {
  groupName: string
  customerCount: number
  percentage: number
}

// Radar Chart Types
export type MonthlyPerformanceMetrics = {
  month: string
  normalizedOrders: number
  normalizedRevenue: number
  normalizedCustomers: number
  normalizedStockSold: number
}

export type ProductMetrics = {
  productName: string
  normalizedQuantity: number
  normalizedRevenue: number
  normalizedMargin: number
  normalizedStock: number
}

// Radial Chart Types
export type MonthlySalesProgress = {
  currentRevenue: number
  targetRevenue: number
  progressPercentage: number
  remaining: number
}

export type ConversionRate = {
  totalCheckouts: number
  completedOrders: number
  conversionRate: number
}

export type InventoryCapacity = {
  currentStock: number
  capacityLimit: number
  usagePercentage: number
}

// Advanced Queries Types
export type ProductRanking = {
  productName: string
  totalRevenue: number
  revenueRank: number
  revenuePercentile: number
}

export type MonthOverMonthGrowth = {
  month: string
  monthlyRevenue: number
  previousMonthRevenue: number | null
  momGrowthPercentage: number | null
}

export type YearToDateSales = {
  month: string
  monthlyRevenue: number
  ytdRevenue: number
  monthlyOrders: number
  ytdOrders: number
}

export const AnalyticsRepository = {
  // Existing methods
  async getDashboardStats(shopId?: string): Promise<DashboardStats> {
    return invoke("get_dashboard_stats", { shop_id: shopId || null })
  },
  async getStockMovements(timeRange: string): Promise<DailyMovementStat[]> {
    const payload: StockMovementsFilter = { timeRange }
    return invoke("get_stock_movements", { payload })
  },

  // Area Chart Methods
  async getCumulativeRevenue(days?: number): Promise<CumulativeRevenue[]> {
    return invoke("get_cumulative_revenue", { days })
  },
  async getStockMovementsArea(days?: number): Promise<StockMovementsArea[]> {
    return invoke("get_stock_movements_area", { days })
  },
  async getRevenueByPaymentMethod(days?: number): Promise<RevenueByPaymentMethod[]> {
    return invoke("get_revenue_by_payment_method", { days })
  },

  // Bar Chart Methods
  async getTopProducts(days?: number, limit?: number): Promise<TopProduct[]> {
    return invoke("get_top_products", { days, limit })
  },
  async getRevenueByCategory(): Promise<RevenueByCategory[]> {
    return invoke("get_revenue_by_category")
  },
  async getMonthlySales(months?: number): Promise<MonthlySales[]> {
    return invoke("get_monthly_sales", { months })
  },
  async getStockStatus(): Promise<StockStatus[]> {
    return invoke("get_stock_status")
  },

  // Line Chart Methods
  async getDailySalesTrend(days?: number): Promise<DailySalesTrend[]> {
    return invoke("get_daily_sales_trend", { days })
  },
  async getCustomerGrowth(months?: number): Promise<CustomerGrowth[]> {
    return invoke("get_customer_growth", { months })
  },
  async getAverageOrderValue(months?: number): Promise<AverageOrderValue[]> {
    return invoke("get_average_order_value", { months })
  },

  // Pie Chart Methods
  async getPaymentMethodDistribution(days?: number): Promise<PaymentMethodDistribution[]> {
    return invoke("get_payment_method_distribution", { days })
  },
  async getCategoryDistribution(): Promise<CategoryDistribution[]> {
    return invoke("get_category_distribution")
  },
  async getOrderStatusDistribution(days?: number): Promise<OrderStatusDistribution[]> {
    return invoke("get_order_status_distribution", { days })
  },
  async getCustomerGroupDistribution(): Promise<CustomerGroupDistribution[]> {
    return invoke("get_customer_group_distribution")
  },

  // Radar Chart Methods
  async getMonthlyPerformanceMetrics(months?: number): Promise<MonthlyPerformanceMetrics[]> {
    return invoke("get_monthly_performance_metrics", { months })
  },
  async getProductMetrics(days?: number, limit?: number): Promise<ProductMetrics[]> {
    return invoke("get_product_metrics", { days, limit })
  },

  // Radial Chart Methods
  async getMonthlySalesProgress(targetRevenue?: number): Promise<MonthlySalesProgress> {
    return invoke("get_monthly_sales_progress", { targetRevenue })
  },
  async getConversionRate(days?: number): Promise<ConversionRate> {
    return invoke("get_conversion_rate", { days })
  },
  async getInventoryCapacity(capacityLimit?: number): Promise<InventoryCapacity> {
    return invoke("get_inventory_capacity", { capacityLimit })
  },

  // Advanced Queries Methods
  async getProductRanking(days?: number, limit?: number): Promise<ProductRanking[]> {
    return invoke("get_product_ranking", { days, limit })
  },
  async getMonthOverMonthGrowth(months?: number): Promise<MonthOverMonthGrowth[]> {
    return invoke("get_month_over_month_growth", { months })
  },
  async getYearToDateSales(): Promise<YearToDateSales[]> {
    return invoke("get_year_to_date_sales")
  },
}
