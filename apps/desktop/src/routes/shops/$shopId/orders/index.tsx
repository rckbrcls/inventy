import { createFileRoute } from "@tanstack/react-router"

import { OrdersTable } from "@/components/tables/orders-table"

export const Route = createFileRoute("/shops/$shopId/orders/")({
  component: OrdersRoute,
})

function OrdersRoute() {
  return <OrdersTable />
}
