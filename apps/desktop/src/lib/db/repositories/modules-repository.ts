import { invoke } from "@tauri-apps/api/core"

export type Module = {
  id: string
  code: string
  name: string
  description: string | null
  category: string | null
  is_core: boolean
  dependencies: string | null
  features: string | null
  _status: string | null
  created_at: string | null
  updated_at: string | null
}

export const ModulesRepository = {
  async list(): Promise<Module[]> {
    return invoke("list_modules")
  },

  async getById(id: string): Promise<Module | null> {
    return invoke("get_module", { id })
  },

  async getByCode(code: string): Promise<Module | null> {
    return invoke("get_module_by_code", { code })
  },

  async listByCategory(category: string): Promise<Module[]> {
    return invoke("list_modules_by_category", { category })
  },

  async listCore(): Promise<Module[]> {
    return invoke("list_core_modules")
  },
}
