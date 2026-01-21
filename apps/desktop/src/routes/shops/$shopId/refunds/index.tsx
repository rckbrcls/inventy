import { createFileRoute } from "@tanstack/react-router"

import { RefundsTable } from "@/components/tables/refunds-table"

export const Route = createFileRoute("/shops/$shopId/refunds/")({
  component: RefundsRoute,
})

function RefundsRoute() {
  return <RefundsTable />
}
