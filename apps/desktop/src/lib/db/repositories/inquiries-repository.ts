import { invoke } from "@tauri-apps/api/core";
import type {
  Inquiry,
  CreateInquiryInput,
  UpdateInquiryInput,
} from "@uru/types";

export const InquiriesRepository = {
  async listByShop(shopId: string): Promise<Inquiry[]> {
    return invoke("list_inquiries_by_shop", { shopId });
  },

  async getById(id: string): Promise<Inquiry | null> {
    return invoke("get_inquiry", { id });
  },

  async create(payload: CreateInquiryInput): Promise<Inquiry> {
    return invoke("create_inquiry", { payload });
  },

  async update(id: string, payload: UpdateInquiryInput): Promise<Inquiry> {
    return invoke("update_inquiry", { id, payload });
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_inquiry", { id });
  },
};
