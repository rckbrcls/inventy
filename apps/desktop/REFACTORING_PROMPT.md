# Prompt de Refatoração: Consolidação de Repositórios e Models

Este documento contém um prompt otimizado para ser usado em ferramentas de IA (como Antigravity, Cursor, ou ChatGPT) para realizar a refatoração de arquitetura do projeto Inventy.

---

## 🚀 Contexto do Projeto

- **Linguagem**: Rust
- **Framework**: Tauri
- **Banco de Dados**: SQLite (com suporte a compatibilidade PostgreSQL no futuro)
- **ORM/Query Builder**: SQLx
- **Padrão de Segurança (Hybrid Safety)**:
  1.  Uso obrigatório de `sqlx::query_as::<_, StructName>`.
  2.  Uso de `RETURNING *` em comandos `INSERT` e `UPDATE`.
  3.  Parâmetros numerados (`$1`, `$2`, etc).
  4.  Extração da query SQL para uma variável `const` ou `let sql = r#...#` caso tenha mais de 3 parâmetros.
  5.  Datas usando `chrono::DateTime<Utc>`.

---

## 🎯 Objetivo da Refatoração

Consolidar repositórios e models fragmentados em "Agregados" (Entidades Principais) para reduzir boilerplate, garantir integridade transacional e permitir buscas mais ricas com `JOIN`.

---

## 🤖 Prompt Otimizado para Copiar e Colar

> **Tarefa**: Refatorar a camada de persistência (Models e Repositories) para consolidar entidades dependentes em seus agregados principais.
>
> **Diretrizes de Consolidação**:
>
> 1.  **Mapeamento de Consolidação**:
>     - `product` ← `product_categories`
>     - `customer` ← `customer_addresses`, `customer_group_memberships`
>     - `transaction` ← `transaction_items`, `inventory_movements`
>     - `shipment` ← `shipment_items`, `shipment_events`
>     - `user` ← `user_identities`, `user_sessions`, `user_roles`
>     - `inquiry` ← `inquiry_messages`
> 2.  **Ação nos Models**:
>     - Mova as `structs` dos arquivos dependentes para o arquivo do model principal.
>     - Exemplo: A struct `TransactionItem` deve residir em `models/transaction.rs`.
>     - Remova as exportações duplicadas no `models/mod.rs`.
> 3.  **Ação nos Repositories**:
>     - Integre a lógica de CRUD das tabelas dependentes no Repositório Principal.
>     - **Leitura**: Melhore os métodos `get_by_id` e `list` para usar `LEFT JOIN` e trazer os dados relacionados em uma única query (ou processe o agrupamento em Rust se necessário).
>     - **Escrita (Atômica)**: Use `self.pool.begin().await?` para criar transações. Métodos de criação (ex: `create_sale`) devem inserir a entidade principal e todos os seus itens/detalhes dentro do mesmo bloco transacional.
>     - **Batch Inserts**: Sempre que possível, utilize inserts em massa para itens dependentes.
> 4.  **Regras de Código (Hybrid Safety)**:
>     - Mantenha o padrão `sqlx::query_as` e `RETURNING *`.
>     - Garanta que todos os campos de data utilizem `DateTime<Utc>`.
>     - Utilize parâmetros numerados em todas as queries.
>
> **Resultado Esperado**:
>
> - Código mais limpo e centralizado.
> - Integridade total no banco de dados (sem "itens órfãos").
> - Menos chamadas ao banco de dados por operação de negócio.
