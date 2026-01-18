import { createFileRoute } from "@tanstack/react-router"

import { PaymentsTable } from "@/components/tables/payments-table"

export const Route = createFileRoute("/shops/$shopId/payments/")({
  component: PaymentsRoute,
})

function PaymentsRoute() {
  return <PaymentsTable />
}
