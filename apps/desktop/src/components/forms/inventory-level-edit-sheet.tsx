import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  InventoryLevel,
  InventoryLevelsRepository,
  UpdateInventoryLevelDTO,
} from "@/lib/db/repositories/inventory-levels-repository"
import { Product } from "@/lib/db/repositories/products-repository"
import { Location } from "@/lib/db/repositories/locations-repository"

type InventoryLevelEditSheetProps = {
  item: InventoryLevel | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  products: Product[]
  locations: Location[]
}

const STOCK_STATUSES = [
  { value: "sellable", label: "Sellable" },
  { value: "damaged", label: "Damaged" },
  { value: "quarantine", label: "Quarantine" },
  { value: "expired", label: "Expired" },
]

export function InventoryLevelEditSheet({
  item,
  open,
  onOpenChange,
  onSuccess,
  products,
  locations,
}: InventoryLevelEditSheetProps) {
  const [isSaving, setIsSaving] = React.useState(false)
  const [formData, setFormData] = React.useState({
    product_id: "",
    location_id: "",
    batch_number: "",
    serial_number: "",
    expiry_date: "",
    quantity_on_hand: "",
    quantity_reserved: "",
    stock_status: "sellable",
    aisle_bin_slot: "",
  })

  React.useEffect(() => {
    if (item) {
      setFormData({
        product_id: item.product_id || "",
        location_id: item.location_id || "",
        batch_number: item.batch_number || "",
        serial_number: item.serial_number || "",
        expiry_date: item.expiry_date ? item.expiry_date.split("T")[0] : "",
        quantity_on_hand: item.quantity_on_hand?.toString() || "0",
        quantity_reserved: item.quantity_reserved?.toString() || "0",
        stock_status: item.stock_status || "sellable",
        aisle_bin_slot: item.aisle_bin_slot || "",
      })
    }
  }, [item])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!item) return

    if (!formData.product_id || !formData.location_id) {
      toast.error("Product and Location are required")
      return
    }

    try {
      setIsSaving(true)

      const payload: UpdateInventoryLevelDTO = {
        id: item.id,
        product_id: formData.product_id,
        location_id: formData.location_id,
        batch_number: formData.batch_number || undefined,
        serial_number: formData.serial_number || undefined,
        expiry_date: formData.expiry_date || undefined,
        quantity_on_hand: formData.quantity_on_hand
          ? parseFloat(formData.quantity_on_hand)
          : undefined,
        quantity_reserved: formData.quantity_reserved
          ? parseFloat(formData.quantity_reserved)
          : undefined,
        stock_status: formData.stock_status || undefined,
        aisle_bin_slot: formData.aisle_bin_slot || undefined,
      }

      await InventoryLevelsRepository.update(payload)
      toast.success("Inventory level updated successfully")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update inventory level:", error)
      toast.error("Failed to update inventory level")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Inventory Level</SheetTitle>
          <SheetDescription>
            Update inventory level information. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-4">
              {/* Product and Location */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Product & Location</h4>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-product">Product *</Label>
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
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-location">Location *</Label>
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
                  </div>
                </div>
              </div>

              {/* Quantities */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Quantities</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-quantity_on_hand">Quantity On Hand</Label>
                    <Input
                      id="edit-quantity_on_hand"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.quantity_on_hand}
                      onChange={(e) => handleChange("quantity_on_hand", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-quantity_reserved">Quantity Reserved</Label>
                    <Input
                      id="edit-quantity_reserved"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.quantity_reserved}
                      onChange={(e) => handleChange("quantity_reserved", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Status</h4>
                <div className="grid gap-2">
                  <Label htmlFor="edit-stock_status">Stock Status</Label>
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
                </div>
              </div>

              {/* Tracking */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Tracking</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-batch_number">Batch Number</Label>
                    <Input
                      id="edit-batch_number"
                      value={formData.batch_number}
                      onChange={(e) => handleChange("batch_number", e.target.value)}
                      placeholder="e.g., LOT-2024-001"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-serial_number">Serial Number</Label>
                    <Input
                      id="edit-serial_number"
                      value={formData.serial_number}
                      onChange={(e) => handleChange("serial_number", e.target.value)}
                      placeholder="e.g., SN123456"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-expiry_date">Expiry Date</Label>
                    <Input
                      id="edit-expiry_date"
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => handleChange("expiry_date", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-aisle_bin_slot">Aisle/Bin/Slot</Label>
                    <Input
                      id="edit-aisle_bin_slot"
                      value={formData.aisle_bin_slot}
                      onChange={(e) => handleChange("aisle_bin_slot", e.target.value)}
                      placeholder="e.g., A-01-03"
                    />
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
