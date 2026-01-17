"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AnalyticsRepository, type TopProduct } from "@/lib/db/repositories/analytics-repository"
import { formatCurrency } from "@/lib/formatters"

const chartConfig = {
  totalQuantity: {
    label: "Quantidade Vendida",
    color: "var(--chart-1)",
  },
  totalRevenue: {
    label: "Receita Total",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function TopProductsBarChart() {
  const [days, setDays] = React.useState<number>(30)
  const [limit, setLimit] = React.useState<number>(10)
  const [data, setData] = React.useState<TopProduct[]>([])
  const [loading, setLoading] = React.useState(true)
  const [activeMetric, setActiveMetric] = React.useState<"totalQuantity" | "totalRevenue">("totalQuantity")

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const productsData = await AnalyticsRepository.getTopProducts(days, limit)
        setData(productsData)
      } catch (error) {
        console.error("Failed to load top products data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [days, limit])

  const chartData = React.useMemo(() => {
    return data.map((product) => ({
      productName: product.productName,
      totalQuantity: product.totalQuantity,
      totalRevenue: product.totalRevenue,
      orderCount: product.orderCount,
    }))
  }, [data])

  const total = React.useMemo(
    () => ({
      totalQuantity: chartData.reduce((acc, curr) => acc + curr.totalQuantity, 0),
      totalRevenue: chartData.reduce((acc, curr) => acc + curr.totalRevenue, 0),
    }),
    [chartData]
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Produtos Mais Vendidos</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>Top Produtos Mais Vendidos</CardTitle>
          <CardDescription>
            Produtos com maior volume de vendas
          </CardDescription>
        </div>
        <div className="flex gap-2 px-6 pb-3 sm:pb-0 sm:px-8 sm:py-6">
          <Select
            value={days.toString()}
            onValueChange={(value) => setDays(Number(value))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={limit.toString()}
            onValueChange={(value) => setLimit(Number(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Top 5</SelectItem>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="20">Top 20</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex">
          {(["totalQuantity", "totalRevenue"] as const).map((metric) => {
            return (
              <button
                key={metric}
                data-active={activeMetric === metric}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveMetric(metric)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[metric].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {metric === "totalQuantity"
                    ? total[metric].toLocaleString()
                    : formatCurrency(total[metric])}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              dataKey="productName"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={150}
              tickFormatter={(value) => {
                return value.length > 20 ? `${value.substring(0, 20)}...` : value
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  formatter={(value, name) => {
                    if (name === "totalRevenue") {
                      return formatCurrency(Number(value))
                    }
                    return value
                  }}
                  labelFormatter={(value) => {
                    const product = chartData.find((p) => p.productName === value)
                    return (
                      <div>
                        <div className="font-semibold">{value}</div>
                        {product && (
                          <div className="text-xs text-muted-foreground">
                            {product.orderCount} pedidos
                          </div>
                        )}
                      </div>
                    )
                  }}
                />
              }
            />
            <Bar
              dataKey={activeMetric}
              fill={`var(--color-${activeMetric})`}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
