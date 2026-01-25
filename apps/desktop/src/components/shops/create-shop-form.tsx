import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TemplateSelector } from "./template-selector"
import { ModuleSelector } from "./module-selector"
import { SupabaseConfigForm, type SupabaseConfig } from "./supabase-config-form"
import { useShops } from "@/hooks/use-shops"
import { ModulesRepository } from "@/lib/db/repositories/modules-repository"
import { ShopTemplatesRepository } from "@/lib/db/repositories/shop-templates-repository"
import type { Module } from "@/lib/db/repositories/modules-repository"
import type { ShopTemplate } from "@/lib/db/repositories/shop-templates-repository"

const CORE_MODULES = ["products", "customers", "orders", "transactions", "payments"]

const CURRENCIES = [
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
]

const TIMEZONES = [
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo (BRT)" },
  { value: "America/New_York", label: "America/New_York (EST)" },
  { value: "Europe/London", label: "Europe/London (GMT)" },
]

const LOCALES = [
  { value: "pt-BR", label: "pt-BR - Portuguese (Brazil)" },
  { value: "en-US", label: "en-US - English (US)" },
  { value: "es-ES", label: "es-ES - Spanish (Spain)" },
]

export function CreateShopForm() {
  const navigate = useNavigate()
  const { createShop, createShopFromTemplate } = useShops()
  const [mode, setMode] = React.useState<"template" | "custom">("template")
  const [templates, setTemplates] = React.useState<ShopTemplate[]>([])
  const [modules, setModules] = React.useState<Module[]>([])
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>()
  const [selectedModules, setSelectedModules] = React.useState<string[]>(CORE_MODULES)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  const [formData, setFormData] = React.useState({
    name: "",
    slug: "",
    currency: "BRL",
    timezone: "America/Sao_Paulo",
    locale: "pt-BR",
    legal_name: "",
    status: "active",
  })

  const [databaseType, setDatabaseType] = React.useState<"sqlite" | "postgres">("sqlite")
  const [supabaseConfig, setSupabaseConfig] = React.useState<SupabaseConfig>({
    projectUrl: "",
    apiKey: "",
    databaseName: "postgres",
    port: 5432,
  })

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [templatesData, modulesData] = await Promise.all([
          ShopTemplatesRepository.list(),
          ModulesRepository.list(),
        ])
        setTemplates(templatesData)
        setModules(modulesData)
      } catch (error) {
        console.error("Failed to load data:", error)
        toast.error("Failed to load templates and modules")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      slug: field === "name" ? generateSlug(value) : prev.slug,
    }))
  }

  const handleModuleSelectionChange = (modules: string[]) => {
    // Always include core modules
    const allModules = [...new Set([...CORE_MODULES, ...modules])]
    setSelectedModules(allModules)
  }

  const generateConnectionString = (): string => {
    if (databaseType === "sqlite") {
      return ""
    }
    if (!supabaseConfig.projectUrl || !supabaseConfig.apiKey) {
      return ""
    }
    
    try {
      const port = supabaseConfig.port || 5432
      const url = new URL(supabaseConfig.projectUrl)
      const host = url.hostname.replace(/^https?:\/\//, "").replace(/\.supabase\.co$/, "")
      
      if (!host) {
        return ""
      }
      
      return `postgresql://postgres:${encodeURIComponent(supabaseConfig.apiKey)}@db.${host}.supabase.co:${port}/${supabaseConfig.databaseName || "postgres"}`
    } catch {
      return ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.slug) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validate Supabase config if Postgres is selected
    if (databaseType === "postgres") {
      if (!supabaseConfig.projectUrl || !supabaseConfig.apiKey) {
        toast.error("Please fill in all Supabase configuration fields")
        return
      }
    }

    try {
      setIsSaving(true)

      // Build features_config from selected modules
      const featuresConfig: Record<string, boolean> = {}
      selectedModules.forEach((moduleCode) => {
        featuresConfig[moduleCode] = true
      })

      // Build database_config
      let databaseConfig: string | undefined
      if (databaseType === "postgres") {
        const connectionString = generateConnectionString()
        databaseConfig = JSON.stringify({
          database_type: "postgres",
          connection_string: connectionString,
          max_connections: 5,
          min_connections: 1,
          connect_timeout_secs: 30,
          idle_timeout_secs: 600,
        })
      }

      const payload = {
        name: formData.name,
        slug: formData.slug,
        currency: formData.currency,
        timezone: formData.timezone,
        locale: formData.locale,
        legal_name: formData.legal_name || undefined,
        status: formData.status || undefined,
        features_config: JSON.stringify(featuresConfig),
        database_type: databaseType,
        database_config: databaseConfig,
      }

      let shop
      if (mode === "template" && selectedTemplate) {
        shop = await createShopFromTemplate(payload, selectedTemplate)
      } else {
        shop = await createShop(payload)
      }

      toast.success("Shop created successfully")
      navigate({ to: "/shops/$shopId/", params: { shopId: shop.id } })
    } catch (error) {
      console.error("Failed to create shop:", error)
      toast.error("Failed to create shop")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div>Loading templates and modules...</div>
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-medium">New Shop</h3>
          <p className="text-sm text-muted-foreground">
            Create a new shop using a template or customize it manually.
          </p>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Essential shop details like name and configuration.
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
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="My Shop"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleChange("slug", e.target.value)}
                placeholder="my-shop"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="legal_name">Legal Name</Label>
              <Input
                id="legal_name"
                value={formData.legal_name}
                onChange={(e) => handleChange("legal_name", e.target.value)}
                placeholder="My Shop Ltd."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
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
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => handleChange("timezone", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="locale">Locale</Label>
                <Select
                  value={formData.locale}
                  onValueChange={(value) => handleChange("locale", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCALES.map((locale) => (
                      <SelectItem key={locale.value} value={locale.value}>
                        {locale.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Database Configuration</CardTitle>
            <CardDescription>
              Choose between local SQLite or remote Postgres (Supabase) database.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="sqlite"
                  name="databaseType"
                  value="sqlite"
                  checked={databaseType === "sqlite"}
                  onChange={(e) => setDatabaseType(e.target.value as "sqlite" | "postgres")}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <Label htmlFor="sqlite" className="font-normal cursor-pointer">
                  SQLite (Local) - Offline-first, no internet required
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="postgres"
                  name="databaseType"
                  value="postgres"
                  checked={databaseType === "postgres"}
                  onChange={(e) => setDatabaseType(e.target.value as "sqlite" | "postgres")}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <Label htmlFor="postgres" className="font-normal cursor-pointer">
                  Postgres (Supabase) - Cloud sync, backup, and multi-device access
                </Label>
              </div>
            </div>

            {databaseType === "postgres" && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                <SupabaseConfigForm
                  config={supabaseConfig}
                  onChange={setSupabaseConfig}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template or Module Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Choose to use a template or customize modules manually.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={(v) => setMode(v as "template" | "custom")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="template">Use Template</TabsTrigger>
                <TabsTrigger value="custom">Custom Modules</TabsTrigger>
              </TabsList>
              <TabsContent value="template" className="mt-4">
                {templates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No templates available. Use custom modules instead.
                  </p>
                ) : (
                  <TemplateSelector
                    templates={templates}
                    selectedTemplate={selectedTemplate}
                    onSelect={setSelectedTemplate}
                  />
                )}
              </TabsContent>
              <TabsContent value="custom" className="mt-4">
                <ModuleSelector
                  modules={modules}
                  selectedModules={selectedModules}
                  onSelectionChange={handleModuleSelectionChange}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/" })}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Creating..." : "Create Shop"}
          </Button>
        </div>
      </div>
    </form>
  )
}
