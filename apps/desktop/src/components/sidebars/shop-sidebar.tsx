import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  Activity,
  ArrowRightLeft,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Home,
  Inbox,
  Layers,
  MapPin,
  Package,
  Receipt,
  ShoppingCart,
  Tag,
  Undo2,
  Users,
  UsersRound,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useShop } from "@/hooks/use-shop"
import { ShopSwitcher } from "@/components/shops/shop-switcher"
import { useLocation } from "@tanstack/react-router"

type MenuItem = {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

type ModuleConfig = {
  code: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: MenuItem[]
}

const menuStructure: Record<string, ModuleConfig[]> = {
  core: [
    {
      code: "products",
      title: "Products",
      icon: Package,
      items: [
        { title: "Products", url: "/shops/$shopId/products", icon: Package },
        { title: "Brands", url: "/shops/$shopId/brands", icon: Tag },
        { title: "Categories", url: "/shops/$shopId/categories", icon: Layers },
      ],
    },
    {
      code: "customers",
      title: "Customers",
      icon: Users,
      items: [
        { title: "Customers", url: "/shops/$shopId/customers", icon: Users },
        { title: "Addresses", url: "/shops/$shopId/customers/addresses", icon: MapPin },
        { title: "Groups", url: "/shops/$shopId/customers/groups", icon: UsersRound },
      ],
    },
    {
      code: "orders",
      title: "Orders",
      icon: ShoppingCart,
      items: [
        { title: "Orders", url: "/shops/$shopId/orders", icon: ShoppingCart },
      ],
    },
    {
      code: "transactions",
      title: "Transactions",
      icon: ArrowRightLeft,
      items: [
        { title: "Transactions", url: "/shops/$shopId/transactions", icon: ArrowRightLeft },
      ],
    },
    {
      code: "payments",
      title: "Payments",
      icon: CreditCard,
      items: [
        { title: "Payments", url: "/shops/$shopId/payments", icon: CreditCard },
        { title: "Refunds", url: "/shops/$shopId/refunds", icon: Undo2 },
      ],
    },
  ],
  logistics: [
    {
      code: "inventory",
      title: "Inventory",
      icon: Inbox,
      items: [
        { title: "Inventory", url: "/shops/$shopId/inventory", icon: Inbox },
        { title: "Movements", url: "/shops/$shopId/inventory/movements", icon: ArrowRightLeft },
      ],
    },
  ],
  sales: [
    {
      code: "checkout",
      title: "Checkout",
      icon: Receipt,
      items: [
        { title: "Checkouts", url: "/shops/$shopId/checkouts", icon: Receipt },
      ],
    },
  ],
}

export function ShopSidebar() {
  const { shop, isModuleEnabled } = useShop()
  const location = useLocation()

  // Extract shopId from pathname
  const shopIdMatch = location.pathname.match(/\/shops\/([^/]+)/)
  const shopId = shopIdMatch?.[1] || shop?.id || ""

  const getEnabledModules = (category: string) => {
    return menuStructure[category]?.filter((module) => isModuleEnabled(module.code)) || []
  }

  const enabledCore = getEnabledModules("core")
  const enabledLogistics = getEnabledModules("logistics")
  const enabledSales = getEnabledModules("sales")

  const buildUrl = (url: string) => {
    return url.replace("$shopId", shopId)
  }

  const renderModule = (module: ModuleConfig) => {
    const ModuleIcon = module.icon

    return (
      <SidebarMenuItem key={module.code}>
        <Collapsible defaultOpen className="group/collapsible">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              <ModuleIcon className="size-4" />
              <span>{module.title}</span>
              <ChevronRight className="ml-auto size-4 group-data-[state=open]/collapsible:hidden" />
              <ChevronDown className="ml-auto size-4 hidden group-data-[state=open]/collapsible:block" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {module.items.map((item) => {
                const ItemIcon = item.icon
                return (
                  <SidebarMenuSubItem key={item.url}>
                    <SidebarMenuSubButton asChild>
                      <Link to={buildUrl(item.url)}>
                        <ItemIcon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    )
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <ShopSwitcher />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {/* Dashboard */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to={buildUrl("/shops/$shopId")}>
                  <Home className="size-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Core Modules */}
            {enabledCore.map((module) => renderModule(module))}

            {/* Logistics Modules */}
            {enabledLogistics.map((module) => renderModule(module))}

            {/* Sales Modules */}
            {enabledSales.map((module) => renderModule(module))}

            {/* Shop Settings */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to={buildUrl("/shops/$shopId/settings")}>
                  <Activity className="size-4" />
                  <span>Shop Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
