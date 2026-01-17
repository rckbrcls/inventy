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
  Refund,
  RefundsRepository,
  UpdateRefundDTO,
  REFUND_STATUSES,
  REFUND_REASONS,
} from "@/lib/db/repositories/refunds-repository"
import { Payment } from "@/lib/db/repositories/payments-repository"

type RefundEditSheetProps = {
  refund: Refund | null
  payments: Payment[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RefundEditSheet({
  refund,
  payments,
  open,
  onOpenChange,
  onSuccess,
}: RefundEditSheetProps) {
  const [isSaving, setIsSaving] = React.useState(false)
  const [formData, setFormData] = React.useState({
    payment_id: "",
    amount: "",
    status: "pending",
    reason: "",
    provider_refund_id: "",
  })

  React.useEffect(() => {
    if (refund) {
      setFormData({
        payment_id: refund.payment_id || "",
        amount: refund.amount?.toString() || "",
        status: refund.status || "pending",
        reason: refund.reason || "",
        provider_refund_id: refund.provider_refund_id || "",
      })
    }
  }, [refund])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!refund) return

    if (!formData.payment_id || !formData.amount) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)

      const payload: UpdateRefundDTO = {
        id: refund.id,
        payment_id: formData.payment_id,
        amount: parseFloat(formData.amount) || 0,
        status: formData.status || undefined,
        reason: formData.reason || undefined,
        provider_refund_id: formData.provider_refund_id || undefined,
      }

      await RefundsRepository.update(payload)
      toast.success("Refund updated successfully")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update refund:", error)
      toast.error("Failed to update refund")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Refund</SheetTitle>
          <SheetDescription>
            Update refund information. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-4">
              {/* Payment Selection */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Refund Details</h4>

                <div className="grid gap-2">
                  <Label htmlFor="edit-payment_id">
                    Payment <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.payment_id}
                    onValueChange={(value) => handleChange("payment_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment" />
                    </SelectTrigger>
                    <SelectContent>
                      {payments.map((payment) => (
                        <SelectItem key={payment.id} value={payment.id}>
                          {payment.id.slice(0, 8)}... - {payment.method} - ${payment.amount.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REFUND_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-reason">Reason</Label>
                  <Select
                    value={formData.reason || "none"}
                    onValueChange={(value) => handleChange("reason", value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {REFUND_REASONS.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-provider_refund_id">Provider Refund ID</Label>
                  <Input
                    id="edit-provider_refund_id"
                    value={formData.provider_refund_id}
                    onChange={(e) => handleChange("provider_refund_id", e.target.value)}
                    placeholder="External provider reference"
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
