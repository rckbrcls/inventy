import { invoke } from "@tauri-apps/api/core";
import type {
  Location,
  CreateLocationDTO,
  UpdateLocationDTO,
} from "@uru/types";

export const LocationsRepository = {
  async listByShop(shopId: string): Promise<Location[]> {
    return invoke("list_locations", { shopId });
  },

  async getById(shopId: string, id: string): Promise<Location | null> {
    return invoke("get_location", { shopId, id });
  },

  async create(payload: CreateLocationDTO): Promise<Location> {
    return invoke("create_location", { payload });
  },

  async update(payload: UpdateLocationDTO): Promise<Location> {
    return invoke("update_location", { payload });
  },

  async delete(shopId: string, id: string): Promise<void> {
    return invoke("delete_location", { shopId, id });
  },
};
