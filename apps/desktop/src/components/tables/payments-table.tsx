import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Copy } from "lucide-react"
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
import { PaymentsRepository } from "@/lib/db/repositories/payments-repository"
import type { Payment } from "@uru/types"
import { useNavigate } from "@tanstack/react-router"
import { useShop } from "@/hooks/use-shop"

const getStatusVariant = (status: string) => {
  switch (status) {
    case "captured":
      return "default"
    case "authorized":
      return "secondary"
    case "pending":
      return "outline"
    case "declined":
    case "voided":
    case "charged_back":
      return "destructive"
    case "refunded":
      return "secondary"
    default:
      return "outline"
  }
}

const getMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    credit_card: "Credit Card",
    debit_card: "Debit Card",
    pix: "PIX",
    boleto: "Boleto",
    voucher: "Voucher",
    bank_transfer: "Bank Transfer",
    cash: "Cash",
    wallet: "Wallet",
    crypto: "Crypto",
  }
  return labels[method] || method
}

export function PaymentsTable() {
  const navigate = useNavigate()
  const { shopId } = useShop()
  const [data, setData] = React.useState<Payment[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const payments = await PaymentsRepository.list()
      setData(payments)
    } catch (error) {
      console.error("Failed to load payments:", error)
      toast.error("Failed to load payments")
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
      await PaymentsRepository.delete(deleteId)
      toast.success("Payment deleted successfully")
      loadData()
    } catch (error) {
      console.error("Failed to delete payment:", error)
      toast.error("Failed to delete payment")
    } finally {
      setDeleteId(null)
    }
  }

  const handleEdit = (payment: Payment) => {
    if (!shopId) return
    navigate({
      to: "/shops/$shopId/payments/$paymentId/edit",
      params: { shopId, paymentId: payment.id },
    })
  }

  const columns: ColumnDef<Payment>[] = React.useMemo(
    () => [
      {
        accessorKey: "transaction_id",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Transaction
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-mono text-xs truncate max-w-[120px]">
            {row.getValue("transaction_id")}
          </div>
        ),
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
        cell: ({ row }) => {
          const amount = row.getValue("amount") as number
          const currency = row.original.currency || "BRL"
          return (
            <div className="font-medium">
              {formatCurrency(amount)} {currency}
            </div>
          )
        },
      },
      {
        accessorKey: "provider",
        header: "Provider",
        cell: ({ row }) => (
          <div className="capitalize">{row.getValue("provider")}</div>
        ),
      },
      {
        accessorKey: "method",
        header: "Method",
        cell: ({ row }) => (
          <Badge variant="outline">{getMethodLabel(row.getValue("method"))}</Badge>
        ),
      },
      {
        accessorKey: "installments",
        header: "Installments",
        cell: ({ row }) => {
          const installments = row.getValue("installments") as number | null
          return installments && installments > 1 ? `${installments}x` : "1x"
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string
          return (
            <Badge variant={getStatusVariant(status)}>
              {status?.replace("_", " ") || "-"}
            </Badge>
          )
        },
      },
      {
        accessorKey: "risk_level",
        header: "Risk",
        cell: ({ row }) => {
          const risk = row.getValue("risk_level") as string | null
          if (!risk) return "-"
          const variant =
            risk === "low"
              ? "default"
              : risk === "medium"
                ? "secondary"
                : risk === "high"
                  ? "destructive"
                  : "destructive"
          return <Badge variant={variant}>{risk}</Badge>
        },
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => formatDateTime(row.getValue("created_at")),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const payment = row.original

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
                  onClick={() => {
                    navigator.clipboard.writeText(payment.id)
                    toast.success("Payment ID copied")
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy ID
                </DropdownMenuItem>
                {payment.provider_transaction_id && (
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(payment.provider_transaction_id!)
                      toast.success("Provider ID copied")
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Provider ID
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(payment)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteId(payment.id)}
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
        <div className="text-muted-foreground">Loading payments...</div>
      </div>
    )
  }

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        filterColumnId="transaction_id"
        filterPlaceholder="Filter by transaction..."
        emptyMessage="No payments found."
        action={{
          label: "New Payment",
          to: `/shops/${shopId}/payments/new`,
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the payment
              record.
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
