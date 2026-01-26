import { invoke } from "@tauri-apps/api/core";
import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductListFilter,
} from "@uru/types";

export const ProductsRepository = {
  async listByShop(shopId: string): Promise<Product[]> {
    return invoke("list_products_by_shop", { shopId });
  },

  async listFiltered(filters: ProductListFilter): Promise<Product[]> {
    return invoke("list_products_filtered", { filters });
  },

  async getById(id: string): Promise<Product | null> {
    return invoke("get_product", { id });
  },

  async create(payload: CreateProductDTO): Promise<Product> {
    return invoke("create_product", { payload });
  },

  async update(payload: UpdateProductDTO): Promise<Product> {
    return invoke("update_product", { payload });
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_product", { id });
  },
};
