use crate::dtos::transaction_dto::CreateTransactionDTO;
use crate::models::transaction_model::Transaction;
use crate::repositories::inventory_movements_repository::InventoryMovementsRepository;
use crate::repositories::transaction_items_repository::TransactionItemsRepository;
use crate::repositories::transactions_repository::TransactionsRepository;
use sqlx::SqlitePool;

pub struct TransactionService {
    repo: TransactionsRepository,
    items_repo: TransactionItemsRepository,
    movements_repo: InventoryMovementsRepository,
}

impl TransactionService {
    pub fn new(pool: SqlitePool) -> Self {
        let repo = TransactionsRepository::new(pool.clone());
        let items_repo = TransactionItemsRepository::new(pool.clone());
        let movements_repo = InventoryMovementsRepository::new(pool);
        Self {
            repo,
            items_repo,
            movements_repo,
        }
    }

    pub async fn create_transaction(
        &self,
        payload: CreateTransactionDTO,
    ) -> Result<Transaction, String> {
        let _location_id = payload
            .location_id
            .clone()
            .ok_or("Location ID is required".to_string())?;
        let (transaction, items) = payload.into_models();

        let created_transaction = self
            .repo
            .create(transaction)
            .await
            .map_err(|e| format!("Erro ao criar transação: {}", e))?;

        if !items.is_empty() {
            self.items_repo
                .create_many(items)
                .await
                .map_err(|e| format!("Erro ao criar itens da transação: {}", e))?;
        }

        // Inventory movements generation was TODO in original file.
        // original call: self.repo.create(transaction, items, Vec::new())
        // so movements were empty.

        Ok(created_transaction)
    }

    pub async fn delete_transaction(&self, id: &str) -> Result<(), String> {
        self.items_repo
            .delete_by_transaction_id(id)
            .await
            .map_err(|e| format!("Erro ao deletar itens da transação: {}", e))?;
        self.movements_repo
            .delete_by_transaction_id(id)
            .await
            .map_err(|e| format!("Erro ao deletar movimentos da transação: {}", e))?;
        self.repo
            .delete(id)
            .await
            .map_err(|e| format!("Erro ao deletar transação: {}", e))
    }

    pub async fn get_transaction(&self, id: &str) -> Result<Option<Transaction>, String> {
        self.repo
            .get_by_id(id)
            .await
            .map_err(|e| format!("Erro ao buscar transação: {}", e))
    }

    pub async fn list_transactions(&self) -> Result<Vec<Transaction>, String> {
        self.repo
            .list()
            .await
            .map_err(|e| format!("Erro ao listar transações: {}", e))
    }
}
