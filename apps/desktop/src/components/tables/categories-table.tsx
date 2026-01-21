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
import { Category, CategoriesRepository } from "@/lib/db/repositories/categories-repository"
import { useNavigate } from "@tanstack/react-router"
import { useShop } from "@/hooks/use-shop"

type CategoryWithParentName = Category & {
  parent_name?: string | null
}

export function CategoriesTable() {
  const navigate = useNavigate()
  const { shopId } = useShop()
  const [data, setData] = React.useState<CategoryWithParentName[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    if (!shopId) return

    try {
      setIsLoading(true)
      const categories = await CategoriesRepository.listByShop(shopId)

      // Map parent_id to parent_name for display
      const categoriesWithParent = categories.map((cat) => {
        const parent = categories.find((c) => c.id === cat.parent_id)
        return {
          ...cat,
          parent_name: parent?.name ?? null,
        }
      })

      setData(categoriesWithParent)
    } catch (error) {
      console.error("Failed to load categories:", error)
      toast.error("Failed to load categories")
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
      await CategoriesRepository.delete(deleteId)
      toast.success("Category deleted successfully")
      loadData()
    } catch (error) {
      console.error("Failed to delete category:", error)
      toast.error("Failed to delete category")
    } finally {
      setDeleteId(null)
    }
  }

  const handleEdit = (category: Category) => {
    if (!shopId) return
    navigate({
      to: "/shops/$shopId/categories/$categoryId/edit",
      params: { shopId, categoryId: category.id },
    })
  }

  const columns: ColumnDef<CategoryWithParentName>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
      },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => (
          <span className="font-mono text-sm text-muted-foreground">
            {row.getValue("slug")}
          </span>
        ),
      },
      {
        accessorKey: "parent_name",
        header: "Parent",
        cell: ({ row }) => row.getValue("parent_name") || "-",
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as string | null
          const variant = type === "automated" ? "secondary" : "outline"
          return <Badge variant={variant}>{type || "manual"}</Badge>
        },
      },
      {
        accessorKey: "is_visible",
        header: "Visible",
        cell: ({ row }) => (
          <Badge variant={row.getValue("is_visible") ? "default" : "outline"}>
            {row.getValue("is_visible") ? "Yes" : "No"}
          </Badge>
        ),
      },
      {
        accessorKey: "sort_order",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Order
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => row.getValue("sort_order") ?? "-",
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
          const category = row.original

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
                  onClick={() => navigator.clipboard.writeText(category.id)}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(category)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteId(category.id)}
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
        <div className="text-muted-foreground">Loading categories...</div>
      </div>
    )
  }

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        filterColumnId="name"
        filterPlaceholder="Filter categories..."
        emptyMessage="No categories found."
        action={{
          label: "New Category",
          to: shopId ? `/shops/${shopId}/categories/new` : "/categories/new",
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category.
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
