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
import { Customer, CustomersRepository } from "@/lib/db/repositories/customers-repository"
import { useNavigate } from "@tanstack/react-router"
import { useShop } from "@/hooks/use-shop"

type CustomerRow = Customer

export function CustomersTable() {
  const navigate = useNavigate()
  const { shopId } = useShop()
  const [data, setData] = React.useState<CustomerRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    if (!shopId) return
    
    try {
      setIsLoading(true)
      const customers = await CustomersRepository.listByShop(shopId)
      setData(customers)
    } catch (error) {
      console.error("Failed to load customers:", error)
      toast.error("Failed to load customers")
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
      await CustomersRepository.delete(deleteId)
      toast.success("Customer deleted successfully")
      loadData()
    } catch (error) {
      console.error("Failed to delete customer:", error)
      toast.error("Failed to delete customer")
    } finally {
      setDeleteId(null)
    }
  }

  const handleEdit = (customer: Customer) => {
    navigate({ to: "/customers/$customerId/edit", params: { customerId: customer.id } })
  }

  const getDisplayName = (customer: CustomerRow) => {
    if (customer.company_name) return customer.company_name
    const firstName = customer.first_name || ""
    const lastName = customer.last_name || ""
    return `${firstName} ${lastName}`.trim() || "-"
  }

  const columns: ColumnDef<CustomerRow>[] = React.useMemo(
    () => [
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as string
          const variant =
            type === "individual"
              ? "default"
              : type === "business"
                ? "secondary"
                : "outline"
          return <Badge variant={variant}>{type || "-"}</Badge>
        },
      },
      {
        id: "display_name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        accessorFn: (row) => getDisplayName(row),
        cell: ({ row }) => (
          <div className="font-medium">{getDisplayName(row.original)}</div>
        ),
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
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => row.getValue("phone") || "-",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string
          const variant =
            status === "active"
              ? "default"
              : status === "inactive"
                ? "secondary"
                : status === "blocked"
                  ? "destructive"
                  : "outline"
          return <Badge variant={variant}>{status || "-"}</Badge>
        },
      },
      {
        accessorKey: "orders_count",
        header: "Orders",
        cell: ({ row }) => row.getValue("orders_count") ?? 0,
      },
      {
        accessorKey: "total_spent",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Total Spent
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => formatCurrency(row.getValue("total_spent")),
      },
      {
        accessorKey: "last_order_at",
        header: "Last Order",
        cell: ({ row }) => formatDateTime(row.getValue("last_order_at")),
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
          const customer = row.original

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
                  onClick={() => navigator.clipboard.writeText(customer.id)}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(customer)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteId(customer.id)}
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
        <div className="text-muted-foreground">Loading customers...</div>
      </div>
    )
  }

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        filterColumnId="email"
        filterPlaceholder="Filter customers..."
        emptyMessage="No customers found."
        action={{ label: "New Customer", to: "/customers/new" }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer.
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
