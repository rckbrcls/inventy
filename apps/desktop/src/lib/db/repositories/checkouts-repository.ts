import { invoke } from "@tauri-apps/api/core";
import type {
  Checkout,
  CreateCheckoutDTO,
  UpdateCheckoutDTO,
} from "@uru/types";

export const CheckoutsRepository = {
  async list(): Promise<Checkout[]> {
    return invoke("list_checkouts");
  },

  async listByShop(shopId: string): Promise<Checkout[]> {
    return invoke("list_checkouts_by_shop", { shopId });
  },

  async getById(id: string): Promise<Checkout | null> {
    return invoke("get_checkout", { id });
  },

  async getByToken(token: string): Promise<Checkout | null> {
    return invoke("get_checkout_by_token", { token });
  },

  async create(payload: CreateCheckoutDTO): Promise<Checkout> {
    return invoke("create_checkout", { payload });
  },

  async update(payload: UpdateCheckoutDTO): Promise<Checkout> {
    return invoke("update_checkout", { payload });
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_checkout", { id });
  },
};
