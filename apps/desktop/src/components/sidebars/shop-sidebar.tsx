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
  BarChart3,
  MessageSquare,
  HelpCircle,
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

const menuStructure = {
  core: [
    { code: "products", title: "Products", url: "/shops/$shopId/products", icon: Package },
    { code: "customers", title: "Customers", url: "/shops/$shopId/customers", icon: Users },
    { code: "orders", title: "Orders", url: "/shops/$shopId/orders", icon: ShoppingCart },
    { code: "transactions", title: "Transactions", url: "/shops/$shopId/transactions", icon: ArrowRightLeft },
    { code: "payments", title: "Payments", url: "/shops/$shopId/payments", icon: CreditCard },
  ],
  logistics: [
    { code: "inventory", title: "Inventory", url: "/shops/$shopId/inventory", icon: Inbox },
    { code: "shipping", title: "Shipping", url: "/shops/$shopId/shipping", icon: MapPin },
    { code: "locations", title: "Locations", url: "/shops/$shopId/locations", icon: MapPin },
  ],
  sales: [
    { code: "checkout", title: "Checkout", url: "/shops/$shopId/checkout", icon: Receipt },
    { code: "pos", title: "POS", url: "/shops/$shopId/pos", icon: Activity },
  ],
  marketing: [
    { code: "reviews", title: "Reviews", url: "/shops/$shopId/reviews", icon: Tag },
    { code: "inquiries", title: "Inquiries", url: "/shops/$shopId/inquiries", icon: MessageSquare },
  ],
  analytics: [
    { code: "analytics", title: "Analytics", url: "/shops/$shopId/analytics", icon: BarChart3 },
  ],
}

export function ShopSidebar() {
  const { shop, isModuleEnabled } = useShop()
  const location = useLocation()
  
  // Extract shopId from pathname
  const shopIdMatch = location.pathname.match(/\/shops\/([^/]+)/)
  const shopId = shopIdMatch?.[1] || shop?.id || ""

  const getEnabledItems = (category: keyof typeof menuStructure) => {
    return menuStructure[category].filter((item) => isModuleEnabled(item.code))
  }

  const enabledCore = getEnabledItems("core")
  const enabledLogistics = getEnabledItems("logistics")
  const enabledSales = getEnabledItems("sales")
  const enabledMarketing = getEnabledItems("marketing")
  const enabledAnalytics = getEnabledItems("analytics")

  const buildUrl = (url: string) => {
    return url.replace("$shopId", shopId)
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

            {/* Core Section */}
            {enabledCore.length > 0 && (
              <SidebarMenuItem>
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Package className="size-4" />
                      <span>Core</span>
                      <ChevronRight className="ml-auto size-4 group-data-[state=open]/collapsible:hidden" />
                      <ChevronDown className="ml-auto size-4 hidden group-data-[state=open]/collapsible:block" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {enabledCore.map((item) => (
                        <SidebarMenuSubItem key={item.code}>
                          <SidebarMenuSubButton asChild>
                            <Link to={buildUrl(item.url)}>
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            )}

            {/* Logistics Section */}
            {enabledLogistics.length > 0 && (
              <SidebarMenuItem>
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Inbox className="size-4" />
                      <span>Logistics</span>
                      <ChevronRight className="ml-auto size-4 group-data-[state=open]/collapsible:hidden" />
                      <ChevronDown className="ml-auto size-4 hidden group-data-[state=open]/collapsible:block" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {enabledLogistics.map((item) => (
                        <SidebarMenuSubItem key={item.code}>
                          <SidebarMenuSubButton asChild>
                            <Link to={buildUrl(item.url)}>
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            )}

            {/* Sales Section */}
            {enabledSales.length > 0 && (
              <SidebarMenuItem>
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <ShoppingCart className="size-4" />
                      <span>Sales</span>
                      <ChevronRight className="ml-auto size-4 group-data-[state=open]/collapsible:hidden" />
                      <ChevronDown className="ml-auto size-4 hidden group-data-[state=open]/collapsible:block" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {enabledSales.map((item) => (
                        <SidebarMenuSubItem key={item.code}>
                          <SidebarMenuSubButton asChild>
                            <Link to={buildUrl(item.url)}>
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            )}

            {/* Marketing Section */}
            {enabledMarketing.length > 0 && (
              <SidebarMenuItem>
                <Collapsible defaultOpen className="group/collapsible">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Tag className="size-4" />
                      <span>Marketing</span>
                      <ChevronRight className="ml-auto size-4 group-data-[state=open]/collapsible:hidden" />
                      <ChevronDown className="ml-auto size-4 hidden group-data-[state=open]/collapsible:block" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {enabledMarketing.map((item) => (
                        <SidebarMenuSubItem key={item.code}>
                          <SidebarMenuSubButton asChild>
                            <Link to={buildUrl(item.url)}>
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            )}

            {/* Analytics - Always available */}
            {enabledAnalytics.length > 0 && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to={buildUrl("/shops/$shopId/analytics")}>
                    <BarChart3 className="size-4" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}

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
