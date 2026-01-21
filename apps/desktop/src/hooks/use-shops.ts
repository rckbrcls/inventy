import { useEffect } from "react"
import { useShopStore } from "@/stores/shop-store"

export function useShops() {
  const { shops, loadShops, createShop, updateShop, deleteShop, createShopFromTemplate } = useShopStore()

  useEffect(() => {
    loadShops()
  }, [loadShops])

  return {
    shops,
    loadShops,
    createShop,
    updateShop,
    deleteShop,
    createShopFromTemplate,
  }
}
