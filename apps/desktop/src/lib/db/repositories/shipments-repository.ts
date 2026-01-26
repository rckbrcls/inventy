import { invoke } from "@tauri-apps/api/core";
import type {
  Shipment,
  CreateShipmentInput,
  UpdateShipmentInput,
} from "@uru/types";

export const ShipmentsRepository = {
  async listByShop(shopId: string): Promise<Shipment[]> {
    return invoke("list_shipments_by_shop", { shopId });
  },

  async getById(id: string): Promise<Shipment | null> {
    return invoke("get_shipment", { id });
  },

  async create(payload: CreateShipmentInput): Promise<Shipment> {
    return invoke("create_shipment", { payload });
  },

  async update(id: string, payload: UpdateShipmentInput): Promise<Shipment> {
    return invoke("update_shipment", { id, payload });
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_shipment", { id });
  },
};
