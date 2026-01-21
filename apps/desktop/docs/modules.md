# Documentação de Módulos

Este documento descreve os módulos disponíveis no sistema e as tabelas do banco de dados associadas a cada um.

## Visão Geral

O sistema utiliza uma arquitetura baseada em módulos que podem ser habilitados ou desabilitados (com exceção dos módulos Core). Cada módulo é responsável por um conjunto específico de tabelas e funcionalidades.

---

## Módulos Core (Sempre Habilitados)

Estes módulos formam a base do sistema e não podem ser desativados.

### 📦 Produtos (`mod-products`)

**Descrição:** Catálogo de produtos e serviços.
**Tabelas:** `products`, `brands`, `categories`, `product_categories`

### 👥 Clientes (`mod-customers`)

**Descrição:** Gerenciamento de clientes.
**Tabelas:** `customers`, `customer_addresses`, `customer_groups`, `customer_group_memberships`

### 💳 Transações (`mod-transactions`)

**Descrição:** Registro de transações financeiras.
**Tabelas:** `transactions`, `transaction_items`

### 📝 Pedidos (`mod-orders`)

**Descrição:** Gerenciamento de pedidos.
**Tabelas:** `orders`

### 💰 Pagamentos (`mod-payments`)

**Descrição:** Processamento de pagamentos.
**Tabelas:** `payments`, `refunds`

---

## Módulos Opcionais - Logística

### 🚚 Entrega (`mod-shipping`)

**Descrição:** Gerenciamento de entregas e frete.
**Tabelas:** `shipments`, `shipment_items`, `shipment_events`

### 📦 Estoque (`mod-inventory`)

**Descrição:** Controle de estoque e inventário.
**Tabelas:** `inventory_levels`, `inventory_movements`

### 📍 Locais (`mod-locations`)

**Descrição:** Gerenciamento de locais e depósitos.
**Tabelas:** `locations`

---

## Módulos Opcionais - Vendas

### 🛒 Checkout (`mod-checkout`)

**Descrição:** Carrinho de compras e checkout.
**Tabelas:** `checkouts`

### 🏪 Ponto de Venda (`mod-pos`)

**Descrição:** Sistema de ponto de venda (PDV).
**Tabelas:** _Nenhuma_

---

## Módulos Opcionais - Marketing e Suporte

### ⭐ Avaliações (`mod-reviews`)

**Descrição:** Sistema de avaliações e reviews.
**Tabelas:** `reviews`, `product_metrics`

### 🎧 Atendimento (`mod-inquiries`)

**Descrição:** Sistema de atendimento ao cliente (SAC).
**Tabelas:** `inquiries`, `inquiry_messages`

---

---

## Tabelas de Sistema e Infraestrutura

As seguintes tabelas não estão vinculadas a módulos específicos, pois fazem parte da infraestrutura global do sistema:

### Base e Configuração

- `shops`: Tabela raiz que define as lojas no sistema.
- `settings`: Configurações globais de sistema.
- `modules`: Definições dos próprios módulos.
- `shop_templates`: Modelos pré-configurados de lojas.

### Gestão de Identidade (IAM)

- `users`: Usuários do sistema (staff).
- `user_identities`: Autenticação externa (OAuth, etc).
- `user_sessions`: Sessões ativas de usuários.
- `roles`: Papéis e permissões.
- `user_roles`: Atribuição de papéis a usuários.

### Auditoria e Diagnóstico

- `audit_logs`: Registro de todas as alterações críticas no banco de dados.
