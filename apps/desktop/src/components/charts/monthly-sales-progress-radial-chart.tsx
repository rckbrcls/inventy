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
import { AnalyticsRepository, type MonthlySalesProgress } from "@/lib/db/repositories/analytics-repository"
import { formatCurrency } from "@/lib/formatters"
import { useShopIdFromRoute } from "@/hooks/use-shop"

const chartConfig = {
  progress: {
    label: "Progresso",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function MonthlySalesProgressRadialChart() {
  const shopId = useShopIdFromRoute()
  const [targetRevenue, setTargetRevenue] = React.useState<number>(100000)
  const [data, setData] = React.useState<MonthlySalesProgress | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      if (!shopId) return
      try {
        setLoading(true)
        const progressData = await AnalyticsRepository.getMonthlySalesProgress(shopId, targetRevenue)
        setData(progressData)
      } catch (error) {
        console.error("Failed to load monthly sales progress data", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [shopId, targetRevenue])

  const progressPercentage = React.useMemo(() => {
    if (!data) return 0
    return Math.min(data.progressPercentage, 100)
  }, [data])

  const getProgressColor = () => {
    if (progressPercentage < 50) return "var(--chart-2)" // Vermelho
    if (progressPercentage < 80) return "var(--chart-3)" // Amarelo
    if (progressPercentage < 100) return "var(--chart-1)" // Verde
    return "var(--chart-4)" // Azul (meta superada)
  }

  const chartData = React.useMemo(() => {
    if (!data) return []
    return [
      {
        progress: progressPercentage,
        fill: getProgressColor(),
      },
    ]
  }, [data, progressPercentage])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progresso de Meta de Vendas Mensal</CardTitle>
          <CardDescription>Carregando dados...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progresso de Meta de Vendas Mensal</CardTitle>
          <CardDescription>Nenhum dado disponível</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const isOverTarget = data.progressPercentage > 100

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <div className="flex w-full items-center justify-between">
          <div>
            <CardTitle>Progresso de Meta de Vendas Mensal</CardTitle>
            <CardDescription>
              Progresso em relação à meta de receita mensal
            </CardDescription>
          </div>
          <Select
            value={targetRevenue.toString()}
            onValueChange={(value) => setTargetRevenue(Number(value))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50000">R$ 50k</SelectItem>
              <SelectItem value="100000">R$ 100k</SelectItem>
              <SelectItem value="200000">R$ 200k</SelectItem>
              <SelectItem value="500000">R$ 500k</SelectItem>
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
              dataKey="progress"
              background
              cornerRadius={10}
              fill={getProgressColor()}
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
                          {progressPercentage.toFixed(0)}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          {isOverTarget ? "Meta Superada!" : "da Meta"}
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
            <div className="text-muted-foreground text-xs">Receita Atual</div>
            <div className="font-semibold">{formatCurrency(data.currentRevenue)}</div>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <div className="text-muted-foreground text-xs">Meta</div>
            <div className="font-semibold">{formatCurrency(data.targetRevenue)}</div>
          </div>
        </div>
        {data.remaining > 0 && (
          <div className="text-muted-foreground leading-none">
            Faltam {formatCurrency(data.remaining)} para atingir a meta
          </div>
        )}
        {isOverTarget && (
          <div className="text-green-600 leading-none font-medium">
            Meta superada em {formatCurrency(data.currentRevenue - data.targetRevenue)}!
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
