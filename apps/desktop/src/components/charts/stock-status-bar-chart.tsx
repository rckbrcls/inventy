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
import { AnalyticsRepository, type StockStatus } from "@/lib/db/repositories/analytics-repository"
import { useShopIdFromRoute } from "@/hooks/use-shop"

const stockStatusColors: Record<string, string> = {
  "Out of Stock": "var(--chart-2)",
  "Low Stock": "var(--chart-3)",
  "Medium Stock": "var(--chart-4)",
  "High Stock": "var(--chart-1)",
}

const stockStatusLabels: Record<string, string> = {
  "Out of Stock": "Sem Estoque",
  "Low Stock": "Estoque Baixo",
  "Medium Stock": "Estoque Médio",
  "High Stock": "Estoque Alto",
}

const chartConfig = {
  productCount: {
    label: "Quantidade de Produtos",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function StockStatusBarChart() {
  const shopId = useShopIdFromRoute()
  const [data, setData] = React.useState<StockStatus[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      if (!shopId) return
      try {
        setLoading(true)
        const statusData = await AnalyticsRepository.getStockStatus(shopId)
        setData(statusData)
      } catch (error) {
        console.error("Failed to load stock status data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [shopId])

  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      stockStatus: item.stockStatus,
      productCount: item.productCount,
      totalQuantity: item.totalQuantity,
      fill: stockStatusColors[item.stockStatus] || "var(--chart-1)",
      label: stockStatusLabels[item.stockStatus] || item.stockStatus,
    }))
  }, [data])

  const totalProducts = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.productCount, 0),
    [chartData]
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos por Status de Estoque</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos por Status de Estoque</CardTitle>
          <CardDescription>
            Nenhum dado de estoque disponível. Certifique-se de que há produtos com categorias associadas à loja.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>Produtos por Status de Estoque</CardTitle>
          <CardDescription>
            Distribuição de produtos por nível de estoque
          </CardDescription>
        </div>
        <div className="flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
          <span className="text-muted-foreground text-xs">
            Total de Produtos
          </span>
          <span className="text-lg leading-none font-bold sm:text-3xl">
            {totalProducts.toLocaleString()}
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
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
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
                    const item = chartData.find((c) => c.label === value)
                    return (
                      <div>
                        <div className="font-semibold">{value}</div>
                        {item && (
                          <div className="text-xs text-muted-foreground">
                            {item.totalQuantity.toLocaleString()} unidades em estoque
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
              fill={(entry) => entry.fill}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
