import { Activity, Box, TrendingUp } from "lucide-react"
import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"

import type { DashboardStats } from "@/lib/db/repositories/analytics-repository"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AnalyticsRepository } from "@/lib/db/repositories/analytics-repository"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { CumulativeRevenueAreaChart } from "@/components/charts/cumulative-revenue-area-chart"
import { DailySalesTrendLineChart } from "@/components/charts/daily-sales-trend-line-chart"
import { TopProductsBarChart } from "@/components/charts/top-products-bar-chart"
import { PaymentMethodDistributionPieChart } from "@/components/charts/payment-method-distribution-pie-chart"

export const Route = createFileRoute("/")({ component: Dashboard })

function Dashboard() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null)
  const [timeRange] = useLocalStorage("dashboard_timeRange", "30d")
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      try {
        const dashboardStats = await AnalyticsRepository.getDashboardStats()
        setStats(dashboardStats)
      } catch (error) {
        console.error("Failed to load dashboard data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [timeRange])

  if (loading) {
    return <div className="p-4">Loading stats...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-4 md:grid-cols-3 md:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
              <Badge variant="outline" className="gap-1 rounded-full">
                <TrendingUp className="h-3 w-3" />
                {stats?.totalItemsGrowth ?? 0}%
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.totalItems ?? 0}</div>
              <p className="text-sm text-muted-foreground mt-1">
                From last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
              <Badge variant="outline" className="gap-1 rounded-full">
                <Box className="h-3 w-3" />
                Needs Attention
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.lowStockItems ?? 0}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Items below safety stock
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Asset Value
              </CardTitle>
              <Badge variant="outline" className="gap-1 rounded-full">
                <Activity className="h-3 w-3" />
                Active
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.totalInventoryValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'R$ 0,00'}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total inventory cost
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
        <CumulativeRevenueAreaChart />
        <DailySalesTrendLineChart />
        <TopProductsBarChart />
        <div className="grid gap-4 md:grid-cols-2">
          <PaymentMethodDistributionPieChart />
        </div>
    </div>
  )
}
