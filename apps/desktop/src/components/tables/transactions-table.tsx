import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, XCircle, CheckCircle } from "lucide-react"
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
import { Transaction, TransactionsRepository } from "@/lib/db/repositories/transactions-repository"
import { useNavigate } from "@tanstack/react-router"

type TransactionRow = Transaction

const getTypeBadgeVariant = (type: string | null) => {
  switch (type) {
    case "sale":
      return "default"
    case "purchase":
      return "secondary"
    case "transfer":
      return "outline"
    case "return":
      return "destructive"
    case "adjustment":
      return "outline"
    default:
      return "outline"
  }
}

const getStatusBadgeVariant = (status: string | null) => {
  switch (status) {
    case "completed":
      return "default"
    case "draft":
      return "secondary"
    case "pending":
      return "outline"
    case "cancelled":
      return "destructive"
    default:
      return "outline"
  }
}

export function TransactionsTable() {
  const navigate = useNavigate()
  const [data, setData] = React.useState<TransactionRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [cancelId, setCancelId] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const transactions = await TransactionsRepository.list()
      setData(transactions)
    } catch (error) {
      console.error("Failed to load transactions:", error)
      toast.error("Failed to load transactions")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await TransactionsRepository.delete(deleteId)
      toast.success("Transaction deleted successfully")
      loadData()
    } catch (error) {
      console.error("Failed to delete transaction:", error)
      toast.error("Failed to delete transaction")
    } finally {
      setDeleteId(null)
    }
  }

  const handleCancel = async () => {
    if (!cancelId) return

    try {
      await TransactionsRepository.cancel(cancelId)
      toast.success("Transaction cancelled successfully")
      loadData()
    } catch (error) {
      console.error("Failed to cancel transaction:", error)
      toast.error("Failed to cancel transaction")
    } finally {
      setCancelId(null)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    navigate({
      to: "/transactions/$transactionId/edit",
      params: { transactionId: transaction.id },
    })
  }

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await TransactionsRepository.updateStatus({ id, status })
      toast.success(`Transaction status updated to ${status}`)
      loadData()
    } catch (error) {
      console.error("Failed to update transaction status:", error)
      toast.error("Failed to update transaction status")
    }
  }

  const columns: ColumnDef<TransactionRow>[] = React.useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => {
          const id = row.getValue("id") as string
          return (
            <div className="font-mono text-sm">
              {id.substring(0, 8)}...
            </div>
          )
        },
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as string | null
          return (
            <Badge variant={getTypeBadgeVariant(type)}>
              {type || "-"}
            </Badge>
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
        accessorKey: "channel",
        header: "Channel",
        cell: ({ row }) => row.getValue("channel") || "-",
      },
      {
        accessorKey: "customer_id",
        header: "Customer",
        cell: ({ row }) => {
          const customerId = row.getValue("customer_id") as string | null
          return customerId ? (
            <span className="font-mono text-sm">{customerId.substring(0, 8)}...</span>
          ) : (
            "-"
          )
        },
      },
      {
        accessorKey: "total_items",
        header: "Items",
        cell: ({ row }) => row.getValue("total_items") ?? "-",
      },
      {
        accessorKey: "total_net",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total Net
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(row.getValue("total_net"))}
          </span>
        ),
      },
      {
        accessorKey: "total_discount",
        header: "Discount",
        cell: ({ row }) => formatCurrency(row.getValue("total_discount")),
      },
      {
        accessorKey: "total_shipping",
        header: "Shipping",
        cell: ({ row }) => formatCurrency(row.getValue("total_shipping")),
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
          const transaction = row.original
          const isDraft = transaction.status === "draft"
          const isCancelled = transaction.status === "cancelled"
          const isCompleted = transaction.status === "completed"

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
                  onClick={() => navigator.clipboard.writeText(transaction.id)}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {isDraft && (
                  <DropdownMenuItem
                    className="text-green-600"
                    onClick={() => handleUpdateStatus(transaction.id, "completed")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete
                  </DropdownMenuItem>
                )}
                {!isCancelled && !isCompleted && (
                  <DropdownMenuItem
                    className="text-orange-600"
                    onClick={() => setCancelId(transaction.id)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteId(transaction.id)}
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
    []
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading transactions...</div>
      </div>
    )
  }

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        filterColumnId="type"
        filterPlaceholder="Filter transactions..."
        emptyMessage="No transactions found."
        action={{ label: "New Transaction", to: "/transactions/new" }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction
              and all associated items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Transaction Confirmation Dialog */}
      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this transaction? This action cannot be
              easily reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Transaction</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-orange-600 hover:bg-orange-700">
              Cancel Transaction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
