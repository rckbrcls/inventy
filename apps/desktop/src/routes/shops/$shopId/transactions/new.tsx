import { createFileRoute, useNavigate } from "@tanstack/react-router"
import * as React from "react"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"

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
import { TransactionsRepository, CreateTransactionDTO, CreateTransactionItemDTO } from "@/lib/db/repositories/transactions-repository"
import { ProductsRepository, Product } from "@/lib/db/repositories/products-repository"

export const Route = createFileRoute("/shops/$shopId/transactions/new")({
  component: NewTransaction,
})

const TRANSACTION_TYPES = [
  { value: "sale", label: "Sale" },
  { value: "purchase", label: "Purchase" },
  { value: "transfer", label: "Transfer" },
  { value: "return", label: "Return" },
  { value: "adjustment", label: "Adjustment" },
]

const TRANSACTION_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
]

const CURRENCIES = [
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
]

const CHANNELS = [
  { value: "pos", label: "Point of Sale" },
  { value: "web", label: "Web Store" },
  { value: "mobile", label: "Mobile App" },
  { value: "manual", label: "Manual" },
  { value: "whatsapp", label: "WhatsApp" },
]

type TransactionItemForm = {
  product_id: string
  quantity: string
  product_name?: string
  unit_price?: number
}

function NewTransaction() {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = React.useState(false)
  const [products, setProducts] = React.useState<Product[]>([])
  const [items, setItems] = React.useState<TransactionItemForm[]>([])

  const [formData, setFormData] = React.useState({
    type: "sale",
    status: "draft",
    channel: "pos",
    customer_id: "",
    supplier_id: "",
    staff_id: "",
    currency: "BRL",
    total_shipping: "",
    total_discount: "",
    shipping_method: "",
    shipping_address: "",
    billing_address: "",
    location_id: "",
  })

  // Load products for selection
  React.useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsList = await ProductsRepository.list()
        setProducts(productsList)
      } catch (error) {
        console.error("Failed to load products:", error)
      }
    }
    loadProducts()
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddItem = () => {
    setItems((prev) => [...prev, { product_id: "", quantity: "1" }])
  }

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: string, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item
        
        const updatedItem = { ...item, [field]: value }
        
        // If product_id changed, update the product name and price
        if (field === "product_id") {
          const product = products.find((p) => p.id === value)
          if (product) {
            updatedItem.product_name = product.name
            updatedItem.unit_price = product.price
          }
        }
        
        return updatedItem
      })
    )
  }

  // Calculate total
  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0
      const price = item.unit_price || 0
      return sum + quantity * price
    }, 0)

    const shipping = parseFloat(formData.total_shipping) || 0
    const discount = parseFloat(formData.total_discount) || 0

    return itemsTotal + shipping - discount
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.type) {
      toast.error("Please select a transaction type")
      return
    }

    if (items.length === 0) {
      toast.error("Please add at least one item to the transaction")
      return
    }

    const invalidItems = items.filter((item) => !item.product_id || !item.quantity)
    if (invalidItems.length > 0) {
      toast.error("Please fill in all item details")
      return
    }

    try {
      setIsSaving(true)

      const transactionItems: CreateTransactionItemDTO[] = items.map((item) => ({
        product_id: item.product_id,
        quantity: parseFloat(item.quantity) || 0,
      }))

      const payload: CreateTransactionDTO = {
        type: formData.type,
        status: formData.status || undefined,
        channel: formData.channel || undefined,
        customer_id: formData.customer_id || undefined,
        supplier_id: formData.supplier_id || undefined,
        staff_id: formData.staff_id || undefined,
        currency: formData.currency || undefined,
        total_shipping: formData.total_shipping ? parseFloat(formData.total_shipping) : undefined,
        total_discount: formData.total_discount ? parseFloat(formData.total_discount) : undefined,
        shipping_method: formData.shipping_method || undefined,
        shipping_address: formData.shipping_address || undefined,
        billing_address: formData.billing_address || undefined,
        location_id: formData.location_id || undefined,
        items: transactionItems,
      }

      await TransactionsRepository.create(payload)
      toast.success("Transaction created successfully")
      navigate({ to: "/transactions" })
    } catch (error) {
      console.error("Failed to create transaction:", error)
      toast.error("Failed to create transaction")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium">New Transaction</h3>
        <p className="text-sm text-muted-foreground">
          Create a new transaction with items.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Transaction Type & Status */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>
                Set the type and status of this transaction.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">
                    Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                      {TRANSACTION_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="channel">Channel</Label>
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

          {/* Transaction Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>
                Add products to this transaction.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No items added yet. Click "Add Item" to add products.
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-4 items-end">
                      <div className="flex-1 grid gap-2">
                        <Label>Product</Label>
                        <Select
                          value={item.product_id}
                          onValueChange={(value) => handleItemChange(index, "product_id", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - {product.currency || "BRL"} {product.price?.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-24 grid gap-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        />
                      </div>
                      <div className="w-32 grid gap-2">
                        <Label>Subtotal</Label>
                        <div className="h-9 px-3 flex items-center border rounded-md bg-muted text-sm">
                          {((parseFloat(item.quantity) || 0) * (item.unit_price || 0)).toFixed(2)}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Button type="button" variant="outline" onClick={handleAddItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>

              {items.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total</span>
                    <span>{formData.currency} {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parties */}
          <Card>
            <CardHeader>
              <CardTitle>Parties</CardTitle>
              <CardDescription>
                Customer, supplier and staff information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer_id">Customer ID</Label>
                  <Input
                    id="customer_id"
                    value={formData.customer_id}
                    onChange={(e) => handleChange("customer_id", e.target.value)}
                    placeholder="UUID"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supplier_id">Supplier ID</Label>
                  <Input
                    id="supplier_id"
                    value={formData.supplier_id}
                    onChange={(e) => handleChange("supplier_id", e.target.value)}
                    placeholder="UUID"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="staff_id">Staff ID</Label>
                  <Input
                    id="staff_id"
                    value={formData.staff_id}
                    onChange={(e) => handleChange("staff_id", e.target.value)}
                    placeholder="UUID"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location_id">
                  Location ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="location_id"
                  value={formData.location_id}
                  onChange={(e) => handleChange("location_id", e.target.value)}
                  placeholder="UUID of the location/store"
                />
                <p className="text-xs text-muted-foreground">
                  Required for inventory movements when completing the transaction.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping & Discounts */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping & Discounts</CardTitle>
              <CardDescription>
                Additional charges and discounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
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
                  <Label htmlFor="total_discount">Discount</Label>
                  <Input
                    id="total_discount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_discount}
                    onChange={(e) => handleChange("total_discount", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="shipping_method">Shipping Method</Label>
                  <Input
                    id="shipping_method"
                    value={formData.shipping_method}
                    onChange={(e) => handleChange("shipping_method", e.target.value)}
                    placeholder="e.g., standard, express"
                  />
                </div>
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
            <CardFooter className="border-t px-6 py-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/transactions" })}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Creating..." : "Create Transaction"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
