import { createFileRoute, useNavigate } from "@tanstack/react-router"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  InventoryLevelsRepository,
  CreateInventoryLevelDTO,
} from "@/lib/db/repositories/inventory-levels-repository"
import { ProductsRepository, Product } from "@/lib/db/repositories/products-repository"
import { LocationsRepository, Location } from "@/lib/db/repositories/locations-repository"

export const Route = createFileRoute("/shops/$shopId/inventory/new")({
  component: NewInventoryLevel,
})

const STOCK_STATUSES = [
  { value: "sellable", label: "Sellable" },
  { value: "damaged", label: "Damaged" },
  { value: "quarantine", label: "Quarantine" },
  { value: "expired", label: "Expired" },
]

function NewInventoryLevel() {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = React.useState(false)
  const [products, setProducts] = React.useState<Product[]>([])
  const [locations, setLocations] = React.useState<Location[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const [formData, setFormData] = React.useState({
    product_id: "",
    location_id: "",
    batch_number: "",
    serial_number: "",
    expiry_date: "",
    quantity_on_hand: "0",
    quantity_reserved: "0",
    stock_status: "sellable",
    aisle_bin_slot: "",
  })

  const { shopId } = Route.useParams()
  
  React.useEffect(() => {
    if (!shopId) return
    
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [productsList, locationsList] = await Promise.all([
          ProductsRepository.listByShop(shopId),
          LocationsRepository.listByShop(shopId),
        ])
        setProducts(productsList)
        setLocations(locationsList)
      } catch (error) {
        console.error("Failed to load data:", error)
        toast.error("Failed to load products and locations")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [shopId])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.product_id) {
      toast.error("Please select a product")
      return
    }

    if (!formData.location_id) {
      toast.error("Please select a location")
      return
    }

    try {
      setIsSaving(true)

      const payload: CreateInventoryLevelDTO = {
        product_id: formData.product_id,
        location_id: formData.location_id,
        batch_number: formData.batch_number || undefined,
        serial_number: formData.serial_number || undefined,
        expiry_date: formData.expiry_date || undefined,
        quantity_on_hand: parseFloat(formData.quantity_on_hand) || 0,
        quantity_reserved: parseFloat(formData.quantity_reserved) || 0,
        stock_status: formData.stock_status,
        aisle_bin_slot: formData.aisle_bin_slot || undefined,
      }

      await InventoryLevelsRepository.create(shopId, payload)
      toast.success("Inventory level created successfully")
      navigate({ to: "/inventory" })
    } catch (error) {
      console.error("Failed to create inventory level:", error)
      toast.error("Failed to create inventory level")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium">New Inventory Level</h3>
        <p className="text-sm text-muted-foreground">
          Create a new inventory level for a product at a specific location.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Product and Location */}
          <Card>
            <CardHeader>
              <CardTitle>Product & Location</CardTitle>
              <CardDescription>
                Select the product and location for this inventory level.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="product_id">
                    Product <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.product_id}
                    onValueChange={(value) => handleChange("product_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} {product.sku ? `(${product.sku})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {products.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No products found. Create products first.
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location_id">
                    Location <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.location_id}
                    onValueChange={(value) => handleChange("location_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name} ({location.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {locations.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No locations found. Create locations first.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantities */}
          <Card>
            <CardHeader>
              <CardTitle>Quantities</CardTitle>
              <CardDescription>
                Set the initial quantities for this inventory level.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity_on_hand">
                    Quantity On Hand <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="quantity_on_hand"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.quantity_on_hand}
                    onChange={(e) => handleChange("quantity_on_hand", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Total physical quantity available.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity_reserved">Quantity Reserved</Label>
                  <Input
                    id="quantity_reserved"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.quantity_reserved}
                    onChange={(e) => handleChange("quantity_reserved", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Quantity reserved for pending orders.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-md">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Available Quantity:</span>
                  <span className="font-medium">
                    {(parseFloat(formData.quantity_on_hand) || 0) -
                      (parseFloat(formData.quantity_reserved) || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Status</CardTitle>
              <CardDescription>
                Set the status of this inventory.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="stock_status">Stock Status</Label>
                <Select
                  value={formData.stock_status}
                  onValueChange={(value) => handleChange("stock_status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STOCK_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Only "sellable" items are available for sale.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking Information</CardTitle>
              <CardDescription>
                Optional tracking details for this inventory.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="batch_number">Batch Number</Label>
                  <Input
                    id="batch_number"
                    value={formData.batch_number}
                    onChange={(e) => handleChange("batch_number", e.target.value)}
                    placeholder="e.g., LOT-2024-001"
                  />
                  <p className="text-xs text-muted-foreground">
                    For perishables, pharmaceuticals, etc.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="serial_number">Serial Number</Label>
                  <Input
                    id="serial_number"
                    value={formData.serial_number}
                    onChange={(e) => handleChange("serial_number", e.target.value)}
                    placeholder="e.g., SN123456789"
                  />
                  <p className="text-xs text-muted-foreground">
                    For unique items (electronics, vehicles, etc.)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => handleChange("expiry_date", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    For perishable products.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="aisle_bin_slot">Aisle/Bin/Slot</Label>
                  <Input
                    id="aisle_bin_slot"
                    value={formData.aisle_bin_slot}
                    onChange={(e) => handleChange("aisle_bin_slot", e.target.value)}
                    placeholder="e.g., A-01-03"
                  />
                  <p className="text-xs text-muted-foreground">
                    Physical location in warehouse.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/inventory" })}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving || products.length === 0 || locations.length === 0}>
                  {isSaving ? "Creating..." : "Create Inventory Level"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
