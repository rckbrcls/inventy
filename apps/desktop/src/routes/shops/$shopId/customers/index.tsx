import { createFileRoute } from "@tanstack/react-router"

import { CustomersTable } from "@/components/tables/customers-table"

export const Route = createFileRoute("/shops/$shopId/customers/")({
  component: CustomersRoute,
})

function CustomersRoute() {
  return <CustomersTable />
}
