import {
  Activity,
  ArrowRightLeft,
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
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
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
  {
    title: "Transactions",
    url: "/transactions",
    icon: ArrowRightLeft,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingCart,
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

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Inventy</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
