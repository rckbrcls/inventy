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
import { AnalyticsRepository, type RevenueByCategory } from "@/lib/db/repositories/analytics-repository"
import { formatCurrency } from "@/lib/formatters"

const chartConfig = {
  totalRevenue: {
    label: "Receita Total",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function RevenueByCategoryBarChart() {
  const [data, setData] = React.useState<RevenueByCategory[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const categoryData = await AnalyticsRepository.getRevenueByCategory()
        setData(categoryData)
      } catch (error) {
        console.error("Failed to load revenue by category data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      categoryName: item.categoryName,
      totalRevenue: item.totalRevenue,
      productCount: item.productCount,
      orderCount: item.orderCount,
    }))
  }, [data])

  const totalRevenue = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.totalRevenue, 0),
    [chartData]
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Receita por Categoria</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>Receita por Categoria</CardTitle>
          <CardDescription>
            Distribuição de receita total por categoria de produtos
          </CardDescription>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
          <span className="text-muted-foreground text-xs">
            Receita Total
          </span>
          <span className="text-lg leading-none font-bold sm:text-3xl">
            {formatCurrency(totalRevenue)}
          </span>
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
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="categoryName"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={80}
              tickFormatter={(value) => {
                return value.length > 15 ? `${value.substring(0, 15)}...` : value
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `R$ ${(value / 1000000).toFixed(1)}M`
                }
                if (value >= 1000) {
                  return `R$ ${(value / 1000).toFixed(0)}k`
                }
                return `R$ ${value}`
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  formatter={(value) => formatCurrency(Number(value))}
                  labelFormatter={(value) => {
                    const category = chartData.find((c) => c.categoryName === value)
                    return (
                      <div>
                        <div className="font-semibold">{value}</div>
                        {category && (
                          <div className="text-xs text-muted-foreground">
                            {category.productCount} produtos • {category.orderCount} pedidos
                          </div>
                        )}
                      </div>
                    )
                  }}
                />
              }
            />
            <Bar
              dataKey="totalRevenue"
              fill="var(--color-totalRevenue)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
