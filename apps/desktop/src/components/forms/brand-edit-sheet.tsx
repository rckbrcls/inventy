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
import { Brand, BrandsRepository, UpdateBrandDTO } from "@/lib/db/repositories/brands-repository"

type BrandEditSheetProps = {
  brand: Brand | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const BRAND_STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

export function BrandEditSheet({
  brand,
  open,
  onOpenChange,
  onSuccess,
}: BrandEditSheetProps) {
  const [isSaving, setIsSaving] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    status: "active",
    description: "",
    logo_url: "",
    website_url: "",
    is_featured: false,
    sort_order: "0",
    metadata: "",
  })

  React.useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name || "",
        slug: brand.slug || "",
        status: brand.status || "active",
        description: brand.description || "",
        logo_url: brand.logo_url || "",
        website_url: brand.website_url || "",
        is_featured: brand.is_featured ?? false,
        sort_order: brand.sort_order?.toString() || "0",
        metadata: brand.metadata || "",
      })
    }
  }, [brand])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!brand) return

    if (!formData.name || !formData.slug) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)

      const payload: UpdateBrandDTO = {
        id: brand.id,
        name: formData.name,
        slug: formData.slug,
        status: formData.status || undefined,
        description: formData.description || undefined,
        logo_url: formData.logo_url || undefined,
        website_url: formData.website_url || undefined,
        is_featured: formData.is_featured,
        sort_order: parseInt(formData.sort_order) || 0,
        metadata: formData.metadata || undefined,
      }

      await BrandsRepository.update(payload)
      toast.success("Brand updated successfully")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update brand:", error)
      toast.error("Failed to update brand")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Brand</SheetTitle>
          <SheetDescription>
            Update brand information. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Basic Information</h4>

                <div className="grid gap-2">
                  <Label htmlFor="edit-name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-slug">
                    Slug <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-slug"
                    value={formData.slug}
                    onChange={(e) => handleChange("slug", e.target.value)}
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
                      {BRAND_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Visual */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Visual</h4>

                <div className="grid gap-2">
                  <Label htmlFor="edit-logo_url">Logo URL</Label>
                  <Input
                    id="edit-logo_url"
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => handleChange("logo_url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-website_url">Website URL</Label>
                  <Input
                    id="edit-website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => handleChange("website_url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Display Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Display Settings</h4>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) =>
                      handleChange("is_featured", checked as boolean)
                    }
                  />
                  <Label htmlFor="edit-is_featured">Featured brand (show on homepage)</Label>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-sort_order">Sort Order</Label>
                  <Input
                    id="edit-sort_order"
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => handleChange("sort_order", e.target.value)}
                  />
                </div>
              </div>

              {/* Advanced */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Advanced</h4>

                <div className="grid gap-2">
                  <Label htmlFor="edit-metadata">Metadata (JSON)</Label>
                  <Textarea
                    id="edit-metadata"
                    value={formData.metadata}
                    onChange={(e) => handleChange("metadata", e.target.value)}
                    rows={3}
                    placeholder='{"social": {"instagram": "@brand"}}'
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
