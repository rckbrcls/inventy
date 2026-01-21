import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, XCircle } from "lucide-react"
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
import { formatCurrency, formatDateTime } from "@/lib/formatters"
import { Order, OrdersRepository } from "@/lib/db/repositories/orders-repository"
import { useNavigate } from "@tanstack/react-router"
import { useShop } from "@/hooks/use-shop"

type OrderRow = Order

const getStatusBadgeVariant = (status: string | null) => {
  switch (status) {
    case "open":
      return "default"
    case "archived":
      return "secondary"
    case "cancelled":
      return "destructive"
    default:
      return "outline"
  }
}

const getPaymentStatusBadgeVariant = (status: string | null) => {
  switch (status) {
    case "paid":
      return "default"
    case "partially_paid":
      return "secondary"
    case "unpaid":
    case "pending":
      return "outline"
    case "refunded":
    case "partially_refunded":
    case "voided":
      return "destructive"
    default:
      return "outline"
  }
}

const getFulfillmentStatusBadgeVariant = (status: string | null) => {
  switch (status) {
    case "fulfilled":
      return "default"
    case "partially_fulfilled":
    case "scheduled":
      return "secondary"
    case "unfulfilled":
      return "outline"
    case "returned":
    case "restocked":
      return "destructive"
    default:
      return "outline"
  }
}

export function OrdersTable() {
  const navigate = useNavigate()
  const { shopId } = useShop()
  const [data, setData] = React.useState<OrderRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [cancelId, setCancelId] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    if (!shopId) return

    try {
      setIsLoading(true)
      const orders = await OrdersRepository.listByShop(shopId)
      setData(orders)
    } catch (error) {
      console.error("Failed to load orders:", error)
      toast.error("Failed to load orders")
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
      await OrdersRepository.delete(deleteId)
      toast.success("Order deleted successfully")
      loadData()
    } catch (error) {
      console.error("Failed to delete order:", error)
      toast.error("Failed to delete order")
    } finally {
      setDeleteId(null)
    }
  }

  const handleCancel = async () => {
    if (!cancelId) return

    try {
      await OrdersRepository.cancel(cancelId)
      toast.success("Order cancelled successfully")
      loadData()
    } catch (error) {
      console.error("Failed to cancel order:", error)
      toast.error("Failed to cancel order")
    } finally {
      setCancelId(null)
    }
  }

  const handleEdit = (order: Order) => {
    if (!shopId) return
    navigate({
      to: "/shops/$shopId/orders/$orderId/edit",
      params: { shopId, orderId: order.id },
    })
  }

  const columns: ColumnDef<OrderRow>[] = React.useMemo(
    () => [
      {
        accessorKey: "order_number",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Order #
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const orderNumber = row.getValue("order_number") as number | null
          return (
            <div className="font-mono text-sm">
              #{orderNumber || row.original.id.substring(0, 8)}
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string | null
          return (
            <Badge variant={getStatusBadgeVariant(status)}>
              {status || "-"}
            </Badge>
          )
        },
      },
      {
        accessorKey: "payment_status",
        header: "Payment",
        cell: ({ row }) => {
          const status = row.getValue("payment_status") as string | null
          return (
            <Badge variant={getPaymentStatusBadgeVariant(status)}>
              {status || "-"}
            </Badge>
          )
        },
      },
      {
        accessorKey: "fulfillment_status",
        header: "Fulfillment",
        cell: ({ row }) => {
          const status = row.getValue("fulfillment_status") as string | null
          return (
            <Badge variant={getFulfillmentStatusBadgeVariant(status)}>
              {status || "-"}
            </Badge>
          )
        },
      },
      {
        accessorKey: "channel",
        header: "Channel",
        cell: ({ row }) => row.getValue("channel") || "-",
      },
      {
        accessorKey: "subtotal_price",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Subtotal
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => formatCurrency(row.getValue("subtotal_price")),
      },
      {
        accessorKey: "total_price",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(row.getValue("total_price"))}
          </span>
        ),
      },
      {
        accessorKey: "currency",
        header: "Currency",
        cell: ({ row }) => row.getValue("currency") || "BRL",
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
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const order = row.original
          const isCancelled = order.status === "cancelled"

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
                  onClick={() => navigator.clipboard.writeText(order.id)}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(order)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {!isCancelled && (
                  <DropdownMenuItem
                    className="text-orange-600"
                    onClick={() => setCancelId(order.id)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Order
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteId(order.id)}
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
        <div className="text-muted-foreground">Loading orders...</div>
      </div>
    )
  }

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        filterColumnId="order_number"
        filterPlaceholder="Filter orders..."
        emptyMessage="No orders found."
        action={{
          label: "New Order",
          to: shopId ? `/shops/${shopId}/orders/new` : "/orders/new",
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Order Confirmation Dialog */}
      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This will update the order
              status and cannot be easily reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-orange-600 hover:bg-orange-700">
              Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
