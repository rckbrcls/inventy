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
import { formatCurrency, formatDateTime } from "@/lib/formatters"
import { RefundsRepository, REFUND_REASONS } from "@/lib/db/repositories/refunds-repository"
import { PaymentsRepository } from "@/lib/db/repositories/payments-repository"
import type { Refund } from "@uru/types"
import { useNavigate } from "@tanstack/react-router"
import { useShop } from "@/hooks/use-shop"

type RefundRow = Refund & {
  payment_method?: string
  payment_amount?: number
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "completed":
      return "default"
    case "pending":
      return "secondary"
    case "processing":
      return "outline"
    case "failed":
    case "cancelled":
      return "destructive"
    default:
      return "secondary"
  }
}

const getReasonLabel = (reason: string | null) => {
  if (!reason) return "-"
  const found = REFUND_REASONS.find((r) => r.value === reason)
  return found ? found.label : reason
}

export function RefundsTable() {
  const navigate = useNavigate()
  const { shopId } = useShop()
  const [data, setData] = React.useState<RefundRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const [refunds, paymentsData] = await Promise.all([
        RefundsRepository.list(),
        PaymentsRepository.list(),
      ])

      const paymentsMap = new Map(paymentsData.map((p) => [p.id, p]))

      const enrichedRefunds = refunds.map((refund) => {
        const payment = paymentsMap.get(refund.payment_id)
        return {
          ...refund,
          payment_method: payment?.method,
          payment_amount: payment?.amount,
        }
      })

      setData(enrichedRefunds)
    } catch (error) {
      console.error("Failed to load refunds:", error)
      toast.error("Failed to load refunds")
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
      await RefundsRepository.delete(deleteId)
      toast.success("Refund deleted successfully")
      loadData()
    } catch (error) {
      console.error("Failed to delete refund:", error)
      toast.error("Failed to delete refund")
    } finally {
      setDeleteId(null)
    }
  }

  const handleEdit = (refund: Refund) => {
    if (!shopId) return
    navigate({
      to: "/shops/$shopId/refunds/$refundId/edit",
      params: { shopId, refundId: refund.id },
    })
  }

  const columns: ColumnDef<RefundRow>[] = React.useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
          <div className="font-mono text-xs">{(row.getValue("id") as string).slice(0, 8)}...</div>
        ),
      },
      {
        accessorKey: "payment_id",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Payment
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const paymentId = row.getValue("payment_id") as string
          const method = row.original.payment_method
          return (
            <div>
              <div className="font-mono text-xs">{paymentId.slice(0, 8)}...</div>
              {method && <div className="text-xs text-muted-foreground">{method}</div>}
            </div>
          )
        },
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <span className="font-medium text-red-600">
            -{formatCurrency(row.getValue("amount"))}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string
          return <Badge variant={getStatusVariant(status)}>{status || "-"}</Badge>
        },
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => getReasonLabel(row.getValue("reason")),
      },
      {
        accessorKey: "provider_refund_id",
        header: "Provider ID",
        cell: ({ row }) => {
          const providerId = row.getValue("provider_refund_id") as string | null
          return providerId ? (
            <span className="font-mono text-xs">{providerId.slice(0, 12)}...</span>
          ) : (
            "-"
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
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const refund = row.original

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
                  onClick={() => navigator.clipboard.writeText(refund.id)}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(refund)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteId(refund.id)}
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
        <div className="text-muted-foreground">Loading refunds...</div>
      </div>
    )
  }

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        filterColumnId="payment_id"
        filterPlaceholder="Filter refunds..."
        emptyMessage="No refunds found."
        action={{
          label: "New Refund",
          to: `/shops/${shopId}/refunds/new`,
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the refund.
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
