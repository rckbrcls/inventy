# Uru: The Local-First Inventory Cloud

> **Manage your inventory in real-time across multiple devices using your own Local Network. No cloud subscriptions, no internet interaction required.**

**Uru** is a high-performance, "Premium" aesthetics inventory management system designed for small businesses that need reliability and speed. It operates on a robust **Mother-Satellite Architecture**, where a Desktop computer acts as the local server for multiple mobile devices.

---

## The Vision

Most inventory apps are either:

1.  **Cloud-based**: Slow, require monthly subscriptions, and stop working when the internet goes down.
2.  **Single-device**: Data is trapped on one phone or computer.

**Uru** bridges this gap. It gives you the power of a "Cloud" system but runs entirely inside your Wi-Fi router. It is **Offline-First**, meaning you can keep selling even if the Wi-Fi or Power goes out, and everything syncs back up automatically when reconnected.

---

## Architecture: "Mother & Satellites"

The system is composed of two distinct application types that work in harmony:

### 1. The Mother Node (Desktop)

- **Role**: The Truth Source. It holds the master database and orchestrates synchronization.
- **Platform**: Windows / macOS / Linux (via **Tauri v2**).
- **Tech Stack**:
  - **Frontend**: Next.js (React) + Shadcn/UI + Framer Motion.
  - **Backend**: Rust (via Tauri Sidecar) + Node.js (Local API).
  - **Database**: SQLite (High Performance, WAL Mode).
- **Responsibilities**:
  - Announces presence on the network (Bonjour/mDNS).
  - Resolves data conflicts.
  - Provides advanced reporting and dashboarding on a large screen.

### 2. The Satellite Nodes (Mobile)

- **Role**: Input Terminals. Used for POS (Point of Sale), stock checking, and barcode scanning.
- **Platform**: Android / iOS (via **React Native**).
- **Tech Stack**:
  - **Logic**: TypeScript + React Native.
  - **Database**: WatermelonDB / Op-SQLite.
- **Responsibilities**:
  - **Offline-First**: Reads/Writes to local DB immediately.
  - **Sync**: Pushes changes to Mother Node periodically.

---

## Technology Stack Breakdown

We chose this stack to maximize **Performance**, **Beauty**, and **DX (Developer Experience)**:

| Layer             | Technology            | Decision Rationale                                                                                                          |
| :---------------- | :-------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| **Desktop Shell** | **Tauri v2**          | significantly lighter than Electron. Uses system webview (WebKit/WebView2) instead of bundling Chrome. Allows Rust backend. |
| **Mobile Core**   | **React Native**      | Allows sharing 90% of business logic (Models, Validation, Util) with the Desktop web frontend via Monorepo.                 |
| **Styling**       | **Tailwind + Shadcn** | Enables "Glassmorphism" and premium feel with minimal effort. Consistent design language across Web and Desktop.            |
| **Sync Engine**   | **WatermelonDB**      | Specialized for dealing with thousands of records and complex offline sync logic (Push/Pull protocols).                     |

---

## The Sync Protocol

The heart of Uru is its ability to keep devices in sync without a central cloud server.

1.  **Discovery**:
    - Mother Node starts up and broadcasts `_uru-http._tcp` via mDNS.
    - Satellites listen and auto-discover the Mother Node IP (e.g., `192.168.1.50:3000`).
2.  **Authentication**:
    - Satellites perform a handshake (Pairing) to ensure unauthorized devices can't access data.
3.  **Synchronization**:
    - **PULL**: Satellite asks "Give me everything changed since `last_pulled_at`".
    - **PUSH**: Satellite sends "Here is everything I changed locally since last sync".
    - **Conflict Resolution**: "Last Write Wins" or server-side merges based on audit logs.

---

## Database Schema Principles

To support robust two-way syncing, our database schema follows strict rules:

- **UUIDs**: Every record (Item, Client, Transaction) utilizes a UUIDv4 Primary Key. Incrementing IDs (1, 2, 3) are strictly forbidden to prevent collision between offline devices.
- **Soft Deletes**: Data is never `DELETE`d. We set a `deleted_at` timestamp. This ensures deletion events propagate during sync.
- **Timestamps**: `created_at` and `updated_at` are mandatory for the Sync Protocol to know what requires transfer.
- **Immutable Logs**: Stock changes are recorded in an `inventory_movements` table (ledger) rather than just mutating the `quantity`, allowing full auditability.

---

## Roadmap

- [ ] **Phase 1: Foundation**
  - [ ] Establish Monorepo structure (`apps/mobile`, `apps/desktop`, `packages/shared`).
  - [ ] Create shared WatermelonDB Schema definitions.
- [ ] **Phase 2: The Mother Node**
  - [ ] Init Tauri v2 project.
  - [ ] Implement Local HTTP Server (Node/Rust) for Sync API.
  - [ ] Build key "Dashboard" screens.
- [ ] **Phase 3: The Connection**
  - [ ] Implement mDNS Discovery on Mobile.
  - [ ] Build "Pairing" UI.
  - [ ] Finalize WatermelonDB Sync Adapter.
