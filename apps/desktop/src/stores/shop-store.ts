import { create } from "zustand"
import type { Shop, CreateShopDTO, UpdateShopDTO } from "@/lib/db/repositories/shops-repository"
import { ShopsRepository } from "@/lib/db/repositories/shops-repository"

interface ShopState {
  shops: Shop[]
  activeShopId: string | null
  activeShop: Shop | null
  isLoading: boolean
  error: string | null

  // Actions
  setActiveShop: (shopId: string) => Promise<void>
  loadShops: () => Promise<void>
  createShop: (data: CreateShopDTO) => Promise<Shop>
  createShopFromTemplate: (data: CreateShopDTO, templateCode?: string) => Promise<Shop>
  updateShop: (id: string, data: UpdateShopDTO) => Promise<Shop>
  deleteShop: (id: string) => Promise<void>
}

export const useShopStore = create<ShopState>((set, get) => ({
  shops: [],
  activeShopId: null,
  activeShop: null,
  isLoading: false,
  error: null,

  setActiveShop: async (shopId: string) => {
    set({ isLoading: true, error: null })
    try {
      const shop = await ShopsRepository.getById(shopId)
      if (shop) {
        set({ activeShopId: shopId, activeShop: shop, isLoading: false })
      } else {
        set({ error: "Shop not found", isLoading: false })
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to set active shop", isLoading: false })
    }
  },

  loadShops: async () => {
    set({ isLoading: true, error: null })
    try {
      const shops = await ShopsRepository.list()
      
      // If no active shop is set, use the first shop
      let activeShopId = get().activeShopId
      if (!activeShopId) {
        activeShopId = shops[0]?.id || null
      }

      // Load active shop if we have an activeShopId
      let activeShop = get().activeShop
      if (activeShopId) {
        activeShop = shops.find((s) => s.id === activeShopId) || null
      }

      set({ shops, activeShopId, activeShop, isLoading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to load shops", isLoading: false })
    }
  },

  createShop: async (data: CreateShopDTO) => {
    set({ isLoading: true, error: null })
    try {
      const shop = await ShopsRepository.create(data)
      const shops = [...get().shops, shop]
      set({ shops, isLoading: false })
      return shop
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create shop"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  createShopFromTemplate: async (data: CreateShopDTO, templateCode?: string) => {
    set({ isLoading: true, error: null })
    try {
      const shop = await ShopsRepository.createFromTemplate(data, templateCode)
      const shops = [...get().shops, shop]
      set({ shops, isLoading: false })
      return shop
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create shop from template"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  updateShop: async (id: string, data: UpdateShopDTO) => {
    set({ isLoading: true, error: null })
    try {
      const shop = await ShopsRepository.update({ ...data, id })
      const shops = get().shops.map((s) => (s.id === id ? shop : s))
      
      // Update active shop if it's the one being updated
      const activeShop = get().activeShopId === id ? shop : get().activeShop
      
      set({ shops, activeShop, isLoading: false })
      return shop
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update shop"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  deleteShop: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      await ShopsRepository.delete(id)
      const shops = get().shops.filter((s) => s.id !== id)
      
      // If the deleted shop was active, clear it
      const activeShopId = get().activeShopId === id ? null : get().activeShopId
      const activeShop = get().activeShopId === id ? null : get().activeShop
      
      set({ shops, activeShopId, activeShop, isLoading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete shop"
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },
}))
