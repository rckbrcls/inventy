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
import { AnalyticsRepository, type CustomerGrowth } from "@/lib/db/repositories/analytics-repository"
import { formatMonth } from "@/lib/formatters"
import { useShopIdFromRoute } from "@/hooks/use-shop"

const chartConfig = {
  cumulativeCustomers: {
    label: "Clientes Acumulados",
    color: "var(--chart-1)",
  },
  newCustomers: {
    label: "Novos Clientes",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function CustomerGrowthLineChart() {
  const shopId = useShopIdFromRoute()
  const [months, setMonths] = React.useState<number>(12)
  const [data, setData] = React.useState<CustomerGrowth[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      if (!shopId) return
      try {
        setLoading(true)
        const growthData = await AnalyticsRepository.getCustomerGrowth(shopId, months)
        setData(growthData)
      } catch (error) {
        console.error("Failed to load customer growth data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [shopId, months])

  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      month: item.month,
      newCustomers: item.newCustomers,
      cumulativeCustomers: item.cumulativeCustomers,
      growthPercentage: item.growthPercentage ?? null,
    }))
  }, [data])

  const totalCustomers = React.useMemo(
    () => chartData.length > 0 ? chartData[chartData.length - 1]?.cumulativeCustomers ?? 0 : 0,
    [chartData]
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crescimento de Clientes</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Crescimento de Clientes ao Longo do Tempo</CardTitle>
          <CardDescription>
            Evolução do número de clientes acumulados e novos clientes por mês
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
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  labelFormatter={(value) => formatMonth(value)}
                  formatter={(value, name) => {
                    if (name === "cumulativeCustomers" || name === "newCustomers") {
                      return [value.toLocaleString(), chartConfig[name].label]
                    }
                    return value
                  }}
                />
              }
            />
            <Line
              dataKey="cumulativeCustomers"
              type="monotone"
              stroke="var(--color-cumulativeCustomers)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="newCustomers"
              type="monotone"
              stroke="var(--color-newCustomers)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ChartContainer>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Total de Clientes: <span className="font-semibold">{totalCustomers.toLocaleString()}</span>
          </div>
          {chartData.length > 0 && chartData[chartData.length - 1]?.growthPercentage && (
            <div className="text-muted-foreground">
              Crescimento: <span className="font-semibold">
                {chartData[chartData.length - 1]?.growthPercentage?.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
