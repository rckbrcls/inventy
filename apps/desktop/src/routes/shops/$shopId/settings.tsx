import * as React from "react"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"

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
import { useShop } from "@/hooks/use-shop"
import { useShopStore } from "@/stores/shop-store"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/shops/$shopId/settings")({
    component: ShopSettingsRoute,
})

const CURRENCIES = [
    { value: "BRL", label: "BRL (R$)" },
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
]

const TIMEZONES = [
    { value: "America/Sao_Paulo", label: "America/São Paulo" },
    { value: "America/New_York", label: "America/New York" },
    { value: "Europe/London", label: "Europe/London" },
]

const LOCALES = [
    { value: "pt-BR", label: "pt-BR" },
    { value: "en-US", label: "en-US" },
    { value: "en-GB", label: "en-GB" },
]

function ShopSettingsRoute() {
    const navigate = useNavigate()
    const { shopId } = Route.useParams()
    const { shop } = useShop()
    const { updateShop, setActiveShop } = useShopStore()
    const [isLoading, setIsLoading] = React.useState(true)
    const [isSaving, setIsSaving] = React.useState(false)
    const [formData, setFormData] = React.useState({
        name: "",
        legal_name: "",
        slug: "",
        currency: "BRL",
        timezone: "America/Sao_Paulo",
        locale: "pt-BR",
    })

    React.useEffect(() => {
        const load = async () => {
            if (shopId) {
                await setActiveShop(shopId)
            }
            setIsLoading(false)
        }
        load()
    }, [shopId, setActiveShop])

    React.useEffect(() => {
        if (shop) {
            setFormData({
                name: shop.name || "",
                legal_name: shop.legal_name || "",
                slug: shop.slug || "",
                currency: shop.currency || "BRL",
                timezone: shop.timezone || "America/Sao_Paulo",
                locale: shop.locale || "pt-BR",
            })
        }
    }, [shop])

    const handleSave = async () => {
        if (!shop) return
        setIsSaving(true)
        try {
            await updateShop(shop.id, {
                id: shop.id,
                name: formData.name,
                legal_name: formData.legal_name || undefined,
                slug: formData.slug,
                currency: formData.currency,
                timezone: formData.timezone,
                locale: formData.locale,
            })
            toast.success("Shop settings saved successfully")
            navigate({ to: "/shops/$shopId", params: { shopId: shop.id } })
        } catch (error) {
            console.error("Failed to save shop settings:", error)
            toast.error("Failed to save shop settings")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading || !shop) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate({ to: "/shops/$shopId", params: { shopId } })}
                >
                    <ArrowLeft className="size-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Shop Settings</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your shop profile and preferences.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                        Basic information about your shop.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="My Shop"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="legal_name">Legal name</Label>
                        <Input
                            id="legal_name"
                            value={formData.legal_name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, legal_name: e.target.value }))}
                            placeholder="Legal business name"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                            placeholder="my-shop"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Regional</CardTitle>
                    <CardDescription>
                        Currency, timezone, and locale for this shop.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Currency</Label>
                        <Select
                            value={formData.currency}
                            onValueChange={(v) => setFormData((prev) => ({ ...prev, currency: v }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CURRENCIES.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                        {c.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Timezone</Label>
                        <Select
                            value={formData.timezone}
                            onValueChange={(v) => setFormData((prev) => ({ ...prev, timezone: v }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TIMEZONES.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Locale</Label>
                        <Select
                            value={formData.locale}
                            onValueChange={(v) => setFormData((prev) => ({ ...prev, locale: v }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {LOCALES.map((l) => (
                                    <SelectItem key={l.value} value={l.value}>
                                        {l.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={() => navigate({ to: "/shops/$shopId", params: { shopId } })}
                >
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save changes"}
                </Button>
            </div>
        </div>
    )
}
