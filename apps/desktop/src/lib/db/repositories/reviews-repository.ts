import { invoke } from "@tauri-apps/api/core";
import type { Review, CreateReviewInput, UpdateReviewInput } from "@uru/types";

export const ReviewsRepository = {
  async listByShop(shopId: string): Promise<Review[]> {
    return invoke("list_reviews_by_shop", { shopId });
  },

  async getById(id: string): Promise<Review | null> {
    return invoke("get_review", { id });
  },

  async create(payload: CreateReviewInput): Promise<Review> {
    return invoke("create_review", { payload });
  },

  async update(id: string, payload: UpdateReviewInput): Promise<Review> {
    return invoke("update_review", { id, payload });
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_review", { id });
  },
};
