import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DataTable } from "@/components/tables/data-table"
import { formatDateTime } from "@/lib/formatters"
import {
  InventoryLevelsRepository,
} from "@/lib/db/repositories/inventory-levels-repository"
import type { InventoryLevel } from "@uru/types"
import { LocationsRepository } from "@/lib/db/repositories/locations-repository"
import { ProductsRepository } from "@/lib/db/repositories/products-repository"
import { useNavigate } from "@tanstack/react-router"
import { useShop } from "@/hooks/use-shop"

type InventoryLevelRow = InventoryLevel & {
  product_name?: string
  location_name?: string
}

const getStockStatusBadgeVariant = (status: string | null) => {
  switch (status) {
    case "sellable":
      return "default"
    case "damaged":
      return "destructive"
    case "quarantine":
      return "secondary"
    case "expired":
      return "destructive"
    default:
      return "outline"
  }
}

export function InventoryTable() {
  const navigate = useNavigate()
  const { shopId } = useShop()
  const [data, setData] = React.useState<InventoryLevelRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    if (!shopId) return

    try {
      setIsLoading(true)
      const [inventoryLevels, products, locations] = await Promise.all([
        InventoryLevelsRepository.listByShop(shopId),
        ProductsRepository.listFiltered({ shop_id: shopId }),
        LocationsRepository.list(),
      ])

      const prodMap = new Map(products.map((p) => [p.id, p]))
      const locMap = new Map(locations.map((l) => [l.id, l]))

      const enrichedData = inventoryLevels.map((level) => ({
        ...level,
        product_name: prodMap.get(level.product_id)?.name || level.product_id,
        location_name: locMap.get(level.location_id)?.name || level.location_id,
      }))

      setData(enrichedData)
    } catch (error) {
      console.error("Failed to load inventory levels:", error)
      toast.error("Failed to load inventory levels")
    } finally {
      setIsLoading(false)
    }
  }, [shopId])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await InventoryLevelsRepository.delete(deleteId)
      toast.success("Inventory level deleted successfully")
      loadData()
    } catch (error) {
      console.error("Failed to delete inventory level:", error)
      toast.error("Failed to delete inventory level")
    } finally {
      setDeleteId(null)
    }
  }

  const handleEdit = (item: InventoryLevel) => {
    if (!shopId) return
    navigate({
      to: "/shops/$shopId/inventory/$inventoryLevelId/edit",
      params: { shopId, inventoryLevelId: item.id },
    })
  }

  const columns: ColumnDef<InventoryLevelRow>[] = React.useMemo(
    () => [
      {
        accessorKey: "product_name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Product
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("product_name")}</div>
        ),
      },
      {
        accessorKey: "location_name",
        header: "Location",
        cell: ({ row }) => row.getValue("location_name"),
      },
      {
        accessorKey: "quantity_on_hand",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            On Hand
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const quantity = row.getValue("quantity_on_hand") as number
          return <span className="font-medium">{quantity}</span>
        },
      },
      {
        accessorKey: "quantity_reserved",
        header: "Reserved",
        cell: ({ row }) => row.getValue("quantity_reserved"),
      },
      {
        id: "available",
        header: "Available",
        cell: ({ row }) => {
          const onHand = row.original.quantity_on_hand
          const reserved = row.original.quantity_reserved
          const available = onHand - reserved
          return (
            <Badge variant={available > 0 ? "default" : "destructive"}>
              {available}
            </Badge>
          )
        },
      },
      {
        accessorKey: "stock_status",
        header: "Stock Status",
        cell: ({ row }) => {
          const status = row.getValue("stock_status") as string | null
          return (
            <Badge variant={getStockStatusBadgeVariant(status)}>
              {status || "sellable"}
            </Badge>
          )
        },
      },
      {
        accessorKey: "batch_number",
        header: "Batch",
        cell: ({ row }) => row.getValue("batch_number") || "-",
      },
      {
        accessorKey: "serial_number",
        header: "Serial",
        cell: ({ row }) => row.getValue("serial_number") || "-",
      },
      {
        accessorKey: "aisle_bin_slot",
        header: "Location Slot",
        cell: ({ row }) => row.getValue("aisle_bin_slot") || "-",
      },
      {
        accessorKey: "expiry_date",
        header: "Expiry",
        cell: ({ row }) => {
          const date = row.getValue("expiry_date") as string | null
          if (!date) return "-"
          return new Date(date).toLocaleDateString()
        },
      },
      {
        accessorKey: "last_counted_at",
        header: "Last Counted",
        cell: ({ row }) => formatDateTime(row.getValue("last_counted_at")),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(item.id)}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(item)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteId(item.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [shopId]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading inventory...</div>
      </div>
    )
  }

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        filterColumnId="product_name"
        filterPlaceholder="Filter inventory..."
        emptyMessage="No inventory levels found."
        action={{
          label: "Add Inventory Level",
          to: `/shops/${shopId}/inventory/new`,
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              inventory level record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
