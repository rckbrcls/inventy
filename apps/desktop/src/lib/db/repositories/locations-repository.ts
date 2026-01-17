import { invoke } from "@tauri-apps/api/core"

export type Location = {
  id: string
  name: string
  type: string
  is_sellable: boolean
  address_data: string | null
}

export type CreateLocationDTO = {
  name: string
  type: string
  is_sellable?: boolean
  address_data?: string
}

export type UpdateLocationDTO = {
  id: string
  name?: string
  type?: string
  is_sellable?: boolean
  address_data?: string
}

export const LocationsRepository = {
  async list(): Promise<Location[]> {
    return invoke("list_locations")
  },

  async getById(id: string): Promise<Location | null> {
    return invoke("get_location", { id })
  },

  async create(payload: CreateLocationDTO): Promise<Location> {
    return invoke("create_location", { payload })
  },

  async update(payload: UpdateLocationDTO): Promise<Location> {
    return invoke("update_location", { payload })
  },

  async delete(id: string): Promise<void> {
    return invoke("delete_location", { id })
  },
}
