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
import { Order, OrdersRepository, UpdateOrderDTO } from "@/lib/db/repositories/orders-repository"

type OrderEditSheetProps = {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const ORDER_STATUSES = [
  { value: "open", label: "Open" },
  { value: "archived", label: "Archived" },
  { value: "cancelled", label: "Cancelled" },
]

const PAYMENT_STATUSES = [
  { value: "unpaid", label: "Unpaid" },
  { value: "pending", label: "Pending" },
  { value: "authorized", label: "Authorized" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
  { value: "partially_refunded", label: "Partially Refunded" },
  { value: "voided", label: "Voided" },
]

const FULFILLMENT_STATUSES = [
  { value: "unfulfilled", label: "Unfulfilled" },
  { value: "scheduled", label: "Scheduled" },
  { value: "partially_fulfilled", label: "Partially Fulfilled" },
  { value: "fulfilled", label: "Fulfilled" },
  { value: "returned", label: "Returned" },
  { value: "restocked", label: "Restocked" },
]

const CURRENCIES = [
  { value: "BRL", label: "BRL" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
]

export function OrderEditSheet({
  order,
  open,
  onOpenChange,
  onSuccess,
}: OrderEditSheetProps) {
  const [isSaving, setIsSaving] = React.useState(false)
  const [formData, setFormData] = React.useState({
    channel: "",
    status: "open",
    payment_status: "unpaid",
    fulfillment_status: "unfulfilled",
    currency: "BRL",
    subtotal_price: "",
    total_discounts: "",
    total_tax: "",
    total_shipping: "",
    total_tip: "",
    total_price: "",
    note: "",
    tags: "",
    custom_attributes: "",
    metadata: "",
    customer_snapshot: "",
    billing_address: "",
    shipping_address: "",
  })

  React.useEffect(() => {
    if (order) {
      setFormData({
        channel: order.channel || "",
        status: order.status || "open",
        payment_status: order.payment_status || "unpaid",
        fulfillment_status: order.fulfillment_status || "unfulfilled",
        currency: order.currency || "BRL",
        subtotal_price: order.subtotal_price?.toString() || "",
        total_discounts: order.total_discounts?.toString() || "",
        total_tax: order.total_tax?.toString() || "",
        total_shipping: order.total_shipping?.toString() || "",
        total_tip: order.total_tip?.toString() || "",
        total_price: order.total_price?.toString() || "",
        note: order.note || "",
        tags: order.tags || "",
        custom_attributes: order.custom_attributes || "",
        metadata: order.metadata || "",
        customer_snapshot: order.customer_snapshot || "",
        billing_address: order.billing_address || "",
        shipping_address: order.shipping_address || "",
      })
    }
  }, [order])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!order) return

    if (!formData.subtotal_price || !formData.total_price) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)

      const payload: UpdateOrderDTO = {
        id: order.id,
        channel: formData.channel || undefined,
        status: formData.status || undefined,
        payment_status: formData.payment_status || undefined,
        fulfillment_status: formData.fulfillment_status || undefined,
        currency: formData.currency || undefined,
        subtotal_price: parseFloat(formData.subtotal_price) || 0,
        total_discounts: formData.total_discounts
          ? parseFloat(formData.total_discounts)
          : undefined,
        total_tax: formData.total_tax ? parseFloat(formData.total_tax) : undefined,
        total_shipping: formData.total_shipping
          ? parseFloat(formData.total_shipping)
          : undefined,
        total_tip: formData.total_tip ? parseFloat(formData.total_tip) : undefined,
        total_price: parseFloat(formData.total_price) || 0,
        note: formData.note || undefined,
        tags: formData.tags || undefined,
        custom_attributes: formData.custom_attributes || undefined,
        metadata: formData.metadata || undefined,
        customer_snapshot: formData.customer_snapshot || undefined,
        billing_address: formData.billing_address || undefined,
        shipping_address: formData.shipping_address || undefined,
      }

      await OrdersRepository.update(payload)
      toast.success("Order updated successfully")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update order:", error)
      toast.error("Failed to update order")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Order</SheetTitle>
          <SheetDescription>
            Update order information. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-4">
              {/* Status Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Status</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Order Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-payment_status">Payment Status</Label>
                    <Select
                      value={formData.payment_status}
                      onValueChange={(value) => handleChange("payment_status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-fulfillment_status">Fulfillment Status</Label>
                    <Select
                      value={formData.fulfillment_status}
                      onValueChange={(value) => handleChange("fulfillment_status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FULFILLMENT_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Pricing</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-subtotal_price">
                      Subtotal <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-subtotal_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.subtotal_price}
                      onChange={(e) => handleChange("subtotal_price", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-total_price">
                      Total <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-total_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.total_price}
                      onChange={(e) => handleChange("total_price", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-total_discounts">Discounts</Label>
                    <Input
                      id="edit-total_discounts"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.total_discounts}
                      onChange={(e) => handleChange("total_discounts", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-total_tax">Tax</Label>
                    <Input
                      id="edit-total_tax"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.total_tax}
                      onChange={(e) => handleChange("total_tax", e.target.value)}
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
                      min="0"
                      value={formData.total_shipping}
                      onChange={(e) => handleChange("total_shipping", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-total_tip">Tip</Label>
                    <Input
                      id="edit-total_tip"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.total_tip}
                      onChange={(e) => handleChange("total_tip", e.target.value)}
                    />
                  </div>
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

              {/* General Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">General</h4>
                <div className="grid gap-2">
                  <Label htmlFor="edit-channel">Channel</Label>
                  <Input
                    id="edit-channel"
                    value={formData.channel}
                    onChange={(e) => handleChange("channel", e.target.value)}
                    placeholder="e.g., web_store, pos, whatsapp"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-note">Note</Label>
                  <Textarea
                    id="edit-note"
                    value={formData.note}
                    onChange={(e) => handleChange("note", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-tags">Tags</Label>
                  <Input
                    id="edit-tags"
                    value={formData.tags}
                    onChange={(e) => handleChange("tags", e.target.value)}
                    placeholder="e.g., vip, urgent"
                  />
                </div>
              </div>

              {/* Advanced Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Advanced (JSON)</h4>
                <div className="grid gap-2">
                  <Label htmlFor="edit-custom_attributes">Custom Attributes</Label>
                  <Textarea
                    id="edit-custom_attributes"
                    value={formData.custom_attributes}
                    onChange={(e) => handleChange("custom_attributes", e.target.value)}
                    rows={2}
                    placeholder='[{"key": "Gift Message", "value": "Happy Birthday!"}]'
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-metadata">Metadata</Label>
                  <Textarea
                    id="edit-metadata"
                    value={formData.metadata}
                    onChange={(e) => handleChange("metadata", e.target.value)}
                    rows={2}
                    placeholder='{"source": "campaign_123"}'
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
                  <Label htmlFor="edit-shipping_address">Shipping Address (JSON)</Label>
                  <Textarea
                    id="edit-shipping_address"
                    value={formData.shipping_address}
                    onChange={(e) => handleChange("shipping_address", e.target.value)}
                    rows={2}
                  />
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
