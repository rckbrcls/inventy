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
import { AnalyticsRepository, type InventoryCapacity } from "@/lib/db/repositories/analytics-repository"
import { useShopIdFromRoute } from "@/hooks/use-shop"

const chartConfig = {
  usagePercentage: {
    label: "Uso de Capacidade",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function InventoryCapacityRadialChart() {
  const shopId = useShopIdFromRoute()
  const [capacityLimit, setCapacityLimit] = React.useState<number>(10000)
  const [data, setData] = React.useState<InventoryCapacity | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      if (!shopId) return
      try {
        setLoading(true)
        const capacityData = await AnalyticsRepository.getInventoryCapacity(shopId, capacityLimit)
        setData(capacityData)
      } catch (error) {
        console.error("Failed to load inventory capacity data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [shopId, capacityLimit])

  const getCapacityColor = () => {
    if (!data) return "var(--chart-1)"
    if (data.usagePercentage < 50) return "var(--chart-1)" // Verde (capacidade ok)
    if (data.usagePercentage < 80) return "var(--chart-3)" // Amarelo (atenção)
    return "var(--chart-2)" // Vermelho (próximo do limite)
  }

  const getCapacityLabel = () => {
    if (!data) return "Normal"
    if (data.usagePercentage < 50) return "Normal"
    if (data.usagePercentage < 80) return "Atenção"
    return "Crítico"
  }

  const chartData = React.useMemo(() => {
    if (!data) return []
    return [
      {
        usagePercentage: data.usagePercentage,
        fill: getCapacityColor(),
      },
    ]
  }, [data])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Capacidade de Estoque</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Capacidade de Estoque</CardTitle>
          <CardDescription>Nenhum dado disponível</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <div className="flex w-full items-center justify-between">
          <div>
            <CardTitle>Percentual de Estoque Ocupado</CardTitle>
            <CardDescription>
              Uso da capacidade de estoque disponível
            </CardDescription>
          </div>
          <Select
            value={capacityLimit.toString()}
            onValueChange={(value) => setCapacityLimit(Number(value))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5000">5k unidades</SelectItem>
              <SelectItem value="10000">10k unidades</SelectItem>
              <SelectItem value="20000">20k unidades</SelectItem>
              <SelectItem value="50000">50k unidades</SelectItem>
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
              dataKey="usagePercentage"
              background
              cornerRadius={10}
              fill={getCapacityColor()}
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
                          {data.usagePercentage.toFixed(0)}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          {getCapacityLabel()}
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
            <div className="text-muted-foreground text-xs">Estoque Atual</div>
            <div className="font-semibold">{data.currentStock.toLocaleString()}</div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <div className="text-muted-foreground text-xs">Capacidade Máxima</div>
            <div className="font-semibold">{data.capacityLimit.toLocaleString()}</div>
          </div>
        </div>
        <div className="text-muted-foreground leading-none">
          {data.capacityLimit - data.currentStock} unidades disponíveis
        </div>
      </CardFooter>
    </Card>
  )
}
