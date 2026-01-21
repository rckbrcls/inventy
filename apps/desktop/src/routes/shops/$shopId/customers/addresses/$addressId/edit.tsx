import { createFileRoute, useNavigate } from "@tanstack/react-router"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  CustomerAddressesRepository,
  UpdateCustomerAddressDTO,
} from "@/lib/db/repositories/customer-addresses-repository"
import { Customer, CustomersRepository } from "@/lib/db/repositories/customers-repository"

export const Route = createFileRoute("/shops/$shopId/customers/addresses/$addressId/edit")({
  component: EditCustomerAddress,
})

const ADDRESS_TYPES = [
  { value: "shipping", label: "Shipping" },
  { value: "billing", label: "Billing" },
  { value: "both", label: "Both" },
]

const COUNTRIES = [
  { value: "BR", label: "Brazil" },
  { value: "US", label: "United States" },
  { value: "AR", label: "Argentina" },
  { value: "MX", label: "Mexico" },
  { value: "PT", label: "Portugal" },
]

function EditCustomerAddress() {
  const navigate = useNavigate()
  const { addressId } = Route.useParams()
  const [isSaving, setIsSaving] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [customers, setCustomers] = React.useState<Customer[]>([])

  const [formData, setFormData] = React.useState<UpdateCustomerAddressDTO>({
    id: addressId,
    customer_id: "",
    type: "shipping",
    is_default: false,
    first_name: "",
    last_name: "",
    company: "",
    address1: "",
    address2: "",
    city: "",
    province_code: "",
    country_code: "BR",
    postal_code: "",
    phone: "",
  })

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [address, customersData] = await Promise.all([
          CustomerAddressesRepository.getById(addressId),
          CustomersRepository.list(),
        ])
        if (!address) {
          toast.error("Address not found")
          navigate({ to: "/customers/addresses" })
          return
        }
        setCustomers(customersData)
        setFormData({
          id: address.id,
          customer_id: address.customer_id,
          type: address.type || "shipping",
          is_default: address.is_default || false,
          first_name: address.first_name || "",
          last_name: address.last_name || "",
          company: address.company || "",
          address1: address.address1 || "",
          address2: address.address2 || "",
          city: address.city || "",
          province_code: address.province_code || "",
          country_code: address.country_code || "BR",
          postal_code: address.postal_code || "",
          phone: address.phone || "",
        })
      } catch (error) {
        console.error("Failed to load address:", error)
        toast.error("Failed to load address")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [addressId, navigate])

  const handleChange = (field: keyof UpdateCustomerAddressDTO, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const getCustomerLabel = (customer: Customer) => {
    if (customer.company_name) return customer.company_name
    const firstName = customer.first_name || ""
    const lastName = customer.last_name || ""
    const name = `${firstName} ${lastName}`.trim()
    if (name && customer.email) return `${name} (${customer.email})`
    return name || customer.email || customer.id
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customer_id) {
      toast.error("Please select a customer")
      return
    }

    if (!formData.address1) {
      toast.error("Please provide an address")
      return
    }

    if (!formData.city) {
      toast.error("Please provide a city")
      return
    }

    if (!formData.country_code) {
      toast.error("Please select a country")
      return
    }

    try {
      setIsSaving(true)
      await CustomerAddressesRepository.update(formData)
      toast.success("Address updated successfully")
      navigate({ to: "/customers/addresses" })
    } catch (error) {
      console.error("Failed to update address:", error)
      toast.error("Failed to update address")
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
        <h3 className="text-lg font-medium">Edit Customer Address</h3>
        <p className="text-sm text-muted-foreground">
          Update address information and customer association.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
              <CardDescription>
                Select the customer for this address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="customer_id">
                  Customer <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.customer_id || ""}
                  onValueChange={(value) => handleChange("customer_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {getCustomerLabel(customer)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Address Type</Label>
                  <Select
                    value={formData.type || "shipping"}
                    onValueChange={(value) => handleChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADDRESS_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="is_default"
                    checked={formData.is_default || false}
                    onCheckedChange={(checked) =>
                      handleChange("is_default", checked === true)
                    }
                  />
                  <Label htmlFor="is_default">Set as default address</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipient Information */}
          <Card>
            <CardHeader>
              <CardTitle>Recipient</CardTitle>
              <CardDescription>
                Who will receive deliveries at this address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name || ""}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name || ""}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company || ""}
                  onChange={(e) => handleChange("company", e.target.value)}
                  placeholder="Company name (optional)"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+55 11 99999-9999"
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Details */}
          <Card>
            <CardHeader>
              <CardTitle>Address Details</CardTitle>
              <CardDescription>
                Full address information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="address1">
                  Address Line 1 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="address1"
                  value={formData.address1 || ""}
                  onChange={(e) => handleChange("address1", e.target.value)}
                  placeholder="Street address, number"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address2">Address Line 2</Label>
                <Input
                  id="address2"
                  value={formData.address2 || ""}
                  onChange={(e) => handleChange("address2", e.target.value)}
                  placeholder="Apartment, suite, unit, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">
                    City <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="city"
                    value={formData.city || ""}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="São Paulo"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="province_code">State/Province</Label>
                  <Input
                    id="province_code"
                    value={formData.province_code || ""}
                    onChange={(e) => handleChange("province_code", e.target.value)}
                    placeholder="SP"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code || ""}
                    onChange={(e) => handleChange("postal_code", e.target.value)}
                    placeholder="01310-100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country_code">
                    Country <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.country_code || "BR"}
                    onValueChange={(value) => handleChange("country_code", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/customers/addresses" })}
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
