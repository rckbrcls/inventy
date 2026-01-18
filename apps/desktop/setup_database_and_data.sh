#!/usr/bin/env bash
set -euo pipefail

# Script para resetar o banco de dados, criar o schema e preencher com dados sintéticos
# Uso: ./setup_database_and_data.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_DIR="$ROOT_DIR/scripts/python"
VENV_DIR="$PYTHON_DIR/.venv"
DB_DIR="$HOME/Library/Application Support/com.tauri.dev"
DB_PATH="$DB_DIR/inventy.db"
SCHEMA_PATH="$ROOT_DIR/src-tauri/migrations/001_initial_schema.sql"
SCRIPT_PATH="$PYTHON_DIR/generate_synthetic_data.py"

# Verificar se sqlite3 está instalado
if ! command -v sqlite3 &> /dev/null; then
  echo "❌ Erro: sqlite3 não está instalado"
  echo "   Instale com: brew install sqlite3"
  exit 1
fi

# Verificar se o arquivo de schema existe
if [[ ! -f "$SCHEMA_PATH" ]]; then
  echo "❌ Erro: Schema não encontrado em $SCHEMA_PATH"
  exit 1
fi

# Verificar se o script Python existe
if [[ ! -f "$SCRIPT_PATH" ]]; then
  echo "❌ Erro: Script Python não encontrado em $SCRIPT_PATH"
  exit 1
fi

echo "🗑️  Removendo banco de dados existente (se houver)..."
mkdir -p "$DB_DIR"
if [[ -f "$DB_PATH" ]]; then
  rm -f "$DB_PATH"
  echo "   ✓ Banco removido"
else
  echo "   ℹ Nenhum banco encontrado"
fi

echo ""
echo "📊 Aplicando schema inicial..."
sqlite3 "$DB_PATH" < "$SCHEMA_PATH"
echo "   ✓ Schema aplicado"

echo ""
echo "🐍 Configurando ambiente Python..."

# Criar venv se não existir
if [[ ! -d "$VENV_DIR" ]]; then
  echo "   Criando venv em $VENV_DIR"
  python3 -m venv "$VENV_DIR"
fi

# Ativar venv
echo "   Ativando venv"
source "$VENV_DIR/bin/activate"

# Instalar dependências se necessário
echo "   Instalando/atualizando dependências"
pip install --upgrade pip --quiet
pip install faker --quiet

echo ""
echo "🎲 Gerando dados sintéticos..."
python "$SCRIPT_PATH" --db-path "$DB_PATH" --seed 42

echo ""
echo "✅ Banco de dados criado e preenchido com sucesso!"
echo ""
echo "📊 Informações do banco:"
echo "   Localização: $DB_PATH"

# Verificar quantas tabelas foram criadas
TABLE_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';" 2>/dev/null || echo "0")
echo "   Tabelas: $TABLE_COUNT"

# Verificar alguns registros principais
SHOP_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM shops;" 2>/dev/null || echo "0")
PRODUCT_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM products;" 2>/dev/null || echo "0")
CUSTOMER_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM customers;" 2>/dev/null || echo "0")
TRANSACTION_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM transactions;" 2>/dev/null || echo "0")
ORDER_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM orders;" 2>/dev/null || echo "0")

if [[ "$SHOP_COUNT" -gt 0 ]]; then
  echo "   Shops: $SHOP_COUNT"
fi
if [[ "$PRODUCT_COUNT" -gt 0 ]]; then
  echo "   Products: $PRODUCT_COUNT"
fi
if [[ "$CUSTOMER_COUNT" -gt 0 ]]; then
  echo "   Customers: $CUSTOMER_COUNT"
fi
if [[ "$TRANSACTION_COUNT" -gt 0 ]]; then
  echo "   Transactions: $TRANSACTION_COUNT"
fi
if [[ "$ORDER_COUNT" -gt 0 ]]; then
  echo "   Orders: $ORDER_COUNT"
fi

echo ""
