# Protocolo de Rede e Sincronização: Inventy

Esta documentação define como os dispositivos (Mother Node e Satellites) se comunicam na Rede Local (LAN). O protocolo é desenhado para ser "Zero Config" e resiliente a falhas de conexão.

## 1. Visão Geral

- **Protocolo de Transporte**: HTTP/1.1 sobre TCP/IP.
- **Formato de Dados**: JSON.
- **Porta Padrão**: `3000` (Configurável).
- **Descoberta**: mDNS (Bonjour/Avahi).

---

## 2. Descoberta de Serviço (Service Discovery)

Para evitar que o usuário precise digitar o IP do servidor manualmente (ex: `192.168.0.15`), utilizamos **mDNS**.

### Mother Node (Anúncio)

Ao iniciar, o Desktop App anuncia o serviço na rede local:

- **Service Name**: `_inventy-http._tcp.local`
- **Instance Name**: `Inventy Server ({HostName})`
- **Port**: `3000`
- **TXT Records**:
  - `version`: `1.0`
  - `deviceID`: `<UUID-Mother-Node>`

### Satellite Node (Busca)

O App Mobile escaneia a rede procurando por serviços `_inventy-http._tcp`. Ao encontrar, resolve o IP e tenta conectar.

---

## 3. Segurança e Autenticação

Para impedir que qualquer dispositivo na rede acesse os dados da loja, implementamos um sistema de **Pareamento**.

1.  **Handshake Inicial**:
    - O Mobile solicita conexão.
    - O Desktop exibe um PIN de 4 dígitos na tela.
    - O Usuário digita o PIN no Mobile.
2.  **Token JWT**:
    - Se o PIN estiver correto, o Desktop emite um **Permanent Auth Token** para o Mobile.
    - Todas as requisições subsequentes do Mobile devem incluir o header: `Authorization: Bearer <TOKEN>`.

---

## 4. Endpoints da API

A API é minimalista, focada puramente na sincronização e verificação de saúde.

### 4.1. Health Check

- **GET** `/api/v1/health`
- **Resposta**: `200 OK` `{ "status": "online", "server_time": 1715000000 }`
- **Uso**: Verificar se o IP ainda é válido e calcular `time_offset` entre dispositivos.

### 4.2. Sincronização (WatermelonDB Protocol)

Seguimos estritamente o protocolo de sync do WatermelonDB.

#### PULL (Baixar mudanças do servidor)

- **GET** `/api/v1/sync/pull`
- **Query Params**:
  - `last_pulled_at`: Timestamp da última sincronização bem sucedida (ou `null` se for a primeira vez).
- **Resposta**:
  ```json
  {
    "changes": {
      "inventory_items": {
        "created": [],
        "updated": [{ "id": "uuid-1", "name": "Novo Nome", ... }],
        "deleted": ["uuid-2"] // IDs de itens deletados
      },
      "debtors": { ... }
    },
    "timestamp": 1715001000 // Novo ponto de referência para o próximo pull
  }
  ```

#### PUSH (Enviar mudanças locais)

- **POST** `/api/v1/sync/push`
- **Body**:
  ```json
  {
    "changes": {
      "inventory_items": {
        "created": [{ "id": "uuid-temp", "name": "Coca Cola", ... }],
        "updated": [],
        "deleted": []
      },
      "inventory_movements": { "created": [...] }
    },
    "last_pulled_at": 1715000000
  }
  ```
- **Lógica do Servidor**:
  - Processa cada mudança em uma transação atômica.
  - Resolve conflitos ("Last Write Wins" baseado no `occurred_at` ou rejeita se `last_pulled_at` for muito antigo).

---

## 5. Tratamento de Erros de Rede

- **Timeout**: Requests com mais de 10s são abortados.
- **Retry**: O Mobile tenta reconectar exponencialmente (1s, 2s, 5s...) se a conexão cair no meio do sync.
- **IP Mudou?**: Se o Health Check falhar, o Mobile reinicia o processo de descoberta mDNS para achar o novo IP do servidor.
