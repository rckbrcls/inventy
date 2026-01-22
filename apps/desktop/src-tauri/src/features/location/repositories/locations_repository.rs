use crate::features::location::models::location_model::Location;
use sqlx::{Result, SqlitePool};

pub struct LocationsRepository {
    pool: SqlitePool,
}

impl LocationsRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, item: Location) -> Result<Location> {
        let sql = r#"
            INSERT INTO locations (
                id, name, type, is_sellable, address_data
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        "#;

        sqlx::query_as::<_, Location>(sql)
            .bind(item.id)
            .bind(item.name)
            .bind(item.type_)
            .bind(item.is_sellable)
            .bind(item.address_data)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn update(&self, item: Location) -> Result<Location> {
        let sql = r#"
            UPDATE locations SET
                name = $2,
                type = $3,
                is_sellable = $4,
                address_data = $5
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Location>(sql)
            .bind(item.id)
            .bind(item.name)
            .bind(item.type_)
            .bind(item.is_sellable)
            .bind(item.address_data)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn get_all(&self) -> Result<Vec<Location>> {
        let sql = r#"
            SELECT * FROM locations
        "#;

        sqlx::query_as::<_, Location>(sql)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list_by_shop(&self, shop_id: &str) -> Result<Vec<Location>> {
        let sql = r#"
            SELECT DISTINCT l.* FROM locations l
            INNER JOIN inventory_levels il ON il.location_id = l.id
            INNER JOIN products p ON p.id = il.product_id
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN brands b ON b.id = p.brand_id
            WHERE (c.shop_id = $1 OR b.shop_id = $1)
            ORDER BY l.name ASC
        "#;

        sqlx::query_as::<_, Location>(sql)
            .bind(shop_id)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Location>> {
        let sql = r#"
            SELECT * FROM locations WHERE id = $1
        "#;

        sqlx::query_as::<_, Location>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = r#"
            DELETE FROM locations WHERE id = $1
        "#;

        sqlx::query(sql)
            .bind(id)
            .execute(&self.pool)
            .await?;

        Ok(())
    }
}
