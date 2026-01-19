"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

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
import { AnalyticsRepository, type AverageOrderValue } from "@/lib/db/repositories/analytics-repository"
import { formatCurrency, formatMonth } from "@/lib/formatters"
import { useShopIdFromRoute } from "@/hooks/use-shop"

const chartConfig = {
  avgOrderValue: {
    label: "Ticket Médio",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function AverageOrderValueLineChart() {
  const shopId = useShopIdFromRoute()
  const [months, setMonths] = React.useState<number>(12)
  const [data, setData] = React.useState<AverageOrderValue[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      if (!shopId) return
      try {
        setLoading(true)
        const avgData = await AnalyticsRepository.getAverageOrderValue(shopId, months)
        setData(avgData)
      } catch (error) {
        console.error("Failed to load average order value data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [shopId, months])

  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      month: item.month,
      avgOrderValue: item.avgOrderValue,
      orderCount: item.orderCount,
      avgChangePercentage: item.avgChangePercentage ?? null,
    }))
  }, [data])

  const currentAvg = React.useMemo(
    () => chartData.length > 0 ? chartData[chartData.length - 1]?.avgOrderValue ?? 0 : 0,
    [chartData]
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ticket Médio</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Ticket Médio ao Longo do Tempo</CardTitle>
          <CardDescription>
            Evolução do valor médio dos pedidos por mês
          </CardDescription>
        </div>
        <Select
          value={months.toString()}
          onValueChange={(value) => setMonths(Number(value))}
        >
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select months"
          >
            <SelectValue placeholder="12 meses" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="6" className="rounded-lg">
              Últimos 6 meses
            </SelectItem>
            <SelectItem value="12" className="rounded-lg">
              Últimos 12 meses
            </SelectItem>
            <SelectItem value="24" className="rounded-lg">
              Últimos 24 meses
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
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatMonth(value)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
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
                  labelFormatter={(value) => formatMonth(value)}
                  formatter={(value, name) => {
                    if (name === "avgOrderValue") {
                      return formatCurrency(Number(value))
                    }
                    return value
                  }}
                />
              }
            />
            <Line
              dataKey="avgOrderValue"
              type="monotone"
              stroke="var(--color-avgOrderValue)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Ticket Médio Atual: <span className="font-semibold">{formatCurrency(currentAvg)}</span>
          </div>
          {chartData.length > 0 && chartData[chartData.length - 1]?.avgChangePercentage && (
            <div className={`font-semibold ${
              (chartData[chartData.length - 1]?.avgChangePercentage ?? 0) >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}>
              {chartData[chartData.length - 1]?.avgChangePercentage && chartData[chartData.length - 1]!.avgChangePercentage! >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(chartData[chartData.length - 1]?.avgChangePercentage ?? 0).toFixed(1)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
