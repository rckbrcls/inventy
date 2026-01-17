import { createFileRoute, useNavigate } from "@tanstack/react-router"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  RefundsRepository,
  UpdateRefundDTO,
  REFUND_STATUSES,
  REFUND_REASONS,
} from "@/lib/db/repositories/refunds-repository"
import { Payment, PaymentsRepository } from "@/lib/db/repositories/payments-repository"

export const Route = createFileRoute("/refunds/$refundId/edit")({
  component: EditRefund,
})

function EditRefund() {
  const navigate = useNavigate()
  const { refundId } = Route.useParams()
  const [payments, setPayments] = React.useState<Payment[]>([])
  const [isSaving, setIsSaving] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  const [formData, setFormData] = React.useState({
    payment_id: "",
    amount: "",
    status: "pending",
    reason: "",
    provider_refund_id: "",
  })

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [refund, paymentsData] = await Promise.all([
          RefundsRepository.getById(refundId),
          PaymentsRepository.list(),
        ])
        if (!refund) {
          toast.error("Refund not found")
          navigate({ to: "/refunds" })
          return
        }
        setPayments(paymentsData)
        setFormData({
          payment_id: refund.payment_id || "",
          amount: refund.amount?.toString() || "",
          status: refund.status || "pending",
          reason: refund.reason || "",
          provider_refund_id: refund.provider_refund_id || "",
        })
      } catch (error) {
        console.error("Failed to load refund:", error)
        toast.error("Failed to load refund")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [refundId, navigate])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.payment_id || !formData.amount) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)

      const payload: UpdateRefundDTO = {
        id: refundId,
        payment_id: formData.payment_id,
        amount: parseFloat(formData.amount) || 0,
        status: formData.status || undefined,
        reason: formData.reason || undefined,
        provider_refund_id: formData.provider_refund_id || undefined,
      }

      await RefundsRepository.update(payload)
      toast.success("Refund updated successfully")
      navigate({ to: "/refunds" })
    } catch (error) {
      console.error("Failed to update refund:", error)
      toast.error("Failed to update refund")
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
        <h3 className="text-lg font-medium">Edit Refund</h3>
        <p className="text-sm text-muted-foreground">
          Update refund details and status.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Refund Details */}
          <Card>
            <CardHeader>
              <CardTitle>Refund Details</CardTitle>
              <CardDescription>
                Select payment, set amount, and reason.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="payment_id">
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
                <Label htmlFor="amount">
                  Amount <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                />
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
                    {REFUND_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reason">Reason</Label>
                <Select
                  value={formData.reason || "none"}
                  onValueChange={(value) =>
                    handleChange("reason", value === "none" ? "" : value)
                  }
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
                <Label htmlFor="provider_refund_id">Provider Refund ID</Label>
                <Input
                  id="provider_refund_id"
                  value={formData.provider_refund_id}
                  onChange={(e) => handleChange("provider_refund_id", e.target.value)}
                  placeholder="External provider reference"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/refunds" })}
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
