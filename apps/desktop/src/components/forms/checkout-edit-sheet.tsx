import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Checkout,
  CheckoutsRepository,
  UpdateCheckoutDTO,
} from "@/lib/db/repositories/checkouts-repository"

type CheckoutEditSheetProps = {
  checkout: Checkout | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const CHECKOUT_STATUSES = [
  { value: "open", label: "Open" },
  { value: "completed", label: "Completed" },
  { value: "expired", label: "Expired" },
]

const CURRENCIES = [
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
]

export function CheckoutEditSheet({
  checkout,
  open,
  onOpenChange,
  onSuccess,
}: CheckoutEditSheetProps) {
  const [isSaving, setIsSaving] = React.useState(false)
  const [formData, setFormData] = React.useState({
    email: "",
    status: "open",
    currency: "BRL",
    subtotal_price: "",
    total_tax: "",
    total_shipping: "",
    total_discounts: "",
    total_price: "",
    items: "",
    shipping_address: "",
    billing_address: "",
    shipping_line: "",
    applied_discount_codes: "",
    metadata: "",
    recovery_url: "",
  })

  React.useEffect(() => {
    if (checkout) {
      setFormData({
        email: checkout.email || "",
        status: checkout.status || "open",
        currency: checkout.currency || "BRL",
        subtotal_price: checkout.subtotal_price?.toString() || "",
        total_tax: checkout.total_tax?.toString() || "",
        total_shipping: checkout.total_shipping?.toString() || "",
        total_discounts: checkout.total_discounts?.toString() || "",
        total_price: checkout.total_price?.toString() || "",
        items: checkout.items || "",
        shipping_address: checkout.shipping_address || "",
        billing_address: checkout.billing_address || "",
        shipping_line: checkout.shipping_line || "",
        applied_discount_codes: checkout.applied_discount_codes || "",
        metadata: checkout.metadata || "",
        recovery_url: checkout.recovery_url || "",
      })
    }
  }, [checkout])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!checkout) return

    try {
      setIsSaving(true)

      const payload: UpdateCheckoutDTO = {
        id: checkout.id,
        email: formData.email || undefined,
        status: formData.status || undefined,
        currency: formData.currency || undefined,
        subtotal_price: formData.subtotal_price
          ? parseFloat(formData.subtotal_price)
          : undefined,
        total_tax: formData.total_tax ? parseFloat(formData.total_tax) : undefined,
        total_shipping: formData.total_shipping
          ? parseFloat(formData.total_shipping)
          : undefined,
        total_discounts: formData.total_discounts
          ? parseFloat(formData.total_discounts)
          : undefined,
        total_price: formData.total_price
          ? parseFloat(formData.total_price)
          : undefined,
        items: formData.items || undefined,
        shipping_address: formData.shipping_address || undefined,
        billing_address: formData.billing_address || undefined,
        shipping_line: formData.shipping_line || undefined,
        applied_discount_codes: formData.applied_discount_codes || undefined,
        metadata: formData.metadata || undefined,
        recovery_url: formData.recovery_url || undefined,
      }

      await CheckoutsRepository.update(payload)
      toast.success("Checkout updated successfully")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update checkout:", error)
      toast.error("Failed to update checkout")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Checkout</SheetTitle>
          <SheetDescription>
            Update checkout information. Token:{" "}
            <span className="font-mono text-xs">{checkout?.token}</span>
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Basic Information</h4>

                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="customer@example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHECKOUT_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => handleChange("currency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-recovery_url">Recovery URL</Label>
                  <Input
                    id="edit-recovery_url"
                    type="url"
                    value={formData.recovery_url}
                    onChange={(e) => handleChange("recovery_url", e.target.value)}
                    placeholder="https://store.com/checkout?token=..."
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Pricing</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-subtotal_price">Subtotal</Label>
                    <Input
                      id="edit-subtotal_price"
                      type="number"
                      step="0.01"
                      value={formData.subtotal_price}
                      onChange={(e) => handleChange("subtotal_price", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-total_discounts">Discounts</Label>
                    <Input
                      id="edit-total_discounts"
                      type="number"
                      step="0.01"
                      value={formData.total_discounts}
                      onChange={(e) => handleChange("total_discounts", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-total_shipping">Shipping</Label>
                    <Input
                      id="edit-total_shipping"
                      type="number"
                      step="0.01"
                      value={formData.total_shipping}
                      onChange={(e) => handleChange("total_shipping", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-total_tax">Tax</Label>
                    <Input
                      id="edit-total_tax"
                      type="number"
                      step="0.01"
                      value={formData.total_tax}
                      onChange={(e) => handleChange("total_tax", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-total_price">Total Price</Label>
                  <Input
                    id="edit-total_price"
                    type="number"
                    step="0.01"
                    value={formData.total_price}
                    onChange={(e) => handleChange("total_price", e.target.value)}
                  />
                </div>
              </div>

              {/* JSON Fields */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Cart & Addresses</h4>

                <div className="grid gap-2">
                  <Label htmlFor="edit-items">Items (JSON)</Label>
                  <Textarea
                    id="edit-items"
                    value={formData.items}
                    onChange={(e) => handleChange("items", e.target.value)}
                    rows={3}
                    placeholder='[{"sku": "PROD-001", "qty": 1, "price": 99.90}]'
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-shipping_address">Shipping Address (JSON)</Label>
                  <Textarea
                    id="edit-shipping_address"
                    value={formData.shipping_address}
                    onChange={(e) => handleChange("shipping_address", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-billing_address">Billing Address (JSON)</Label>
                  <Textarea
                    id="edit-billing_address"
                    value={formData.billing_address}
                    onChange={(e) => handleChange("billing_address", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-shipping_line">Shipping Line (JSON)</Label>
                  <Textarea
                    id="edit-shipping_line"
                    value={formData.shipping_line}
                    onChange={(e) => handleChange("shipping_line", e.target.value)}
                    rows={2}
                    placeholder='{"code": "sedex", "price": 15.00, "carrier": "Correios"}'
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-applied_discount_codes">
                    Discount Codes (JSON)
                  </Label>
                  <Textarea
                    id="edit-applied_discount_codes"
                    value={formData.applied_discount_codes}
                    onChange={(e) =>
                      handleChange("applied_discount_codes", e.target.value)
                    }
                    rows={1}
                    placeholder='["CUPOM10", "FRETE"]'
                  />
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Metadata</h4>
                <div className="grid gap-2">
                  <Label htmlFor="edit-metadata">Metadata (JSON)</Label>
                  <Textarea
                    id="edit-metadata"
                    value={formData.metadata}
                    onChange={(e) => handleChange("metadata", e.target.value)}
                    rows={2}
                    placeholder='{"source": "instagram", "utm_campaign": "summer2024"}'
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
          <SheetFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
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
