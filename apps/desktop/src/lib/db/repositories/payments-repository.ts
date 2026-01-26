import { invoke } from "@tauri-apps/api/core";
import type { Payment, CreatePaymentDTO, UpdatePaymentDTO } from "@uru/types";
import { PAYMENT_METHODS, PAYMENT_STATUSES, RISK_LEVELS } from "@uru/types";

export const PaymentsRepository = {
  async listByShop(shopId: string): Promise<Payment[]> {
    return invoke("list_payments_by_shop", { shopId });
  },

  async getById(id: string): Promise<Payment | null> {
    return invoke("get_payment", { id });
  },

  async create(payload: CreatePaymentDTO): Promise<Payment> {
    return invoke("create_payment", { payload });
  },

  async update(payload: UpdatePaymentDTO): Promise<Payment> {
    return invoke("update_payment", { payload });
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_payment", { id });
  },

  async updateStatus(id: string, status: string): Promise<Payment> {
    return invoke("update_payment_status", { id, status });
  },
};

export { PAYMENT_METHODS, PAYMENT_STATUSES, RISK_LEVELS };
