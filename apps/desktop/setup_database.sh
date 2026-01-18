#!/usr/bin/env bash
set -euo pipefail

# Script para criar o banco de dados aplicando o schema inicial
# Uso: ./setup_database.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_PATH="$ROOT_DIR/src-tauri/migrations/001_initial_schema.sql"

# Caminho do banco de dados (mesmo usado pelo Tauri)
DB_DIR="$HOME/Library/Application Support/com.tauri.dev"
DB_PATH="$DB_DIR/inventy.db"

# Verificar se o arquivo de schema existe
if [[ ! -f "$SCHEMA_PATH" ]]; then
  echo "❌ Erro: Schema não encontrado em $SCHEMA_PATH"
  exit 1
fi

# Verificar se sqlite3 está instalado
if ! command -v sqlite3 &> /dev/null; then
  echo "❌ Erro: sqlite3 não está instalado"
  echo "   Instale com: brew install sqlite3"
  exit 1
fi

echo "📁 Criando diretório do banco de dados..."
mkdir -p "$DB_DIR"

# Verificar se o banco já existe
if [[ -f "$DB_PATH" ]]; then
  echo "⚠️  Banco de dados já existe em: $DB_PATH"
  read -p "   Deseja sobrescrever? (s/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operação cancelada"
    exit 1
  fi
  echo "🗑️  Removendo banco existente..."
  rm -f "$DB_PATH"
fi

echo "📊 Aplicando schema inicial..."
echo "   Schema: $SCHEMA_PATH"
echo "   Banco:  $DB_PATH"

# Aplicar o schema
if sqlite3 "$DB_PATH" < "$SCHEMA_PATH"; then
  echo ""
  echo "✅ Banco de dados criado com sucesso!"
  echo ""
  echo "📊 Informações do banco:"
  echo "   Localização: $DB_PATH"
  
  # Verificar quantas tabelas foram criadas
  TABLE_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';" 2>/dev/null || echo "0")
  echo "   Tabelas criadas: $TABLE_COUNT"
  
  # Verificar quantos registros foram inseridos (módulos e templates)
  MODULE_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM modules;" 2>/dev/null || echo "0")
  TEMPLATE_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM shop_templates;" 2>/dev/null || echo "0")
  
  if [[ "$MODULE_COUNT" -gt 0 ]]; then
    echo "   Módulos: $MODULE_COUNT"
  fi
  if [[ "$TEMPLATE_COUNT" -gt 0 ]]; then
    echo "   Templates: $TEMPLATE_COUNT"
  fi
  
  echo ""
  echo "💡 Dica: Para gerar dados sintéticos, execute:"
  echo "   ./setup_synthetic_data.sh"
else
  echo ""
  echo "❌ Erro ao aplicar o schema"
  exit 1
fi
