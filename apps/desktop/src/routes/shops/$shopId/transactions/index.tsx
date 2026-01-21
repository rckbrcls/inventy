import { createFileRoute } from "@tanstack/react-router"

import { TransactionsTable } from "@/components/tables/transactions-table"

export const Route = createFileRoute("/shops/$shopId/transactions/")({
  component: TransactionsRoute,
})

function TransactionsRoute() {
  return <TransactionsTable />
}
