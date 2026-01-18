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
import {
  Category,
  CategoriesRepository,
  CreateCategoryDTO,
} from "@/lib/db/repositories/categories-repository"

export const Route = createFileRoute("/shops/$shopId/categories/new")({
  component: NewCategory,
})

const CATEGORY_TYPES = [
  { value: "manual", label: "Manual" },
  { value: "automated", label: "Automated (Smart)" },
]

function NewCategory() {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = React.useState(false)
  const [categories, setCategories] = React.useState<Category[]>([])

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

  // Load existing categories for parent selection
  React.useEffect(() => {
    CategoriesRepository.list()
      .then(setCategories)
      .catch((error) => {
        console.error("Failed to load categories:", error)
      })
  }, [])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.slug) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)

      const payload: CreateCategoryDTO = {
        shop_id: "default", // TODO: Get from context/settings when multi-shop is implemented
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

      await CategoriesRepository.create(payload)
      toast.success("Category created successfully")
      navigate({ to: "/categories" })
    } catch (error) {
      console.error("Failed to create category:", error)
      toast.error("Failed to create category")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium">New Category</h3>
        <p className="text-sm text-muted-foreground">
          Create a new category for your catalog navigation.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential category details like name, slug, and hierarchy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Electronics, Clothing, Shoes..."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="electronics"
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly identifier. Will be auto-generated from name.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="parent_id">Parent Category</Label>
                <Select
                  value={formData.parent_id || "none"}
                  onValueChange={(value) => handleChange("parent_id", value === "none" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None (Root Category)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root Category)</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select a parent to create a subcategory (e.g., Clothing &gt; Men &gt; Shirts).
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Brief description for the category page header..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Visual Identity */}
          <Card>
            <CardHeader>
              <CardTitle>Visual Identity</CardTitle>
              <CardDescription>
                Images for the category thumbnail and banner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="image_url">Image URL (Thumbnail)</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleChange("image_url", e.target.value)}
                  placeholder="https://example.com/category-thumb.png"
                />
                <p className="text-xs text-muted-foreground">
                  Small icon used in category lists and menus.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="banner_url">Banner URL (Hero)</Label>
                <Input
                  id="banner_url"
                  type="url"
                  value={formData.banner_url}
                  onChange={(e) => handleChange("banner_url", e.target.value)}
                  placeholder="https://example.com/category-banner.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Large image displayed at the top of the category page.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Category Logic */}
          <Card>
            <CardHeader>
              <CardTitle>Category Logic</CardTitle>
              <CardDescription>
                Define how products are assigned to this category.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
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
                  Manual: assign products individually. Automated: products match rules automatically.
                </p>
              </div>

              {formData.type === "automated" && (
                <div className="grid gap-2">
                  <Label htmlFor="rules">Rules (JSON)</Label>
                  <Textarea
                    id="rules"
                    value={formData.rules}
                    onChange={(e) => handleChange("rules", e.target.value)}
                    placeholder='[{"field": "price", "relation": "less_than", "condition": "100"}]'
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Define rules for automatic product assignment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Control visibility and ordering in navigation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_visible"
                  checked={formData.is_visible}
                  onCheckedChange={(checked) =>
                    handleChange("is_visible", checked as boolean)
                  }
                />
                <Label htmlFor="is_visible">
                  Visible in navigation menu
                </Label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min="0"
                  value={formData.sort_order}
                  onChange={(e) => handleChange("sort_order", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first in navigation.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="template_suffix">Template Suffix</Label>
                <Input
                  id="template_suffix"
                  value={formData.template_suffix}
                  onChange={(e) => handleChange("template_suffix", e.target.value)}
                  placeholder="grid-large, sale-landing..."
                />
                <p className="text-xs text-muted-foreground">
                  Optional: use a custom layout template for this category.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
              <CardDescription>
                Optimize the category page for search engines.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="seo_title">SEO Title</Label>
                <Input
                  id="seo_title"
                  value={formData.seo_title}
                  onChange={(e) => handleChange("seo_title", e.target.value)}
                  placeholder="Shop Electronics Online | Your Store"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="seo_description">SEO Description</Label>
                <Textarea
                  id="seo_description"
                  value={formData.seo_description}
                  onChange={(e) => handleChange("seo_description", e.target.value)}
                  placeholder="Browse our wide selection of electronics..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Advanced */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced</CardTitle>
              <CardDescription>
                Additional metadata for extensibility (JSON format).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="metadata">Metadata (JSON)</Label>
                <Textarea
                  id="metadata"
                  value={formData.metadata}
                  onChange={(e) => handleChange("metadata", e.target.value)}
                  placeholder='{"icon": "electronics-icon", "featured_products": ["id1", "id2"]}'
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/categories" })}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Creating..." : "Create Category"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
