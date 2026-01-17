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
import { Transaction, TransactionsRepository, UpdateTransactionDTO } from "@/lib/db/repositories/transactions-repository"

type TransactionEditSheetProps = {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

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

export function TransactionEditSheet({
  transaction,
  open,
  onOpenChange,
  onSuccess,
}: TransactionEditSheetProps) {
  const [isSaving, setIsSaving] = React.useState(false)
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
    if (transaction) {
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
    }
  }, [transaction])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!transaction) return

    try {
      setIsSaving(true)

      const payload: UpdateTransactionDTO = {
        id: transaction.id,
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
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update transaction:", error)
      toast.error("Failed to update transaction")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Transaction</SheetTitle>
          <SheetDescription>
            Update transaction information. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-4">
              {/* Type and Status Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Type & Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-type">Type</Label>
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
                    <Label htmlFor="edit-status">Status</Label>
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
              </div>

              {/* Pricing Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Pricing</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-total_net">Total Net</Label>
                    <Input
                      id="edit-total_net"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.total_net}
                      onChange={(e) => handleChange("total_net", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-total_items">Total Items</Label>
                    <Input
                      id="edit-total_items"
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
                    <Label htmlFor="edit-total_discount">Discount</Label>
                    <Input
                      id="edit-total_discount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.total_discount}
                      onChange={(e) => handleChange("total_discount", e.target.value)}
                    />
                  </div>
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
                    placeholder="e.g., pos, web, mobile"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-customer_id">Customer ID</Label>
                  <Input
                    id="edit-customer_id"
                    value={formData.customer_id}
                    onChange={(e) => handleChange("customer_id", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-supplier_id">Supplier ID</Label>
                  <Input
                    id="edit-supplier_id"
                    value={formData.supplier_id}
                    onChange={(e) => handleChange("supplier_id", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-staff_id">Staff ID</Label>
                  <Input
                    id="edit-staff_id"
                    value={formData.staff_id}
                    onChange={(e) => handleChange("staff_id", e.target.value)}
                  />
                </div>
              </div>

              {/* Shipping Section */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Shipping</h4>
                <div className="grid gap-2">
                  <Label htmlFor="edit-shipping_method">Shipping Method</Label>
                  <Input
                    id="edit-shipping_method"
                    value={formData.shipping_method}
                    onChange={(e) => handleChange("shipping_method", e.target.value)}
                    placeholder="e.g., standard, express"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-shipping_address">Shipping Address (JSON)</Label>
                  <Textarea
                    id="edit-shipping_address"
                    value={formData.shipping_address}
                    onChange={(e) => handleChange("shipping_address", e.target.value)}
                    rows={3}
                    placeholder='{"street": "...", "city": "..."}'
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-billing_address">Billing Address (JSON)</Label>
                  <Textarea
                    id="edit-billing_address"
                    value={formData.billing_address}
                    onChange={(e) => handleChange("billing_address", e.target.value)}
                    rows={3}
                    placeholder='{"street": "...", "city": "..."}'
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
