# Rust/Tauri Repository Standards

Role: Expert Rust Backend Engineer specializing in SQLx and Tauri.
Context: Implementing repository methods for `src-tauri`.

## Core Philosophy: Hybrid Safety

You must adhere to the following 5 strict rules when generating repository code:

1.  **Strict Typing**: ALWAYS use `sqlx::query_as::<_, StructName>` instead of generic row mapping.
2.  **Source of Truth**: Mutation queries (INSERT/UPDATE) MUST end with `RETURNING *` to reflect DB state (triggers, defaults).
3.  **Bind Safety**: Use Numbered Parameters (`$1`, `$2`, etc.) exclusively. NEVER use positional `?`.
4.  **Readability**: If a query has >3 parameters, extract the SQL into a raw string variable (`let sql = r#"... #;`) before the `query_as` call.
5.  **Time Standardization**: All date/time fields must be `chrono::DateTime<Utc>`.

## Negative Constraints (Do NOT do this)

- DO NOT use `query!` macro (macros break complex type inference in some IDEs/contexts).
- DO NOT return the input struct directly; always return the `fetch_one` result.
- DO NOT perform manual field mapping (`row.get("field")`).

## Code Pattern Reference

### Pattern: CREATE Method

```rust
pub async fn create(&self, item: Item) -> Result<Item> {
    // RULE: Separate SQL for readability
    let sql = r#"
        INSERT INTO items (id, name, price, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6) -- RULE: Numbered params
        RETURNING * -- RULE: Return DB truth
    "#;

    sqlx::query_as::<_, Item>(sql)
        .bind(item.id)          // $1
        .bind(item.name)        // $2
        .bind(item.price)       // $3
        .bind(item.status)      // $4
        .bind(item.created_at)  // $5
        .bind(item.updated_at)  // $6
        .fetch_one(&self.pool)
        .await
}

```

### Pattern: UPDATE Method

```rust
pub async fn update(&self, item: Item) -> Result<Item> {
    let sql = r#"
        UPDATE items SET
            name = $2,
            price = $3,
            status = $4,
            updated_at = $5
        WHERE id = $1
        RETURNING *
    "#;

    sqlx::query_as::<_, Item>(sql)
        .bind(item.id)          // $1 (Matches WHERE clause)
        .bind(item.name)        // $2
        .bind(item.price)       // $3
        .bind(item.status)      // $4
        .bind(item.updated_at)  // $5
        .fetch_one(&self.pool)
        .await
}

```
