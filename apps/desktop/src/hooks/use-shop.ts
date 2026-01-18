import { useShopStore } from "@/stores/shop-store"
import { useModuleEnabled } from "./use-module-enabled"

export function useShop() {
  const { activeShop, activeShopId, setActiveShop } = useShopStore()
  
  const isModuleEnabled = (moduleCode: string) => 
    useModuleEnabled(moduleCode, activeShop?.features_config, activeShop)

  return {
    shop: activeShop,
    shopId: activeShopId,
    setActiveShop,
    isModuleEnabled,
  }
}
