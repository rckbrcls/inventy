use crate::features::product::models::product_model::Product;
use sqlx::{QueryBuilder, Result, Sqlite, SqlitePool, Transaction};

pub struct ProductRepository {
    pool: SqlitePool,
}

impl ProductRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, product: Product) -> Result<Product> {
        let sql = r#"
            INSERT INTO products (
                id, sku, type, status, name, slug, gtin_ean, price, promotional_price, cost_price,
                currency, tax_ncm, is_shippable, weight_g, width_mm, height_mm, depth_mm,
                attributes, metadata, category_id, brand_id, parent_id, _status, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                $18, $19, $20, $21, $22, $23, $24, $25
            )
            RETURNING *
        "#;

        sqlx::query_as::<_, Product>(sql)
            .bind(&product.id)
            .bind(&product.sku)
            .bind(&product.r#type)
            .bind(&product.status)
            .bind(&product.name)
            .bind(&product.slug)
            .bind(&product.gtin_ean)
            .bind(&product.price)
            .bind(&product.promotional_price)
            .bind(&product.cost_price)
            .bind(&product.currency)
            .bind(&product.tax_ncm)
            .bind(&product.is_shippable)
            .bind(&product.weight_g)
            .bind(&product.width_mm)
            .bind(&product.height_mm)
            .bind(&product.depth_mm)
            .bind(&product.attributes)
            .bind(&product.metadata)
            .bind(&product.category_id)
            .bind(&product.brand_id)
            .bind(&product.parent_id)
            .bind(&product.sync_status)
            .bind(&product.created_at)
            .bind(&product.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn create_in_tx(
        &self,
        tx: &mut Transaction<'_, Sqlite>,
        product: &Product,
    ) -> Result<Product> {
        let sql = r#"
            INSERT INTO products (
                id, sku, type, status, name, slug, gtin_ean, price, promotional_price, cost_price,
                currency, tax_ncm, is_shippable, weight_g, width_mm, height_mm, depth_mm,
                attributes, metadata, category_id, brand_id, parent_id, _status, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                $18, $19, $20, $21, $22, $23, $24, $25
            )
            RETURNING *
        "#;

        sqlx::query_as::<_, Product>(sql)
            .bind(&product.id)
            .bind(&product.sku)
            .bind(&product.r#type)
            .bind(&product.status)
            .bind(&product.name)
            .bind(&product.slug)
            .bind(&product.gtin_ean)
            .bind(&product.price)
            .bind(&product.promotional_price)
            .bind(&product.cost_price)
            .bind(&product.currency)
            .bind(&product.tax_ncm)
            .bind(&product.is_shippable)
            .bind(&product.weight_g)
            .bind(&product.width_mm)
            .bind(&product.height_mm)
            .bind(&product.depth_mm)
            .bind(&product.attributes)
            .bind(&product.metadata)
            .bind(&product.category_id)
            .bind(&product.brand_id)
            .bind(&product.parent_id)
            .bind(&product.sync_status)
            .bind(&product.created_at)
            .bind(&product.updated_at)
            .fetch_one(&mut **tx)
            .await
    }

    pub async fn update(&self, product: Product) -> Result<Product> {
        let sql = r#"
            UPDATE products SET
                sku = $2,
                type = $3,
                status = $4,
                name = $5,
                slug = $6,
                gtin_ean = $7,
                price = $8,
                promotional_price = $9,
                cost_price = $10,
                currency = $11,
                tax_ncm = $12,
                is_shippable = $13,
                weight_g = $14,
                width_mm = $15,
                height_mm = $16,
                depth_mm = $17,
                attributes = $18,
                metadata = $19,
                category_id = $20,
                brand_id = $21,
                parent_id = $22,
                _status = $23,
                updated_at = $24
            WHERE id = $1
            RETURNING *
        "#;

        sqlx::query_as::<_, Product>(sql)
            .bind(product.id)
            .bind(product.sku)
            .bind(product.r#type)
            .bind(product.status)
            .bind(product.name)
            .bind(product.slug)
            .bind(product.gtin_ean)
            .bind(product.price)
            .bind(product.promotional_price)
            .bind(product.cost_price)
            .bind(product.currency)
            .bind(product.tax_ncm)
            .bind(product.is_shippable)
            .bind(product.weight_g)
            .bind(product.width_mm)
            .bind(product.height_mm)
            .bind(product.depth_mm)
            .bind(product.attributes)
            .bind(product.metadata)
            .bind(product.category_id)
            .bind(product.brand_id)
            .bind(product.parent_id)
            .bind(product.sync_status)
            .bind(product.updated_at)
            .fetch_one(&self.pool)
            .await
    }

    pub async fn delete(&self, id: &str) -> Result<()> {
        let sql = "DELETE FROM products WHERE id = $1";

        sqlx::query(sql).bind(id).execute(&self.pool).await?;
        Ok(())
    }

    pub async fn get_by_id(&self, id: &str) -> Result<Option<Product>> {
        let sql = "SELECT * FROM products WHERE id = $1";
        sqlx::query_as::<_, Product>(sql)
            .bind(id)
            .fetch_optional(&self.pool)
            .await
    }

    pub async fn list(&self) -> Result<Vec<Product>> {
        let sql = "SELECT * FROM products ORDER BY created_at DESC";
        sqlx::query_as::<_, Product>(sql)
            .fetch_all(&self.pool)
            .await
    }

    pub async fn list_by_shop(&self, shop_id: &str) -> Result<Vec<Product>> {
        let sql = r#"
            SELECT p.* FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN brands b ON b.id = p.brand_id
            WHERE c.shop_id = $1 OR b.shop_id = $1
            ORDER BY p.created_at DESC
        "#;
        sqlx::query_as::<_, Product>(sql)
            .bind(shop_id)
            .fetch_all(&self.pool)
            .await
    }

    #[allow(clippy::too_many_arguments)]
    pub async fn list_filtered(
        &self,
        shop_id: Option<&str>,
        status: Option<&str>,
        category_id: Option<&str>,
        brand_id: Option<&str>,
        query: Option<&str>,
        is_shippable: Option<bool>,
        min_price: Option<f64>,
        max_price: Option<f64>,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<Product>> {
        let mut builder = QueryBuilder::<Sqlite>::new(
            "SELECT p.* FROM products p \
             LEFT JOIN categories c ON c.id = p.category_id \
             LEFT JOIN brands b ON b.id = p.brand_id \
             WHERE 1 = 1",
        );

        if let Some(shop_id) = shop_id {
            builder.push(" AND (c.shop_id = ");
            builder.push_bind(shop_id);
            builder.push(" OR b.shop_id = ");
            builder.push_bind(shop_id);
            builder.push(")");
        }

        if let Some(status) = status {
            builder.push(" AND p.status = ");
            builder.push_bind(status);
        }

        if let Some(category_id) = category_id {
            builder.push(" AND p.category_id = ");
            builder.push_bind(category_id);
        }

        if let Some(brand_id) = brand_id {
            builder.push(" AND p.brand_id = ");
            builder.push_bind(brand_id);
        }

        if let Some(query) = query {
            let pattern = format!("%{}%", query);
            builder.push(" AND (p.name LIKE ");
            builder.push_bind(pattern.clone());
            builder.push(" OR p.sku LIKE ");
            builder.push_bind(pattern.clone());
            builder.push(" OR p.gtin_ean LIKE ");
            builder.push_bind(pattern);
            builder.push(")");
        }

        if let Some(is_shippable) = is_shippable {
            builder.push(" AND p.is_shippable = ");
            builder.push_bind(is_shippable);
        }

        if let Some(min_price) = min_price {
            builder.push(" AND p.price >= ");
            builder.push_bind(min_price);
        }

        if let Some(max_price) = max_price {
            builder.push(" AND p.price <= ");
            builder.push_bind(max_price);
        }

        builder.push(" ORDER BY p.created_at DESC");
        builder.push(" LIMIT ");
        builder.push_bind(limit);
        builder.push(" OFFSET ");
        builder.push_bind(offset);

        let query = builder.build_query_as::<Product>();
        query.fetch_all(&self.pool).await
    }

    pub async fn search(&self, query_str: &str) -> Result<Vec<Product>> {
        let sql = "SELECT * FROM products WHERE name LIKE $1 OR sku LIKE $1 OR gtin_ean LIKE $1";
        let search_pattern = format!("%{}%", query_str);
        sqlx::query_as::<_, Product>(sql)
            .bind(search_pattern)
            .fetch_all(&self.pool)
            .await
    }
}
