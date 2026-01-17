# Implementation Status Report

Status das implementações por tabela do schema.

## Legenda

| Símbolo | Significado                       |
| ------- | --------------------------------- |
| ✅      | Implementado                      |
| ⚠️      | Parcial / Precisa melhorar        |
| ❌      | Não implementado / Não necessário |
| 🔧      | Sugerido implementar              |

---

## Tabelas de Negócio Principal

| Tabela                | Service                   | Tx Methods   | Triggers             | Indexes  | Status   |
| --------------------- | ------------------------- | ------------ | -------------------- | -------- | -------- |
| `transactions`        | ✅ TransactionService     | ✅ 2 métodos | ✅ audit             | ✅ 4 idx | ✅ OK    |
| `transaction_items`   | ✅ via TransactionService | ✅ 1 método  | ❌                   | ❌       | 🔧 Index |
| `inventory_movements` | ✅ via InventoryService   | ✅ 1 método  | ✅ defensivo + audit | ❌       | 🔧 Index |
| `inventory_levels`    | ✅ InventoryService       | ✅ 6 métodos | ✅ defensivo         | ✅ 3 idx | ✅ OK    |
| `payments`            | ✅ PaymentService         | ✅ 5 métodos | ✅ audit             | ✅ 2 idx | ✅ OK    |
| `refunds`             | ✅ via PaymentService     | ✅ 2 métodos | ✅ audit             | ❌       | 🔧 Index |
| `orders`              | ✅ OrderService           | ✅ 6 métodos | ✅ audit             | ✅ 4 idx | ✅ OK    |
| `checkouts`           | ✅ via OrderService       | ✅ 2 métodos | ❌                   | ❌       | 🔧 Index |
| `customers`           | ✅ CustomerService        | ✅ 2 métodos | ❌                   | ✅ 3 idx | ✅ OK    |

---

## Tabelas de Catálogo

| Tabela               | Service             | Tx Methods   | Triggers | Indexes  | Status                        |
| -------------------- | ------------------- | ------------ | -------- | -------- | ----------------------------- |
| `shops`              | ✅ ShopService      | ✅ 1 método  | ❌       | ❌       | ✅ OK                         |
| `brands`             | ✅ BrandService     | ✅ 5 métodos | ❌       | ❌       | ✅ OK                         |
| `categories`         | ✅ CategoryService  | ✅ 5 métodos | ❌       | ❌       | ✅ OK                         |
| `products`           | ✅ ProductService   | ✅ 1 método  | ❌       | ✅ 4 idx | ✅ OK                         |
| `product_categories` | ❌ join table       | ❌           | ❌       | ❌       | ❌ CRUD simples               |
| `locations`          | ✅ LocationService  | ✅ 5 métodos | ❌       | ❌       | ✅ OK                         |

---

## Tabelas de Envio

| Tabela            | Service                | Tx Methods   | Triggers | Indexes  | Status   |
| ----------------- | ---------------------- | ------------ | -------- | -------- | -------- |
| `shipments`       | ✅ ShipmentService     | ✅ 5 métodos | ❌       | ✅ 2 idx | ✅ OK    |
| `shipment_items`  | ✅ via ShipmentService | ✅ 1 método  | ❌       | ❌       | 🔧 Index |
| `shipment_events` | ✅ via ShipmentService | ✅ 1 método  | ❌       | ❌       | 🔧 Index |

---

## Tabelas de Usuários

| Tabela            | Service        | Tx Methods | Triggers | Indexes | Status               |
| ----------------- | -------------- | ---------- | -------- | ------- | -------------------- |
| `users`           | ⚠️ UserService | ❌         | ❌       | ❌      | 🔧 Index email/phone |
| `user_identities` | ❌             | ❌         | ❌       | ❌      | 🔧 Index provider    |
| `user_sessions`   | ❌             | ❌         | ❌       | ❌      | 🔧 Index token       |
| `roles`           | ❌             | ❌         | ❌       | ❌      | ❌ CRUD simples      |
| `user_roles`      | ❌ join table  | ❌         | ❌       | ❌      | ❌ CRUD simples      |

---

## Tabelas de Atendimento

| Tabela             | Service               | Tx Methods   | Triggers | Indexes | Status              |
| ------------------ | --------------------- | ------------ | -------- | ------- | ------------------- |
| `inquiries`        | ✅ InquiryService     | ✅ 6 métodos | ❌       | ❌      | 🔧 Index status     |
| `inquiry_messages` | ✅ via InquiryService | ✅ 1 método  | ❌       | ❌      | 🔧 Index inquiry_id |

---

## Tabelas de Avaliações

| Tabela            | Service              | Tx Methods   | Triggers | Indexes | Status             |
| ----------------- | -------------------- | ------------ | -------- | ------- | ------------------ |
| `reviews`         | ✅ ReviewService     | ✅ 4 métodos | ❌       | ❌      | 🔧 Trigger + Index |
| `product_metrics` | ✅ via ReviewService | ✅ 4 métodos | ❌       | ❌      | 🔧 Index           |

---

## Tabelas de Grupos

| Tabela                       | Service       | Tx Methods | Triggers | Indexes | Status               |
| ---------------------------- | ------------- | ---------- | -------- | ------- | -------------------- |
| `customer_groups`            | ❌            | ❌         | ❌       | ❌      | ❌ CRUD simples      |
| `customer_group_memberships` | ❌ join table | ❌         | ❌       | ❌      | ❌ CRUD simples      |
| `customer_addresses`         | ❌            | ❌         | ❌       | ❌      | 🔧 Index customer_id |

---

## Tabelas de Sistema

| Tabela       | Service    | Tx Methods | Triggers      | Indexes  | Status |
| ------------ | ---------- | ---------- | ------------- | -------- | ------ |
| `audit_logs` | ❌ sistema | ❌         | ✅ 8 triggers | ✅ 2 idx | ✅ OK  |

---

## Resumo de Pendências

### 1. Services Implementados (2026-01-16)

| Service              | Tabelas                                          | Status    |
| -------------------- | ------------------------------------------------ | --------- |
| `ShipmentService` tx | `shipments`, `shipment_items`, `shipment_events` | ✅ Pronto |
| `ReviewService`      | `reviews`, `product_metrics`                     | ✅ Pronto |
| `InquiryService` tx  | `inquiries`, `inquiry_messages`                  | ✅ Pronto |

### 2. Triggers Sugeridos

| Trigger                     | Tabela    | Função                                                  |
| --------------------------- | --------- | ------------------------------------------------------- |
| `trg_review_update_metrics` | `reviews` | Atualizar `product_metrics` ao inserir/atualizar review |

### 3. Indexes Pendentes

```sql
-- transaction_items
CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_product ON transaction_items(product_id);

-- inventory_movements
CREATE INDEX idx_inventory_movements_transaction ON inventory_movements(transaction_id);
CREATE INDEX idx_inventory_movements_level ON inventory_movements(inventory_level_id);

-- refunds
CREATE INDEX idx_refunds_payment ON refunds(payment_id);
CREATE INDEX idx_refunds_status ON refunds(status);

-- checkouts
CREATE INDEX idx_checkouts_user ON checkouts(user_id);
CREATE INDEX idx_checkouts_status ON checkouts(status);

-- users
CREATE INDEX idx_users_email ON users(email) WHERE _status != 'deleted';

-- user_sessions
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);

-- inquiries
CREATE INDEX idx_inquiries_customer ON inquiries(customer_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);

-- inquiry_messages
CREATE INDEX idx_inquiry_messages_inquiry ON inquiry_messages(inquiry_id);

-- reviews
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);

-- shipment_items
CREATE INDEX idx_shipment_items_shipment ON shipment_items(shipment_id);

-- shipment_events
CREATE INDEX idx_shipment_events_shipment ON shipment_events(shipment_id);

-- customer_addresses
CREATE INDEX idx_customer_addresses_customer ON customer_addresses(customer_id);
```

---

## Métricas

| Categoria       | Total | OK  | Pendente |
| --------------- | ----- | --- | -------- |
| Tabelas         | 31    | 16  | 15       |
| Services com Tx | 7     | 7   | 0        |
| Triggers        | 11    | 11  | 1        |
| Indexes         | 24    | 24  | ~18      |
