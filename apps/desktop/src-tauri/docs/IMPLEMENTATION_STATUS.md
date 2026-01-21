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

| Tabela | Service | Tx Methods | Triggers | Indexes | Status |
| --- | --- | --- | --- | --- | --- |
| `transactions` | ✅ TransactionService | ✅ 2 métodos | ✅ audit | ✅ 6 idx | ✅ OK |
| `transaction_items` | ✅ via TransactionService | ✅ 1 método | ❌ | ✅ 2 idx | ✅ OK |
| `inventory_movements` | ✅ via InventoryService | ✅ 1 método | ✅ defensivo + audit | ✅ 2 idx | ✅ OK |
| `inventory_levels` | ✅ InventoryService | ✅ 6 métodos | ✅ defensivo | ✅ 6 idx | ✅ OK |
| `payments` | ✅ PaymentService | ✅ 5 métodos | ✅ audit | ✅ 3 idx | ✅ OK |
| `refunds` | ✅ via PaymentService | ✅ 2 métodos | ✅ audit | ✅ 2 idx | ✅ OK |
| `orders` | ✅ OrderService | ✅ 6 métodos | ✅ audit | ✅ 5 idx | ✅ OK |
| `checkouts` | ✅ via OrderService | ✅ 2 métodos | ❌ | ✅ 2 idx | ✅ OK |
| `customers` | ✅ CustomerService | ✅ 2 métodos | ❌ | ✅ 3 idx | ✅ OK |

---

## Tabelas de Catálogo

| Tabela | Service | Tx Methods | Triggers | Indexes | Status |
| --- | --- | --- | --- | --- | --- |
| `shops` | ✅ ShopService | ✅ 1 método | ❌ | ❌ | ✅ OK |
| `brands` | ✅ BrandService | ✅ 5 métodos | ❌ | ✅ 1 idx | ✅ OK |
| `categories` | ✅ CategoryService | ✅ 5 métodos | ❌ | ✅ 1 idx | ✅ OK |
| `products` | ✅ ProductService | ✅ 1 método | ❌ | ✅ 7 idx | ✅ OK |
| `product_categories` | ❌ join table | ❌ | ❌ | ❌ | ❌ CRUD simples |
| `locations` | ✅ LocationService | ✅ 5 métodos | ❌ | ❌ | ✅ OK |

---

## Tabelas de Envio

| Tabela | Service | Tx Methods | Triggers | Indexes | Status |
| --- | --- | --- | --- | --- | --- |
| `shipments` | ✅ ShipmentService | ✅ 5 métodos | ❌ | ✅ 3 idx | ✅ OK |
| `shipment_items` | ✅ via ShipmentService | ✅ 1 método | ❌ | ✅ 1 idx | ✅ OK |
| `shipment_events` | ✅ via ShipmentService | ✅ 1 método | ❌ | ✅ 1 idx | ✅ OK |

---

## Tabelas de Usuários

| Tabela | Service | Tx Methods | Triggers | Indexes | Status |
| --- | --- | --- | --- | --- | --- |
| `users` | ✅ UserService | ✅ 5 métodos | ❌ | ✅ 1 idx | ✅ OK |
| `user_identities` | ✅ UserIdentityService | ✅ 6 métodos | ❌ | ❌ | ✅ OK |
| `user_sessions` | ✅ UserSessionService | ✅ 6 métodos | ❌ | ✅ 2 idx | ✅ OK |
| `roles` | ✅ RoleService | ✅ 5 métodos | ❌ | ❌ | ✅ OK |
| `user_roles` | ✅ UserRoleService | ✅ 3 métodos | ❌ | ❌ | ✅ OK |

---

## Tabelas de Atendimento

| Tabela | Service | Tx Methods | Triggers | Indexes | Status |
| --- | --- | --- | --- | --- | --- |
| `inquiries` | ✅ InquiryService | ✅ 6 métodos | ❌ | ✅ 2 idx | ✅ OK |
| `inquiry_messages` | ✅ via InquiryService | ✅ 1 método | ❌ | ✅ 1 idx | ✅ OK |

---

## Tabelas de Avaliações

| Tabela | Service | Tx Methods | Triggers | Indexes | Status |
| --- | --- | --- | --- | --- | --- |
| `reviews` | ✅ ReviewService | ✅ 4 métodos | ✅ | ✅ 2 idx | ✅ OK |
| `product_metrics` | ✅ via ReviewService | ✅ 4 métodos | ❌ | ❌ | 🔧 Index |

---

## Tabelas de Grupos

| Tabela | Service | Tx Methods | Triggers | Indexes | Status |
| --- | --- | --- | --- | --- | --- |
| `customer_groups` | ✅ CustomerGroupService | ✅ 5 métodos | ❌ | ✅ 1 idx | ✅ OK |
| `customer_group_memberships` | ✅ CustomerGroupMembershipService | ✅ 4 métodos | ❌ | ❌ | ✅ OK |
| `customer_addresses` | ✅ CustomerAddressService | ✅ 6 métodos | ❌ | ✅ 1 idx | ✅ OK |

---

## Tabelas de Sistema

| Tabela | Service | Tx Methods | Triggers | Indexes | Status |
| --- | --- | --- | --- | --- | --- |
| `audit_logs` | ✅ AuditLogService | ✅ 2 métodos | ✅ 8 triggers | ✅ 2 idx | ✅ OK |

---

## Resumo de Pendências

### 1. Services Implementados (2026-01-16)

| Service              | Tabelas                                          | Status    |
| -------------------- | ------------------------------------------------ | --------- |
| `ShipmentService` tx | `shipments`, `shipment_items`, `shipment_events` | ✅ Pronto |
| `ReviewService`      | `reviews`, `product_metrics`                     | ✅ Pronto |
| `InquiryService` tx  | `inquiries`, `inquiry_messages`                  | ✅ Pronto |

### 2. Triggers Implementados

| Trigger                              | Tabela    | Função                                                        |
| ------------------------------------ | --------- | ------------------------------------------------------------- |
| `trg_reviews_metrics_insert`         | `reviews` | Atualizar `product_metrics` ao inserir review                 |
| `trg_reviews_metrics_update_rating`  | `reviews` | Recalcular métricas ao alterar rating do review               |
| `trg_reviews_metrics_update_product` | `reviews` | Ajustar métricas ao mudar o produto do review                 |
| `trg_reviews_metrics_delete`         | `reviews` | Atualizar `product_metrics` ao remover review                 |

### 3. Indexes Pendentes

```sql
-- Nenhum pendente no momento
```

---

## Métricas

| Categoria       | Total | OK  | Pendente |
| --------------- | ----- | --- | -------- |
| Tabelas         | 31    | 16  | 15       |
| Services com Tx | 7     | 7   | 0        |
| Triggers        | 15    | 15  | 0        |
| Indexes         | 57    | 57  | 0        |
