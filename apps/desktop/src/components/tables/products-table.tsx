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
import { ProductsRepository } from "@/lib/db/repositories/products-repository"
import { BrandsRepository } from "@/lib/db/repositories/brands-repository"
import { CategoriesRepository } from "@/lib/db/repositories/categories-repository"
import type { Product } from "@uru/types"
import { useNavigate } from "@tanstack/react-router"
import { useShop } from "@/hooks/use-shop"

type ProductRow = Product & {
  brand_name?: string
  category_name?: string
}

export function ProductsTable() {
  const navigate = useNavigate()
  const { shopId } = useShop()
  const [data, setData] = React.useState<ProductRow[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const loadData = React.useCallback(async () => {
    if (!shopId) return

    try {
      setIsLoading(true)
      const [products, brandsData, categoriesData] = await Promise.all([
        ProductsRepository.listFiltered({ shop_id: shopId }),
        BrandsRepository.listByShop(shopId),
        CategoriesRepository.listByShop(shopId),
      ])

      const brandsMap = new Map(brandsData.map((b) => [b.id, b.name]))
      const categoriesMap = new Map(categoriesData.map((c) => [c.id, c.name]))

      const enrichedProducts = products.map((product) => ({
        ...product,
        brand_name: product.brand_id ? brandsMap.get(product.brand_id) : undefined,
        category_name: product.category_id ? categoriesMap.get(product.category_id) : undefined,
      }))

      setData(enrichedProducts)
    } catch (error) {
      console.error("Failed to load products:", error)
      toast.error("Failed to load products")
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
      await ProductsRepository.delete(deleteId)
      toast.success("Product deleted successfully")
      loadData()
    } catch (error) {
      console.error("Failed to delete product:", error)
      toast.error("Failed to delete product")
    } finally {
      setDeleteId(null)
    }
  }

  const handleEdit = (product: Product) => {
    if (!shopId) return
    navigate({
      to: "/shops/$shopId/products/$productId/edit",
      params: { shopId, productId: product.id },
    })
  }

  const columns: ColumnDef<ProductRow>[] = React.useMemo(
    () => [
      {
        accessorKey: "sku",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            SKU
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="uppercase font-mono text-sm">{row.getValue("sku") || "-"}</div>
        ),
      },
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
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.getValue("type") as string
          const variant =
            type === "physical"
              ? "default"
              : type === "digital"
                ? "secondary"
                : type === "service"
                  ? "outline"
                  : "default"
          return <Badge variant={variant}>{type || "-"}</Badge>
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string
          const variant =
            status === "active"
              ? "default"
              : status === "draft"
                ? "secondary"
                : status === "archived"
                  ? "outline"
                  : "destructive"
          return <Badge variant={variant}>{status || "-"}</Badge>
        },
      },
      {
        accessorKey: "price",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Price
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => formatCurrency(row.getValue("price")),
      },
      {
        accessorKey: "promotional_price",
        header: "Promo Price",
        cell: ({ row }) => {
          const promoPrice = row.getValue("promotional_price") as number | null
          return promoPrice ? (
            <span className="text-green-600 font-medium">{formatCurrency(promoPrice)}</span>
          ) : (
            "-"
          )
        },
      },
      {
        accessorKey: "brand_name",
        header: "Brand",
        cell: ({ row }) => row.getValue("brand_name") || "-",
      },
      {
        accessorKey: "category_name",
        header: "Category",
        cell: ({ row }) => row.getValue("category_name") || "-",
      },
      {
        accessorKey: "is_shippable",
        header: "Shippable",
        cell: ({ row }) => (row.getValue("is_shippable") ? "Yes" : "No"),
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
          const product = row.original

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
                  onClick={() => navigator.clipboard.writeText(product.id)}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(product)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteId(product.id)}
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
        <div className="text-muted-foreground">Loading products...</div>
      </div>
    )
  }

  return (
    <>
      <DataTable
        data={data}
        columns={columns}
        filterColumnId="name"
        filterPlaceholder="Filter products..."
        emptyMessage="No products found."
        action={{
          label: "New Product",
          to: `/shops/${shopId}/products/new`,
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
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
