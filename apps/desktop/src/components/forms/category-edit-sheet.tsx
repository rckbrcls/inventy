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
import {
  Category,
  CategoriesRepository,
  UpdateCategoryDTO,
} from "@/lib/db/repositories/categories-repository"

type CategoryEditSheetProps = {
  category: Category | null
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const CATEGORY_TYPES = [
  { value: "manual", label: "Manual" },
  { value: "automated", label: "Automated (Smart)" },
]

export function CategoryEditSheet({
  category,
  categories,
  open,
  onOpenChange,
  onSuccess,
}: CategoryEditSheetProps) {
  const [isSaving, setIsSaving] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    parent_id: "",
    description: "",
    image_url: "",
    banner_url: "",
    type: "manual",
    rules: "",
    is_visible: true,
    sort_order: "0",
    seo_title: "",
    seo_description: "",
    template_suffix: "",
    metadata: "",
  })

  // Get available parent categories (excluding current category and its descendants)
  const availableParents = React.useMemo(() => {
    if (!category) return categories
    return categories.filter((c) => c.id !== category.id)
  }, [categories, category])

  React.useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        slug: category.slug || "",
        parent_id: category.parent_id || "",
        description: category.description || "",
        image_url: category.image_url || "",
        banner_url: category.banner_url || "",
        type: category.type || "manual",
        rules: category.rules || "",
        is_visible: category.is_visible ?? true,
        sort_order: category.sort_order?.toString() || "0",
        seo_title: category.seo_title || "",
        seo_description: category.seo_description || "",
        template_suffix: category.template_suffix || "",
        metadata: category.metadata || "",
      })
    }
  }, [category])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!category) return

    if (!formData.name || !formData.slug) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)

      const payload: UpdateCategoryDTO = {
        id: category.id,
        name: formData.name,
        slug: formData.slug,
        parent_id: formData.parent_id || undefined,
        description: formData.description || undefined,
        image_url: formData.image_url || undefined,
        banner_url: formData.banner_url || undefined,
        type: formData.type || undefined,
        rules: formData.rules || undefined,
        is_visible: formData.is_visible,
        sort_order: parseInt(formData.sort_order) || 0,
        seo_title: formData.seo_title || undefined,
        seo_description: formData.seo_description || undefined,
        template_suffix: formData.template_suffix || undefined,
        metadata: formData.metadata || undefined,
      }

      await CategoriesRepository.update(payload)
      toast.success("Category updated successfully")
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update category:", error)
      toast.error("Failed to update category")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit Category</SheetTitle>
          <SheetDescription>
            Update category information. Click save when you're done.
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
                  <Label htmlFor="edit-parent_id">Parent Category</Label>
                  <Select
                    value={formData.parent_id}
                    onValueChange={(value) => handleChange("parent_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None (Root Category)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (Root Category)</SelectItem>
                      {availableParents.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
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
                  <Label htmlFor="edit-image_url">Image URL (Thumbnail)</Label>
                  <Input
                    id="edit-image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => handleChange("image_url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-banner_url">Banner URL (Hero)</Label>
                  <Input
                    id="edit-banner_url"
                    type="url"
                    value={formData.banner_url}
                    onChange={(e) => handleChange("banner_url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Category Logic */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Category Logic</h4>

                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Manual: products added manually. Automated: products auto-populated by rules.
                  </p>
                </div>

                {formData.type === "automated" && (
                  <div className="grid gap-2">
                    <Label htmlFor="edit-rules">Rules (JSON)</Label>
                    <Textarea
                      id="edit-rules"
                      value={formData.rules}
                      onChange={(e) => handleChange("rules", e.target.value)}
                      rows={3}
                      placeholder='[{"field": "price", "relation": "less_than", "condition": "50"}]'
                    />
                  </div>
                )}
              </div>

              {/* Display Settings */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Display Settings</h4>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-is_visible"
                    checked={formData.is_visible}
                    onCheckedChange={(checked) =>
                      handleChange("is_visible", checked as boolean)
                    }
                  />
                  <Label htmlFor="edit-is_visible">Visible in navigation menu</Label>
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

                <div className="grid gap-2">
                  <Label htmlFor="edit-template_suffix">Template Suffix</Label>
                  <Input
                    id="edit-template_suffix"
                    value={formData.template_suffix}
                    onChange={(e) => handleChange("template_suffix", e.target.value)}
                    placeholder="grid-large, sale-landing..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Custom template for this category page.
                  </p>
                </div>
              </div>

              {/* SEO */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">SEO</h4>

                <div className="grid gap-2">
                  <Label htmlFor="edit-seo_title">SEO Title</Label>
                  <Input
                    id="edit-seo_title"
                    value={formData.seo_title}
                    onChange={(e) => handleChange("seo_title", e.target.value)}
                    placeholder="Category Title | Your Store"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-seo_description">SEO Description</Label>
                  <Textarea
                    id="edit-seo_description"
                    value={formData.seo_description}
                    onChange={(e) => handleChange("seo_description", e.target.value)}
                    rows={2}
                    placeholder="Meta description for search engines..."
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
                    placeholder='{"icon": "category-icon", "color": "#ff0000"}'
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
