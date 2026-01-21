import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  Activity,
  ArrowRightLeft,
  Building2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Home,
  Inbox,
  Layers,
  MapPin,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Smartphone,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Menu items grouped by domain
const catalogItems = [
  {
    title: "Products",
    url: "/products",
    icon: Package,
  },
  {
    title: "Brands",
    url: "/brands",
    icon: Tag,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: Layers,
  },
]

const customerItems = [
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
  },
  {
    title: "Customer Addresses",
    url: "/customers/addresses",
    icon: MapPin,
  },
  {
    title: "Customer Groups",
    url: "/customers/groups",
    icon: UsersRound,
  },
]

const salesItems = [
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: ArrowRightLeft,
  },
  {
    title: "Payments",
    url: "/payments",
    icon: CreditCard,
  },
  {
    title: "Refunds",
    url: "/refunds",
    icon: Undo2,
  },
  {
    title: "Checkouts",
    url: "/checkouts",
    icon: Receipt,
  },
]

const inventoryItems = [
  {
    title: "Inventory",
    url: "/inventory",
    icon: Inbox,
  },
  {
    title: "Movements",
    url: "/movements",
    icon: Activity,
  },
]

const systemItems = [
  {
    title: "Pairing",
    url: "/pairing",
    icon: Smartphone,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

// Mock organizations - replace with actual data from your state/API
const organizations = [
  { id: "1", name: "Acme Inc" },
  { id: "2", name: "Acme Corp." },
  { id: "3", name: "Tech Solutions" },
]

export function AppSidebar() {
  const [selectedOrganization, setSelectedOrganization] = React.useState(
    organizations[0]
  )

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Building2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {selectedOrganization.name}
                    </span>
                    <span className="truncate text-xs">Organization</span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                {organizations.map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => setSelectedOrganization(org)}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border">
                      <Building2 className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">{org.name}</span>
                      <span className="text-xs text-muted-foreground">
                        Organization
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {/* Dashboard - Separated at the top */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/">
                  <Home className="size-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Catalog Section */}
            <SidebarMenuItem>
              <Collapsible defaultOpen className="group/collapsible">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <Package className="size-4" />
                    <span>Catalog</span>
                    <ChevronRight className="ml-auto size-4 group-data-[state=open]/collapsible:hidden" />
                    <ChevronDown className="ml-auto size-4 hidden group-data-[state=open]/collapsible:block" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {catalogItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild>
                          <Link to={item.url}>
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

            {/* Customers Section */}
            <SidebarMenuItem>
              <Collapsible defaultOpen className="group/collapsible">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <Users className="size-4" />
                    <span>Customers</span>
                    <ChevronRight className="ml-auto size-4 group-data-[state=open]/collapsible:hidden" />
                    <ChevronDown className="ml-auto size-4 hidden group-data-[state=open]/collapsible:block" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {customerItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild>
                          <Link to={item.url}>
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

            {/* Sales Section */}
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
                    {salesItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild>
                          <Link to={item.url}>
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

            {/* Inventory Section */}
            <SidebarMenuItem>
              <Collapsible defaultOpen className="group/collapsible">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <Inbox className="size-4" />
                    <span>Inventory</span>
                    <ChevronRight className="ml-auto size-4 group-data-[state=open]/collapsible:hidden" />
                    <ChevronDown className="ml-auto size-4 hidden group-data-[state=open]/collapsible:block" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {inventoryItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild>
                          <Link to={item.url}>
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

            {/* System Section */}
            <SidebarMenuItem>
              <Collapsible defaultOpen className="group/collapsible">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <Settings className="size-4" />
                    <span>System</span>
                    <ChevronRight className="ml-auto size-4 group-data-[state=open]/collapsible:hidden" />
                    <ChevronDown className="ml-auto size-4 hidden group-data-[state=open]/collapsible:block" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {systemItems.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton asChild>
                          <Link to={item.url}>
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
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
