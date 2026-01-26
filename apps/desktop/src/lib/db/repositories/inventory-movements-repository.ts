import { invoke } from "@tauri-apps/api/core";
import type { InventoryMovement, CreateInventoryMovementDTO } from "@uru/types";

export const InventoryMovementsRepository = {
  async listByShop(shopId: string): Promise<InventoryMovement[]> {
    return invoke("list_inventory_movements_by_shop", { shopId });
  },

  async listByTransaction(
    shopId: string,
    transactionId: string,
  ): Promise<InventoryMovement[]> {
    return invoke("list_inventory_movements_by_transaction", {
      shopId,
      transactionId,
    });
  },

  async listByLevel(
    shopId: string,
    inventoryLevelId: string,
  ): Promise<InventoryMovement[]> {
    return invoke("list_inventory_movements_by_level", {
      shopId,
      inventoryLevelId,
    });
  },

  async create(
    shopId: string,
    payload: CreateInventoryMovementDTO,
  ): Promise<InventoryMovement> {
    return invoke("create_inventory_movement", { shopId, payload });
  },
};
