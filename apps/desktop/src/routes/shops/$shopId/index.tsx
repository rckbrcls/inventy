import { Activity, Box, TrendingUp } from "lucide-react"
import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"

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
import { useShopStore } from "@/stores/shop-store"
import { useShop } from "@/hooks/use-shop"
import { Skeleton } from "@/components/ui/skeleton"
import { CumulativeRevenueAreaChart } from "@/components/charts/cumulative-revenue-area-chart"
import { DailySalesTrendLineChart } from "@/components/charts/daily-sales-trend-line-chart"
import { TopProductsBarChart } from "@/components/charts/top-products-bar-chart"
import { PaymentMethodDistributionPieChart } from "@/components/charts/payment-method-distribution-pie-chart"
import { RevenueByCategoryBarChart } from "@/components/charts/revenue-by-category-bar-chart"
import { MonthlySalesBarChart } from "@/components/charts/monthly-sales-bar-chart"
import { CategoryDistributionPieChart } from "@/components/charts/category-distribution-pie-chart"
import { MonthlySalesProgressRadialChart } from "@/components/charts/monthly-sales-progress-radial-chart"
import { StockStatusBarChart } from "@/components/charts/stock-status-bar-chart"
import { CustomerGrowthLineChart } from "@/components/charts/customer-growth-line-chart"
import { AverageOrderValueLineChart } from "@/components/charts/average-order-value-line-chart"
import { OrderStatusDistributionPieChart } from "@/components/charts/order-status-distribution-pie-chart"
import { ConversionRateRadialChart } from "@/components/charts/conversion-rate-radial-chart"
import { InventoryCapacityRadialChart } from "@/components/charts/inventory-capacity-radial-chart"

export const Route = createFileRoute("/shops/$shopId/")({
  component: ShopDashboardRoute,
})

function ShopDashboardRoute() {
  const { shopId } = Route.useParams()
  const { shop } = useShop()
  const { setActiveShop } = useShopStore()
  const [stats, setStats] = React.useState<DashboardStats | null>(null)
  const [timeRange] = useLocalStorage("dashboard_timeRange", "30d")
  const [loading, setLoading] = React.useState(true)
  const [shopReady, setShopReady] = React.useState(false)

  useEffect(() => {
    const loadShop = async () => {
      console.log("[ShopDashboardRoute] Setting active shop:", shopId)
      await setActiveShop(shopId)
      setShopReady(true)
      console.log("[ShopDashboardRoute] Active shop set")
    }
    if (shopId) {
      loadShop()
    }
  }, [shopId, setActiveShop])

  React.useEffect(() => {
    console.log("[ShopDashboardRoute] useEffect triggered - shopId:", shopId, "type:", typeof shopId, "timeRange:", timeRange)
    async function loadData() {
      console.log("[ShopDashboardRoute.loadData] Called with shopId:", shopId)
      if (!shopId) {
        console.warn("[ShopDashboardRoute] WARNING: No shopId available - skipping data load")
        setLoading(false)
        return
      }
      try {
        console.log("[ShopDashboardRoute] Calling AnalyticsRepository.getDashboardStats with shopId:", shopId)
        const dashboardStats = await AnalyticsRepository.getDashboardStats(shopId)
        console.log("[ShopDashboardRoute] Dashboard stats loaded successfully:", dashboardStats)
        setStats(dashboardStats)
      } catch (error) {
        console.error("[ShopDashboardRoute] ERROR: Failed to load dashboard data:", error)
        setStats(null)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [timeRange, shopId])

  if (!shop || !shopReady || loading || !shopId) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold">{shop.name}</h2>
        <p className="text-sm text-muted-foreground">
          {shop.slug} • {shop.status}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-4 xl:grid-cols-3 md:col-span-3">
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
      <CustomerGrowthLineChart />
      <AverageOrderValueLineChart />
      <TopProductsBarChart />
      <RevenueByCategoryBarChart />
      <MonthlySalesBarChart />
      <StockStatusBarChart />
      <div className="grid gap-4 md:grid-cols-2">
        <PaymentMethodDistributionPieChart />
        <OrderStatusDistributionPieChart />
      </div>
      <CategoryDistributionPieChart />
      <div className="grid gap-4 md:grid-cols-3">
        <MonthlySalesProgressRadialChart />
        <ConversionRateRadialChart />
        <InventoryCapacityRadialChart />
      </div>
    </div>
  )
}
