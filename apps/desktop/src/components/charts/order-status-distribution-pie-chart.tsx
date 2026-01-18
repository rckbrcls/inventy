"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"

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
import { AnalyticsRepository, type OrderStatusDistribution } from "@/lib/db/repositories/analytics-repository"
import { formatCurrency } from "@/lib/formatters"

const paymentStatusColors: Record<string, string> = {
  paid: "var(--chart-1)",
  pending: "var(--chart-3)",
  refunded: "var(--chart-2)",
  cancelled: "var(--chart-4)",
}

const paymentStatusLabels: Record<string, string> = {
  paid: "Pago",
  pending: "Pendente",
  refunded: "Reembolsado",
  cancelled: "Cancelado",
}

export function OrderStatusDistributionPieChart() {
  const [days, setDays] = React.useState<number>(30)
  const [data, setData] = React.useState<OrderStatusDistribution[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const distributionData = await AnalyticsRepository.getOrderStatusDistribution(days)
        setData(distributionData)
      } catch (error) {
        console.error("Failed to load order status distribution data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [days])

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {}
    data.forEach((item) => {
      const color = paymentStatusColors[item.paymentStatus] || "var(--chart-1)"
      config[item.paymentStatus] = {
        label: paymentStatusLabels[item.paymentStatus] || item.paymentStatus,
        color,
      }
    })
    return config
  }, [data])

  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      paymentStatus: item.paymentStatus,
      orderCount: item.orderCount,
      totalRevenue: item.totalRevenue,
      orderPercentage: item.orderPercentage,
      revenuePercentage: item.revenuePercentage,
      fill: paymentStatusColors[item.paymentStatus] || "var(--chart-1)",
      label: paymentStatusLabels[item.paymentStatus] || item.paymentStatus,
    }))
  }, [data])

  const totalOrders = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.orderCount, 0),
    [chartData]
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Pedidos por Status</CardTitle>
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
            <CardTitle>Distribuição de Pedidos por Status</CardTitle>
            <CardDescription>
              Distribuição de pedidos por status de pagamento
            </CardDescription>
          </div>
          <Select
            value={days.toString()}
            onValueChange={(value) => setDays(Number(value))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, props) => {
                    const item = props.payload as typeof chartData[0]
                    return [
                      <div key="info" className="flex flex-col gap-1">
                        <div className="font-semibold">
                          {item.orderCount} pedidos
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.orderPercentage.toFixed(1)}% dos pedidos
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(item.totalRevenue)} ({item.revenuePercentage.toFixed(1)}% da receita)
                        </div>
                      </div>,
                      item.label,
                    ]
                  }}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="orderCount"
              label={(entry) => `${entry.orderPercentage.toFixed(1)}%`}
              nameKey="label"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardContent className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Total: {totalOrders} pedidos
        </div>
        <div className="text-muted-foreground leading-none">
          {data.length} status diferentes
        </div>
      </CardContent>
    </Card>
  )
}
