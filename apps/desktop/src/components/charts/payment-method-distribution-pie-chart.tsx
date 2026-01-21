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
import { AnalyticsRepository, type PaymentMethodDistribution } from "@/lib/db/repositories/analytics-repository"
import { formatCurrency } from "@/lib/formatters"
import { useShopIdFromRoute } from "@/hooks/use-shop"

const paymentMethodColors: Record<string, string> = {
  pix: "var(--chart-1)",
  credit_card: "var(--chart-2)",
  debit_card: "var(--chart-3)",
  cash: "var(--chart-4)",
  bank_transfer: "var(--chart-5)",
}

export function PaymentMethodDistributionPieChart() {
  const shopId = useShopIdFromRoute()
  const [days, setDays] = React.useState<number>(30)
  const [data, setData] = React.useState<PaymentMethodDistribution[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      if (!shopId) return
      try {
        setLoading(true)
        const distributionData = await AnalyticsRepository.getPaymentMethodDistribution(shopId, days)
        setData(distributionData)
      } catch (error) {
        console.error("Failed to load payment method distribution data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [shopId, days])

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {}
    data.forEach((item) => {
      const color = paymentMethodColors[item.paymentMethod] || "var(--chart-1)"
      config[item.paymentMethod] = {
        label: item.paymentMethod,
        color,
      }
    })
    return config
  }, [data])

  const chartData = React.useMemo(() => {
    return data.map((item) => ({
      paymentMethod: item.paymentMethod,
      totalAmount: item.totalAmount,
      transactionCount: item.transactionCount,
      percentage: item.percentage,
      fill: paymentMethodColors[item.paymentMethod] || "var(--chart-1)",
    }))
  }, [data])

  const totalAmount = React.useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.totalAmount, 0),
    [chartData]
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Método de Pagamento</CardTitle>
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
            <CardTitle>Distribuição por Método de Pagamento</CardTitle>
            <CardDescription>
              Distribuição de vendas por método de pagamento
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
                      <div key="amount" className="flex flex-col gap-1">
                        <div className="font-semibold">
                          {formatCurrency(item.totalAmount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {item.percentage.toFixed(1)}% • {item.transactionCount} transações
                        </div>
                      </div>,
                      item.paymentMethod,
                    ]
                  }}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="totalAmount"
              label={(entry) => `${entry.percentage.toFixed(1)}%`}
              nameKey="paymentMethod"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardContent className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Total: {formatCurrency(totalAmount)}
        </div>
        <div className="text-muted-foreground leading-none">
          {data.length} métodos de pagamento
        </div>
      </CardContent>
    </Card>
  )
}
