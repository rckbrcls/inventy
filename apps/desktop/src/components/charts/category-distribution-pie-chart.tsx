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
import { AnalyticsRepository, type CategoryDistribution } from "@/lib/db/repositories/analytics-repository"
import { useShopIdFromRoute } from "@/hooks/use-shop"

const chartConfig = {
  productCount: {
    label: "Quantidade de Produtos",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function CategoryDistributionPieChart() {
  const shopId = useShopIdFromRoute()
  const [data, setData] = React.useState<CategoryDistribution[]>([])
  const [loading, setLoading] = React.useState(true)
  const [limit, setLimit] = React.useState<number>(20)

  React.useEffect(() => {
    async function loadData() {
      if (!shopId) return
      try {
        setLoading(true)
        const distributionData = await AnalyticsRepository.getCategoryDistribution(shopId)
        setData(distributionData)
      } catch (error) {
        console.error("Failed to load category distribution data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [shopId])

  const sortedData = React.useMemo(() => {
    return [...data].sort((a, b) => b.productCount - a.productCount)
  }, [data])

  const chartData = React.useMemo(() => {
    return sortedData.slice(0, limit).map((item) => ({
      categoryName: item.categoryName,
      productCount: item.productCount,
      percentage: item.percentage,
    }))
  }, [sortedData, limit])

  const totalProducts = React.useMemo(
    () => data.reduce((acc, curr) => acc + curr.productCount, 0),
    [data]
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Produtos por Categoria</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <div className="flex w-full items-center justify-between">
          <div>
            <CardTitle>Distribuição de Produtos por Categoria</CardTitle>
            <CardDescription>
              Top {limit} categorias por quantidade de produtos
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={30}>Top 30</option>
              <option value={50}>Top 50</option>
              <option value={data.length}>Todas ({data.length})</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[400px] w-full"
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
              height={120}
              tickFormatter={(value) => {
                return value.length > 15 ? `${value.substring(0, 15)}...` : value
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  labelFormatter={(value) => {
                    const item = chartData.find((c) => c.categoryName === value)
                    return (
                      <div>
                        <div className="font-semibold">{value}</div>
                        {item && (
                          <div className="text-xs text-muted-foreground">
                            {item.percentage.toFixed(1)}% do total
                          </div>
                        )}
                      </div>
                    )
                  }}
                />
              }
            />
            <Bar
              dataKey="productCount"
              fill="var(--color-productCount)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardContent className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Total: {totalProducts} produtos
        </div>
        <div className="text-muted-foreground leading-none">
          Mostrando {chartData.length} de {data.length} categorias
        </div>
      </CardContent>
    </Card>
  )
}
