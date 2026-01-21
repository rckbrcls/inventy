import { invoke } from "@tauri-apps/api/core";
import type { InventoryMovement, CreateInventoryMovementDTO } from "@uru/types";

export const InventoryMovementsRepository = {
  async list(): Promise<InventoryMovement[]> {
    return invoke("list_inventory_movements");
  },

  async listByTransaction(transactionId: string): Promise<InventoryMovement[]> {
    return invoke("list_inventory_movements_by_transaction", { transactionId });
  },

  async listByLevel(inventoryLevelId: string): Promise<InventoryMovement[]> {
    return invoke("list_inventory_movements_by_level", { inventoryLevelId });
  },

  async create(
    payload: CreateInventoryMovementDTO,
  ): Promise<InventoryMovement> {
    return invoke("create_inventory_movement", { payload });
  },
};
