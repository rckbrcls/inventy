import { createFileRoute } from "@tanstack/react-router"

import { CustomerGroupMembershipsTable } from "@/components/tables/customer-group-memberships-table"

export const Route = createFileRoute("/customers/groups/")({
  component: CustomerGroupsRoute,
})

function CustomerGroupsRoute() {
  return <CustomerGroupMembershipsTable />
}
