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
import { OrdersRepository, CreateOrderDTO } from "@/lib/db/repositories/orders-repository"

export const Route = createFileRoute("/orders/new")({
  component: NewOrder,
})

const ORDER_STATUSES = [
  { value: "open", label: "Open" },
  { value: "archived", label: "Archived" },
]

const PAYMENT_STATUSES = [
  { value: "unpaid", label: "Unpaid" },
  { value: "pending", label: "Pending" },
  { value: "authorized", label: "Authorized" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
]

const FULFILLMENT_STATUSES = [
  { value: "unfulfilled", label: "Unfulfilled" },
  { value: "scheduled", label: "Scheduled" },
  { value: "partially_fulfilled", label: "Partially Fulfilled" },
  { value: "fulfilled", label: "Fulfilled" },
]

const CURRENCIES = [
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
]

const CHANNELS = [
  { value: "manual", label: "Manual" },
  { value: "web_store", label: "Web Store" },
  { value: "mobile_app", label: "Mobile App" },
  { value: "pos", label: "Point of Sale" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "marketplace", label: "Marketplace" },
]

function NewOrder() {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = React.useState(false)

  const [formData, setFormData] = React.useState({
    channel: "manual",
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
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    custom_attributes: "",
    metadata: "",
    billing_address: "",
    shipping_address: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Auto-calculate total price when subtotal or other fields change
  React.useEffect(() => {
    const subtotal = parseFloat(formData.subtotal_price) || 0
    const discounts = parseFloat(formData.total_discounts) || 0
    const tax = parseFloat(formData.total_tax) || 0
    const shipping = parseFloat(formData.total_shipping) || 0
    const tip = parseFloat(formData.total_tip) || 0

    const total = subtotal - discounts + tax + shipping + tip
    if (total >= 0 && formData.subtotal_price) {
      setFormData((prev) => ({
        ...prev,
        total_price: total.toFixed(2),
      }))
    }
  }, [
    formData.subtotal_price,
    formData.total_discounts,
    formData.total_tax,
    formData.total_shipping,
    formData.total_tip,
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subtotal_price || !formData.total_price) {
      toast.error("Please fill in the required price fields")
      return
    }

    if (!formData.customer_name && !formData.customer_email) {
      toast.error("Please provide at least customer name or email")
      return
    }

    try {
      setIsSaving(true)

      // Build customer snapshot
      const customerSnapshot = JSON.stringify({
        name: formData.customer_name || undefined,
        email: formData.customer_email || undefined,
        phone: formData.customer_phone || undefined,
      })

      const payload: CreateOrderDTO = {
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
        customer_snapshot: customerSnapshot,
        billing_address: formData.billing_address || undefined,
        shipping_address: formData.shipping_address || undefined,
      }

      await OrdersRepository.create(payload)
      toast.success("Order created successfully")
      navigate({ to: "/orders" })
    } catch (error) {
      console.error("Failed to create order:", error)
      toast.error("Failed to create order")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium">New Order</h3>
        <p className="text-sm text-muted-foreground">
          Create a new order manually.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>
                Customer details for this order. At least name or email is required.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer_name">
                    Customer Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => handleChange("customer_name", e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customer_email">Customer Email</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => handleChange("customer_email", e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="customer_phone">Customer Phone</Label>
                <Input
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) => handleChange("customer_phone", e.target.value)}
                  placeholder="+55 11 99999-9999"
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>
                Set the initial status for this order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Order Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
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
                      <SelectValue placeholder="Select payment status" />
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
                      <SelectValue placeholder="Select fulfillment status" />
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

              <div className="grid gap-2">
                <Label htmlFor="channel">Sales Channel</Label>
                <Select
                  value={formData.channel}
                  onValueChange={(value) => handleChange("channel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNELS.map((channel) => (
                      <SelectItem key={channel.value} value={channel.value}>
                        {channel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>
                Order totals and pricing details. Total is auto-calculated.
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
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="total_discounts">Discounts</Label>
                  <Input
                    id="total_discounts"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_discounts}
                    onChange={(e) => handleChange("total_discounts", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="total_tax">Tax</Label>
                  <Input
                    id="total_tax"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_tax}
                    onChange={(e) => handleChange("total_tax", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="total_shipping">Shipping</Label>
                  <Input
                    id="total_shipping"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_shipping}
                    onChange={(e) => handleChange("total_shipping", e.target.value)}
                    placeholder="0.00"
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
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    placeholder="0.00"
                    className="font-medium"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleChange("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
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
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Notes, tags, and other order details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="note">Order Note</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => handleChange("note", e.target.value)}
                  placeholder="Internal notes about this order..."
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleChange("tags", e.target.value)}
                  placeholder="vip, urgent, priority"
                />
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <CardTitle>Addresses</CardTitle>
              <CardDescription>
                Billing and shipping address information (JSON format).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="billing_address">Billing Address (JSON)</Label>
                <Textarea
                  id="billing_address"
                  value={formData.billing_address}
                  onChange={(e) => handleChange("billing_address", e.target.value)}
                  placeholder='{"street": "123 Main St", "city": "São Paulo", "country": "BR"}'
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="shipping_address">Shipping Address (JSON)</Label>
                <Textarea
                  id="shipping_address"
                  value={formData.shipping_address}
                  onChange={(e) => handleChange("shipping_address", e.target.value)}
                  placeholder='{"street": "123 Main St", "city": "São Paulo", "country": "BR"}'
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced</CardTitle>
              <CardDescription>
                Custom attributes and metadata (JSON format).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="custom_attributes">Custom Attributes (JSON)</Label>
                <Textarea
                  id="custom_attributes"
                  value={formData.custom_attributes}
                  onChange={(e) => handleChange("custom_attributes", e.target.value)}
                  placeholder='[{"key": "Gift Message", "value": "Happy Birthday!"}]'
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metadata">Metadata (JSON)</Label>
                <Textarea
                  id="metadata"
                  value={formData.metadata}
                  onChange={(e) => handleChange("metadata", e.target.value)}
                  placeholder='{"source": "campaign_123", "utm_source": "google"}'
                  rows={3}
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
                  {isSaving ? "Creating..." : "Create Order"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
