use crate::models::review_model::Review;
use crate::repositories::product_metrics_repository::ProductMetricsRepository;
use crate::repositories::reviews_repository::ReviewsRepository;
use sqlx::SqlitePool;

pub struct ReviewService {
    pool: SqlitePool,
    reviews_repo: ReviewsRepository,
}

impl ReviewService {
    pub fn new(pool: SqlitePool) -> Self {
        let reviews_repo = ReviewsRepository::new(pool.clone());
        Self { pool, reviews_repo }
    }

    // ============================================================
    // Transactional methods (atomic operations)
    // ============================================================

    /// Create a review and update product metrics atomically
    pub async fn create_review(&self, review: Review) -> Result<Review, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Create the review
        let created_review = ReviewsRepository::create_with_tx(&mut tx, review)
            .await
            .map_err(|e| format!("Erro ao criar review: {}", e))?;

        // Update product metrics if product_id exists
        if let Some(ref product_id) = created_review.product_id {
            ProductMetricsRepository::increment_with_tx(&mut tx, product_id, created_review.rating)
                .await
                .map_err(|e| format!("Erro ao atualizar métricas do produto: {}", e))?;
        }

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(created_review)
    }

    /// Update a review and recalculate product metrics atomically
    pub async fn update_review(&self, review: Review) -> Result<Review, String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Get the old review to check if product changed or rating changed
        let old_review = ReviewsRepository::get_by_id_with_tx(&mut tx, &review.id)
            .await
            .map_err(|e| format!("Erro ao buscar review: {}", e))?
            .ok_or_else(|| "Review não encontrada".to_string())?;

        // Update the review
        let updated_review = ReviewsRepository::update_with_tx(&mut tx, review)
            .await
            .map_err(|e| format!("Erro ao atualizar review: {}", e))?;

        // If product_id changed, recalculate both old and new products
        let old_product = old_review.product_id.as_ref();
        let new_product = updated_review.product_id.as_ref();

        if old_product != new_product {
            // Recalculate old product metrics
            if let Some(product_id) = old_product {
                ProductMetricsRepository::recalculate_from_reviews_with_tx(&mut tx, product_id)
                    .await
                    .map_err(|e| format!("Erro ao recalcular métricas do produto antigo: {}", e))?;
            }
            // Recalculate new product metrics
            if let Some(product_id) = new_product {
                ProductMetricsRepository::recalculate_from_reviews_with_tx(&mut tx, product_id)
                    .await
                    .map_err(|e| format!("Erro ao recalcular métricas do produto novo: {}", e))?;
            }
        } else if old_review.rating != updated_review.rating {
            // Same product but rating changed, recalculate
            if let Some(product_id) = new_product {
                ProductMetricsRepository::recalculate_from_reviews_with_tx(&mut tx, product_id)
                    .await
                    .map_err(|e| format!("Erro ao recalcular métricas do produto: {}", e))?;
            }
        }

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(updated_review)
    }

    /// Delete a review and update product metrics atomically
    pub async fn delete_review(&self, review_id: &str) -> Result<(), String> {
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| format!("Erro ao iniciar transação: {}", e))?;

        // Get the review to know the product and rating
        let review = ReviewsRepository::get_by_id_with_tx(&mut tx, review_id)
            .await
            .map_err(|e| format!("Erro ao buscar review: {}", e))?
            .ok_or_else(|| "Review não encontrada".to_string())?;

        // Delete the review
        ReviewsRepository::delete_with_tx(&mut tx, review_id)
            .await
            .map_err(|e| format!("Erro ao deletar review: {}", e))?;

        // Update product metrics
        if let Some(ref product_id) = review.product_id {
            ProductMetricsRepository::decrement_with_tx(&mut tx, product_id, review.rating)
                .await
                .map_err(|e| format!("Erro ao atualizar métricas do produto: {}", e))?;
        }

        tx.commit()
            .await
            .map_err(|e| format!("Erro ao confirmar transação: {}", e))?;

        Ok(())
    }

    // ============================================================
    // Non-transactional methods (simple operations)
    // ============================================================

    /// Get reviews for a product
    pub async fn get_product_reviews(&self, product_id: &str) -> Result<Vec<Review>, String> {
        self.reviews_repo
            .list_by_product(product_id)
            .await
            .map_err(|e| format!("Erro ao buscar reviews do produto: {}", e))
    }

    /// Get reviews by a customer
    pub async fn get_customer_reviews(&self, customer_id: &str) -> Result<Vec<Review>, String> {
        self.reviews_repo
            .list_by_customer(customer_id)
            .await
            .map_err(|e| format!("Erro ao buscar reviews do cliente: {}", e))
    }

    /// Get reviews for an order
    pub async fn get_order_reviews(&self, order_id: &str) -> Result<Vec<Review>, String> {
        self.reviews_repo
            .list_by_order(order_id)
            .await
            .map_err(|e| format!("Erro ao buscar reviews do pedido: {}", e))
    }

    /// Get a single review by ID
    pub async fn get_review(&self, id: &str) -> Result<Option<Review>, String> {
        self.reviews_repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Erro ao buscar review: {}", e))
    }
}
