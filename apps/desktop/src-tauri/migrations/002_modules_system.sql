-- Migration: Sistema de Módulos e Templates
-- Criação das tabelas modules e shop_templates
-- Popular com módulos disponíveis e templates pré-configurados

-- ============================================================
-- 1. Tabela modules - Catálogo de todos os módulos disponíveis
-- ============================================================

CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,              -- 'shipping', 'inventory', etc.
    name TEXT NOT NULL,                     -- Nome exibido ao usuário
    description TEXT,                       -- Descrição do módulo
    category TEXT,                          -- 'core', 'logistics', 'sales', etc.
    icon TEXT,                              -- Ícone/nome do ícone
    version TEXT DEFAULT '1.0.0',
    required_modules TEXT DEFAULT '[]',     -- JSON array: dependências
    conflicts_with TEXT DEFAULT '[]',       -- JSON array: conflitos
    tables_used TEXT DEFAULT '[]',          -- JSON array: tabelas utilizadas
    is_core INTEGER DEFAULT 0,              -- 1 se não pode ser desabilitado
    metadata TEXT DEFAULT '{}',             -- JSON: configurações adicionais
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_modules_code ON modules(code) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_modules_category ON modules(category) WHERE _status != 'deleted';

-- ============================================================
-- 2. Tabela shop_templates - Templates pré-configurados
-- ============================================================

CREATE TABLE IF NOT EXISTS shop_templates (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,              -- 'online_store', 'physical_store', etc.
    name TEXT NOT NULL,                     -- Nome exibido
    description TEXT,                       -- Descrição do tipo de negócio
    category TEXT,                          -- 'retail', 'services', 'ecommerce', etc.
    icon TEXT,                              -- Ícone/nome do ícone
    features_config TEXT NOT NULL,          -- JSON: configuração a ser aplicada
    default_settings TEXT DEFAULT '{}',     -- JSON: configurações padrão
    recommended_modules TEXT DEFAULT '[]',  -- JSON array: módulos recomendados
    metadata TEXT DEFAULT '{}',             -- JSON: informações adicionais
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shop_templates_code ON shop_templates(code) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_shop_templates_category ON shop_templates(category) WHERE _status != 'deleted';

-- ============================================================
-- 3. Popular módulos disponíveis
-- ============================================================

-- Módulos Core (sempre habilitados)
INSERT INTO modules (id, code, name, description, category, is_core, tables_used) VALUES
('mod-products', 'products', 'Produtos', 'Catálogo de produtos e serviços', 'core', 1, '["products", "brands", "categories", "product_categories"]'),
('mod-customers', 'customers', 'Clientes', 'Gerenciamento de clientes', 'core', 1, '["customers", "customer_addresses", "customer_groups", "customer_group_memberships"]'),
('mod-transactions', 'transactions', 'Transações', 'Registro de transações financeiras', 'core', 1, '["transactions", "transaction_items"]'),
('mod-orders', 'orders', 'Pedidos', 'Gerenciamento de pedidos', 'core', 1, '["orders"]'),
('mod-payments', 'payments', 'Pagamentos', 'Processamento de pagamentos', 'core', 1, '["payments", "refunds"]');

-- Módulos Opcionais - Logística
INSERT INTO modules (id, code, name, description, category, required_modules, tables_used) VALUES
('mod-shipping', 'shipping', 'Entrega', 'Gerenciamento de entregas e frete', 'logistics', '["orders"]', '["shipments", "shipment_items", "shipment_events"]'),
('mod-inventory', 'inventory', 'Estoque', 'Controle de estoque e inventário', 'logistics', '["products"]', '["inventory_levels", "inventory_movements"]'),
('mod-locations', 'locations', 'Locais', 'Gerenciamento de locais e depósitos', 'logistics', '[]', '["locations"]');

-- Módulos Opcionais - Vendas
INSERT INTO modules (id, code, name, description, category, required_modules, tables_used) VALUES
('mod-checkout', 'checkout', 'Checkout', 'Carrinho de compras e checkout', 'sales', '["products", "customers"]', '["checkouts"]'),
('mod-pos', 'pos', 'Ponto de Venda', 'Sistema de ponto de venda (PDV)', 'sales', '["transactions", "inventory"]', '[]');

-- Módulos Opcionais - Marketing e Suporte
INSERT INTO modules (id, code, name, description, category, required_modules, tables_used) VALUES
('mod-reviews', 'reviews', 'Avaliações', 'Sistema de avaliações e reviews', 'marketing', '["orders", "products", "customers"]', '["reviews"]'),
('mod-inquiries', 'inquiries', 'Atendimento', 'Sistema de atendimento ao cliente (SAC)', 'marketing', '["customers"]', '["inquiries"]');

-- Módulos Opcionais - Analytics
INSERT INTO modules (id, code, name, description, category, tables_used) VALUES
('mod-analytics', 'analytics', 'Analytics', 'Analytics e relatórios (sempre disponível)', 'analytics', '[]');

-- ============================================================
-- 4. Popular templates pré-configurados
-- ============================================================

-- Template 1: Loja Virtual
INSERT INTO shop_templates (id, code, name, description, category, features_config, default_settings, recommended_modules) VALUES
(
    'tpl-online-store',
    'online_store',
    'Loja Virtual',
    'Loja online com checkout, estoque e entregas',
    'ecommerce',
    '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "shipping": true, "checkout": true, "inventory": true, "inquiries": true, "reviews": true, "analytics": true, "pos": false, "locations": false}',
    '{"allow_guest_checkout": true, "require_shipping": true}',
    '["shipping", "checkout", "inventory", "reviews", "inquiries"]'
);

-- Template 2: Loja Física
INSERT INTO shop_templates (id, code, name, description, category, features_config, default_settings, recommended_modules) VALUES
(
    'tpl-physical-store',
    'physical_store',
    'Loja Física',
    'Loja física com PDV e controle de estoque',
    'retail',
    '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "pos": true, "inventory": true, "locations": true, "inquiries": true, "analytics": true, "shipping": false, "checkout": false, "reviews": false}',
    '{"require_shipping": false, "allow_offline_sales": true}',
    '["pos", "inventory", "locations"]'
);

-- Template 3: Marketplace
INSERT INTO shop_templates (id, code, name, description, category, features_config, default_settings, recommended_modules) VALUES
(
    'tpl-marketplace',
    'marketplace',
    'Marketplace',
    'Marketplace multi-vendedor completo',
    'ecommerce',
    '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "shipping": true, "checkout": true, "inventory": true, "locations": true, "inquiries": true, "reviews": true, "analytics": true, "pos": false}',
    '{"multi_vendor": true, "allow_guest_checkout": true, "require_shipping": true}',
    '["shipping", "checkout", "inventory", "locations", "reviews", "inquiries"]'
);

-- Template 4: Loja Híbrida (Física + Virtual)
INSERT INTO shop_templates (id, code, name, description, category, features_config, default_settings, recommended_modules) VALUES
(
    'tpl-hybrid-store',
    'hybrid_store',
    'Loja Híbrida',
    'Loja física e virtual com todos os recursos',
    'retail',
    '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "shipping": true, "checkout": true, "inventory": true, "pos": true, "locations": true, "inquiries": true, "reviews": true, "analytics": true}',
    '{"allow_guest_checkout": true, "require_shipping": true, "allow_offline_sales": true}',
    '["shipping", "checkout", "inventory", "pos", "locations", "reviews", "inquiries"]'
);

-- Template 5: Consultoria/Serviços
INSERT INTO shop_templates (id, code, name, description, category, features_config, default_settings, recommended_modules) VALUES
(
    'tpl-consulting',
    'consulting',
    'Consultoria',
    'Serviços e consultoria sem necessidade de estoque ou entrega',
    'services',
    '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "inquiries": true, "analytics": true, "shipping": false, "inventory": false, "checkout": false, "pos": false, "reviews": false, "locations": false}',
    '{"product_type_default": "service", "require_shipping": false}',
    '["inquiries"]'
);

-- Template 6: Aula Virtual/Educação
INSERT INTO shop_templates (id, code, name, description, category, features_config, default_settings, recommended_modules) VALUES
(
    'tpl-online-education',
    'online_education',
    'Aula Virtual',
    'Plataforma de educação e cursos online',
    'education',
    '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "checkout": true, "inquiries": true, "reviews": true, "analytics": true, "shipping": false, "inventory": false, "pos": false, "locations": false}',
    '{"product_type_default": "digital", "require_shipping": false, "allow_guest_checkout": false}',
    '["checkout", "reviews", "inquiries"]'
);
