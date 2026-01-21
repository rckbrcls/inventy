import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  Building2,
  Settings,
  Layers,
  FileText,
  Users,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const systemItems = [
  {
    title: "Shops",
    url: "/shops",
    icon: Building2,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

const managementItems = [
  {
    title: "Modules",
    url: "/settings/modules",
    icon: Layers,
  },
  {
    title: "Templates",
    url: "/settings/templates",
    icon: FileText,
  },
  {
    title: "Users",
    url: "/settings/users",
    icon: Users,
  },
]

export function SystemSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link to="/">
                  <Building2 className="size-4" />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">System</span>
                    <span className="truncate text-xs">Management</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {/* System Items */}
            {systemItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link to={item.url}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}

            {/* Management Items */}
            {managementItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link to={item.url}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
