import { invoke } from "@tauri-apps/api/core";
import type {
  InventoryLevel,
  CreateInventoryLevelDTO,
  UpdateInventoryLevelDTO,
  AdjustStockDTO,
  TransferStockDTO,
} from "@uru/types";

export type { CreateInventoryLevelDTO, UpdateInventoryLevelDTO };

export const InventoryLevelsRepository = {
  async listByShop(shopId: string): Promise<InventoryLevel[]> {
    return invoke("list_inventory_levels_by_shop", { shopId });
  },

  async getById(shopId: string, id: string): Promise<InventoryLevel | null> {
    return invoke("get_inventory_level", { shopId, id });
  },

  async create(shopId: string, payload: CreateInventoryLevelDTO): Promise<InventoryLevel> {
    return invoke("create_inventory_level", { shopId, payload });
  },

  async update(shopId: string, payload: UpdateInventoryLevelDTO): Promise<InventoryLevel> {
    return invoke("update_inventory_level", { shopId, payload });
  },

  async delete(shopId: string, id: string): Promise<void> {
    return invoke("delete_inventory_level", { shopId, id });
  },

  async adjustStock(shopId: string, payload: AdjustStockDTO): Promise<void> {
    return invoke("adjust_stock", { shopId, payload });
  },

  async transferStock(shopId: string, payload: TransferStockDTO): Promise<void> {
    return invoke("transfer_stock", { shopId, payload });
  },

  async getAvailableQuantity(
    shopId: string,
    productId: string,
    locationId: string,
  ): Promise<number> {
    return invoke("get_available_quantity", { shopId, productId, locationId });
  },
};
