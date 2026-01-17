"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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
import { AnalyticsRepository, type CumulativeRevenue } from "@/lib/db/repositories/analytics-repository"
import { formatCurrency } from "@/lib/formatters"

const chartConfig = {
  cumulativeRevenue: {
    label: "Receita Acumulada",
    color: "var(--chart-1)",
  },
  dailyRefunds: {
    label: "Devoluções",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function CumulativeRevenueAreaChart() {
  const [timeRange, setTimeRange] = React.useState<number>(90)
  const [data, setData] = React.useState<CumulativeRevenue[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const revenueData = await AnalyticsRepository.getCumulativeRevenue(timeRange)
        setData(revenueData)
      } catch (error) {
        console.error("Failed to load cumulative revenue data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [timeRange])

  const chartData = React.useMemo(() => {
    return data.map((d) => ({
      date: d.date,
      cumulativeRevenue: d.cumulativeRevenue,
      dailyRevenue: d.dailyRevenue,
      dailyRefunds: d.dailyRefunds,
    }))
  }, [data])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Receita Acumulada</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Receita Acumulada por Dia</CardTitle>
          <CardDescription>
            Mostrando receita acumulada e devoluções diárias
          </CardDescription>
        </div>
        <Select
          value={timeRange.toString()}
          onValueChange={(value) => setTimeRange(Number(value))}
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
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillCumulativeRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-cumulativeRevenue)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-cumulativeRevenue)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillDailyRefunds" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-dailyRefunds)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-dailyRefunds)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
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
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("pt-BR", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  formatter={(value, name) => {
                    if (name === "cumulativeRevenue" || name === "dailyRevenue") {
                      return formatCurrency(Number(value))
                    }
                    return value
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="dailyRefunds"
              type="natural"
              fill="url(#fillDailyRefunds)"
              stroke="var(--color-dailyRefunds)"
              stackId="a"
            />
            <Area
              dataKey="cumulativeRevenue"
              type="natural"
              fill="url(#fillCumulativeRevenue)"
              stroke="var(--color-cumulativeRevenue)"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
