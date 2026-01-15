# Arquitetura e Regras de Negócio: Inventy

## 1. Arquitetura do Sistema

O sistema segue um modelo **Hybrid Cloud + Local Nodes**. A estratégia é **Offline-First**, garantindo que o app funcione sem internet, sincronizando os dados quando houver conexão.

### Componentes

1.  **Cloud Provider (Supabase/Postgres)**:
    - **Responsabilidade**: _Single Source of Truth_ (Fonte Única da Verdade). Armazena todos os dados de todos os usuários e dispositivos.
    - **Funcionalidades**: Autenticação, Armazenamento de Arquivos e Banco de Dados Relacional.

2.  **Mother Node (Desktop)**:
    - **Stack**: Tauri v2 + Vite + React (Frontend) + Rust (Backend) + SQLite.
    - **Responsabilidade**: Interface administrativa e ponto principal de entrada de dados no desktop. Sincroniza dados locais com o Supabase.

3.  **Satellite Nodes (Mobile/Web)**:
    - **Stack**: React Native (Mobile) / React (Web).
    - **Responsabilidade**: Operação rápida e portátil. Mobile usa SQLite local e sincroniza via Cloud Sync com o Supabase.

## 2. Esquema de Banco de Dados

Para suportar sincronização distribuída (estilo WatermelonDB), todas as tabelas utilizam **UUIDs** como chave primária e colunas de controle de versão.

### Colunas de Sincronização Obrigatórias:

- `_status`: Indica se o registro foi `created`, `updated` ou `deleted`.
- `_changed`: Timestamp ou hash para controle de versão fino.
- `updated_at`: Timestamp Unix (ou ISO 8601) usado como âncora de sincronização.

> [!NOTE]
> Para detalhes técnicos de cada tabela, consulte o [DATABASE_SCHEMA.md](file:///Users/erickpatrickbarcelos/codes/inventy/apps/desktop/docs/DATABASE_SCHEMA.md).

## 3. Sincronização em Nuvem (Cloud Sync)

A sincronização entre os nós locais (SQLite) e a nuvem (Supabase/Postgres) segue um protocolo de **Eventual Consistency**.

### Fluxo de Trabalho

1.  **Operação Local**: Toda escrita é feita primeiro no banco local (SQLite). O registro é marcado com `_status = 'updated'`.
2.  **Background Sync**: Um serviço em segundo plano busca registros com `_status != 'synced'`.
3.  **Pull (Download)**: O app pede ao Supabase: "Dê-me tudo que mudou desde `last_pulled_at`".
4.  **Push (Upload)**: O app envia ao Supabase as mudanças locais.
5.  **Resolução de Conflitos**: O padrão adotado é **Last Write Wins (LWW)** baseado no timestamp `updated_at`.

### Por que manter SQLite localmente?

- **Zero Latência**: Operações de interface não dependem da rede.
- **Offline Total**: O usuário pode realizar vendas e cadastros no meio do mato ou em galpões sem sinal.
- **Privacidade**: O arquivo `.db` fica na máquina do usuário.

## 4. Regras de Negócio e Gestão

### Gestão de Estoque (Ledger)

- **Imutabilidade**: O estoque não é apenas um número estático. Cada alteração (Entrada/Saída) gera um log em `inventory_movements`.
- **Saldo de Cache**: O campo `quantity` em `inventory_items` é um cache do somatório dos logs para performance.

### Fiado (Débitos)

- Uma venda fiada vincula um `purchase_id` a um `debtor_id`.
- O saldo do cliente (`current_balance`) é atualizado atomicamente durante a transação.
