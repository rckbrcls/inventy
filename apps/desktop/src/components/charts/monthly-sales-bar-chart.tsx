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
import { AnalyticsRepository, type MonthlySales } from "@/lib/db/repositories/analytics-repository"
import { formatCurrency, formatMonth } from "@/lib/formatters"

const chartConfig = {
  monthlyRevenue: {
    label: "Receita Mensal",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function MonthlySalesBarChart() {
  const [months, setMonths] = React.useState<number>(12)
  const [data, setData] = React.useState<MonthlySales[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const salesData = await AnalyticsRepository.getMonthlySales(months)
        setData(salesData)
      } catch (error) {
        console.error("Failed to load monthly sales data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [months])

  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      month: item.month,
      monthlyRevenue: item.monthlyRevenue,
      orderCount: item.orderCount,
      avgOrderValue: item.avgOrderValue,
    }))
  }, [data])

  const totalRevenue = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.monthlyRevenue, 0),
    [chartData]
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendas Mensais</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="py-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Vendas Mensais</CardTitle>
          <CardDescription>
            Receita mensal dos últimos {months} meses
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
                  labelFormatter={(value) => formatMonth(value)}
                  formatter={(value, name) => {
                    if (name === "monthlyRevenue" || name === "avgOrderValue") {
                      return formatCurrency(Number(value))
                    }
                    return value
                  }}
                />
              }
            />
            <Bar
              dataKey="monthlyRevenue"
              fill="var(--color-monthlyRevenue)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Total: {formatCurrency(totalRevenue)}
          </div>
          <div className="text-muted-foreground">
            {chartData.length} meses
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
