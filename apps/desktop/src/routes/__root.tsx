import { HeadContent, Scripts, createRootRoute, Outlet, useLocation, Link } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { ShopSidebar } from '@/components/sidebars/shop-sidebar'
import { SystemSidebar } from '@/components/sidebars/system-sidebar'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from "@/components/ui/sonner"
import { Button } from "@/components/ui/button"
import { Plus, Building2 } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { useShop } from "@/hooks/use-shop"
import React from 'react'


export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Inventy',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  component: RootComponent,
})

function RootComponent() {
  const location = useLocation()
  const { shop } = useShop()
  
  // Determine which sidebar to show based on route
  const getSidebar = () => {
    const path = location.pathname
    
    // System routes (no shop context) - root is now shops list
    if (path === "/" || path.startsWith("/shops/new") || path === "/settings" || path.startsWith("/settings/")) {
      return <SystemSidebar />
    }
    
    // Shop routes (with shop context)
    if (path.startsWith("/shops/") && !path.startsWith("/shops/new")) {
      return <ShopSidebar />
    }
    
    // Default to old sidebar for backward compatibility
    return <AppSidebar />
  }

  // Build breadcrumb items
  const getBreadcrumbItems = () => {
    const isShopRoute = location.pathname.startsWith("/shops/") && !location.pathname.startsWith("/shops/new")
    
    if (!isShopRoute || location.pathname === "/") {
      // Normal breadcrumb for non-shop routes
      if (location.pathname === '/') return []
      
      return location.pathname.split('/').filter(Boolean).map((segment, index, array) => {
        const isLast = index === array.length - 1
        const path = '/' + array.slice(0, index + 1).join('/')

        return {
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          path,
          isLast,
        }
      })
    }
    
    // Shop route breadcrumb: Shops > [Shop Name] > [rest of segments]
    const pathSegments = location.pathname.split('/').filter(Boolean)
    const shopIdIndex = pathSegments.indexOf('shops') + 1
    const shopId = pathSegments[shopIdIndex]
    const remainingSegments = pathSegments.slice(shopIdIndex + 1)
    
    const items = [
      { label: shop?.name || 'Shop', path: `/shops/${shopId}/`, isLast: remainingSegments.length === 0 },
    ]
    
    if (remainingSegments.length > 0) {
      remainingSegments.forEach((segment, index) => {
        const isLast = index === remainingSegments.length - 1
        const path = `/shops/${shopId}/${remainingSegments.slice(0, index + 1).join('/')}`
        items.push({
          label: segment.charAt(0).toUpperCase() + segment.slice(1),
          path,
          isLast,
        })
      })
    }
    
    return items
  }

  const breadcrumbItems = getBreadcrumbItems()

  return (
    <SidebarProvider>
      {getSidebar()}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2 h-full">
            <SidebarTrigger className="-ml-1 cursor-pointer" />
            <Separator orientation="vertical" className="mr-2 h-full" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link to="/">Shops</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbItems.length > 0 && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    {breadcrumbItems.map((item, index) => (
                      <React.Fragment key={item.path || index}>
                        <BreadcrumbItem>
                          {item.isLast ? (
                            <BreadcrumbPage>
                              {item.label}
                            </BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <Link to={item.path}>
                                {item.label}
                              </Link>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {!item.isLast && <BreadcrumbSeparator className="hidden md:block" />}
                      </React.Fragment>
                    ))}
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div>
            {location.pathname.startsWith("/shops/") && !location.pathname.startsWith("/shops/new") && (
              <Button
                asChild
                className="p-4 rounded-full shadow-lg"
              >
                <Link to={`${location.pathname}/transactions/new`}>
                  <Plus className="h-5 w-5" />
                  <span>New Sale</span>
                </Link>
              </Button>
            )}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 min-w-0 overflow-hidden">
          <Outlet />
        </div>
      </SidebarInset>
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </SidebarProvider>
  )
}


function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          {children}
          <Toaster />
          <Scripts />
        </ThemeProvider>
      </body>
    </html>
  )
}
