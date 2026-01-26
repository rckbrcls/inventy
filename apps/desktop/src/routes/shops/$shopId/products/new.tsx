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
import { ProductsRepository, CreateProductDTO } from "@/lib/db/repositories/products-repository"
import { Brand, BrandsRepository } from "@/lib/db/repositories/brands-repository"
import { Category, CategoriesRepository } from "@/lib/db/repositories/categories-repository"

export const Route = createFileRoute("/shops/$shopId/products/new")({
  component: NewProduct,
})

const PRODUCT_TYPES = [
  { value: "physical", label: "Physical" },
  { value: "digital", label: "Digital" },
  { value: "service", label: "Service" },
  { value: "bundle", label: "Bundle" },
]

const PRODUCT_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
  { value: "out_of_stock", label: "Out of Stock" },
]

function NewProduct() {
  const navigate = useNavigate()
  const { shopId } = Route.useParams()
  const [brands, setBrands] = React.useState<Brand[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [isSaving, setIsSaving] = React.useState(false)

  // Form state
  const [formData, setFormData] = React.useState({
    sku: "",
    name: "",
    type: "physical",
    status: "draft",
    slug: "",
    gtin_ean: "",
    price: "",
    promotional_price: "",
    cost_price: "",
    currency: "BRL",
    tax_ncm: "",
    is_shippable: true,
    weight_g: "0",
    width_mm: "0",
    height_mm: "0",
    depth_mm: "0",
    brand_id: "",
    category_id: "",
    attributes: "",
    metadata: "",
  })

  React.useEffect(() => {
    if (!shopId) return
    const loadData = async () => {
      try {
        const [brandsData, categoriesData] = await Promise.all([
          BrandsRepository.listByShop(shopId),
          CategoriesRepository.listByShop(shopId),
        ])
        setBrands(brandsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Failed to load data:", error)
      }
    }
    loadData()
  }, [shopId])

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

    if (!formData.sku || !formData.name || !formData.price) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setIsSaving(true)

      const payload: CreateProductDTO = {
        sku: formData.sku,
        name: formData.name,
        type: formData.type,
        status: formData.status || undefined,
        slug: formData.slug || undefined,
        gtin_ean: formData.gtin_ean || undefined,
        price: parseFloat(formData.price) || 0,
        promotional_price: formData.promotional_price
          ? parseFloat(formData.promotional_price)
          : undefined,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
        currency: formData.currency || undefined,
        tax_ncm: formData.tax_ncm || undefined,
        is_shippable: formData.is_shippable,
        weight_g: parseInt(formData.weight_g) || 0,
        width_mm: parseInt(formData.width_mm) || 0,
        height_mm: parseInt(formData.height_mm) || 0,
        depth_mm: parseInt(formData.depth_mm) || 0,
        brand_id: formData.brand_id || undefined,
        category_id: formData.category_id || undefined,
        attributes: formData.attributes || undefined,
        metadata: formData.metadata || undefined,
        categories: [],
      }

      await ProductsRepository.create(payload)
      toast.success("Product created successfully")
      navigate({ to: "/products" })
    } catch (error) {
      console.error("Failed to create product:", error)
      toast.error("Failed to create product")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-medium">New Product</h3>
        <p className="text-sm text-muted-foreground">
          Create a new product in your catalog.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential product details like name, SKU, and type.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sku">
                    SKU <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleChange("sku", e.target.value)}
                    placeholder="PROD-001"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gtin_ean">GTIN/EAN</Label>
                  <Input
                    id="gtin_ean"
                    value={formData.gtin_ean}
                    onChange={(e) => handleChange("gtin_ean", e.target.value)}
                    placeholder="7891234567890"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Product Name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="product-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                      {PRODUCT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      {PRODUCT_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="brand_id">Brand</Label>
                  <Select
                    value={formData.brand_id || "none"}
                    onValueChange={(value) => handleChange("brand_id", value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category_id">Category</Label>
                  <Select
                    value={formData.category_id || "none"}
                    onValueChange={(value) => handleChange("category_id", value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Set the product prices and currency.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">
                    Price <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="promotional_price">Promotional Price</Label>
                  <Input
                    id="promotional_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.promotional_price}
                    onChange={(e) => handleChange("promotional_price", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cost_price">Cost Price</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_price}
                    onChange={(e) => handleChange("cost_price", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="tax_ncm">Tax Code (NCM)</Label>
                  <Input
                    id="tax_ncm"
                    value={formData.tax_ncm}
                    onChange={(e) => handleChange("tax_ncm", e.target.value)}
                    placeholder="8471.30.19"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
              <CardDescription>
                Configure shipping options and dimensions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_shippable"
                  checked={formData.is_shippable}
                  onCheckedChange={(checked) =>
                    handleChange("is_shippable", checked as boolean)
                  }
                />
                <Label htmlFor="is_shippable">This product requires shipping</Label>
              </div>

              {formData.is_shippable && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="weight_g">Weight (grams)</Label>
                    <Input
                      id="weight_g"
                      type="number"
                      min="0"
                      value={formData.weight_g}
                      onChange={(e) => handleChange("weight_g", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="width_mm">Width (mm)</Label>
                      <Input
                        id="width_mm"
                        type="number"
                        min="0"
                        value={formData.width_mm}
                        onChange={(e) => handleChange("width_mm", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="height_mm">Height (mm)</Label>
                      <Input
                        id="height_mm"
                        type="number"
                        min="0"
                        value={formData.height_mm}
                        onChange={(e) => handleChange("height_mm", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="depth_mm">Depth (mm)</Label>
                      <Input
                        id="depth_mm"
                        type="number"
                        min="0"
                        value={formData.depth_mm}
                        onChange={(e) => handleChange("depth_mm", e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Advanced */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced</CardTitle>
              <CardDescription>
                Additional metadata and custom attributes (JSON format).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="attributes">
                  Attributes (JSON)
                </Label>
                <Textarea
                  id="attributes"
                  value={formData.attributes}
                  onChange={(e) => handleChange("attributes", e.target.value)}
                  placeholder='{"color": "Blue", "size": "M"}'
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metadata">
                  Metadata (JSON)
                </Label>
                <Textarea
                  id="metadata"
                  value={formData.metadata}
                  onChange={(e) => handleChange("metadata", e.target.value)}
                  placeholder='{"supplier_id": 123}'
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/products" })}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Creating..." : "Create Product"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
