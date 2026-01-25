import { createFileRoute } from "@tanstack/react-router"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Layers } from "lucide-react"

export const Route = createFileRoute("/modules")({
    component: ModulesPage,
})

const availableModules = [
    {
        id: "mod-products",
        name: "Products",
        description: "Manage your product catalog, categories, and brands",
        tables: ["products", "categories", "brands"],
    },
    {
        id: "mod-inventory",
        name: "Inventory",
        description: "Track stock levels and inventory movements",
        tables: ["inventory_levels", "inventory_movements"],
    },
    {
        id: "mod-orders",
        name: "Orders",
        description: "Process and manage customer orders",
        tables: ["orders", "order_items"],
    },
    {
        id: "mod-customers",
        name: "Customers",
        description: "Manage customer information and groups",
        tables: ["customers", "customer_addresses", "customer_groups", "customer_group_memberships"],
    },
    {
        id: "mod-payments",
        name: "Payments",
        description: "Handle payments, transactions, and refunds",
        tables: ["payments", "transactions", "refunds"],
    },
    {
        id: "mod-checkout",
        name: "Checkout",
        description: "Point of sale checkout sessions",
        tables: ["checkouts"],
    },
    {
        id: "mod-pos",
        name: "POS Sessions",
        description: "Point of sale session management",
        tables: ["pos_sessions"],
    },
    {
        id: "mod-shipping",
        name: "Shipping",
        description: "Manage shipments and deliveries",
        tables: ["shipments"],
    },
    {
        id: "mod-locations",
        name: "Locations",
        description: "Manage store locations and warehouses",
        tables: ["locations"],
    },
    {
        id: "mod-reviews",
        name: "Reviews",
        description: "Customer product reviews and ratings",
        tables: ["product_reviews"],
    },
    {
        id: "mod-inquiries",
        name: "Inquiries",
        description: "Customer inquiries and support requests",
        tables: ["customer_inquiries"],
    },
]

function ModulesPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h3 className="text-lg font-medium">Modules</h3>
                <p className="text-sm text-muted-foreground">
                    View and manage available system modules.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableModules.map((module) => (
                    <Card key={module.id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Layers className="size-4 text-muted-foreground" />
                                <CardTitle className="text-base">{module.name}</CardTitle>
                            </div>
                            <CardDescription>{module.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-1">
                                {module.tables.map((table) => (
                                    <Badge key={table} variant="secondary" className="text-xs">
                                        {table}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
