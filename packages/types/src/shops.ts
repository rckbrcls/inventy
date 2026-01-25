export type Shop = {
  id: string;
  name: string;
  legal_name: string | null;
  slug: string;
  status: string;
  features_config: string | null;
  mail_config: string | null;
  storage_config: string | null;
  settings: string | null;
  branding: string | null;
  currency: string;
  timezone: string;
  locale: string;
  owner_id: string | null;
  _status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CreateShopDTO = {
  name: string;
  slug: string;
  currency: string;
  timezone: string;
  locale: string;
  legal_name?: string;
  status?: string;
  features_config?: string;
  mail_config?: string;
  storage_config?: string;
  settings?: string;
  branding?: string;
  owner_id?: string;
  database_type?: "sqlite" | "postgres";
  database_config?: string; // JSON string with DatabaseConfig
};

export type UpdateShopDTO = {
  id: string;
  name?: string;
  legal_name?: string;
  slug?: string;
  status?: string;
  features_config?: string;
  mail_config?: string;
  storage_config?: string;
  settings?: string;
  branding?: string;
  currency?: string;
  timezone?: string;
  locale?: string;
  owner_id?: string;
};
