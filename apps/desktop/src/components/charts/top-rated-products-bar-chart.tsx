"use client"

import * as React from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { Star } from "lucide-react"

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
import { AnalyticsRepository, type TopRatedProduct } from "@/lib/db/repositories/analytics-repository"
import { useShopIdFromRoute } from "@/hooks/use-shop"

const chartConfig = {
  averageRating: {
    label: "Nota Média",
    color: "var(--chart-1)",
  },
  reviewCount: {
    label: "Nº de Reviews",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function TopRatedProductsBarChart() {
  const shopId = useShopIdFromRoute()
  const [limit, setLimit] = React.useState<number>(10)
  const [minReviews, setMinReviews] = React.useState<number>(1)
  const [data, setData] = React.useState<TopRatedProduct[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      if (!shopId) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const productsData = await AnalyticsRepository.getTopRatedProducts(shopId, limit, minReviews)
        setData(productsData)
      } catch (error) {
        console.error("[TopRatedProductsBarChart] Failed to load data:", error)
        setData([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [shopId, limit, minReviews])

  const chartData = React.useMemo(() => {
    return data.map((product) => ({
      productName: product.productName,
      averageRating: product.averageRating,
      reviewCount: product.reviewCount,
      ratingRank: product.ratingRank,
    }))
  }, [data])

  const averageRating = React.useMemo(() => {
    if (chartData.length === 0) return 0
    return chartData.reduce((acc, curr) => acc + curr.averageRating, 0) / chartData.length
  }, [chartData])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Bem Avaliados</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtos Mais Bem Avaliados</CardTitle>
          <CardDescription>Nenhum produto com reviews encontrado</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Produtos Mais Bem Avaliados
          </CardTitle>
          <CardDescription>
            Ranking por nota média de avaliações
          </CardDescription>
        </div>
        <div className="flex gap-2 px-6 pb-3 sm:pb-0 sm:px-8 sm:py-6">
          <Select
            value={limit.toString()}
            onValueChange={(value) => setLimit(Number(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Top 5</SelectItem>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="20">Top 20</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={minReviews.toString()}
            onValueChange={(value) => setMinReviews(Number(value))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Mín 1 review</SelectItem>
              <SelectItem value="3">Mín 3 reviews</SelectItem>
              <SelectItem value="5">Mín 5 reviews</SelectItem>
              <SelectItem value="10">Mín 10 reviews</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6">
            <span className="text-muted-foreground text-xs">Nota Média Geral</span>
            <span className="text-lg leading-none font-bold sm:text-3xl flex items-center gap-1">
              {averageRating.toFixed(1)}
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            </span>
          </div>
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
            <XAxis type="number" domain={[0, 5]} tickLine={false} axisLine={false} />
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
                    if (name === "averageRating") {
                      return `${Number(value).toFixed(1)} ⭐`
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
                            {product.reviewCount} avaliações • #{product.ratingRank}
                          </div>
                        )}
                      </div>
                    )
                  }}
                />
              }
            />
            <Bar
              dataKey="averageRating"
              fill="var(--color-averageRating)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
