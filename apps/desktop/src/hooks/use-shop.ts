import { useLocation, useParams } from "@tanstack/react-router"
import { useShopStore } from "@/stores/shop-store"
import { useModuleEnabled } from "./use-module-enabled"
import { useMemo } from "react"

export function useShop() {
  const { activeShop, activeShopId, setActiveShop } = useShopStore()
  const location = useLocation()
  
  // Try to get shopId from route params first (most reliable)
  // useParams with strict: false won't throw if params don't exist
  const params = useParams({ strict: false })
  const paramsShopId = params.shopId as string | undefined
  
  // Extract shopId directly from URL pathname as fallback
  // Use useMemo to ensure reactivity to pathname changes
  const urlShopId = useMemo(() => {
    // First try params (most reliable when in a route with $shopId parameter)
    if (paramsShopId) return paramsShopId
    
    // Fallback to regex extraction from pathname
    const match = location.pathname.match(/\/shops\/([^\/]+)/)
    return match?.[1]
  }, [location.pathname, paramsShopId])
  
  // Check if we're in a shop route
  const isShopRoute = useMemo(() => {
    return location.pathname.startsWith("/shops/") && !location.pathname.startsWith("/shops/new")
  }, [location.pathname])
  
  // CRITICAL: If we're in a shop route, prefer URL shopId, but allow store fallback
  // If we're NOT in a shop route, then use store as fallback
  const shopId = useMemo(() => {
    // Always prefer URL/params shopId if available (most reliable)
    if (urlShopId) return urlShopId
    
    // Fallback to store if not in shop route
    if (!isShopRoute && activeShopId) return activeShopId
    
    // Return undefined if nothing available (components should wait)
    return undefined
  }, [isShopRoute, urlShopId, activeShopId])
  
  const isModuleEnabled = (moduleCode: string) => 
    useModuleEnabled(moduleCode, activeShop?.features_config, activeShop)

  return {
    shop: activeShop,
    shopId,
    setActiveShop,
    isModuleEnabled,
  }
}

// Helper hook to get shopId from route params with fallback to useShop
export function useShopIdFromRoute() {
  const params = useParams({ strict: false })
  const { shopId: shopIdFromHook } = useShop()
  const routeShopId = params?.shopId as string | undefined
  const finalShopId = routeShopId || shopIdFromHook
  
  // Log for debugging
  if (typeof window !== 'undefined') {
    console.log('[useShopIdFromRoute] routeShopId:', routeShopId, 'hookShopId:', shopIdFromHook, 'final:', finalShopId)
  }
  
  // Prefer shopId from route params (most reliable), fallback to hook
  return finalShopId
}
