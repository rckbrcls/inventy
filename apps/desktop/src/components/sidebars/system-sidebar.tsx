import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  Building2,
  ChevronDown,
  ChevronRight,
  Home,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

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
            {/* Home / Shops */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/">
                  <Home className="size-4" />
                  <span>Home / Shops</span>
                </Link>
              </SidebarMenuButton>
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

            {/* Management Section */}
            <SidebarMenuItem>
              <Collapsible defaultOpen className="group/collapsible">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <Layers className="size-4" />
                    <span>Management</span>
                    <ChevronRight className="ml-auto size-4 group-data-[state=open]/collapsible:hidden" />
                    <ChevronDown className="ml-auto size-4 hidden group-data-[state=open]/collapsible:block" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {managementItems.map((item) => (
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
