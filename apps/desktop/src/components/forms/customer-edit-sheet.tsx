import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Customer, CustomersRepository, UpdateCustomerDTO } from "@/lib/db/repositories/customers-repository"

type CustomerEditSheetProps = {
  customer: Customer | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

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

export function CustomerEditSheet({
  customer,
  open,
  onOpenChange,
  onSuccess,
}: CustomerEditSheetProps) {
  const [isSaving, setIsSaving] = React.useState(false)
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
    if (customer) {
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
    }
  }, [customer])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customer) return

    try {
      setIsSaving(true)

      const payload: UpdateCustomerDTO = {
        id: customer.id,
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
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update customer:", error)
      toast.error("Failed to update customer")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Customer</SheetTitle>
          <SheetDescription>
            Update customer information. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Basic Information</h4>
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">
                    Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                    <Label htmlFor="edit-first_name">First Name</Label>
                    <Input
                      id="edit-first_name"
                      value={formData.first_name}
                      onChange={(e) => handleChange("first_name", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-last_name">Last Name</Label>
                    <Input
                      id="edit-last_name"
                      value={formData.last_name}
                      onChange={(e) => handleChange("last_name", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-company_name">Company Name</Label>
                  <Input
                    id="edit-company_name"
                    value={formData.company_name}
                    onChange={(e) => handleChange("company_name", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>
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
                      {CUSTOMER_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tax Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Tax Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-tax_id_type">Tax ID Type</Label>
                    <Select
                      value={formData.tax_id_type || "none"}
                      onValueChange={(value) => handleChange("tax_id_type", value === "none" ? "" : value)}
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
                    <Label htmlFor="edit-tax_id">Tax ID</Label>
                    <Input
                      id="edit-tax_id"
                      value={formData.tax_id}
                      onChange={(e) => handleChange("tax_id", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-state_tax_id">State Tax ID</Label>
                  <Input
                    id="edit-state_tax_id"
                    value={formData.state_tax_id}
                    onChange={(e) => handleChange("state_tax_id", e.target.value)}
                  />
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Preferences</h4>
                <div className="grid grid-cols-2 gap-4">
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
                  <div className="grid gap-2">
                    <Label htmlFor="edit-language">Language</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) => handleChange("language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                    id="edit-accepts_marketing"
                    checked={formData.accepts_marketing}
                    onCheckedChange={(checked) =>
                      handleChange("accepts_marketing", checked as boolean)
                    }
                  />
                  <Label htmlFor="edit-accepts_marketing">Accepts marketing emails</Label>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                  <Input
                    id="edit-tags"
                    value={formData.tags}
                    onChange={(e) => handleChange("tags", e.target.value)}
                    placeholder="vip, wholesale, priority"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Notes & Metadata</h4>
                <div className="grid gap-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={3}
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

                <div className="grid gap-2">
                  <Label htmlFor="edit-custom_attributes">Custom Attributes (JSON)</Label>
                  <Textarea
                    id="edit-custom_attributes"
                    value={formData.custom_attributes}
                    onChange={(e) => handleChange("custom_attributes", e.target.value)}
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
