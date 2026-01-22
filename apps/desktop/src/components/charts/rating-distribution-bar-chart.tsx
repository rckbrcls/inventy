"use client"

import * as React from "react"
import { Bar, BarChart, XAxis, YAxis, Cell } from "recharts"
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
import { AnalyticsRepository, type RatingDistribution } from "@/lib/db/repositories/analytics-repository"
import { useShopIdFromRoute } from "@/hooks/use-shop"

const chartConfig = {
  count: {
    label: "Avaliações",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const STAR_COLORS = {
  5: "#22c55e", // green-500
  4: "#84cc16", // lime-500
  3: "#eab308", // yellow-500
  2: "#f97316", // orange-500
  1: "#ef4444", // red-500
}

export function RatingDistributionBarChart() {
  const shopId = useShopIdFromRoute()
  const [data, setData] = React.useState<RatingDistribution[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      if (!shopId) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const distributionData = await AnalyticsRepository.getRatingDistribution(shopId)
        setData(distributionData)
      } catch (error) {
        console.error("[RatingDistributionBarChart] Failed to load data:", error)
        setData([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [shopId])

  const chartData = React.useMemo(() => {
    // Ensure we have all 5 ratings, even if some are zero
    const fullData = [5, 4, 3, 2, 1].map((rating) => {
      const existing = data.find((d) => d.rating === rating)
      return {
        rating: `${rating} ⭐`,
        ratingNum: rating,
        count: existing?.count ?? 0,
        percentage: existing?.percentage ?? 0,
      }
    })
    return fullData
  }, [data])

  const totalReviews = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0)
  }, [chartData])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Avaliações</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Distribuição de Avaliações
        </CardTitle>
        <CardDescription>
          {totalReviews} avaliações no total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[200px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 0,
              right: 40,
              top: 0,
              bottom: 0,
            }}
          >
            <XAxis type="number" hide />
            <YAxis
              dataKey="rating"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              width={50}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[160px]"
                  formatter={(value, _name, item) => {
                    const percentage = item.payload.percentage
                    return `${value} (${percentage.toFixed(1)}%)`
                  }}
                />
              }
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {chartData.map((entry) => (
                <Cell
                  key={`cell-${entry.ratingNum}`}
                  fill={STAR_COLORS[entry.ratingNum as keyof typeof STAR_COLORS]}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="mt-4 space-y-1">
          {chartData.map((item) => (
            <div key={item.ratingNum} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: STAR_COLORS[item.ratingNum as keyof typeof STAR_COLORS] }}
                />
                <span>{item.ratingNum} estrela{item.ratingNum > 1 ? "s" : ""}</span>
              </div>
              <span className="text-muted-foreground">
                {item.count} ({item.percentage.toFixed(0)}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
