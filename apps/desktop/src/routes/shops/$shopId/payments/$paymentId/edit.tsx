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
  PaymentsRepository,
  UpdatePaymentDTO,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  RISK_LEVELS,
} from "@/lib/db/repositories/payments-repository"

export const Route = createFileRoute("/shops/$shopId/payments/$paymentId/edit")({
  component: EditPayment,
})

function EditPayment() {
  const navigate = useNavigate()
  const { paymentId } = Route.useParams()
  const [isSaving, setIsSaving] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

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
    const loadPayment = async () => {
      try {
        setIsLoading(true)
        const payment = await PaymentsRepository.getById(paymentId)
        if (!payment) {
          toast.error("Payment not found")
          navigate({ to: "/payments" })
          return
        }
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
      } catch (error) {
        console.error("Failed to load payment:", error)
        toast.error("Failed to load payment")
      } finally {
        setIsLoading(false)
      }
    }
    loadPayment()
  }, [paymentId, navigate])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || !formData.provider || !formData.method) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)

      const payload: UpdatePaymentDTO = {
        id: paymentId,
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
      navigate({ to: "/payments" })
    } catch (error) {
      console.error("Failed to update payment:", error)
      toast.error("Failed to update payment")
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
        <h3 className="text-lg font-medium">Edit Payment</h3>
        <p className="text-sm text-muted-foreground">
          Update payment details, status, and references.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Amount, currency, and exchange rate.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
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
                    placeholder="0.00"
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
                      <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="exchange_rate">Exchange Rate</Label>
                  <Input
                    id="exchange_rate"
                    type="number"
                    step="0.0001"
                    min="0"
                    value={formData.exchange_rate}
                    onChange={(e) => handleChange("exchange_rate", e.target.value)}
                    placeholder="1.0000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Provider and method used for this payment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="provider">
                    Provider <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="provider"
                    value={formData.provider}
                    onChange={(e) => handleChange("provider", e.target.value)}
                    placeholder="stripe, pagar.me, adyen, manual_cash..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="method">
                    Method <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.method}
                    onValueChange={(value) => handleChange("method", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
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
            </CardContent>
          </Card>

          {/* Installments */}
          <Card>
            <CardHeader>
              <CardTitle>Installments</CardTitle>
              <CardDescription>
                Configure installment options for credit card payments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="installments">Number of Installments</Label>
                  <Input
                    id="installments"
                    type="number"
                    min="1"
                    max="24"
                    value={formData.installments}
                    onChange={(e) => handleChange("installments", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="installment_amount">Amount per Installment</Label>
                  <Input
                    id="installment_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.installment_amount}
                    onChange={(e) => handleChange("installment_amount", e.target.value)}
                    placeholder="Auto-calculated"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                  <Input
                    id="interest_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.interest_rate}
                    onChange={(e) => handleChange("interest_rate", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Risk */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Risk</CardTitle>
              <CardDescription>
                Update payment status and risk level.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Initial Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
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
                  <Label htmlFor="risk_level">Risk Level</Label>
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
            </CardContent>
          </Card>

          {/* External References */}
          <Card>
            <CardHeader>
              <CardTitle>External References</CardTitle>
              <CardDescription>
                IDs from payment gateway and authorization codes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="provider_transaction_id">Provider Transaction ID</Label>
                  <Input
                    id="provider_transaction_id"
                    value={formData.provider_transaction_id}
                    onChange={(e) =>
                      handleChange("provider_transaction_id", e.target.value)
                    }
                    placeholder="ch_3Lk... (from Stripe, etc.)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="authorization_code">Authorization Code (NSU)</Label>
                  <Input
                    id="authorization_code"
                    value={formData.authorization_code}
                    onChange={(e) => handleChange("authorization_code", e.target.value)}
                    placeholder="123456"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced</CardTitle>
              <CardDescription>
                Additional payment details in JSON format.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="payment_details">Payment Details (JSON)</Label>
                <Textarea
                  id="payment_details"
                  value={formData.payment_details}
                  onChange={(e) => handleChange("payment_details", e.target.value)}
                  placeholder='{"last4": "4242", "brand": "visa", "holder_name": "JOHN DOE"}'
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Card: last4, brand, exp_month, exp_year, holder_name | PIX: qr_code,
                  copy_paste | Boleto: barcode, url_pdf
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metadata">Metadata (JSON)</Label>
                <Textarea
                  id="metadata"
                  value={formData.metadata}
                  onChange={(e) => handleChange("metadata", e.target.value)}
                  placeholder='{"notes": "Customer requested invoice"}'
                  rows={2}
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/payments" })}
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
