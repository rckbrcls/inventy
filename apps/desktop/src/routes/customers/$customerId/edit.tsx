import { createFileRoute, useNavigate } from "@tanstack/react-router"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
import { CustomersRepository, UpdateCustomerDTO } from "@/lib/db/repositories/customers-repository"

export const Route = createFileRoute("/customers/$customerId/edit")({
  component: EditCustomer,
})

const CUSTOMER_TYPES = [
  { value: "individual", label: "Individual (B2C)" },
  { value: "business", label: "Business (B2B)" },
  { value: "government", label: "Government" },
  { value: "organization", label: "Organization" },
]

const CUSTOMER_STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "blocked", label: "Blocked" },
  { value: "guest", label: "Guest" },
]

const CURRENCIES = [
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
]

const LANGUAGES = [
  { value: "pt", label: "Portuguese" },
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
]

const TAX_ID_TYPES = [
  { value: "br_cpf", label: "CPF (Brazil)" },
  { value: "br_cnpj", label: "CNPJ (Brazil)" },
  { value: "us_ssn", label: "SSN (USA)" },
  { value: "eu_vat", label: "VAT ID (EU)" },
]

function EditCustomer() {
  const navigate = useNavigate()
  const { customerId } = Route.useParams()
  const [isSaving, setIsSaving] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  const [formData, setFormData] = React.useState({
    type: "individual",
    email: "",
    phone: "",
    first_name: "",
    last_name: "",
    company_name: "",
    tax_id: "",
    tax_id_type: "",
    state_tax_id: "",
    status: "active",
    currency: "BRL",
    language: "pt",
    tags: "",
    accepts_marketing: false,
    notes: "",
    metadata: "",
    custom_attributes: "",
  })

  React.useEffect(() => {
    const loadCustomer = async () => {
      try {
        setIsLoading(true)
        const customer = await CustomersRepository.getById(customerId)
        if (!customer) {
          toast.error("Customer not found")
          navigate({ to: "/customers" })
          return
        }
        setFormData({
          type: customer.type || "individual",
          email: customer.email || "",
          phone: customer.phone || "",
          first_name: customer.first_name || "",
          last_name: customer.last_name || "",
          company_name: customer.company_name || "",
          tax_id: customer.tax_id || "",
          tax_id_type: customer.tax_id_type || "",
          state_tax_id: customer.state_tax_id || "",
          status: customer.status || "active",
          currency: customer.currency || "BRL",
          language: customer.language || "pt",
          tags: customer.tags || "",
          accepts_marketing: customer.accepts_marketing ?? false,
          notes: customer.notes || "",
          metadata: customer.metadata || "",
          custom_attributes: customer.custom_attributes || "",
        })
      } catch (error) {
        console.error("Failed to load customer:", error)
        toast.error("Failed to load customer")
      } finally {
        setIsLoading(false)
      }
    }
    loadCustomer()
  }, [customerId, navigate])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)

      const payload: UpdateCustomerDTO = {
        id: customerId,
        type: formData.type,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        company_name: formData.company_name || undefined,
        tax_id: formData.tax_id || undefined,
        tax_id_type: formData.tax_id_type || undefined,
        state_tax_id: formData.state_tax_id || undefined,
        status: formData.status || undefined,
        currency: formData.currency || undefined,
        language: formData.language || undefined,
        tags: formData.tags || undefined,
        accepts_marketing: formData.accepts_marketing,
        notes: formData.notes || undefined,
        metadata: formData.metadata || undefined,
        custom_attributes: formData.custom_attributes || undefined,
      }

      await CustomersRepository.update(payload)
      toast.success("Customer updated successfully")
      navigate({ to: "/customers" })
    } catch (error) {
      console.error("Failed to update customer:", error)
      toast.error("Failed to update customer")
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
        <h3 className="text-lg font-medium">Edit Customer</h3>
        <p className="text-sm text-muted-foreground">
          Update customer information and preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential customer details like name, email, and type.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                    {CUSTOMER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleChange("company_name", e.target.value)}
                  placeholder="Acme Corp."
                />
                <p className="text-xs text-muted-foreground">
                  Required for Business, Government, and Organization types.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="+55 11 99999-9999"
                  />
                </div>
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
                    {CUSTOMER_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tax Information */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Information</CardTitle>
              <CardDescription>
                Customer tax identification for invoicing and compliance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tax_id_type">Tax ID Type</Label>
                  <Select
                    value={formData.tax_id_type || "none"}
                    onValueChange={(value) =>
                      handleChange("tax_id_type", value === "none" ? "" : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {TAX_ID_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tax_id">Tax ID</Label>
                  <Input
                    id="tax_id"
                    value={formData.tax_id}
                    onChange={(e) => handleChange("tax_id", e.target.value)}
                    placeholder="123.456.789-00"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="state_tax_id">State Tax ID (Inscrição Estadual)</Label>
                <Input
                  id="state_tax_id"
                  value={formData.state_tax_id}
                  onChange={(e) => handleChange("state_tax_id", e.target.value)}
                  placeholder="For B2B customers"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customer communication and marketing preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="currency">Preferred Currency</Label>
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
                <div className="grid gap-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => handleChange("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="accepts_marketing"
                  checked={formData.accepts_marketing}
                  onCheckedChange={(checked) =>
                    handleChange("accepts_marketing", checked as boolean)
                  }
                />
                <Label htmlFor="accepts_marketing">Accepts marketing emails</Label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleChange("tags", e.target.value)}
                  placeholder="vip, wholesale, priority"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes & Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Notes & Metadata</CardTitle>
              <CardDescription>
                Additional information and custom attributes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Internal notes about this customer..."
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metadata">Metadata (JSON)</Label>
                <Textarea
                  id="metadata"
                  value={formData.metadata}
                  onChange={(e) => handleChange("metadata", e.target.value)}
                  placeholder='{"external_id": "12345"}'
                  rows={2}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="custom_attributes">Custom Attributes (JSON)</Label>
                <Textarea
                  id="custom_attributes"
                  value={formData.custom_attributes}
                  onChange={(e) => handleChange("custom_attributes", e.target.value)}
                  placeholder='{"birthday": "1990-05-15", "favorite_team": "..."}'
                  rows={2}
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/customers" })}
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
