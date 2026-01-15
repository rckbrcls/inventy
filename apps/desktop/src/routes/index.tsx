import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Box, TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AnalyticsRepository, DashboardStats, DailyMovementStat } from "@/lib/db/repositories/analytics-repository"
import { useLocalStorage } from "@/hooks/use-local-storage"

export const Route = createFileRoute("/")({ component: Dashboard })

const chartConfig = {
  views: {
    label: "Movements",
  },
  stockIn: {
    label: "Stock In",
    color: "var(--chart-1)",
  },
  stockOut: {
    label: "Stock Out",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function Dashboard() {
  const [activeChart, setActiveChart] = useLocalStorage<keyof typeof chartConfig>("dashboard_activeChart", "stockIn")
  const [stats, setStats] = React.useState<DashboardStats | null>(null)
  const [chartData, setChartData] = React.useState<DailyMovementStat[]>([])
  const [timeRange, setTimeRange] = useLocalStorage("dashboard_timeRange", "30d")
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      try {
        const [dashboardStats, dailyMovements] = await Promise.all([
          AnalyticsRepository.getDashboardStats(),
          AnalyticsRepository.getStockMovements(timeRange)
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
  }, [timeRange])

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

        {chartData.length > 0 && (
          <div className="col-span-3">
            <Card className="col-span-3">
              <CardHeader className="flex flex-col items-stretch space-y-0 border-b  sm:flex-row">
                <div className="flex flex-1 flex-col  gap-6">
                  <div>
                    <CardTitle className="text-xl">Inventory Movements</CardTitle>
                    <CardDescription>
                      Showing {timeRange === 'all' ? 'all-time' : `total stock movements for the last ${timeRange}`}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger
                      className="w-[200px] rounded-lg "
                      aria-label="Select a value"
                    >
                      <SelectValue placeholder="Last 30 days" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="30m" className="rounded-lg">
                        Last 30 minutes
                      </SelectItem>
                      <SelectItem value="1h" className="rounded-lg">
                        Last hour
                      </SelectItem>
                      <SelectItem value="2h" className="rounded-lg">
                        Last 2 hours
                      </SelectItem>
                      <SelectItem value="7d" className="rounded-lg">
                        Last 7 days
                      </SelectItem>
                      <SelectItem value="30d" className="rounded-lg">
                        Last 30 days
                      </SelectItem>
                      <SelectItem value="90d" className="rounded-lg">
                        Last 3 months
                      </SelectItem>
                      <SelectItem value="1y" className="rounded-lg">
                        Last year
                      </SelectItem>
                      <SelectItem value="all" className="rounded-lg">
                        All time
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex h-full">
                    {["stockIn", "stockOut"].map((key) => {
                      const chart = key as keyof typeof chartConfig
                      return (
                        <button
                          key={chart}
                          data-active={activeChart === chart}
                          className="relative z-30 flex items-center cursor-pointer odd:rounded-l-lg p-3 even:rounded-r-lg flex-col justify-center gap-1 px-10 text-left border even:border-l-0 data-[active=true]:bg-muted/50"
                          onClick={() => setActiveChart(chart)}
                        >
                          <span className="text-xs text-nowrap text-muted-foreground">
                            {chartConfig[chart].label}
                          </span>
                          <span className="text-lg leading-none font-bold sm:text-3xl">
                            {total[key as keyof typeof total].toLocaleString()}
                          </span>
                        </button>
                      )
                    })}
                  </div>

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
                        if (['30m', '1h', '2h'].includes(timeRange)) {
                          return date.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        }
                        return date.toLocaleDateString("pt-BR", {
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
                            const date = new Date(value)
                            if (['30m', '1h', '2h'].includes(timeRange)) {
                              return date.toLocaleTimeString("pt-BR", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })
                            }
                            return date.toLocaleDateString("pt-BR", {
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
        )}
      </div>
    </div>
  )
}
