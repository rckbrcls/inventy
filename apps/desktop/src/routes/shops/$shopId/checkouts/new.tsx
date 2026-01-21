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
import {
  CheckoutsRepository,
  CreateCheckoutDTO,
} from "@/lib/db/repositories/checkouts-repository"

export const Route = createFileRoute("/shops/$shopId/checkouts/new")({
  component: NewCheckout,
})

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

function NewCheckout() {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = React.useState(false)

  const [formData, setFormData] = React.useState({
    email: "",
    user_id: "",
    status: "open",
    currency: "BRL",
    subtotal_price: "",
    total_tax: "",
    total_shipping: "",
    total_discounts: "",
    total_price: "",
    items: "[]",
    shipping_address: "",
    billing_address: "",
    shipping_line: "",
    applied_discount_codes: "",
    metadata: "",
    recovery_url: "",
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)

      const payload: CreateCheckoutDTO = {
        email: formData.email || undefined,
        user_id: formData.user_id || undefined,
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

      await CheckoutsRepository.create(payload)
      toast.success("Checkout created successfully")
      navigate({ to: "/checkouts" })
    } catch (error) {
      console.error("Failed to create checkout:", error)
      toast.error("Failed to create checkout")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium">New Checkout</h3>
        <p className="text-sm text-muted-foreground">
          Create a new checkout session. A unique token will be generated automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Customer identification and checkout status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="customer@example.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Important for abandoned cart recovery.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="user_id">User ID</Label>
                  <Input
                    id="user_id"
                    value={formData.user_id}
                    onChange={(e) => handleChange("user_id", e.target.value)}
                    placeholder="Optional - UUID of logged user"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
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

              <div className="grid gap-2">
                <Label htmlFor="recovery_url">Recovery URL</Label>
                <Input
                  id="recovery_url"
                  type="url"
                  value={formData.recovery_url}
                  onChange={(e) => handleChange("recovery_url", e.target.value)}
                  placeholder="https://store.com/checkout?token=..."
                />
                <p className="text-xs text-muted-foreground">
                  Magic link sent in abandoned cart emails.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cart Items */}
          <Card>
            <CardHeader>
              <CardTitle>Cart Items</CardTitle>
              <CardDescription>
                Products in the shopping cart (JSON format).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="items">Items (JSON Array)</Label>
                <Textarea
                  id="items"
                  value={formData.items}
                  onChange={(e) => handleChange("items", e.target.value)}
                  rows={4}
                  placeholder='[{"product_id": "uuid", "sku": "PROD-001", "quantity": 1, "unit_price": 99.90}]'
                />
                <p className="text-xs text-muted-foreground">
                  Array of cart items with product_id, sku, quantity, unit_price, and properties.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="applied_discount_codes">Applied Discount Codes (JSON)</Label>
                <Input
                  id="applied_discount_codes"
                  value={formData.applied_discount_codes}
                  onChange={(e) => handleChange("applied_discount_codes", e.target.value)}
                  placeholder='["CUPOM10", "FRETE"]'
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>
                Financial breakdown of the checkout.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="subtotal_price">Subtotal</Label>
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
                    placeholder="0.00"
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
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="total_price">Total Price</Label>
                <Input
                  id="total_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.total_price}
                  onChange={(e) => handleChange("total_price", e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Final amount to be charged (subtotal - discounts + shipping + tax).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <CardTitle>Addresses & Shipping</CardTitle>
              <CardDescription>
                Delivery and billing information (JSON format).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="shipping_address">Shipping Address (JSON)</Label>
                <Textarea
                  id="shipping_address"
                  value={formData.shipping_address}
                  onChange={(e) => handleChange("shipping_address", e.target.value)}
                  rows={3}
                  placeholder='{"address1": "123 Main St", "city": "São Paulo", "postal_code": "01310-100"}'
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="billing_address">Billing Address (JSON)</Label>
                <Textarea
                  id="billing_address"
                  value={formData.billing_address}
                  onChange={(e) => handleChange("billing_address", e.target.value)}
                  rows={3}
                  placeholder='{"address1": "456 Business Ave", "city": "Rio de Janeiro"}'
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="shipping_line">Shipping Method (JSON)</Label>
                <Textarea
                  id="shipping_line"
                  value={formData.shipping_line}
                  onChange={(e) => handleChange("shipping_line", e.target.value)}
                  rows={2}
                  placeholder='{"code": "sedex", "price": 15.00, "carrier": "Correios", "delivery_days": 3}'
                />
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
              <CardDescription>
                Additional tracking and marketing data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="metadata">Metadata (JSON)</Label>
                <Textarea
                  id="metadata"
                  value={formData.metadata}
                  onChange={(e) => handleChange("metadata", e.target.value)}
                  rows={3}
                  placeholder='{"source": "instagram", "utm_campaign": "summer2024", "user_agent": "...", "ip": "..."}'
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/checkouts" })}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Creating..." : "Create Checkout"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
