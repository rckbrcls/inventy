"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

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
import { AnalyticsRepository, type DailySalesTrend } from "@/lib/db/repositories/analytics-repository"
import { formatCurrency } from "@/lib/formatters"

const chartConfig = {
  dailyRevenue: {
    label: "Receita Diária",
    color: "var(--chart-1)",
  },
  movingAvg7dRevenue: {
    label: "Média Móvel 7 dias",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function DailySalesTrendLineChart() {
  const [days, setDays] = React.useState<number>(90)
  const [data, setData] = React.useState<DailySalesTrend[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const trendData = await AnalyticsRepository.getDailySalesTrend(days)
        setData(trendData)
      } catch (error) {
        console.error("Failed to load daily sales trend data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [days])

  const chartData = React.useMemo(() => {
    return data.map((d) => ({
      date: d.date,
      dailyRevenue: d.dailyRevenue,
      dailyOrders: d.dailyOrders,
      movingAvg7dRevenue: d.movingAvg7dRevenue ?? null,
      movingAvg7dOrders: d.movingAvg7dOrders ?? null,
    }))
  }, [data])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Vendas Diárias</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Tendência de Vendas Diárias</CardTitle>
          <CardDescription>
            Receita diária com média móvel de 7 dias
          </CardDescription>
        </div>
        <Select
          value={days.toString()}
          onValueChange={(value) => setDays(Number(value))}
        >
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Últimos 90 dias" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90" className="rounded-lg">
              Últimos 90 dias
            </SelectItem>
            <SelectItem value="30" className="rounded-lg">
              Últimos 30 dias
            </SelectItem>
            <SelectItem value="7" className="rounded-lg">
              Últimos 7 dias
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <LineChart
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
                return date.toLocaleDateString("pt-BR", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("pt-BR", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  formatter={(value, name) => {
                    if (name === "dailyRevenue" || name === "movingAvg7dRevenue") {
                      return formatCurrency(Number(value))
                    }
                    return value
                  }}
                />
              }
            />
            <Line
              dataKey="dailyRevenue"
              type="monotone"
              stroke="var(--color-dailyRevenue)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="movingAvg7dRevenue"
              type="monotone"
              stroke="var(--color-movingAvg7dRevenue)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
