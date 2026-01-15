import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Activity, Box, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { AnalyticsRepository, DashboardStats, DailyMovementStat } from "@/lib/db/repositories/analytics-repository"

export const Route = createFileRoute("/")({ component: Dashboard })

const chartConfig = {
  views: {
    label: "Movements",
  },
  stockIn: {
    label: "Stock In",
    color: "hsl(var(--chart-1))",
  },
  stockOut: {
    label: "Stock Out",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

function Dashboard() {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("stockIn")
  const [stats, setStats] = React.useState<DashboardStats | null>(null)
  const [chartData, setChartData] = React.useState<DailyMovementStat[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      try {
        const [dashboardStats, dailyMovements] = await Promise.all([
          AnalyticsRepository.getDashboardStats(),
          AnalyticsRepository.getDailyStockMovements(90) // 3 months
        ])
        setStats(dashboardStats)
        setChartData(dailyMovements)
      } catch (error) {
        console.error("Failed to load dashboard data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const total = React.useMemo(
    () => ({
      stockIn: chartData.reduce((acc, curr) => acc + curr.stockIn, 0),
      stockOut: chartData.reduce((acc, curr) => acc + curr.stockOut, 0),
    }),
    [chartData]
  )

  if (loading) {
    return <div className="p-4">Loading stats...</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="grid gap-4 md:grid-cols-3 md:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalItems ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalItemsGrowth ?? 0}% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.lowStockItems ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Items below safety stock
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Asset Value
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalInventoryValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? 'R$ 0,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Total inventory cost
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-3">
          <Card className="col-span-3">
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-4 sm:flex-row">
              <div className="flex flex-1 flex-col justify-center gap-1 px-2 py-5 sm:py-6">
                <CardTitle>Inventory Movements</CardTitle>
                <CardDescription>
                  Showing total stock movements for the last 3 months
                </CardDescription>
              </div>
              <div className="flex">
                {["stockIn", "stockOut"].map((key) => {
                  const chart = key as keyof typeof chartConfig
                  return (
                    <button
                      key={chart}
                      data-active={activeChart === chart}
                      className="relative z-30 flex cursor-pointer odd:rounded-l-lg even:rounded-r-lg flex-1 flex-col justify-center gap-1 px-6 py-4 text-left border even:border-l-0 data-[active=true]:bg-muted/50 sm:px-8 sm:py-6"
                      onClick={() => setActiveChart(chart)}
                    >
                      <span className="text-xs text-muted-foreground">
                        {chartConfig[chart].label}
                      </span>
                      <span className="text-lg leading-none font-bold sm:text-3xl">
                        {total[key as keyof typeof total].toLocaleString()}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-[150px]"
                        nameKey="views"
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        }}
                      />
                    }
                  />
                  <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
