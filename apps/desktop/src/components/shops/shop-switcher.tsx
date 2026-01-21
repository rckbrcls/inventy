import * as React from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { Building2, ChevronDown, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useShop } from "@/hooks/use-shop"
import { useShops } from "@/hooks/use-shops"

export function ShopSwitcher() {
  const navigate = useNavigate()
  const { shop } = useShop()
  const { shops } = useShops()

  const handleSelectShop = (shopId: string) => {
    // Navigate first - the URL is the source of truth
    // The __root.tsx will sync the store when the URL changes
    navigate({ to: "/shops/$shopId/", params: { shopId } })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">{shop?.name || "Select Shop"}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
        <DropdownMenuLabel>Switch Shop</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {shops.map((s) => (
          <DropdownMenuItem
            key={s.id}
            onClick={() => handleSelectShop(s.id)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{s.name}</span>
            </div>
            {shop?.id === s.id && <CheckCircle2 className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/" className="cursor-pointer">
            Manage Shops
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/shops/new" className="cursor-pointer">
            Create New Shop
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
