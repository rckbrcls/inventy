import { invoke } from "@tauri-apps/api/core";
import type {
  InventoryLevel,
  CreateInventoryLevelDTO,
  UpdateInventoryLevelDTO,
  AdjustStockDTO,
  TransferStockDTO,
} from "@uru/types";

export const InventoryLevelsRepository = {
  async list(): Promise<InventoryLevel[]> {
    return invoke("list_inventory_levels");
  },

  async listByShop(shopId: string): Promise<InventoryLevel[]> {
    return invoke("list_inventory_levels_by_shop", { shopId });
  },

  async getById(id: string): Promise<InventoryLevel | null> {
    return invoke("get_inventory_level", { id });
  },

  async create(payload: CreateInventoryLevelDTO): Promise<InventoryLevel> {
    return invoke("create_inventory_level", { payload });
  },

  async update(payload: UpdateInventoryLevelDTO): Promise<InventoryLevel> {
    return invoke("update_inventory_level", { payload });
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_inventory_level", { id });
  },

  async adjustStock(payload: AdjustStockDTO): Promise<void> {
    return invoke("adjust_stock", { payload });
  },

  async transferStock(payload: TransferStockDTO): Promise<void> {
    return invoke("transfer_stock", { payload });
  },

  async getAvailableQuantity(
    productId: string,
    locationId: string,
  ): Promise<number> {
    return invoke("get_available_quantity", { productId, locationId });
  },
};
