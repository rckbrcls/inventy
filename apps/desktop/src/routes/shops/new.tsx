import { createFileRoute } from "@tanstack/react-router"
import { CreateShopForm } from "@/components/shops/create-shop-form"

export const Route = createFileRoute("/shops/new")({
  component: NewShopRoute,
})

function NewShopRoute() {
  return <CreateShopForm />
}
