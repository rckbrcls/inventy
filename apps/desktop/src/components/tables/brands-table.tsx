import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react"
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
import { Brand, BrandsRepository } from "@/lib/db/repositories/brands-repository"
import { useNavigate } from "@tanstack/react-router"
import { useShop } from "@/hooks/use-shop"

export function BrandsTable() {
  const navigate = useNavigate()
  const { shopId } = useShop()
  const [data, setData] = React.useState<Brand[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    if (!shopId) return
    
    try {
      setIsLoading(true)
      const brands = await BrandsRepository.listByShop(shopId)
      setData(brands)
    } catch (error) {
      console.error("Failed to load brands:", error)
      toast.error("Failed to load brands")
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
      await BrandsRepository.delete(deleteId)
      toast.success("Brand deleted successfully")
      loadData()
    } catch (error) {
      console.error("Failed to delete brand:", error)
      toast.error("Failed to delete brand")
    } finally {
      setDeleteId(null)
    }
  }

  const handleEdit = (brand: Brand) => {
    navigate({ to: "/brands/$brandId/edit", params: { brandId: brand.id } })
  }

  const columns: ColumnDef<Brand>[] = React.useMemo(
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
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string | null
          const variant =
            status === "active"
              ? "default"
              : status === "inactive"
                ? "secondary"
                : "outline"
          return <Badge variant={variant}>{status || "-"}</Badge>
        },
      },
      {
        accessorKey: "is_featured",
        header: "Featured",
        cell: ({ row }) => (
          <Badge variant={row.getValue("is_featured") ? "default" : "outline"}>
            {row.getValue("is_featured") ? "Yes" : "No"}
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
        accessorKey: "website_url",
        header: "Website",
        cell: ({ row }) => {
          const url = row.getValue("website_url") as string | null
          if (!url) return "-"
          return (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Link
            </a>
          )
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
          const brand = row.original

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
                  onClick={() => navigator.clipboard.writeText(brand.id)}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(brand)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteId(brand.id)}
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
        <div className="text-muted-foreground">Loading brands...</div>
      </div>
    )
  }

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        filterColumnId="name"
        filterPlaceholder="Filter brands..."
        emptyMessage="No brands found."
        action={{ label: "New Brand", to: "/brands/new" }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the brand.
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
