# Arquitetura e Regras de Negócio: Uru

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
- `created_at`: Data de criação do registro.
- `updated_at`: Timestamp Unix (ou ISO 8601) usado como âncora de sincronização.

### Camada de Compatibilidade (SQLite <-> Postgres)

Como o _Mother Node_ utiliza SQLite (local) e o _Cloud Provider_ utiliza Postgres, as seguintes regras de mapeamento devem ser **estritamente seguidas** para garantir que o Sync funcione:

| Atributo         | Postgres (Cloud) | SQLite (Local) | Tratamento na Aplicação                                                                     |
| :--------------- | :--------------- | :------------- | :------------------------------------------------------------------------------------------ |
| **Primary Keys** | `UUID`           | `TEXT`         | O Front/Rust deve gerar UUID v4 e salvar como string (36 chars).                            |
| **JSON Data**    | `JSONB`          | `TEXT`         | O Rust/TS deve serializar Objetos para Strings antes de salvar, e parsear ao ler.           |
| **Dates**        | `TIMESTAMP`      | `TEXT`         | Sempre salvar como ISO 8601 UTC String (`YYYY-MM-DDTHH:mm:ss.sssZ`).                        |
| **Booleans**     | `BOOLEAN`        | `INTEGER`      | `true` -> `1`, `false` -> `0`. A aplicação deve converter isso na leitura.                  |
| **Arrays**       | `TEXT[]`         | `TEXT`         | Salvar como JSON Array String `["a","b"]` ou CSV, dependendo do caso. Preferência por JSON. |

> **Nota Crítica**: O SQLite é _type-less_ por natureza. A aplicação (seja no Frontend via Types ou no Rust via Structs) é responsável por garantir a integridade desses tipos antes do INSERT.

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
