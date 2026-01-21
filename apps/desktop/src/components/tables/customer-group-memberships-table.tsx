import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Trash2, UserPlus } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { DataTable } from "@/components/tables/data-table"
import { formatDateTime } from "@/lib/formatters"
import {
  CustomerGroupMembershipsRepository,
} from "@/lib/db/repositories/customer-group-memberships-repository"
import { CustomersRepository } from "@/lib/db/repositories/customers-repository"
import {
  CustomerGroupsRepository,
} from "@/lib/db/repositories/customer-groups-repository"
import type { CustomerGroupMembership, Customer, CustomerGroup } from "@uru/types"

type MembershipRow = CustomerGroupMembership & {
  customer?: Customer
  group?: CustomerGroup
}

export function CustomerGroupMembershipsTable() {
  const navigate = useNavigate()
  const { shopId } = useShop()
  const [data, setData] = React.useState<MembershipRow[]>([])
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [groups, setGroups] = React.useState<CustomerGroup[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deleteItem, setDeleteItem] = React.useState<MembershipRow | null>(null)
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = React.useState("")
  const [selectedGroupIds, setSelectedGroupIds] = React.useState<string[]>([])
  const [isAdding, setIsAdding] = React.useState(false)

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const [customersList, groupsList] = await Promise.all([
        CustomersRepository.list(),
        CustomerGroupsRepository.list(),
      ])

      setCustomers(customersList)
      setGroups(groupsList)

      const customersMap = new Map<string, Customer>()
      customersList.forEach((c) => customersMap.set(c.id, c))

      const groupsMap = new Map<string, CustomerGroup>()
      groupsList.forEach((g) => groupsMap.set(g.id, g))

      // Collect all memberships from all customers
      const allMemberships: MembershipRow[] = []
      for (const customer of customersList) {
        try {
          const memberships = await CustomerGroupMembershipsRepository.listByCustomer(
            customer.id
          )
          memberships.forEach((m) => {
            allMemberships.push({
              ...m,
              customer: customersMap.get(m.customer_id),
              group: groupsMap.get(m.customer_group_id),
            })
          })
        } catch {
          // Silently skip if error fetching memberships for this customer
        }
      }

      setData(allMemberships)
    } catch (error) {
      console.error("Failed to load memberships:", error)
      toast.error("Failed to load memberships")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async () => {
    if (!deleteItem) return

    try {
      await CustomerGroupMembershipsRepository.deleteMembership(
        deleteItem.customer_id,
        deleteItem.customer_group_id
      )
      toast.success("Membership removed successfully")
      loadData()
    } catch (error) {
      console.error("Failed to delete membership:", error)
      toast.error("Failed to delete membership")
    } finally {
      setDeleteItem(null)
    }
  }

  const handleAddMembership = async () => {
    if (!selectedCustomerId || selectedGroupIds.length === 0) {
      toast.error("Please select a customer and at least one group")
      return
    }

    try {
      setIsAdding(true)
      await CustomerGroupMembershipsRepository.assignGroups({
        customer_id: selectedCustomerId,
        group_ids: selectedGroupIds,
      })
      toast.success("Customer added to groups successfully")
      setIsAddOpen(false)
      setSelectedCustomerId("")
      setSelectedGroupIds([])
      loadData()
    } catch (error) {
      console.error("Failed to add membership:", error)
      toast.error("Failed to add membership")
    } finally {
      setIsAdding(false)
    }
  }

  const getCustomerName = (customer?: Customer) => {
    if (!customer) return "-"
    if (customer.company_name) return customer.company_name
    const firstName = customer.first_name || ""
    const lastName = customer.last_name || ""
    return `${firstName} ${lastName}`.trim() || customer.email || "-"
  }

  const columns: ColumnDef<MembershipRow>[] = React.useMemo(
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
            {getCustomerName(row.original.customer)}
          </Button>
        ),
      },
      {
        accessorKey: "customer_group_id",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Group
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const group = row.original.group
          return (
            <div>
              <div className="font-medium">{group?.name || "-"}</div>
              {group?.code && (
                <div className="text-sm text-muted-foreground">{group.code}</div>
              )}
            </div>
          )
        },
      },
      {
        id: "group_type",
        header: "Type",
        cell: ({ row }) => {
          const groupType = row.original.group?.type || "manual"
          const variant = groupType === "automatic" ? "secondary" : "default"
          return <Badge variant={variant}>{groupType}</Badge>
        },
      },
      {
        id: "discount",
        header: "Discount",
        cell: ({ row }) => {
          const discount = row.original.group?.default_discount_percentage
          if (discount && discount > 0) {
            return <Badge variant="outline">{discount}% off</Badge>
          }
          return "-"
        },
      },
      {
        accessorKey: "created_at",
        header: "Joined At",
        cell: ({ row }) => formatDateTime(row.getValue("created_at")),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const membership = row.original

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
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${membership.customer_id}:${membership.customer_group_id}`
                    )
                  }
                >
                  Copy IDs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteItem(membership)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove from Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },
    ],
    [navigate]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading memberships...</div>
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Group Memberships</h2>
          <p className="text-muted-foreground">
            Manage customer group assignments
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add to Group
        </Button>
      </div>

      <DataTable
        data={data}
        columns={columns}
        filterColumnId="customer_id"
        filterPlaceholder="Filter memberships..."
        emptyMessage="No group memberships found."
      />

      {/* Add Membership Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer to Groups</DialogTitle>
            <DialogDescription>
              Select a customer and one or more groups to assign.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select
                value={selectedCustomerId}
                onValueChange={setSelectedCustomerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {getCustomerName(customer)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="groups">Groups</Label>
              <Select
                value={selectedGroupIds[0] || ""}
                onValueChange={(value) => setSelectedGroupIds([value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                      {group.default_discount_percentage
                        ? ` (${group.default_discount_percentage}% off)`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the group to assign the customer to.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMembership} disabled={isAdding}>
              {isAdding ? "Adding..." : "Add to Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from group?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove {getCustomerName(deleteItem?.customer)} from the
              group "{deleteItem?.group?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
