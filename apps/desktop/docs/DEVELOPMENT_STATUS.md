# Status de Desenvolvimento - Frontend CRUDs

Este documento rastreia o status de implementação das funcionalidades CRUD para cada domínio do sistema.

**Legenda:**
- ✅ Implementado
- 🔄 Em progresso
- ❌ Pendente
- ➖ Não aplicável

---

## CRUD Completo (Rotas Dedicadas)

| Domínio | UI Table | List (Backend) | Create | Update | Delete (soft) | Filtros/Paginação | FK Navigation |
|---------|----------|----------------|--------|--------|---------------|-------------------|---------------|
| Products | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (Brand, Category) |
| Brands | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ➖ |
| Categories | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (Parent) |
| Customers | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### Sub-CRUDs de Customers

| Sub-Domínio | UI Table | List (Backend) | Create | Update | Delete |
|-------------|----------|----------------|--------|--------|--------|
| customer_addresses | ✅ | ✅ | ✅ | ✅ | ✅ |
| customer_group_memberships | ✅ | ✅ | ✅ (assign) | ➖ | ✅ |

---

## CRUD Parcial

| Domínio | UI Table | List (Backend) | Create | Update | Status Actions | Delete (soft) | Filtros/Paginação | FK Navigation |
|---------|----------|----------------|--------|--------|----------------|---------------|-------------------|---------------|
| Transactions | ✅ | ✅ | ✅ | ✅ | ✅ (complete, cancel, status) | ✅ | ❌ | ❌ |
| Orders | ✅ | ✅ | ✅ | ✅ | ✅ (cancel, payment, fulfillment) | ✅ | ❌ | ❌ |
| Payments | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Refunds | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (Payment) |
| Checkouts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### Sub-CRUDs de Transactions

| Sub-Domínio | UI Table | List (Backend) | Create | Update | Delete |
|-------------|----------|----------------|--------|--------|--------|
| transaction_items | ➖ | ✅ | ✅ | ✅ | ✅ |

---

## Estoque

| Domínio | UI Table | List (Backend) | Create | Update | Delete | Ajuste via Movements | Filtros/Paginação | FK Navigation |
|---------|----------|----------------|--------|--------|--------|----------------------|-------------------|---------------|
| Inventory | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (Product, Location) |
| Movements | ✅ | ✅ | ✅ (via adjust/transfer) | ➖ | ➖ | ➖ | ❌ | ✅ (Product, Location) |
| Locations | ➖ | ✅ | ✅ | ✅ | ✅ | ➖ | ❌ | ➖ |

---

## Analytics

| Funcionalidade | Backend | Frontend |
|----------------|---------|----------|
| get_dashboard_stats | ✅ | ✅ |
| get_stock_movements | ✅ | ✅ |
| Time ranges (30m, 1h, 2h, 7d, 30d, 90d, 1y, all) | ✅ | ✅ |

---

## Funcionalidades Transversais

| Funcionalidade | Status |
|----------------|--------|
| Soft delete (_status = 'deleted') | ✅ (Products) |
| Campos JSON (metadata, attributes) com validação | 🔄 (Products - sem validação) |
| Campos TEXT[] como tags | ❌ |
| Select com busca para FKs | ✅ (Products - Brand) |
| Campos obrigatórios sinalizados na UI | ✅ (Products) |

---

## Resumo por Prioridade

### Alta Prioridade - List (integração backend)
| Item | Domínio | Status |
|------|---------|--------|
| List (backend) | Products | ✅ |
| List (backend) | Brands | ✅ |
| List (backend) | Categories | ✅ |
| List (backend) | Customers | ✅ |
| List (backend) | Inventory | ✅ |
| List (backend) | Movements | ✅ |
| List (backend) | Locations | ✅ |
| List (backend) | Transactions | ✅ |
| List (backend) | Orders | ✅ |
| List (backend) | Payments | ✅ |
| List (backend) | Refunds | ✅ |
| List (backend) | Checkouts | ✅ |

### Alta Prioridade - Formulários CRUD Completo
| Item | Domínio | Status |
|------|---------|--------|
| Formulário de criação | Products | ✅ |
| Formulário de edição | Products | ✅ |
| Formulário de criação | Brands | ✅ |
| Formulário de edição | Brands | ✅ |
| Formulário de criação | Categories | ✅ |
| Formulário de edição | Categories | ✅ |
| Formulário de criação | Customers | ✅ |
| Formulário de edição | Customers | ✅ |

### Média Prioridade - Formulários CRUD Parcial
| Item | Domínio | Status |
|------|---------|--------|
| Formulário de criação | Transactions | ✅ |
| Formulário de criação | Orders | ✅ |
| Formulário de criação | Payments | ✅ |
| Formulário de criação | Refunds | ✅ |
| Formulário de criação | Checkouts | ✅ |
| Formulário de criação | Inventory Level | ✅ |
| Formulário de edição | Transactions | ✅ |
| Formulário de edição | Checkouts | ✅ |
| Formulário de edição | Inventory Level | ✅ |
| Ações de status | Transactions | ✅ |
| Ações de status | Orders | ✅ |
| Ações de status | Payments | ✅ |
| Ações de status | Refunds | ✅ |
| Ações de status | Checkouts | ✅ |
| Ajuste de estoque | Movements | ✅ |
| Transferência de estoque | Movements | ✅ |

### Baixa Prioridade
| Item | Domínio | Status |
|------|---------|--------|
| Sub-CRUD | customer_addresses | ✅ |
| Sub-CRUD | customer_group_memberships | ✅ |
| Sub-CRUD | transaction_items | ✅ |
| Filtros/Ordenação/Paginação backend | Todos | ❌ |
| Navegação por FKs | Todos | ❌ |

---

## Arquitetura de Implementação (Padrão Products)

Esta seção documenta a arquitetura seguida para implementar o CRUD de Products. Use como referência para replicar nas outras tabelas.

### Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐       │
│  │   Route/Page     │    │   Table Component │    │   Form Component │       │
│  │  /products/      │───▶│  products-table   │    │  product-edit-   │       │
│  │  /products/new   │    │      .tsx         │◀──▶│    sheet.tsx     │       │
│  └──────────────────┘    └────────┬─────────┘    └────────┬─────────┘       │
│                                   │                       │                  │
│                                   ▼                       ▼                  │
│                          ┌──────────────────────────────────┐               │
│                          │         Repository               │               │
│                          │  products-repository.ts          │               │
│                          │  - list(), create(), update()    │               │
│                          │  - delete(), getById()           │               │
│                          └────────────────┬─────────────────┘               │
│                                           │                                  │
│                                           │ invoke()                         │
└───────────────────────────────────────────┼──────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND (Rust/Tauri)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐       │
│  │   lib.rs         │    │   Commands       │    │    Service       │       │
│  │  invoke_handler  │───▶│  product_        │───▶│  product_        │       │
│  │  [registra]      │    │  commands.rs     │    │  service.rs      │       │
│  └──────────────────┘    └──────────────────┘    └────────┬─────────┘       │
│                                                           │                  │
│                                                           ▼                  │
│                                                  ┌──────────────────┐        │
│                                                  │   Repository     │        │
│                                                  │  product_        │        │
│                                                  │  repository.rs   │        │
│                                                  └────────┬─────────┘        │
│                                                           │                  │
│                                                           ▼                  │
│                                                  ┌──────────────────┐        │
│                                                  │     SQLite       │        │
│                                                  │   (sqlx)         │        │
│                                                  └──────────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Estrutura de Arquivos

```
src/
├── lib/db/repositories/
│   └── {domain}-repository.ts      # Repository com tipos e métodos CRUD
├── components/
│   ├── tables/
│   │   └── {domain}-table.tsx      # Tabela com listagem, ações, delete dialog
│   └── forms/
│       └── {domain}-edit-sheet.tsx # Sheet lateral para edição
└── routes/{domain}/
    ├── index.tsx                   # Rota principal (renderiza a tabela)
    └── new.tsx                     # Página de criação (formulário completo)

src-tauri/src/
├── lib.rs                          # Registrar comandos no invoke_handler
└── features/{domain}/
    ├── commands/{domain}_commands.rs
    ├── services/{domain}_service.rs
    ├── repositories/{domain}_repository.rs
    ├── dtos/{domain}_dto.rs
    └── models/{domain}_model.rs
```

### Checklist para Implementar um Novo Domínio

#### 1. Backend (se comandos não estiverem registrados)
- [ ] Verificar se comandos existem em `src-tauri/src/features/{domain}/commands/`
- [ ] Registrar comandos no `invoke_handler` em `src-tauri/src/lib.rs`:
  ```rust
  use crate::features::{domain}::commands::{domain}_commands::{
      create_{domain}, update_{domain}, delete_{domain}, get_{domain}, list_{domains}
  };
  ```

#### 2. Repository Frontend
- [ ] Criar `src/lib/db/repositories/{domain}-repository.ts`
- [ ] Definir tipos: `{Domain}`, `Create{Domain}DTO`, `Update{Domain}DTO`
- [ ] Implementar métodos: `list()`, `create()`, `update()`, `delete()`, `getById()`

#### 3. Tabela (Atualizar componente existente)
- [ ] Importar repository e tipos
- [ ] Adicionar estados: `data`, `isLoading`, `deleteId`, `editItem`, `isEditOpen`
- [ ] Implementar `loadData()` com `useCallback` + `useEffect`
- [ ] Resolver FKs se necessário (buscar entidades relacionadas em paralelo)
- [ ] Adicionar coluna de ações com `DropdownMenu` (Edit, Delete)
- [ ] Adicionar `AlertDialog` para confirmação de delete
- [ ] Adicionar prop `action` no `DataTable` para botão "New"

#### 4. Página de Criação
- [ ] Criar `src/routes/{domain}/new.tsx`
- [ ] Implementar formulário com todos os campos do DTO
- [ ] Marcar campos obrigatórios com `*`
- [ ] Adicionar selects para FKs (buscar opções do backend)
- [ ] Validar antes de submeter
- [ ] Redirecionar para listagem após sucesso

#### 5. Sheet de Edição
- [ ] Criar `src/components/forms/{domain}-edit-sheet.tsx`
- [ ] Receber props: `item`, `open`, `onOpenChange`, `onSuccess`
- [ ] Popular form com dados do item via `useEffect`
- [ ] Implementar submit com `update()`
- [ ] Chamar `onSuccess()` para recarregar tabela

#### 6. Gerar Rotas
- [ ] Executar `npx @tanstack/router-cli generate` para registrar nova rota

### Exemplo de Repository

```typescript
// src/lib/db/repositories/{domain}-repository.ts
import { invoke } from "@tauri-apps/api/core"

export type {Domain} = {
  id: string
  // ... campos do modelo
  _status: string | null
  created_at: string | null
  updated_at: string | null
}

export type Create{Domain}DTO = {
  // campos obrigatórios e opcionais para criação
}

export type Update{Domain}DTO = {
  id: string
  // campos opcionais para update
}

export const {Domain}sRepository = {
  async list(): Promise<{Domain}[]> {
    return invoke("list_{domains}")
  },
  async getById(id: string): Promise<{Domain} | null> {
    return invoke("get_{domain}", { id })
  },
  async create(payload: Create{Domain}DTO): Promise<{Domain}> {
    return invoke("create_{domain}", { payload })
  },
  async update(payload: Update{Domain}DTO): Promise<{Domain}> {
    return invoke("update_{domain}", { payload })
  },
  async delete(id: string): Promise<void> {
    return invoke("delete_{domain}", { id })
  },
}
```

### Padrões de UI

| Componente | Uso |
|------------|-----|
| `DataTable` | Listagem com filtro, ordenação, paginação, visibilidade de colunas |
| `DropdownMenu` | Menu de ações por linha (Edit, Delete, Copy ID) |
| `AlertDialog` | Confirmação de ações destrutivas (Delete) |
| `Sheet` | Formulário de edição lateral |
| `Card` | Agrupamento de campos no formulário de criação |
| `Select` | Campos com opções fixas (type, status) ou FKs |
| `Badge` | Status e tipos com cores diferenciadas |
| `toast` (sonner) | Feedback de sucesso/erro |

---

## Notas

- **UI Table**: Estrutura da tabela (colunas, componente) existe, mas com `data = []`
- **List (Backend)**: Integração real com Tauri/SQLite para buscar dados
- Todas as tabelas atualmente mostram "No X found" pois não há dados do backend

---

## Changelog

| Data | Alteração |
|------|-----------|
| 2026-01-17 | Implementado CRUD completo de Inventory (inventory_levels: List, Create, Update, Delete, FK Navigation Product/Location) |
| 2026-01-17 | Implementado CRUD de Movements (List, Adjust Stock, Transfer Stock, FK Navigation Product/Location) |
| 2026-01-17 | Adicionados comandos inventory_level, inventory_movement e location ao invoke_handler |
| 2026-01-17 | Implementado CRUD completo de Transactions (List, Create, Update, Delete, Status Actions: complete, cancel) |
| 2026-01-17 | Implementado Sub-CRUD de transaction_items (List, Create, Update, Delete) |
| 2026-01-17 | Implementado Sub-CRUD completo de customer_addresses (List, Create, Update, Delete) |
| 2026-01-17 | Implementado Sub-CRUD completo de customer_group_memberships (List, Assign, Delete) |
| 2026-01-17 | Adicionados comandos customer, customer_address, customer_group, customer_group_membership ao invoke_handler |
| 2026-01-17 | Implementado CRUD completo de Checkouts (List, Create, Update, Delete, Status Actions) |
| 2026-01-17 | Implementado CRUD completo de Payments (List, Create, Update, Delete, Status Actions) |
| 2026-01-17 | Implementado CRUD completo de Refunds (List, Create, Update, Delete, FK Navigation Payment) |
| 2026-01-17 | Implementado CRUD completo de Customers (List, Create, Update, Delete) |
| 2026-01-17 | Implementado CRUD completo de Categories (List, Create, Update, Delete, FK Navigation Parent) |
| 2026-01-17 | Implementado CRUD completo de Brands (List, Create, Update, Delete) |
| 2026-01-17 | Adicionada seção "Arquitetura de Implementação" com padrão para replicar em outros domínios |
| 2026-01-17 | Implementado CRUD completo de Products (List, Create, Update, Delete, FK Navigation) |
| 2026-01-17 | Corrigido status: UI Tables existem mas List (backend) está pendente |
| 2026-01-17 | Documento criado com status inicial |

