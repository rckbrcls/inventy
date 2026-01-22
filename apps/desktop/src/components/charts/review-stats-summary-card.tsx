"use client"

import * as React from "react"
import { Star, MessageSquare } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnalyticsRepository, type ReviewStatsSummary } from "@/lib/db/repositories/analytics-repository"
import { useShopIdFromRoute } from "@/hooks/use-shop"

export function ReviewStatsSummaryCard() {
  const shopId = useShopIdFromRoute()
  const [data, setData] = React.useState<ReviewStatsSummary | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      if (!shopId) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const summaryData = await AnalyticsRepository.getReviewStatsSummary(shopId)
        setData(summaryData)
      } catch (error) {
        console.error("[ReviewStatsSummaryCard] Failed to load data:", error)
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [shopId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Avaliações</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Avaliações</CardTitle>
          <CardDescription>Sem dados disponíveis</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const totalStars = data.fiveStarCount + data.fourStarCount + data.threeStarCount + data.twoStarCount + data.oneStarCount
  const positivePercentage = totalStars > 0
    ? ((data.fiveStarCount + data.fourStarCount) / totalStars) * 100
    : 0

  const getRatingLabel = (rating: number): string => {
    if (rating >= 4.5) return "Excelente"
    if (rating >= 4.0) return "Muito Bom"
    if (rating >= 3.5) return "Bom"
    if (rating >= 3.0) return "Razoável"
    if (rating >= 2.0) return "Regular"
    return "Precisa Melhorar"
  }

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return "bg-green-500"
    if (rating >= 4.0) return "bg-lime-500"
    if (rating >= 3.5) return "bg-yellow-500"
    if (rating >= 3.0) return "bg-orange-500"
    return "bg-red-500"
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Resumo de Avaliações
          </CardTitle>
          <Badge variant="outline" className={`${getRatingColor(data.averageRating)} text-white border-0`}>
            {getRatingLabel(data.averageRating)}
          </Badge>
        </div>
        <CardDescription>
          Visão geral das avaliações dos seus produtos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Rating Display */}
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-5xl font-bold">{data.averageRating.toFixed(1)}</span>
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Nota média geral
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold">{data.totalReviews}</div>
            <p className="text-xs text-muted-foreground">Total de Reviews</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{data.productsWithReviews}</div>
            <p className="text-xs text-muted-foreground">Produtos Avaliados</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{positivePercentage.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Avaliações 4-5★</p>
          </div>
        </div>

        {/* Stars Breakdown */}
        <div className="space-y-2 pt-4 border-t">
          <div className="text-sm font-medium mb-2">Distribuição por Estrelas</div>
          {[
            { stars: 5, count: data.fiveStarCount, color: "bg-green-500" },
            { stars: 4, count: data.fourStarCount, color: "bg-lime-500" },
            { stars: 3, count: data.threeStarCount, color: "bg-yellow-500" },
            { stars: 2, count: data.twoStarCount, color: "bg-orange-500" },
            { stars: 1, count: data.oneStarCount, color: "bg-red-500" },
          ].map((item) => {
            const percentage = totalStars > 0 ? (item.count / totalStars) * 100 : 0
            return (
              <div key={item.stars} className="flex items-center gap-2 text-sm">
                <span className="w-8 text-right">{item.stars}★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-right text-muted-foreground text-xs">
                  {item.count}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
