import { invoke } from "@tauri-apps/api/core";
import type {
  PosSession,
  CreatePosSessionDTO,
  UpdatePosSessionDTO,
  ClosePosSessionDTO,
} from "@uru/types";

export const PosSessionsRepository = {
  async listByShop(shopId: string): Promise<PosSession[]> {
    return invoke("list_pos_sessions_by_shop", { shopId });
  },

  async getById(id: string): Promise<PosSession | null> {
    return invoke("get_pos_session", { id });
  },

  async getOpenByOperator(operatorId: string): Promise<PosSession | null> {
    return invoke("get_open_pos_session_by_operator", { operatorId });
  },

  async create(payload: CreatePosSessionDTO): Promise<PosSession> {
    return invoke("create_pos_session", { payload });
  },

  async update(payload: UpdatePosSessionDTO): Promise<PosSession> {
    return invoke("update_pos_session", { payload });
  },

  async close(payload: ClosePosSessionDTO): Promise<PosSession> {
    return invoke("close_pos_session", { payload });
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_pos_session", { id });
  },
};
