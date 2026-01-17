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
  Payment,
  PaymentsRepository,
  UpdatePaymentDTO,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  RISK_LEVELS,
} from "@/lib/db/repositories/payments-repository"

type PaymentEditSheetProps = {
  payment: Payment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function PaymentEditSheet({
  payment,
  open,
  onOpenChange,
  onSuccess,
}: PaymentEditSheetProps) {
  const [isSaving, setIsSaving] = React.useState(false)
  const [formData, setFormData] = React.useState({
    amount: "",
    currency: "BRL",
    exchange_rate: "",
    provider: "",
    method: "credit_card",
    installments: "1",
    installment_amount: "",
    interest_rate: "",
    status: "pending",
    provider_transaction_id: "",
    authorization_code: "",
    payment_details: "",
    metadata: "",
    risk_level: "",
  })

  React.useEffect(() => {
    if (payment) {
      setFormData({
        amount: payment.amount?.toString() || "",
        currency: payment.currency || "BRL",
        exchange_rate: payment.exchange_rate?.toString() || "",
        provider: payment.provider || "",
        method: payment.method || "credit_card",
        installments: payment.installments?.toString() || "1",
        installment_amount: payment.installment_amount?.toString() || "",
        interest_rate: payment.interest_rate?.toString() || "",
        status: payment.status || "pending",
        provider_transaction_id: payment.provider_transaction_id || "",
        authorization_code: payment.authorization_code || "",
        payment_details: payment.payment_details || "",
        metadata: payment.metadata || "",
        risk_level: payment.risk_level || "",
      })
    }
  }, [payment])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!payment) return

    if (!formData.amount || !formData.provider || !formData.method) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)

      const payload: UpdatePaymentDTO = {
        id: payment.id,
        amount: parseFloat(formData.amount) || 0,
        currency: formData.currency || undefined,
        exchange_rate: formData.exchange_rate
          ? parseFloat(formData.exchange_rate)
          : undefined,
        provider: formData.provider,
        method: formData.method,
        installments: formData.installments
          ? parseInt(formData.installments)
          : undefined,
        installment_amount: formData.installment_amount
          ? parseFloat(formData.installment_amount)
          : undefined,
        interest_rate: formData.interest_rate
          ? parseFloat(formData.interest_rate)
          : undefined,
        status: formData.status || undefined,
        provider_transaction_id: formData.provider_transaction_id || undefined,
        authorization_code: formData.authorization_code || undefined,
        payment_details: formData.payment_details || undefined,
        metadata: formData.metadata || undefined,
        risk_level: formData.risk_level || undefined,
      }

      await PaymentsRepository.update(payload)
      toast.success("Payment updated successfully")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update payment:", error)
      toast.error("Failed to update payment")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Payment</SheetTitle>
          <SheetDescription>
            Update payment information. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-4">
              {/* Amount & Currency */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Amount</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-amount">
                      Amount <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="edit-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => handleChange("amount", e.target.value)}
                    />
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
                        <SelectItem value="BRL">BRL</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-exchange_rate">Exchange Rate</Label>
                  <Input
                    id="edit-exchange_rate"
                    type="number"
                    step="0.0001"
                    min="0"
                    value={formData.exchange_rate}
                    onChange={(e) => handleChange("exchange_rate", e.target.value)}
                    placeholder="1.0000"
                  />
                </div>
              </div>

              {/* Provider & Method */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Payment Method</h4>
                <div className="grid gap-2">
                  <Label htmlFor="edit-provider">
                    Provider <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-provider"
                    value={formData.provider}
                    onChange={(e) => handleChange("provider", e.target.value)}
                    placeholder="stripe, pagar.me, manual_cash..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-method">
                    Method <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.method}
                    onValueChange={(value) => handleChange("method", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Installments */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Installments</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-installments">Qty</Label>
                    <Input
                      id="edit-installments"
                      type="number"
                      min="1"
                      max="24"
                      value={formData.installments}
                      onChange={(e) => handleChange("installments", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-installment_amount">Amount/Each</Label>
                    <Input
                      id="edit-installment_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.installment_amount}
                      onChange={(e) => handleChange("installment_amount", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-interest_rate">Interest %</Label>
                    <Input
                      id="edit-interest_rate"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.interest_rate}
                      onChange={(e) => handleChange("interest_rate", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Status & Risk */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Payment Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleChange("status", value)}
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
                    <Label htmlFor="edit-risk_level">Risk Level</Label>
                    <Select
                      value={formData.risk_level || "none"}
                      onValueChange={(value) =>
                        handleChange("risk_level", value === "none" ? "" : value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {RISK_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* External IDs */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">External References</h4>
                <div className="grid gap-2">
                  <Label htmlFor="edit-provider_transaction_id">Provider Transaction ID</Label>
                  <Input
                    id="edit-provider_transaction_id"
                    value={formData.provider_transaction_id}
                    onChange={(e) =>
                      handleChange("provider_transaction_id", e.target.value)
                    }
                    placeholder="ch_3Lk..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-authorization_code">Authorization Code (NSU)</Label>
                  <Input
                    id="edit-authorization_code"
                    value={formData.authorization_code}
                    onChange={(e) => handleChange("authorization_code", e.target.value)}
                    placeholder="123456"
                  />
                </div>
              </div>

              {/* Advanced */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Advanced</h4>
                <div className="grid gap-2">
                  <Label htmlFor="edit-payment_details">Payment Details (JSON)</Label>
                  <Textarea
                    id="edit-payment_details"
                    value={formData.payment_details}
                    onChange={(e) => handleChange("payment_details", e.target.value)}
                    rows={3}
                    placeholder='{"last4": "4242", "brand": "visa"}'
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-metadata">Metadata (JSON)</Label>
                  <Textarea
                    id="edit-metadata"
                    value={formData.metadata}
                    onChange={(e) => handleChange("metadata", e.target.value)}
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
