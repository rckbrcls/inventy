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
import { TransactionsRepository, UpdateTransactionDTO } from "@/lib/db/repositories/transactions-repository"

export const Route = createFileRoute("/transactions/$transactionId/edit")({
  component: EditTransaction,
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
  { value: "cancelled", label: "Cancelled" },
]

const CURRENCIES = [
  { value: "BRL", label: "BRL" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
]

function EditTransaction() {
  const navigate = useNavigate()
  const { transactionId } = Route.useParams()
  const [isSaving, setIsSaving] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  const [formData, setFormData] = React.useState({
    type: "sale",
    status: "draft",
    channel: "",
    customer_id: "",
    supplier_id: "",
    staff_id: "",
    currency: "BRL",
    total_items: "",
    total_shipping: "",
    total_discount: "",
    total_net: "",
    shipping_method: "",
    shipping_address: "",
    billing_address: "",
  })

  React.useEffect(() => {
    const loadTransaction = async () => {
      try {
        setIsLoading(true)
        const transaction = await TransactionsRepository.getById(transactionId)
        if (!transaction) {
          toast.error("Transaction not found")
          navigate({ to: "/transactions" })
          return
        }
        setFormData({
          type: transaction.type || "sale",
          status: transaction.status || "draft",
          channel: transaction.channel || "",
          customer_id: transaction.customer_id || "",
          supplier_id: transaction.supplier_id || "",
          staff_id: transaction.staff_id || "",
          currency: transaction.currency || "BRL",
          total_items: transaction.total_items?.toString() || "",
          total_shipping: transaction.total_shipping?.toString() || "",
          total_discount: transaction.total_discount?.toString() || "",
          total_net: transaction.total_net?.toString() || "",
          shipping_method: transaction.shipping_method || "",
          shipping_address: transaction.shipping_address || "",
          billing_address: transaction.billing_address || "",
        })
      } catch (error) {
        console.error("Failed to load transaction:", error)
        toast.error("Failed to load transaction")
      } finally {
        setIsLoading(false)
      }
    }
    loadTransaction()
  }, [transactionId, navigate])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)

      const payload: UpdateTransactionDTO = {
        id: transactionId,
        type: formData.type || undefined,
        status: formData.status || undefined,
        channel: formData.channel || undefined,
        customer_id: formData.customer_id || undefined,
        supplier_id: formData.supplier_id || undefined,
        staff_id: formData.staff_id || undefined,
        currency: formData.currency || undefined,
        total_items: formData.total_items ? parseFloat(formData.total_items) : undefined,
        total_shipping: formData.total_shipping ? parseFloat(formData.total_shipping) : undefined,
        total_discount: formData.total_discount ? parseFloat(formData.total_discount) : undefined,
        total_net: formData.total_net ? parseFloat(formData.total_net) : undefined,
        shipping_method: formData.shipping_method || undefined,
        shipping_address: formData.shipping_address || undefined,
        billing_address: formData.billing_address || undefined,
      }

      await TransactionsRepository.update(payload)
      toast.success("Transaction updated successfully")
      navigate({ to: "/transactions" })
    } catch (error) {
      console.error("Failed to update transaction:", error)
      toast.error("Failed to update transaction")
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
        <h3 className="text-lg font-medium">Edit Transaction</h3>
        <p className="text-sm text-muted-foreground">
          Update transaction details, pricing, and addresses.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Transaction Details */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>
                Update type, status, and currency.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                      <SelectValue />
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
                  <Input
                    id="channel"
                    value={formData.channel}
                    onChange={(e) => handleChange("channel", e.target.value)}
                    placeholder="e.g., pos, web, mobile"
                  />
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
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>
                Update totals for the transaction.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="total_net">Total Net</Label>
                  <Input
                    id="total_net"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_net}
                    onChange={(e) => handleChange("total_net", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="total_items">Total Items</Label>
                  <Input
                    id="total_items"
                    type="number"
                    step="1"
                    min="0"
                    value={formData.total_items}
                    onChange={(e) => handleChange("total_items", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="total_discount">Discount</Label>
                  <Input
                    id="total_discount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_discount}
                    onChange={(e) => handleChange("total_discount", e.target.value)}
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
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parties */}
          <Card>
            <CardHeader>
              <CardTitle>Parties</CardTitle>
              <CardDescription>
                Customer, supplier, and staff information.
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
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
              <CardDescription>
                Shipping method and address details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="shipping_method">Shipping Method</Label>
                <Input
                  id="shipping_method"
                  value={formData.shipping_method}
                  onChange={(e) => handleChange("shipping_method", e.target.value)}
                  placeholder="e.g., standard, express"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="shipping_address">Shipping Address (JSON)</Label>
                <Textarea
                  id="shipping_address"
                  value={formData.shipping_address}
                  onChange={(e) => handleChange("shipping_address", e.target.value)}
                  rows={3}
                  placeholder='{"street": "...", "city": "..."}'
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="billing_address">Billing Address (JSON)</Label>
                <Textarea
                  id="billing_address"
                  value={formData.billing_address}
                  onChange={(e) => handleChange("billing_address", e.target.value)}
                  rows={3}
                  placeholder='{"street": "...", "city": "..."}'
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
