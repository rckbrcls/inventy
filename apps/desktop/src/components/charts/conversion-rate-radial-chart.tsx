"use client"

import * as React from "react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AnalyticsRepository, type ConversionRate } from "@/lib/db/repositories/analytics-repository"

const chartConfig = {
  conversionRate: {
    label: "Taxa de Conversão",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ConversionRateRadialChart() {
  const [days, setDays] = React.useState<number>(30)
  const [data, setData] = React.useState<ConversionRate | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const conversionData = await AnalyticsRepository.getConversionRate(days)
        setData(conversionData)
      } catch (error) {
        console.error("Failed to load conversion rate data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [days])

  const getConversionColor = () => {
    if (!data) return "var(--chart-1)"
    if (data.conversionRate < 10) return "var(--chart-2)" // Vermelho (baixa conversão)
    if (data.conversionRate < 25) return "var(--chart-3)" // Amarelo (média conversão)
    return "var(--chart-1)" // Verde (boa conversão)
  }

  const chartData = React.useMemo(() => {
    if (!data) return []
    return [
      {
        conversionRate: data.conversionRate,
        fill: getConversionColor(),
      },
    ]
  }, [data])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Conversão</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Conversão</CardTitle>
          <CardDescription>Nenhum dado disponível</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getConversionLabel = () => {
    if (data.conversionRate < 10) return "Baixa"
    if (data.conversionRate < 25) return "Média"
    return "Boa"
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <div className="flex w-full items-center justify-between">
          <div>
            <CardTitle>Taxa de Conversão</CardTitle>
            <CardDescription>
              Taxa de conversão de carrinhos para pedidos
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
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={-270}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar
              dataKey="conversionRate"
              background
              cornerRadius={10}
              fill={getConversionColor()}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {data.conversionRate.toFixed(1)}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          {getConversionLabel()}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col gap-1">
            <div className="text-muted-foreground text-xs">Checkouts</div>
            <div className="font-semibold">{data.totalCheckouts.toLocaleString()}</div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <div className="text-muted-foreground text-xs">Pedidos Completados</div>
            <div className="font-semibold">{data.completedOrders.toLocaleString()}</div>
          </div>
        </div>
        <div className="text-muted-foreground leading-none">
          {data.totalCheckouts - data.completedOrders} carrinhos abandonados
        </div>
      </CardFooter>
    </Card>
  )
}
