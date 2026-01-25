-- Migração Inicial SQLite
-- Adaptada de DDL.md e ARCHITECTURE.md
-- Ordem ajustada para satisfazer Foreign Keys
--
-- CONVENÇÕES:
-- - ON DELETE CASCADE: apenas em join tables e tabelas dependentes sem valor próprio
-- - ON DELETE SET NULL: para FKs opcionais onde o registro pai pode ser removido
-- - ON DELETE RESTRICT (default): para FKs críticas onde deleção deve ser bloqueada
-- - Soft Delete (_status = 'deleted'): usado para todas as tabelas de negócio

-- 1. Lojas (Shops) - Base da hierarquia
CREATE TABLE IF NOT EXISTS shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    legal_name TEXT,
    slug TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    features_config TEXT, -- JSONB
    mail_config TEXT, -- JSONB
    storage_config TEXT, -- JSONB
    settings TEXT DEFAULT '{}', -- JSONB
    branding TEXT DEFAULT '{}', -- JSONB
    currency TEXT DEFAULT 'BRL',
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    locale TEXT DEFAULT 'pt-BR',
    owner_id TEXT,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Marcas (Depende de Shops)
CREATE TABLE IF NOT EXISTS brands (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    description TEXT,
    rich_description TEXT,
    website_url TEXT,
    status TEXT DEFAULT 'active',
    is_featured INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    seo_title TEXT,
    seo_keywords TEXT, -- TEXT[]
    metadata TEXT DEFAULT '{}', -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (shop_id, slug)
);

-- 3. Categorias (Depende de Shops)
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
    parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL, -- Categoria órfã vira raiz
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    banner_url TEXT,
    type TEXT DEFAULT 'manual',
    rules TEXT DEFAULT '[]', -- JSONB
    is_visible INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    template_suffix TEXT,
    metadata TEXT DEFAULT '{}', -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (shop_id, slug)
);

-- 4. Produtos (Depende de Shops, Brands, Categories)
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE RESTRICT, -- Multi-tenancy
    sku TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('physical', 'digital', 'service', 'bundle')),
    status TEXT DEFAULT 'draft',
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    gtin_ean TEXT,
    price REAL NOT NULL CHECK (price >= 0),
    promotional_price REAL CHECK (promotional_price IS NULL OR promotional_price >= 0),
    cost_price REAL CHECK (cost_price IS NULL OR cost_price >= 0),
    currency TEXT DEFAULT 'BRL',
    tax_ncm TEXT,
    is_shippable INTEGER DEFAULT 1,
    weight_g INTEGER DEFAULT 0,
    width_mm INTEGER DEFAULT 0,
    height_mm INTEGER DEFAULT 0,
    depth_mm INTEGER DEFAULT 0,
    attributes TEXT, -- JSONB
    metadata TEXT,   -- JSONB
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL, -- Produto sem categoria é válido
    brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL, -- Produto sem marca é válido
    parent_id TEXT REFERENCES products(id) ON DELETE SET NULL, -- Variante órfã vira produto principal
    _status TEXT DEFAULT 'created' CHECK (_status IN ('created', 'synced', 'modified', 'deleted')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (shop_id, sku),  -- SKU único por loja
    UNIQUE (shop_id, slug)  -- Slug único por loja
);

-- 5. Product Categories (Join Table) - CASCADE em ambos
CREATE TABLE IF NOT EXISTS product_categories (
    product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id, category_id)
);

-- 6. Locais (Depende de Shops)
CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE RESTRICT, -- Multi-tenancy
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('warehouse', 'store', 'transit', 'virtual')),
    is_sellable INTEGER DEFAULT 1,
    address_data TEXT, -- JSONB
    _status TEXT DEFAULT 'created' CHECK (_status IN ('created', 'synced', 'modified', 'deleted')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (shop_id, name)  -- Nome único por loja
);

-- 7. Níveis de Estoque (Inventory Levels)
CREATE TABLE IF NOT EXISTS inventory_levels (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT, -- Não deletar produto com estoque
    location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT, -- Não deletar location com estoque
    batch_number TEXT,
    serial_number TEXT,
    expiry_date DATE,
    quantity_on_hand REAL DEFAULT 0,
    quantity_reserved REAL DEFAULT 0,
    stock_status TEXT DEFAULT 'sellable' CHECK (stock_status IN ('sellable', 'damaged', 'quarantine', 'expired')),
    aisle_bin_slot TEXT,
    last_counted_at DATETIME,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, location_id, batch_number, serial_number, stock_status)
);

-- 8. Clientes (Depende de Shops)
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE RESTRICT, -- Multi-tenancy
    type TEXT NOT NULL DEFAULT 'individual' CHECK (type IN ('individual', 'company')),
    email TEXT,
    phone TEXT,
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    tax_id TEXT,
    tax_id_type TEXT,
    state_tax_id TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    currency TEXT DEFAULT 'BRL',
    language TEXT DEFAULT 'pt',
    tags TEXT, -- TEXT[]
    accepts_marketing INTEGER DEFAULT 0,
    customer_group_id TEXT REFERENCES customer_groups(id) ON DELETE SET NULL, -- FK para grupos
    total_spent REAL DEFAULT 0 CHECK (total_spent >= 0),
    orders_count INTEGER DEFAULT 0 CHECK (orders_count >= 0),
    last_order_at DATETIME,
    notes TEXT,
    metadata TEXT, -- JSONB
    custom_attributes TEXT, -- JSONB
    _status TEXT DEFAULT 'created' CHECK (_status IN ('created', 'synced', 'modified', 'deleted')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (shop_id, email),  -- Email único por loja
    UNIQUE (shop_id, tax_id)  -- CPF/CNPJ único por loja
);

-- 9. Grupos de Clientes (Customer Groups) - Depende de Shops
CREATE TABLE IF NOT EXISTS customer_groups (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    code TEXT,
    description TEXT,
    type TEXT DEFAULT 'manual',
    rules TEXT DEFAULT '[]', -- JSONB
    default_discount_percentage REAL DEFAULT 0,
    price_list_id TEXT,
    tax_class TEXT,
    allowed_payment_methods TEXT, -- TEXT[]
    min_order_amount REAL DEFAULT 0,
    metadata TEXT DEFAULT '{}', -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (shop_id, code)
);

-- 10. Membros de Grupos de Clientes (Join Table) - CASCADE em ambos
CREATE TABLE IF NOT EXISTS customer_group_memberships (
    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
    customer_group_id TEXT REFERENCES customer_groups(id) ON DELETE CASCADE,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (customer_id, customer_group_id)
);

-- 11. Endereços de Clientes - CASCADE ao deletar customer
CREATE TABLE IF NOT EXISTS customer_addresses (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'shipping',
    is_default INTEGER DEFAULT 0,
    first_name TEXT,
    last_name TEXT,
    company TEXT,
    address1 TEXT,
    address2 TEXT,
    city TEXT,
    province_code TEXT,
    country_code TEXT,
    postal_code TEXT,
    phone TEXT,
    metadata TEXT, -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. Usuários
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT,
    security_stamp TEXT,
    is_email_verified INTEGER DEFAULT 0,
    is_phone_verified INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    lockout_end_at DATETIME,
    mfa_enabled INTEGER DEFAULT 0,
    mfa_secret TEXT,
    mfa_backup_codes TEXT, -- TEXT[]
    last_login_at DATETIME,
    last_login_ip TEXT,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    profile_type TEXT,
    status TEXT DEFAULT 'active'
);

-- 13. Transações (Transactions) - Depende de Shops
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE RESTRICT, -- Multi-tenancy
    type TEXT NOT NULL CHECK (type IN ('sale', 'purchase', 'transfer', 'return', 'adjustment')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'completed', 'cancelled', 'failed')),
    channel TEXT,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL, -- Manter transação sem cliente
    supplier_id TEXT, -- Sem tabela de suppliers definida no DDL
    staff_id TEXT REFERENCES users(id) ON DELETE SET NULL, -- Manter transação sem staff
    currency TEXT DEFAULT 'BRL',
    total_items REAL DEFAULT 0 CHECK (total_items >= 0),
    total_shipping REAL DEFAULT 0 CHECK (total_shipping >= 0),
    total_discount REAL DEFAULT 0 CHECK (total_discount >= 0),
    total_net REAL DEFAULT 0,
    shipping_method TEXT,
    shipping_address TEXT, -- JSONB
    billing_address TEXT,  -- JSONB
    _status TEXT DEFAULT 'created' CHECK (_status IN ('created', 'synced', 'modified', 'deleted')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 14. Itens da Transação - CASCADE ao deletar transaction
CREATE TABLE IF NOT EXISTS transaction_items (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL, -- Manter item com snapshot
    sku_snapshot TEXT,
    name_snapshot TEXT,
    quantity REAL NOT NULL,
    unit_price REAL NOT NULL,
    unit_cost REAL,
    total_line REAL GENERATED ALWAYS AS (quantity * unit_price) STORED,
    attributes_snapshot TEXT, -- JSONB
    tax_details TEXT, -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 15. Movimentações de Estoque
CREATE TABLE IF NOT EXISTS inventory_movements (
    id TEXT PRIMARY KEY,
    transaction_id TEXT REFERENCES transactions(id) ON DELETE SET NULL, -- Manter histórico
    inventory_level_id TEXT REFERENCES inventory_levels(id) ON DELETE RESTRICT, -- Não deletar level com movimentações
    type TEXT CHECK (type IN ('in', 'out')),
    quantity REAL NOT NULL,
    previous_balance REAL,
    new_balance REAL,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 16. Pagamentos
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT, -- Não deletar transação com pagamentos
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'BRL',
    provider TEXT NOT NULL,
    method TEXT NOT NULL,
    installments INTEGER DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'pending',
    provider_transaction_id TEXT,
    authorization_code TEXT,
    payment_details TEXT, -- JSONB
    risk_level TEXT,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    authorized_at DATETIME,
    captured_at DATETIME,
    voided_at DATETIME
);

-- 17. Estornos/Reembolsos
CREATE TABLE IF NOT EXISTS refunds (
    id TEXT PRIMARY KEY,
    payment_id TEXT NOT NULL REFERENCES payments(id) ON DELETE RESTRICT, -- Não deletar payment com refunds
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    reason TEXT,
    provider_refund_id TEXT,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT REFERENCES users(id) ON DELETE SET NULL
);

-- 18. Sessões de PDV (Point of Sale Sessions)
-- Uma sessão representa um "turno de caixa" - desde a abertura até o fechamento
CREATE TABLE IF NOT EXISTS pos_sessions (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
    location_id TEXT REFERENCES locations(id) ON DELETE RESTRICT, -- Balcão/loja física onde o PDV opera
    operator_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- Operador do caixa
    terminal_id TEXT, -- Identificador do terminal/dispositivo
    session_number INTEGER, -- Sequencial por shop
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'paused', 'closed', 'cancelled')),

    -- Valores de abertura
    opening_cash_amount REAL DEFAULT 0, -- Dinheiro inicial no caixa
    opening_notes TEXT, -- Observações da abertura
    opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Valores de fechamento
    closing_cash_amount REAL, -- Dinheiro contado no fechamento
    closing_notes TEXT, -- Observações do fechamento
    closed_at DATETIME,
    closed_by TEXT REFERENCES users(id) ON DELETE SET NULL, -- Quem fechou (pode ser diferente do operador)

    -- Totais calculados (atualizados durante a sessão)
    total_sales REAL DEFAULT 0, -- Total de vendas
    total_returns REAL DEFAULT 0, -- Total de devoluções
    total_cash_in REAL DEFAULT 0, -- Total de suprimentos (entrada manual de dinheiro)
    total_cash_out REAL DEFAULT 0, -- Total de sangrias (retirada de dinheiro)
    transaction_count INTEGER DEFAULT 0, -- Quantidade de transações

    -- Diferença de caixa (calculada no fechamento)
    expected_cash_amount REAL, -- Valor esperado no fechamento
    cash_difference REAL, -- Diferença (real - esperado)

    metadata TEXT DEFAULT '{}', -- JSONB para dados adicionais
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pos_sessions_shop ON pos_sessions(shop_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_pos_sessions_location ON pos_sessions(location_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_pos_sessions_operator ON pos_sessions(operator_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_pos_sessions_status ON pos_sessions(shop_id, status) WHERE _status != 'deleted';

-- 19. Checkouts
CREATE TABLE IF NOT EXISTS checkouts (
    id TEXT PRIMARY KEY,
    shop_id TEXT REFERENCES shops(id) ON DELETE RESTRICT,
    token TEXT UNIQUE NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL, -- Manter checkout abandonado
    email TEXT,
    items TEXT DEFAULT '[]', -- JSONB
    shipping_address TEXT, -- JSONB
    billing_address TEXT, -- JSONB
    shipping_line TEXT, -- JSONB
    applied_discount_codes TEXT, -- JSONB
    currency TEXT DEFAULT 'BRL',
    subtotal_price REAL DEFAULT 0,
    total_tax REAL DEFAULT 0,
    total_shipping REAL DEFAULT 0,
    total_discounts REAL DEFAULT 0,
    total_price REAL DEFAULT 0,
    status TEXT DEFAULT 'open',
    reservation_expires_at DATETIME,
    completed_at DATETIME,
    metadata TEXT, -- JSONB
    recovery_url TEXT,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 19. Pedidos (Orders)
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number INTEGER, -- Sequencial gerado via logica de app ou tabela auxiliar
    idempotency_key TEXT UNIQUE,
    channel TEXT DEFAULT 'web',
    shop_id TEXT REFERENCES shops(id) ON DELETE RESTRICT,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL, -- Manter order sem cliente
    status TEXT DEFAULT 'open',
    payment_status TEXT DEFAULT 'unpaid',
    fulfillment_status TEXT DEFAULT 'unfulfilled',
    currency TEXT DEFAULT 'BRL',
    subtotal_price REAL NOT NULL,
    total_discounts REAL DEFAULT 0,
    total_tax REAL DEFAULT 0,
    total_shipping REAL DEFAULT 0,
    total_tip REAL DEFAULT 0,
    total_price REAL NOT NULL,
    tax_lines TEXT DEFAULT '[]', -- JSONB
    discount_codes TEXT DEFAULT '[]', -- JSONB
    note TEXT,
    tags TEXT, -- TEXT[]
    custom_attributes TEXT DEFAULT '[]', -- JSONB
    metadata TEXT DEFAULT '{}', -- JSONB
    customer_snapshot TEXT NOT NULL, -- JSONB
    billing_address TEXT, -- JSONB
    shipping_address TEXT, -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME,
    closed_at DATETIME
);

-- 20. Envios (Shipments)
CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, -- Deletar shipments com order
    location_id TEXT REFERENCES locations(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',
    carrier_company TEXT,
    carrier_service TEXT,
    tracking_number TEXT,
    tracking_url TEXT,
    weight_g INTEGER,
    height_mm INTEGER,
    width_mm INTEGER,
    depth_mm INTEGER,
    package_type TEXT,
    shipping_label_url TEXT,
    invoice_url TEXT,
    invoice_key TEXT,
    cost_amount REAL,
    insurance_amount REAL,
    estimated_delivery_at DATETIME,
    shipped_at DATETIME,
    delivered_at DATETIME,
    metadata TEXT, -- JSONB
    customs_info TEXT, -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 21. Itens de Envio - CASCADE ao deletar shipment
CREATE TABLE IF NOT EXISTS shipment_items (
    id TEXT PRIMARY KEY,
    shipment_id TEXT NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    order_item_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    batch_number TEXT,
    serial_numbers TEXT, -- TEXT[]
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 22. Eventos de Envio - CASCADE ao deletar shipment
CREATE TABLE IF NOT EXISTS shipment_events (
    id TEXT PRIMARY KEY,
    shipment_id TEXT REFERENCES shipments(id) ON DELETE CASCADE,
    status TEXT,
    description TEXT,
    location TEXT,
    happened_at DATETIME,
    raw_data TEXT, -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 23. Identidades de Usuário - CASCADE ao deletar user
CREATE TABLE IF NOT EXISTS user_identities (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at DATETIME,
    profile_data TEXT, -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (provider, provider_user_id)
);

-- 24. Sessões de Usuário - CASCADE ao deletar user
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_agent TEXT,
    ip_address TEXT,
    device_type TEXT,
    location TEXT,
    token_hash TEXT,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active_at DATETIME
);

-- 25. Roles
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE,
    permissions TEXT, -- TEXT[]
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 26. User Roles (Join Table) - CASCADE em ambos
CREATE TABLE IF NOT EXISTS user_roles (
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    role_id TEXT REFERENCES roles(id) ON DELETE CASCADE,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- 27. Inquéritos (Inquiries) - Depende de Shops
CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE RESTRICT, -- Multi-tenancy
    protocol_number TEXT NOT NULL,
    type TEXT DEFAULT 'general' CHECK (type IN ('general', 'support', 'complaint', 'return', 'exchange', 'question')),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'open', 'pending', 'resolved', 'closed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    source TEXT DEFAULT 'web_form' CHECK (source IN ('web_form', 'email', 'phone', 'chat', 'social', 'in_store')),
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    requester_data TEXT NOT NULL, -- JSONB
    department TEXT,
    assigned_staff_id TEXT REFERENCES users(id) ON DELETE SET NULL, -- Inquiry sem responsável
    subject TEXT,
    related_order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
    related_product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    metadata TEXT, -- JSONB
    sla_due_at DATETIME,
    resolved_at DATETIME,
    _status TEXT DEFAULT 'created' CHECK (_status IN ('created', 'synced', 'modified', 'deleted')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (shop_id, protocol_number)  -- Protocolo único por loja
);

-- 28. Mensagens de Inquérito - CASCADE ao deletar inquiry
CREATE TABLE IF NOT EXISTS inquiry_messages (
    id TEXT PRIMARY KEY,
    inquiry_id TEXT NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'staff', 'bot')),
    sender_id TEXT,
    body TEXT,
    is_internal_note INTEGER DEFAULT 0,
    attachments TEXT DEFAULT '[]', -- JSONB
    external_id TEXT,
    read_at DATETIME,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 29. Avaliações
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title TEXT,
    body TEXT,
    photos TEXT DEFAULT '[]', -- JSONB
    videos TEXT DEFAULT '[]', -- JSONB
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 30. Métricas de Produtos (agregados)
CREATE TABLE IF NOT EXISTS product_metrics (
    product_id TEXT PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    average_rating REAL DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    _status TEXT DEFAULT 'created',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TRIGGERS (Apenas validação, auditoria e automações defensivas)
-- Lógica de negócio deve ficar na Service Layer (Rust)
-- ============================================================

-- 1. Trigger: Validar estoque antes de movimentação de saída
-- DEFENSIVO: Previne movimentações que deixariam o estoque negativo
CREATE TRIGGER IF NOT EXISTS trg_validate_stock_before_movement
BEFORE INSERT ON inventory_movements
WHEN NEW.type = 'out'
BEGIN
    SELECT CASE
        WHEN (SELECT quantity_on_hand - quantity_reserved FROM inventory_levels WHERE id = NEW.inventory_level_id) < NEW.quantity
        THEN RAISE(ABORT, 'Estoque insuficiente para esta movimentação')
    END;
END;

-- 2. Trigger: Atualizar inventory_levels após INSERT em inventory_movements
-- AUTOMAÇÃO: Mantém quantity_on_hand sincronizado
CREATE TRIGGER IF NOT EXISTS trg_inventory_movement_update_level
AFTER INSERT ON inventory_movements
BEGIN
    UPDATE inventory_levels
    SET
        quantity_on_hand = CASE
            WHEN NEW.type = 'in' THEN quantity_on_hand + NEW.quantity
            WHEN NEW.type = 'out' THEN quantity_on_hand - NEW.quantity
            ELSE quantity_on_hand
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.inventory_level_id;
END;

-- 3. Trigger: Marcar estoque como expirado ao inserir com data passada
-- DEFENSIVO: Garante consistência de stock_status
CREATE TRIGGER IF NOT EXISTS trg_expire_stock_on_insert
AFTER INSERT ON inventory_levels
WHEN NEW.expiry_date IS NOT NULL AND NEW.expiry_date < date('now')
BEGIN
    UPDATE inventory_levels
    SET stock_status = 'expired', updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

-- 4. Trigger: Atualizar métricas de produto ao inserir review
CREATE TRIGGER IF NOT EXISTS trg_reviews_metrics_insert
AFTER INSERT ON reviews
WHEN NEW.product_id IS NOT NULL
BEGIN
    INSERT INTO product_metrics (product_id, average_rating, review_count, updated_at)
    VALUES (NEW.product_id, NEW.rating, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(product_id) DO UPDATE SET
        average_rating = CASE
            WHEN review_count <= 0 THEN NEW.rating
            ELSE ((average_rating * review_count) + NEW.rating) / (review_count + 1)
        END,
        review_count = review_count + 1,
        updated_at = CURRENT_TIMESTAMP;
END;

-- 5. Trigger: Atualizar métricas ao alterar rating do review
CREATE TRIGGER IF NOT EXISTS trg_reviews_metrics_update_rating
AFTER UPDATE OF rating ON reviews
WHEN NEW.product_id IS NOT NULL AND OLD.product_id = NEW.product_id AND OLD.rating != NEW.rating
BEGIN
    UPDATE product_metrics
    SET
        average_rating = CASE
            WHEN review_count <= 0 THEN NEW.rating
            ELSE ((average_rating * review_count) - OLD.rating + NEW.rating) / review_count
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = NEW.product_id;
END;

-- 6. Trigger: Atualizar métricas ao mover review para outro produto
CREATE TRIGGER IF NOT EXISTS trg_reviews_metrics_update_product
AFTER UPDATE OF product_id ON reviews
WHEN OLD.product_id IS NOT NULL AND NEW.product_id IS NOT NULL AND OLD.product_id != NEW.product_id
BEGIN
    UPDATE product_metrics
    SET
        average_rating = CASE
            WHEN review_count <= 1 THEN 0
            ELSE ((average_rating * review_count) - OLD.rating) / (review_count - 1)
        END,
        review_count = CASE
            WHEN review_count <= 0 THEN 0
            ELSE review_count - 1
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = OLD.product_id;

    INSERT INTO product_metrics (product_id, average_rating, review_count, updated_at)
    VALUES (NEW.product_id, NEW.rating, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(product_id) DO UPDATE SET
        average_rating = CASE
            WHEN review_count <= 0 THEN NEW.rating
            ELSE ((average_rating * review_count) + NEW.rating) / (review_count + 1)
        END,
        review_count = review_count + 1,
        updated_at = CURRENT_TIMESTAMP;
END;

-- 7. Trigger: Atualizar métricas ao remover review
CREATE TRIGGER IF NOT EXISTS trg_reviews_metrics_delete
AFTER DELETE ON reviews
WHEN OLD.product_id IS NOT NULL
BEGIN
    UPDATE product_metrics
    SET
        average_rating = CASE
            WHEN review_count <= 1 THEN 0
            ELSE ((average_rating * review_count) - OLD.rating) / (review_count - 1)
        END,
        review_count = CASE
            WHEN review_count <= 0 THEN 0
            ELSE review_count - 1
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = OLD.product_id;
END;

-- ============================================================
-- TABELA DE AUDIT LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data TEXT,  -- JSONB com dados anteriores
    new_data TEXT,  -- JSONB com dados novos
    changed_by TEXT,  -- user_id se disponível
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TRIGGERS DE AUDITORIA (tabelas críticas)
-- ============================================================

-- Audit: transactions
CREATE TRIGGER IF NOT EXISTS trg_audit_transactions_insert
AFTER INSERT ON transactions
BEGIN
    INSERT INTO audit_logs (id, table_name, record_id, action, new_data, created_at)
    VALUES (
        lower(hex(randomblob(16))),
        'transactions',
        NEW.id,
        'INSERT',
        json_object(
            'id', NEW.id,
            'type', NEW.type,
            'status', NEW.status,
            'customer_id', NEW.customer_id,
            'total_net', NEW.total_net
        ),
        CURRENT_TIMESTAMP
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_audit_transactions_update
AFTER UPDATE ON transactions
BEGIN
    INSERT INTO audit_logs (id, table_name, record_id, action, old_data, new_data, created_at)
    VALUES (
        lower(hex(randomblob(16))),
        'transactions',
        NEW.id,
        'UPDATE',
        json_object(
            'type', OLD.type,
            'status', OLD.status,
            'total_net', OLD.total_net
        ),
        json_object(
            'type', NEW.type,
            'status', NEW.status,
            'total_net', NEW.total_net
        ),
        CURRENT_TIMESTAMP
    );
END;

-- Audit: inventory_movements
CREATE TRIGGER IF NOT EXISTS trg_audit_inventory_movements_insert
AFTER INSERT ON inventory_movements
BEGIN
    INSERT INTO audit_logs (id, table_name, record_id, action, new_data, created_at)
    VALUES (
        lower(hex(randomblob(16))),
        'inventory_movements',
        NEW.id,
        'INSERT',
        json_object(
            'id', NEW.id,
            'type', NEW.type,
            'quantity', NEW.quantity,
            'inventory_level_id', NEW.inventory_level_id,
            'previous_balance', NEW.previous_balance,
            'new_balance', NEW.new_balance
        ),
        CURRENT_TIMESTAMP
    );
END;

-- Audit: payments
CREATE TRIGGER IF NOT EXISTS trg_audit_payments_insert
AFTER INSERT ON payments
BEGIN
    INSERT INTO audit_logs (id, table_name, record_id, action, new_data, created_at)
    VALUES (
        lower(hex(randomblob(16))),
        'payments',
        NEW.id,
        'INSERT',
        json_object(
            'id', NEW.id,
            'amount', NEW.amount,
            'status', NEW.status,
            'provider', NEW.provider,
            'method', NEW.method
        ),
        CURRENT_TIMESTAMP
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_audit_payments_update
AFTER UPDATE ON payments
BEGIN
    INSERT INTO audit_logs (id, table_name, record_id, action, old_data, new_data, created_at)
    VALUES (
        lower(hex(randomblob(16))),
        'payments',
        NEW.id,
        'UPDATE',
        json_object(
            'amount', OLD.amount,
            'status', OLD.status
        ),
        json_object(
            'amount', NEW.amount,
            'status', NEW.status
        ),
        CURRENT_TIMESTAMP
    );
END;

-- Audit: orders
CREATE TRIGGER IF NOT EXISTS trg_audit_orders_insert
AFTER INSERT ON orders
BEGIN
    INSERT INTO audit_logs (id, table_name, record_id, action, new_data, created_at)
    VALUES (
        lower(hex(randomblob(16))),
        'orders',
        NEW.id,
        'INSERT',
        json_object(
            'id', NEW.id,
            'order_number', NEW.order_number,
            'status', NEW.status,
            'payment_status', NEW.payment_status,
            'total_price', NEW.total_price
        ),
        CURRENT_TIMESTAMP
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_audit_orders_update
AFTER UPDATE ON orders
BEGIN
    INSERT INTO audit_logs (id, table_name, record_id, action, old_data, new_data, created_at)
    VALUES (
        lower(hex(randomblob(16))),
        'orders',
        NEW.id,
        'UPDATE',
        json_object(
            'status', OLD.status,
            'payment_status', OLD.payment_status,
            'fulfillment_status', OLD.fulfillment_status
        ),
        json_object(
            'status', NEW.status,
            'payment_status', NEW.payment_status,
            'fulfillment_status', NEW.fulfillment_status
        ),
        CURRENT_TIMESTAMP
    );
END;

-- Audit: refunds
CREATE TRIGGER IF NOT EXISTS trg_audit_refunds_insert
AFTER INSERT ON refunds
BEGIN
    INSERT INTO audit_logs (id, table_name, record_id, action, new_data, created_at)
    VALUES (
        lower(hex(randomblob(16))),
        'refunds',
        NEW.id,
        'INSERT',
        json_object(
            'id', NEW.id,
            'payment_id', NEW.payment_id,
            'amount', NEW.amount,
            'status', NEW.status,
            'reason', NEW.reason
        ),
        CURRENT_TIMESTAMP
    );
END;

-- ============================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================

-- Índices para buscas frequentes
CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(shop_id, sku) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(shop_id, slug) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_products_status ON products(shop_id, status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_products_parent ON products(parent_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_products_type ON products(shop_id, type) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_products_created ON products(shop_id, created_at) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_locations_shop ON locations(shop_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_locations_type ON locations(shop_id, type) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(shop_id, name) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_inventory_levels_product ON inventory_levels(product_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inventory_levels_location ON inventory_levels(location_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inventory_levels_status ON inventory_levels(stock_status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inventory_levels_expiry ON inventory_levels(expiry_date) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inventory_levels_serial ON inventory_levels(serial_number) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inventory_levels_batch ON inventory_levels(batch_number) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_customers_shop ON customers(shop_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(shop_id, email) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(shop_id, phone) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(shop_id, status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_customers_tax_id ON customers(shop_id, tax_id) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_transactions_shop ON transactions(shop_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(shop_id, type) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(shop_id, status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(shop_id, created_at) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_transactions_staff ON transactions(staff_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_transactions_channel ON transactions(shop_id, channel) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_orders_shop ON orders(shop_id) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_payments_provider_transaction ON payments(provider_transaction_id) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_shipments_order ON shipments(order_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_transaction_items_product ON transaction_items(product_id) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_inventory_movements_transaction ON inventory_movements(transaction_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inventory_movements_level ON inventory_movements(inventory_level_id) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds(payment_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_checkouts_shop ON checkouts(shop_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_checkouts_user ON checkouts(user_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_checkouts_status ON checkouts(status) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_inquiries_shop ON inquiries(shop_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inquiries_customer ON inquiries(customer_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(shop_id, status) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inquiries_protocol ON inquiries(shop_id, protocol_number) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inquiries_priority ON inquiries(shop_id, priority) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_inquiries_assigned ON inquiries(assigned_staff_id) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_inquiry_messages_inquiry ON inquiry_messages(inquiry_id) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_shipment_items_shipment ON shipment_items(shipment_id) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment ON shipment_events(shipment_id) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer ON customer_addresses(customer_id) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_brands_shop ON brands(shop_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_categories_shop ON categories(shop_id) WHERE _status != 'deleted';
CREATE INDEX IF NOT EXISTS idx_customer_groups_shop ON customer_groups(shop_id) WHERE _status != 'deleted';

CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record ON audit_logs(record_id);

-- ============================================================
-- TABELA DE MODULOS (Modules) - Sistema de Módulos
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
-- TABELA DE TEMPLATES DE LOJA (Shop Templates)
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
-- DADOS INICIAIS: MÓDULOS DISPONÍVEIS
-- ============================================================

-- Módulos Core (sempre habilitados)
INSERT OR IGNORE INTO modules (id, code, name, description, category, is_core, tables_used) VALUES
('mod-products', 'products', 'Produtos', 'Catálogo de produtos e serviços', 'core', 1, '["products", "brands", "categories", "product_categories"]'),
('mod-customers', 'customers', 'Clientes', 'Gerenciamento de clientes', 'core', 1, '["customers", "customer_addresses", "customer_groups", "customer_group_memberships"]'),
('mod-transactions', 'transactions', 'Transações', 'Registro de transações financeiras', 'core', 1, '["transactions", "transaction_items"]'),
('mod-orders', 'orders', 'Pedidos', 'Gerenciamento de pedidos', 'core', 1, '["orders"]'),
('mod-payments', 'payments', 'Pagamentos', 'Processamento de pagamentos', 'core', 1, '["payments", "refunds"]');

-- Módulos Opcionais - Logística
INSERT OR IGNORE INTO modules (id, code, name, description, category, required_modules, tables_used) VALUES
('mod-shipping', 'shipping', 'Entrega', 'Gerenciamento de entregas e frete', 'logistics', '[]', '["shipments", "shipment_items", "shipment_events"]'),
('mod-inventory', 'inventory', 'Estoque', 'Controle de estoque e inventário', 'logistics', '[]', '["inventory_levels", "inventory_movements"]'),
('mod-locations', 'locations', 'Locais', 'Gerenciamento de locais e depósitos', 'logistics', '[]', '["locations"]');

-- Módulos Opcionais - Vendas
INSERT OR IGNORE INTO modules (id, code, name, description, category, required_modules, tables_used) VALUES
('mod-checkout', 'checkout', 'Checkout', 'Carrinho de compras e checkout', 'sales', '[]', '["checkouts"]'),
('mod-pos', 'pos', 'Ponto de Venda', 'Sistema de ponto de venda (PDV)', 'sales', '[]', '[\"pos_sessions\"]');

-- Módulos Opcionais - Marketing e Suporte
INSERT OR IGNORE INTO modules (id, code, name, description, category, required_modules, tables_used) VALUES
('mod-reviews', 'reviews', 'Avaliações', 'Sistema de avaliações e reviews', 'marketing', '[]', '["reviews", "product_metrics"]'),
('mod-inquiries', 'inquiries', 'Atendimento', 'Sistema de atendimento ao cliente (SAC)', 'marketing', '[]', '["inquiries", "inquiry_messages"]');


-- ============================================================
-- DADOS INICIAIS: TEMPLATES PRÉ-CONFIGURADOS
-- ============================================================

-- Template 1: Loja Virtual
INSERT OR IGNORE INTO shop_templates (id, code, name, description, category, features_config, default_settings, recommended_modules) VALUES
(
    'tpl-online-store',
    'online_store',
    'Loja Virtual',
    'Loja online com checkout, estoque e entregas',
    'ecommerce',
    '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "shipping": true, "checkout": true, "inventory": true, "inquiries": true, "reviews": true, "pos": false, "locations": false}',
    '{"allow_guest_checkout": true, "require_shipping": true}',
    '["shipping", "checkout", "inventory", "reviews", "inquiries"]'
);

-- Template 2: Loja Física
INSERT OR IGNORE INTO shop_templates (id, code, name, description, category, features_config, default_settings, recommended_modules) VALUES
(
    'tpl-physical-store',
    'physical_store',
    'Loja Física',
    'Loja física com PDV e controle de estoque',
    'retail',
    '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "pos": true, "inventory": true, "locations": true, "inquiries": true, "shipping": false, "checkout": false, "reviews": false}',
    '{"require_shipping": false, "allow_offline_sales": true}',
    '["pos", "inventory", "locations"]'
);

-- Template 3: Marketplace
INSERT OR IGNORE INTO shop_templates (id, code, name, description, category, features_config, default_settings, recommended_modules) VALUES
(
    'tpl-marketplace',
    'marketplace',
    'Marketplace',
    'Marketplace multi-vendedor completo',
    'ecommerce',
    '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "shipping": true, "checkout": true, "inventory": true, "locations": true, "inquiries": true, "reviews": true, "pos": false}',
    '{"multi_vendor": true, "allow_guest_checkout": true, "require_shipping": true}',
    '["shipping", "checkout", "inventory", "locations", "reviews", "inquiries"]'
);

-- Template 4: Loja Híbrida (Física + Virtual)
INSERT OR IGNORE INTO shop_templates (id, code, name, description, category, features_config, default_settings, recommended_modules) VALUES
(
    'tpl-hybrid-store',
    'hybrid_store',
    'Loja Híbrida',
    'Loja física e virtual com todos os recursos',
    'retail',
    '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "shipping": true, "checkout": true, "inventory": true, "pos": true, "locations": true, "inquiries": true, "reviews": true}',
    '{"allow_guest_checkout": true, "require_shipping": true, "allow_offline_sales": true}',
    '["shipping", "checkout", "inventory", "pos", "locations", "reviews", "inquiries"]'
);

-- Template 5: Consultoria/Serviços
INSERT OR IGNORE INTO shop_templates (id, code, name, description, category, features_config, default_settings, recommended_modules) VALUES
(
    'tpl-consulting',
    'consulting',
    'Consultoria',
    'Serviços e consultoria sem necessidade de estoque ou entrega',
    'services',
    '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "inquiries": true, "shipping": false, "inventory": false, "checkout": false, "pos": false, "reviews": false, "locations": false}',
    '{"product_type_default": "service", "require_shipping": false}',
    '["inquiries"]'
);

-- Template 6: Aula Virtual/Educação
INSERT OR IGNORE INTO shop_templates (id, code, name, description, category, features_config, default_settings, recommended_modules) VALUES
(
    'tpl-online-education',
    'online_education',
    'Aula Virtual',
    'Plataforma de educação e cursos online',
    'education',
    '{"products": true, "customers": true, "transactions": true, "orders": true, "payments": true, "checkout": true, "inquiries": true, "reviews": true, "shipping": false, "inventory": false, "pos": false, "locations": false}',
    '{"product_type_default": "digital", "require_shipping": false, "allow_guest_checkout": false}',
    '["checkout", "reviews", "inquiries"]'
);
