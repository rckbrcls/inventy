import { createFileRoute } from "@tanstack/react-router"

import { BrandsTable } from "@/components/tables/brands-table"

export const Route = createFileRoute("/shops/$shopId/brands/")({
  component: BrandsRoute,
})

function BrandsRoute() {
  return <BrandsTable />
}
