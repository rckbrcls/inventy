import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Copy, ExternalLink } from "lucide-react"
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
import { Checkout, CheckoutsRepository } from "@/lib/db/repositories/checkouts-repository"
import { useNavigate } from "@tanstack/react-router"

type CheckoutRow = Checkout

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  open: "default",
  completed: "secondary",
  expired: "destructive",
}

export function CheckoutsTable() {
  const navigate = useNavigate()
  const [data, setData] = React.useState<CheckoutRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const checkouts = await CheckoutsRepository.list()
      setData(checkouts)
    } catch (error) {
      console.error("Failed to load checkouts:", error)
      toast.error("Failed to load checkouts")
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
      await CheckoutsRepository.delete(deleteId)
      toast.success("Checkout deleted successfully")
      loadData()
    } catch (error) {
      console.error("Failed to delete checkout:", error)
      toast.error("Failed to delete checkout")
    } finally {
      setDeleteId(null)
    }
  }

  const handleEdit = (checkout: Checkout) => {
    navigate({ to: "/checkouts/$checkoutId/edit", params: { checkoutId: checkout.id } })
  }

  const getItemsCount = (items: string | null): number => {
    if (!items) return 0
    try {
      const parsed = JSON.parse(items)
      return Array.isArray(parsed) ? parsed.length : 0
    } catch {
      return 0
    }
  }

  const columns: ColumnDef<CheckoutRow>[] = React.useMemo(
    () => [
      {
        accessorKey: "token",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Token
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const token = row.getValue("token") as string
          return (
            <div className="font-mono text-xs truncate max-w-[120px]" title={token}>
              {token}
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string
          const variant = STATUS_VARIANTS[status] || "outline"
          return <Badge variant={variant}>{status || "-"}</Badge>
        },
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => row.getValue("email") || "-",
      },
      {
        id: "items_count",
        header: "Items",
        cell: ({ row }) => {
          const count = getItemsCount(row.original.items)
          return <span>{count}</span>
        },
      },
      {
        accessorKey: "currency",
        header: "Currency",
        cell: ({ row }) => row.getValue("currency") || "BRL",
      },
      {
        accessorKey: "subtotal_price",
        header: "Subtotal",
        cell: ({ row }) => formatCurrency(row.getValue("subtotal_price")),
      },
      {
        accessorKey: "total_discounts",
        header: "Discounts",
        cell: ({ row }) => {
          const value = row.getValue("total_discounts") as number
          return value > 0 ? `-${formatCurrency(value)}` : "-"
        },
      },
      {
        accessorKey: "total_shipping",
        header: "Shipping",
        cell: ({ row }) => formatCurrency(row.getValue("total_shipping")),
      },
      {
        accessorKey: "total_tax",
        header: "Tax",
        cell: ({ row }) => formatCurrency(row.getValue("total_tax")),
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
          <div className="font-medium">{formatCurrency(row.getValue("total_price"))}</div>
        ),
      },
      {
        accessorKey: "completed_at",
        header: "Completed",
        cell: ({ row }) => formatDateTime(row.getValue("completed_at")),
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
          const checkout = row.original

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
                    navigator.clipboard.writeText(checkout.id)
                    toast.success("ID copied to clipboard")
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(checkout.token)
                    toast.success("Token copied to clipboard")
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Token
                </DropdownMenuItem>
                {checkout.recovery_url && (
                  <DropdownMenuItem
                    onClick={() => window.open(checkout.recovery_url!, "_blank")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Recovery URL
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(checkout)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteId(checkout.id)}
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
        <div className="text-muted-foreground">Loading checkouts...</div>
      </div>
    )
  }

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        filterColumnId="email"
        filterPlaceholder="Filter by email..."
        emptyMessage="No checkouts found."
        action={{ label: "New Checkout", to: "/checkouts/new" }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the checkout.
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
