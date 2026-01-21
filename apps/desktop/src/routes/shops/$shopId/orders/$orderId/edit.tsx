import { createFileRoute, useNavigate } from "@tanstack/react-router"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { OrdersRepository, UpdateOrderDTO } from "@/lib/db/repositories/orders-repository"

export const Route = createFileRoute("/shops/$shopId/orders/$orderId/edit")({
  component: EditOrder,
})

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

function EditOrder() {
  const navigate = useNavigate()
  const { orderId } = Route.useParams()
  const [isSaving, setIsSaving] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

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
    const loadOrder = async () => {
      try {
        setIsLoading(true)
        const order = await OrdersRepository.getById(orderId)
        if (!order) {
          toast.error("Order not found")
          navigate({ to: "/orders" })
          return
        }
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
      } catch (error) {
        console.error("Failed to load order:", error)
        toast.error("Failed to load order")
      } finally {
        setIsLoading(false)
      }
    }
    loadOrder()
  }, [orderId, navigate])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subtotal_price || !formData.total_price) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)

      const payload: UpdateOrderDTO = {
        id: orderId,
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
      navigate({ to: "/orders" })
    } catch (error) {
      console.error("Failed to update order:", error)
      toast.error("Failed to update order")
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
        <h3 className="text-lg font-medium">Edit Order</h3>
        <p className="text-sm text-muted-foreground">
          Update order status, pricing, and customer details.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Status Section */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>
                Update order, payment, and fulfillment statuses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Order Status</Label>
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
                  <Label htmlFor="payment_status">Payment Status</Label>
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
                  <Label htmlFor="fulfillment_status">Fulfillment Status</Label>
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
            </CardContent>
          </Card>

          {/* Pricing Section */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>
                Update order totals and currency.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="subtotal_price">
                    Subtotal <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="subtotal_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.subtotal_price}
                    onChange={(e) => handleChange("subtotal_price", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="total_price">
                    Total <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="total_price"
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
                  <Label htmlFor="total_discounts">Discounts</Label>
                  <Input
                    id="total_discounts"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_discounts}
                    onChange={(e) => handleChange("total_discounts", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="total_tax">Tax</Label>
                  <Input
                    id="total_tax"
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
                  <Label htmlFor="total_shipping">Shipping</Label>
                  <Input
                    id="total_shipping"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_shipping}
                    onChange={(e) => handleChange("total_shipping", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="total_tip">Tip</Label>
                  <Input
                    id="total_tip"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_tip}
                    onChange={(e) => handleChange("total_tip", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
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
            </CardContent>
          </Card>

          {/* General Section */}
          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
              <CardDescription>
                Notes and tags for internal tracking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="channel">Channel</Label>
                <Input
                  id="channel"
                  value={formData.channel}
                  onChange={(e) => handleChange("channel", e.target.value)}
                  placeholder="e.g., web_store, pos, whatsapp"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="note">Note</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => handleChange("note", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleChange("tags", e.target.value)}
                  placeholder="e.g., vip, urgent"
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced (JSON)</CardTitle>
              <CardDescription>
                Custom attributes and address snapshots.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="custom_attributes">Custom Attributes</Label>
                <Textarea
                  id="custom_attributes"
                  value={formData.custom_attributes}
                  onChange={(e) => handleChange("custom_attributes", e.target.value)}
                  rows={2}
                  placeholder='[{"key": "Gift Message", "value": "Happy Birthday!"}]'
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metadata">Metadata</Label>
                <Textarea
                  id="metadata"
                  value={formData.metadata}
                  onChange={(e) => handleChange("metadata", e.target.value)}
                  rows={2}
                  placeholder='{"source": "campaign_123"}'
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="customer_snapshot">Customer Snapshot (JSON)</Label>
                <Textarea
                  id="customer_snapshot"
                  value={formData.customer_snapshot}
                  onChange={(e) => handleChange("customer_snapshot", e.target.value)}
                  rows={3}
                  placeholder='{"name": "John Doe", "email": "john@example.com"}'
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="billing_address">Billing Address (JSON)</Label>
                <Textarea
                  id="billing_address"
                  value={formData.billing_address}
                  onChange={(e) => handleChange("billing_address", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="shipping_address">Shipping Address (JSON)</Label>
                <Textarea
                  id="shipping_address"
                  value={formData.shipping_address}
                  onChange={(e) => handleChange("shipping_address", e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/orders" })}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
