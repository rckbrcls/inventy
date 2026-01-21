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
  CreateRefundDTO,
  REFUND_STATUSES,
  REFUND_REASONS,
} from "@/lib/db/repositories/refunds-repository"
import { Payment, PaymentsRepository } from "@/lib/db/repositories/payments-repository"

export const Route = createFileRoute("/shops/$shopId/refunds/new")({
  component: NewRefund,
})

function NewRefund() {
  const navigate = useNavigate()
  const [payments, setPayments] = React.useState<Payment[]>([])
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(null)
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
        const paymentsData = await PaymentsRepository.list()
        // Filter only captured payments that can be refunded
        const refundablePayments = paymentsData.filter(
          (p) => p.status === "captured" || p.status === "partially_refunded"
        )
        setPayments(refundablePayments)
      } catch (error) {
        console.error("Failed to load payments:", error)
        toast.error("Failed to load payments")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePaymentChange = (paymentId: string) => {
    const payment = payments.find((p) => p.id === paymentId)
    setSelectedPayment(payment || null)
    setFormData((prev) => ({
      ...prev,
      payment_id: paymentId,
      amount: payment ? payment.amount.toString() : "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.payment_id || !formData.amount) {
      toast.error("Please fill in all required fields")
      return
    }

    const amount = parseFloat(formData.amount)
    if (selectedPayment && amount > selectedPayment.amount) {
      toast.error("Refund amount cannot exceed payment amount")
      return
    }

    try {
      setIsSaving(true)

      const payload: CreateRefundDTO = {
        payment_id: formData.payment_id,
        amount: amount,
        status: formData.status || undefined,
        reason: formData.reason || undefined,
        provider_refund_id: formData.provider_refund_id || undefined,
      }

      await RefundsRepository.create(payload)
      toast.success("Refund created successfully")
      navigate({ to: "/refunds" })
    } catch (error) {
      console.error("Failed to create refund:", error)
      toast.error("Failed to create refund")
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
        <h3 className="text-lg font-medium">New Refund</h3>
        <p className="text-sm text-muted-foreground">
          Create a new refund for a captured payment.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Payment Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Select the payment to refund.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="payment_id">
                  Payment <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.payment_id}
                  onValueChange={handlePaymentChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment to refund" />
                  </SelectTrigger>
                  <SelectContent>
                    {payments.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No refundable payments available
                      </SelectItem>
                    ) : (
                      payments.map((payment) => (
                        <SelectItem key={payment.id} value={payment.id}>
                          {payment.id.slice(0, 8)}... - {payment.method} - ${payment.amount.toFixed(2)} ({payment.status})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedPayment && (
                <div className="rounded-lg bg-muted p-4">
                  <h4 className="font-medium text-sm mb-2">Selected Payment Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Method:</div>
                    <div>{selectedPayment.method}</div>
                    <div className="text-muted-foreground">Amount:</div>
                    <div className="font-medium">${selectedPayment.amount.toFixed(2)}</div>
                    <div className="text-muted-foreground">Status:</div>
                    <div>{selectedPayment.status}</div>
                    <div className="text-muted-foreground">Provider:</div>
                    <div>{selectedPayment.provider}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Refund Details */}
          <Card>
            <CardHeader>
              <CardTitle>Refund Details</CardTitle>
              <CardDescription>
                Specify the refund amount and reason.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">
                    Refund Amount <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    max={selectedPayment?.amount}
                    value={formData.amount}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    placeholder="0.00"
                  />
                  {selectedPayment && (
                    <p className="text-xs text-muted-foreground">
                      Maximum: ${selectedPayment.amount.toFixed(2)}
                    </p>
                  )}
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
                      {REFUND_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="reason">Reason</Label>
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
                <Label htmlFor="provider_refund_id">Provider Refund ID</Label>
                <Input
                  id="provider_refund_id"
                  value={formData.provider_refund_id}
                  onChange={(e) => handleChange("provider_refund_id", e.target.value)}
                  placeholder="External provider reference (optional)"
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
                <Button type="submit" disabled={isSaving || !formData.payment_id}>
                  {isSaving ? "Creating..." : "Create Refund"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
