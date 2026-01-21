import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/tables/data-table"
import { formatDateTime } from "@/lib/formatters"
import {
  InventoryMovement,
  InventoryMovementsRepository,
} from "@/lib/db/repositories/inventory-movements-repository"
import {
  InventoryLevel,
  InventoryLevelsRepository,
} from "@/lib/db/repositories/inventory-levels-repository"
import { Product, ProductsRepository } from "@/lib/db/repositories/products-repository"
import { Location, LocationsRepository } from "@/lib/db/repositories/locations-repository"

type MovementRow = InventoryMovement & {
  product_name?: string
  location_name?: string
}

export function MovementsTable() {
  const [data, setData] = React.useState<MovementRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const [movements, inventoryLevels, products, locations] = await Promise.all([
        InventoryMovementsRepository.list(),
        InventoryLevelsRepository.list(),
        ProductsRepository.list(),
        LocationsRepository.list(),
      ])

      const levelMap = new Map(inventoryLevels.map((l) => [l.id, l]))
      const productMap = new Map(products.map((p) => [p.id, p]))
      const locationMap = new Map(locations.map((l) => [l.id, l]))

      const enrichedData = movements.map((movement) => {
        const level = movement.inventory_level_id
          ? levelMap.get(movement.inventory_level_id)
          : null
        const product = level ? productMap.get(level.product_id) : null
        const location = level ? locationMap.get(level.location_id) : null

        return {
          ...movement,
          product_name: product?.name || "Unknown Product",
          location_name: location?.name || "Unknown Location",
        }
      })

      setData(enrichedData)
    } catch (error) {
      console.error("Failed to load inventory movements:", error)
      toast.error("Failed to load inventory movements")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const columns: ColumnDef<MovementRow>[] = React.useMemo(
    () => [
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as string | null
          const isIn = type === "in"
          return (
            <div className="flex items-center gap-2">
              {isIn ? (
                <ArrowDownLeft className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowUpRight className="h-4 w-4 text-red-500" />
              )}
              <Badge variant={isIn ? "default" : "destructive"}>
                {type || "-"}
              </Badge>
            </div>
          )
        },
      },
      {
        accessorKey: "quantity",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Quantity
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const quantity = row.getValue("quantity") as number
          const type = row.original.type
          const isIn = type === "in"
          return (
            <span className={isIn ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
              {isIn ? "+" : "-"}{quantity}
            </span>
          )
        },
      },
      {
        accessorKey: "product_name",
        header: "Product",
        cell: ({ row }) => row.getValue("product_name"),
      },
      {
        accessorKey: "location_name",
        header: "Location",
        cell: ({ row }) => row.getValue("location_name"),
      },
      {
        accessorKey: "previous_balance",
        header: "Previous",
        cell: ({ row }) => row.getValue("previous_balance") ?? "-",
      },
      {
        accessorKey: "new_balance",
        header: "New Balance",
        cell: ({ row }) => {
          const newBalance = row.getValue("new_balance") as number | null
          return newBalance !== null ? (
            <span className="font-medium">{newBalance}</span>
          ) : (
            "-"
          )
        },
      },
      {
        accessorKey: "transaction_id",
        header: "Transaction",
        cell: ({ row }) => {
          const transactionId = row.getValue("transaction_id") as string | null
          return transactionId ? (
            <span className="font-mono text-sm">{transactionId.substring(0, 8)}...</span>
          ) : (
            <Badge variant="outline">Manual</Badge>
          )
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => formatDateTime(row.getValue("created_at")),
      },
    ],
    []
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading movements...</div>
      </div>
    )
  }

  return (
    <DataTable
      data={data}
      columns={columns}
      filterColumnId="product_name"
      filterPlaceholder="Filter movements..."
      emptyMessage="No movements found."
      action={{ label: "Adjust Stock", to: "/inventory/new" }}
    />
  )
}
