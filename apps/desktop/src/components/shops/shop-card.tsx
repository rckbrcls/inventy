import * as React from "react"
import { Link } from "@tanstack/react-router"
import { Building2, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { Shop } from "@/lib/db/repositories/shops-repository"
import { useShops } from "@/hooks/use-shops"

interface ShopCardProps {
  shop: Shop
}

export function ShopCard({ shop }: ShopCardProps) {
  const { deleteShop } = useShops()
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteShop(shop.id)
      toast.success("Shop deleted successfully")
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Failed to delete shop:", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Failed to delete shop"
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const enabledModules = React.useMemo(() => {
    if (!shop.features_config) return []
    try {
      const config = JSON.parse(shop.features_config)
      return Object.keys(config).filter((key) => config[key] === true)
    } catch {
      return []
    }
  }, [shop.features_config])

  return (
    <>
      <Link
        to="/shops/$shopId/"
        params={{ shopId: shop.id }}
        className="block cursor-pointer"
      >
        <Card className="relative hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <CardTitle>{shop.name}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem asChild>
                    <Link to="/shops/$shopId/" params={{ shopId: shop.id }}>
                      Open
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription>
              {shop.slug}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={shop.status === "active" ? "default" : "secondary"}>
                  {shop.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Currency:</span>
                <span>{shop.currency}</span>
              </div>
              {enabledModules.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-muted-foreground">Modules: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {enabledModules.slice(0, 3).map((module) => (
                      <Badge key={module} variant="outline" className="text-xs">
                        {module}
                      </Badge>
                    ))}
                    {enabledModules.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{enabledModules.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the shop "{shop.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
