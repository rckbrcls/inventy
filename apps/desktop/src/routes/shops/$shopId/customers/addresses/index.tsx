import { createFileRoute } from "@tanstack/react-router"

import { CustomerAddressesTable } from "@/components/tables/customer-addresses-table"

export const Route = createFileRoute("/shops/$shopId/customers/addresses/")({
  component: CustomerAddressesRoute,
})

function CustomerAddressesRoute() {
  return <CustomerAddressesTable />
}
