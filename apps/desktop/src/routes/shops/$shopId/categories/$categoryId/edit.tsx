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
  UpdateCategoryDTO,
} from "@/lib/db/repositories/categories-repository"

export const Route = createFileRoute("/shops/$shopId/categories/$categoryId/edit")({
  component: EditCategory,
})

const CATEGORY_TYPES = [
  { value: "manual", label: "Manual" },
  { value: "automated", label: "Automated (Smart)" },
]

function EditCategory() {
  const navigate = useNavigate()
  const { shopId, categoryId } = Route.useParams()
  const [isLoading, setIsLoading] = React.useState(true)
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

  React.useEffect(() => {
    const loadData = async () => {
      if (!shopId) return
      try {
        setIsLoading(true)
        const [category, list] = await Promise.all([
          CategoriesRepository.getById(categoryId),
          CategoriesRepository.listByShop(shopId),
        ])
        if (!category) {
          toast.error("Category not found")
          navigate({ to: "/categories" })
          return
        }
        setCategories(list)
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
      } catch (error) {
        console.error("Failed to load category:", error)
        toast.error("Failed to load category")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [shopId, categoryId, navigate])

  const availableParents = React.useMemo(() => {
    return categories.filter((category) => category.id !== categoryId)
  }, [categories, categoryId])

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

      const payload: UpdateCategoryDTO = {
        id: categoryId,
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
      navigate({ to: "/categories" })
    } catch (error) {
      console.error("Failed to update category:", error)
      toast.error("Failed to update category")
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
        <h3 className="text-lg font-medium">Edit Category</h3>
        <p className="text-sm text-muted-foreground">
          Update category information and visibility settings.
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
                  onValueChange={(value) =>
                    handleChange("parent_id", value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None (Root Category)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root Category)</SelectItem>
                    {availableParents.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select a parent to create a subcategory.
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
                    {CATEGORY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
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
