import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import {
  CustomerAddress,
  CustomerAddressesRepository,
  UpdateCustomerAddressDTO,
} from "@/lib/db/repositories/customer-addresses-repository"

interface CustomerAddressEditSheetProps {
  address: CustomerAddress | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CustomerAddressEditSheet({
  address,
  open,
  onOpenChange,
  onSuccess,
}: CustomerAddressEditSheetProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [formData, setFormData] = React.useState<UpdateCustomerAddressDTO>({
    id: "",
  })

  React.useEffect(() => {
    if (address) {
      setFormData({
        id: address.id,
        type: address.type || "shipping",
        is_default: address.is_default || false,
        first_name: address.first_name || "",
        last_name: address.last_name || "",
        company: address.company || "",
        address1: address.address1 || "",
        address2: address.address2 || "",
        city: address.city || "",
        province_code: address.province_code || "",
        country_code: address.country_code || "",
        postal_code: address.postal_code || "",
        phone: address.phone || "",
      })
    }
  }, [address])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await CustomerAddressesRepository.update(formData)
      toast.success("Address updated successfully")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update address:", error)
      toast.error("Failed to update address")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Address</SheetTitle>
          <SheetDescription>
            Update the customer address information.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type || "shipping"}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="is_default"
                checked={formData.is_default || false}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_default: checked === true })
                }
              />
              <Label htmlFor="is_default">Default Address</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                placeholder="First name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company || ""}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              placeholder="Company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address1">Address Line 1 *</Label>
            <Input
              id="address1"
              value={formData.address1 || ""}
              onChange={(e) =>
                setFormData({ ...formData, address1: e.target.value })
              }
              placeholder="Street address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address2">Address Line 2</Label>
            <Input
              id="address2"
              value={formData.address2 || ""}
              onChange={(e) =>
                setFormData({ ...formData, address2: e.target.value })
              }
              placeholder="Apartment, suite, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="City"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province_code">State/Province</Label>
              <Input
                id="province_code"
                value={formData.province_code || ""}
                onChange={(e) =>
                  setFormData({ ...formData, province_code: e.target.value })
                }
                placeholder="e.g. SP, NY"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                value={formData.postal_code || ""}
                onChange={(e) =>
                  setFormData({ ...formData, postal_code: e.target.value })
                }
                placeholder="e.g. 01310-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country_code">Country *</Label>
              <Input
                id="country_code"
                value={formData.country_code || ""}
                onChange={(e) =>
                  setFormData({ ...formData, country_code: e.target.value })
                }
                placeholder="e.g. BR, US"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone || ""}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+55 11 99999-9999"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
