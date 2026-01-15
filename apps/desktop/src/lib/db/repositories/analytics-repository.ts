import { getDb } from '../client'

export interface DashboardStats {
  totalItems: number
  totalItemsGrowth: number // Percentage
  lowStockItems: number
  totalInventoryValue: number
  activeSatellites: number
}

export interface DailyMovementStat {
  date: string
  stockIn: number
  stockOut: number
}

export class AnalyticsRepository {
  /**
   * Retrieves high-level statistics for the dashboard.
   * uses Window Functions to calculate month-over-month growth.
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    const db = await getDb()

    // Fallback for total count if no history or window func creates empty
    const totalCountQuery = `SELECT COUNT(*) as count FROM inventory_items WHERE deleted_at IS NULL`

    // 2. Low Stock
    const lowStockQuery = `
      SELECT COUNT(*) as count
      FROM inventory_items
      WHERE deleted_at IS NULL
      AND quantity <= min_stock_level
      AND min_stock_level IS NOT NULL
      AND min_stock_level > 0
    `

    // 3. Inventory Value
    const valueQuery = `
      SELECT SUM(quantity * cost_price) as total_value
      FROM inventory_items
      WHERE deleted_at IS NULL
    `

    try {
      const totalResult = await db.select<{ count: number }[]>(totalCountQuery)
      const lowStockResult = await db.select<{ count: number }[]>(lowStockQuery)
      const valueResult = await db.select<{ total_value: number }[]>(valueQuery)

      const currentTotal = totalResult[0]?.count || 0

      // Calculate growth based on window function result if available, covering the "current month" vs "prev month" logic
      // Ideally we want total accumulated count up to now vs last month, but this query does new items per month.
      // To do "Total Database Size" growth, we need a running count.

      /*
        Better Window Function for Total Database Size Growth:
        We need cumulative count.
      */
      const cumulativeGrowthQuery = `
        WITH monthly_new AS (
          SELECT
            strftime('%Y-%m', created_at) as month,
            COUNT(*) as new_items
          FROM inventory_items
          WHERE deleted_at IS NULL
          GROUP BY month
        ),
        running_totals AS (
          SELECT
            month,
            SUM(new_items) OVER (ORDER BY month) as total_at_month_end
          FROM monthly_new
        ),
        final_stats AS (
          SELECT
            total_at_month_end,
            LAG(total_at_month_end) OVER (ORDER BY month) as prev_total
          FROM running_totals
        )
        SELECT * FROM final_stats ORDER BY total_at_month_end DESC LIMIT 1;
       `

      const statsResult = await db.select<
        { total_at_month_end: number; prev_total: number }[]
      >(cumulativeGrowthQuery)

      let growth = 0
      if (statsResult.length > 0) {
        const { total_at_month_end, prev_total } = statsResult[0]
        if (prev_total > 0) {
          growth = ((total_at_month_end - prev_total) / prev_total) * 100
        } else if (total_at_month_end > 0) {
          growth = 100 // 0 to something is 100% technically infinite but 100 represents "all new"
        }
      }

      return {
        totalItems: currentTotal,
        totalItemsGrowth: Number(growth.toFixed(1)),
        lowStockItems: lowStockResult[0]?.count || 0,
        totalInventoryValue: valueResult[0]?.total_value || 0,
        activeSatellites: 0, // Placeholder as requested, not in DB yet
      }
    } catch (error) {
      console.error('[AnalyticsRepository] getDashboardStats error:', error)
      return {
        totalItems: 0,
        totalItemsGrowth: 0,
        lowStockItems: 0,
        totalInventoryValue: 0,
        activeSatellites: 0,
      }
    }
  }

  /**
   * Retrieves daily stock movement aggregation for the chart.
   * @param days Number of past days to analyze
   */
  static async getDailyStockMovements(days = 30): Promise<DailyMovementStat[]> {
    const db = await getDb()

    // SQLite query to group movements by day
    // We assume occurred_at is ISO string. strftime('%Y-%m-%d', occurred_at) extracts date.
    const query = `
      SELECT
        strftime('%Y-%m-%d', occurred_at) as date,
        SUM(CASE WHEN type = 'IN' THEN quantity_change ELSE 0 END) as stockIn,
        SUM(CASE WHEN type IN ('OUT', 'ADJUST') THEN ABS(quantity_change) ELSE 0 END) as stockOut
      FROM inventory_movements
      WHERE occurred_at >= date('now', '-${days} days')
      GROUP BY date
      ORDER BY date ASC
    `

    try {
      const result = await db.select<DailyMovementStat[]>(query)
      return result
    } catch (error) {
      console.error(
        '[AnalyticsRepository] getDailyStockMovements error:',
        error,
      )
      return []
    }
  }
}
