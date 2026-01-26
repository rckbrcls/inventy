import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Star } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "@tanstack/react-router"
import { useShop } from "@/hooks/use-shop"

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
  CustomerAddressesRepository,
} from "@/lib/db/repositories/customer-addresses-repository"
import { CustomersRepository } from "@/lib/db/repositories/customers-repository"
import type { CustomerAddress, Customer } from "@uru/types"

type CustomerAddressRow = CustomerAddress & {
  customer?: Customer
}

export function CustomerAddressesTable() {
  const navigate = useNavigate()
  const { shopId } = useShop()
  const [data, setData] = React.useState<CustomerAddressRow[]>([])
  const [customers, setCustomers] = React.useState<Map<string, Customer>>(new Map())
  const [isLoading, setIsLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    if (!shopId) {
      console.warn('[CustomerAddressesTable] shopId is not available yet')
      return
    }

    try {
      setIsLoading(true)
      console.log('[CustomerAddressesTable] Loading addresses for shopId:', shopId)
      const [addresses, customersList] = await Promise.all([
        CustomerAddressesRepository.listByShop(shopId),
        CustomersRepository.listByShop(shopId),
      ])

      const customersMap = new Map<string, Customer>()
      customersList.forEach((c) => customersMap.set(c.id, c))
      setCustomers(customersMap)

      // Filter addresses to only include those belonging to shop customers
      const enrichedAddresses = addresses
        .filter((address) => customersMap.has(address.customer_id))
        .map((address) => ({
          ...address,
          customer: customersMap.get(address.customer_id),
        }))
      setData(enrichedAddresses)
    } catch (error) {
      console.error("Failed to load customer addresses:", error)
      toast.error("Failed to load customer addresses")
    } finally {
      setIsLoading(false)
    }
  }, [shopId])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async () => {
    if (!deleteId || !shopId) return

    try {
      await CustomerAddressesRepository.delete(shopId, deleteId)
      toast.success("Address deleted successfully")
      loadData()
    } catch (error) {
      console.error("Failed to delete address:", error)
      toast.error("Failed to delete address")
    } finally {
      setDeleteId(null)
    }
  }

  const handleEdit = (address: CustomerAddress) => {
    if (!shopId) return
    navigate({
      to: "/shops/$shopId/customers/addresses/$addressId/edit",
      params: { shopId, addressId: address.id },
    })
  }

  const getCustomerName = (customerId: string) => {
    const customer = customers.get(customerId)
    if (!customer) return "-"
    if (customer.company_name) return customer.company_name
    const firstName = customer.first_name || ""
    const lastName = customer.last_name || ""
    return `${firstName} ${lastName}`.trim() || "-"
  }

  const getFullAddress = (address: CustomerAddressRow) => {
    const parts = [
      address.address1,
      address.address2,
      address.city,
      address.province_code,
      address.postal_code,
      address.country_code,
    ].filter(Boolean)
    return parts.join(", ") || "-"
  }

  const columns: ColumnDef<CustomerAddressRow>[] = React.useMemo(
    () => [
      {
        accessorKey: "customer_id",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Customer
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <Button
            variant="link"
            className="p-0 h-auto font-medium"
            onClick={() => navigate({ to: `/shops/${shopId}/customers` })}
          >
            {getCustomerName(row.getValue("customer_id"))}
          </Button>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as string
          const variant =
            type === "shipping"
              ? "default"
              : type === "billing"
                ? "secondary"
                : "outline"
          return <Badge variant={variant}>{type || "shipping"}</Badge>
        },
      },
      {
        accessorKey: "is_default",
        header: "Default",
        cell: ({ row }) => {
          const isDefault = row.getValue("is_default") as boolean
          return isDefault ? (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          ) : null
        },
      },
      {
        id: "recipient",
        header: "Recipient",
        cell: ({ row }) => {
          const address = row.original
          const firstName = address.first_name || ""
          const lastName = address.last_name || ""
          const name = `${firstName} ${lastName}`.trim()
          return (
            <div>
              <div className="font-medium">{name || "-"}</div>
              {address.company && (
                <div className="text-sm text-muted-foreground">{address.company}</div>
              )}
            </div>
          )
        },
      },
      {
        id: "full_address",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Address
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        accessorFn: (row) => getFullAddress(row),
        cell: ({ row }) => (
          <div className="max-w-[300px] truncate">{getFullAddress(row.original)}</div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => row.getValue("phone") || "-",
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
          const address = row.original

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
                  onClick={() => navigator.clipboard.writeText(address.id)}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(address)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteId(address.id)}
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
    [customers, navigate, shopId]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading addresses...</div>
      </div>
    )
  }

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        filterColumnId="full_address"
        filterPlaceholder="Filter addresses..."
        emptyMessage="No addresses found."
        action={{
          label: "New Address",
          to: `/shops/${shopId}/customers/addresses/new`,
        }}
        onRowDoubleClick={handleEdit}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the address.
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
