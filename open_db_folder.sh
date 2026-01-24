#!/usr/bin/env bash

# Script para abrir a pasta onde os bancos de dados do app estão localizados
# Uso: ./open_db_folder.sh

DATA_DIR="$HOME/Library/Application Support/com.tauri.dev"

if [ -d "$DATA_DIR" ]; then
  echo "📂 Abrindo pasta dos bancos de dados no Finder..."
  echo "   Caminho: $DATA_DIR"
  open "$DATA_DIR"
else
  echo "❌ Erro: Pasta não encontrada!"
  echo "   Caminho esperado: $DATA_DIR"
  echo "   Dica: Rode ./setup_database_and_data.sh primeiro para criar a estrutura."
fi
