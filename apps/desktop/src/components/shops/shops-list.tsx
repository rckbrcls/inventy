import * as React from "react"
import { Link } from "@tanstack/react-router"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ShopCard } from "./shop-card"
import { useShops } from "@/hooks/use-shops"
import { useShopStore } from "@/stores/shop-store"
import { Skeleton } from "@/components/ui/skeleton"

export function ShopsList() {
  const { shops } = useShops()
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      await useShopStore.getState().loadShops()
      setIsLoading(false)
    }
    load()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    )
  }

  if (shops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold">No shops found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get started by creating your first shop.
        </p>
        <Button asChild>
          <Link to="/shops/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Shop
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Shops</h2>
          <p className="text-sm text-muted-foreground">
            Manage your shops and switch between them
          </p>
        </div>
        <Button asChild>
          <Link to="/shops/new">
            <Plus className="mr-2 h-4 w-4" />
            New Shop
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {shops.map((shop) => (
          <ShopCard
            key={shop.id}
            shop={shop}
          />
        ))}
      </div>
    </div>
  )
}
