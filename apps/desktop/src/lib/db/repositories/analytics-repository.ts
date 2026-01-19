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
  async getDashboardStats(shopId: string): Promise<DashboardStats> {
    return invoke("get_dashboard_stats", { shop_id: shopId })
  },
  async getStockMovements(shopId: string, timeRange: string): Promise<DailyMovementStat[]> {
    const payload: StockMovementsFilter = { timeRange }
    return invoke("get_stock_movements", { shop_id: shopId, payload })
  },

  // Area Chart Methods
  async getCumulativeRevenue(shopId: string, days?: number): Promise<CumulativeRevenue[]> {
    return invoke("get_cumulative_revenue", { shop_id: shopId, days })
  },
  async getStockMovementsArea(shopId: string, days?: number): Promise<StockMovementsArea[]> {
    return invoke("get_stock_movements_area", { shop_id: shopId, days })
  },
  async getRevenueByPaymentMethod(shopId: string, days?: number): Promise<RevenueByPaymentMethod[]> {
    return invoke("get_revenue_by_payment_method", { shop_id: shopId, days })
  },

  // Bar Chart Methods
  async getTopProducts(shopId: string, days?: number, limit?: number): Promise<TopProduct[]> {
    return invoke("get_top_products", { shop_id: shopId, days, limit })
  },
  async getRevenueByCategory(shopId: string): Promise<RevenueByCategory[]> {
    return invoke("get_revenue_by_category", { shop_id: shopId })
  },
  async getMonthlySales(shopId: string, months?: number): Promise<MonthlySales[]> {
    return invoke("get_monthly_sales", { shop_id: shopId, months })
  },
  async getStockStatus(shopId: string): Promise<StockStatus[]> {
    return invoke("get_stock_status", { shop_id: shopId })
  },

  // Line Chart Methods
  async getDailySalesTrend(shopId: string, days?: number): Promise<DailySalesTrend[]> {
    return invoke("get_daily_sales_trend", { shop_id: shopId, days })
  },
  async getCustomerGrowth(shopId: string, months?: number): Promise<CustomerGrowth[]> {
    return invoke("get_customer_growth", { shop_id: shopId, months })
  },
  async getAverageOrderValue(shopId: string, months?: number): Promise<AverageOrderValue[]> {
    return invoke("get_average_order_value", { shop_id: shopId, months })
  },

  // Pie Chart Methods
  async getPaymentMethodDistribution(shopId: string, days?: number): Promise<PaymentMethodDistribution[]> {
    return invoke("get_payment_method_distribution", { shop_id: shopId, days })
  },
  async getCategoryDistribution(shopId: string): Promise<CategoryDistribution[]> {
    return invoke("get_category_distribution", { shop_id: shopId })
  },
  async getOrderStatusDistribution(shopId: string, days?: number): Promise<OrderStatusDistribution[]> {
    return invoke("get_order_status_distribution", { shop_id: shopId, days })
  },
  async getCustomerGroupDistribution(shopId: string): Promise<CustomerGroupDistribution[]> {
    return invoke("get_customer_group_distribution", { shop_id: shopId })
  },

  // Radar Chart Methods
  async getMonthlyPerformanceMetrics(shopId: string, months?: number): Promise<MonthlyPerformanceMetrics[]> {
    return invoke("get_monthly_performance_metrics", { shop_id: shopId, months })
  },
  async getProductMetrics(shopId: string, days?: number, limit?: number): Promise<ProductMetrics[]> {
    return invoke("get_product_metrics", { shop_id: shopId, days, limit })
  },

  // Radial Chart Methods
  async getMonthlySalesProgress(shopId: string, targetRevenue?: number): Promise<MonthlySalesProgress> {
    return invoke("get_monthly_sales_progress", { shop_id: shopId, targetRevenue })
  },
  async getConversionRate(shopId: string, days?: number): Promise<ConversionRate> {
    return invoke("get_conversion_rate", { shop_id: shopId, days })
  },
  async getInventoryCapacity(shopId: string, capacityLimit?: number): Promise<InventoryCapacity> {
    return invoke("get_inventory_capacity", { shop_id: shopId, capacityLimit })
  },

  // Advanced Queries Methods
  async getProductRanking(shopId: string, days?: number, limit?: number): Promise<ProductRanking[]> {
    return invoke("get_product_ranking", { shop_id: shopId, days, limit })
  },
  async getMonthOverMonthGrowth(shopId: string, months?: number): Promise<MonthOverMonthGrowth[]> {
    return invoke("get_month_over_month_growth", { shop_id: shopId, months })
  },
  async getYearToDateSales(shopId: string): Promise<YearToDateSales[]> {
    return invoke("get_year_to_date_sales", { shop_id: shopId })
  },
}
