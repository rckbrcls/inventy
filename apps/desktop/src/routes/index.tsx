import { createFileRoute } from "@tanstack/react-router"
import { ShopsList } from "@/components/shops/shops-list"

export const Route = createFileRoute("/")({
  component: ShopsListRoute,
})

function ShopsListRoute() {
  return <ShopsList />
}
