# Arquitetura e Regras de Negócio: Inventy Desktop

## 1. Arquitetura do Sistema

O sistema segue um modelo **Local Server (Mãe) + Satellites (Filhos)**.

### Componentes

1.  **Mother Node (Desktop)**:
    - **Stack**: Tauri v2 + Next.js + Rust (Backend) + SQLite.
    - **Responsabilidade**: Fonte da verdade (Source of Truth). Gerencia conflitos, backups e serve a API de sincronização na rede local.
2.  **Satellite Nodes (Mobile/Outros Desktops)**:
    - **Stack**: React Native + WatermelonDB/Op-SQLite.
    - **Responsabilidade**: Operação offline-first. Sincroniza dados periodicamente com o Mother Node.

## 2. Schema de Banco de Dados (Versão Robusta)

Para suportar sincronização distribuída e integridade, **todas as tabelas devem usar UUIDs** como chave primária e colunas de controle de versão (`created_at`, `updated_at`, `deleted_at`).

### Tabela: `inventory_items`

Representa os produtos no estoque.

```sql
CREATE TABLE inventory_items (
  id TEXT PRIMARY KEY NOT NULL, -- UUID
  name TEXT NOT NULL,
  sku TEXT, -- Código de barras ou identificador único legível
  category TEXT,
  description TEXT,

  -- Controle de Estoque
  quantity REAL NOT NULL DEFAULT 0,
  min_stock_level REAL DEFAULT 5, -- Para gerar alertas de reposição
  location TEXT, -- Prateleira A, Gaveta 2, etc.

  -- Valores
  cost_price REAL, -- Preço de custo (para cálculo de lucro)
  selling_price REAL, -- Preço de venda sugerido

  -- Sync Metadata
  created_at TEXT NOT NULL, -- ISO 8601
  updated_at TEXT NOT NULL,
  deleted_at TEXT -- Se preenchido, o item foi excluído (Soft Delete)
);
```

### Tabela: `debtors` (Clientes)

Pessoas que possuem débitos ou histórico com a loja.

```sql
CREATE TABLE debtors (
  id TEXT PRIMARY KEY NOT NULL, -- UUID
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,

  -- Cache de Estado (Calculado via movements, mas persistido para performance)
  current_balance REAL DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'blocked', 'archived'

  -- Sync Metadata
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);
```

### Tabela: `inventory_movements` (Logs)

Log imutável de tudo que entra e sai. Essencial para auditoria.

```sql
CREATE TABLE inventory_movements (
  id TEXT PRIMARY KEY NOT NULL,
  item_id TEXT NOT NULL REFERENCES inventory_items(id),
  debtor_id TEXT REFERENCES debtors(id), -- Opcional, se foi saída para um cliente específico

  type TEXT NOT NULL, -- 'IN' (Compra), 'OUT' (Venda), 'ADJUST' (Correção), 'RETURN' (Devolução)
  quantity_change REAL NOT NULL, -- Positivo para entrada, Negativo para saída

  unit_price_snapshot REAL, -- Preço unitário no momento da movimentação
  reason TEXT, -- 'Venda Balcão', 'Venda Fiado', 'Perda/Validade', etc.

  occurred_at TEXT NOT NULL, -- Data real da movimentação
  created_at TEXT NOT NULL -- Data do registro no banco
);
```

## 3. Regras de Negócio e Sync

### Mecânica "Mother-Satellite"

1.  **Descoberta**: O Desktop anuncia seu IP via mDNS (Bonjour). O Mobile escaneia e encontra `Inventy Server`.
2.  **Pull (Mobile -> Pede dados)**: Mobile envia seu `last_pulled_at`. Desktop responde com todos registros onde `updated_at > last_pulled_at`.
3.  **Push (Mobile -> Envia dados)**: Mobile envia registros criados/alterados offline. Desktop aplica (Last Write Wins) e atualiza o `updated_at`.

### Gestão de Estoque

- **Saldo**: O campo `quantity` em `inventory_items` é a verdade atual. Ele deve ser eventualmente consistente com a soma dos `inventory_movements`.
- **Edição Concorrente**: Se Desktop e Mobile editarem a quantidade do mesmo item ao mesmo tempo, a edição com `updated_at` mais recente vence.

### Fiado (Débitos)

- Uma venda "Fiado" gera:
  1.  Um `inventory_movement` (Tipo 'OUT', devedor preenchido).
  2.  Uma atualização no `debtors` somando o valor ao `current_balance`.
