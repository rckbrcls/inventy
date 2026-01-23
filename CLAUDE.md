# CLAUDE.md - AI Assistant Guide for Urú

## Project Overview

**Urú** is a local-first inventory management system designed for small businesses. It operates on a **Mother-Satellite Architecture** where a Desktop computer (Mother Node) acts as the local server for multiple mobile devices (Satellite Nodes). The system works entirely within a local Wi-Fi network without requiring cloud subscriptions or internet connectivity.

### Core Philosophy

- **Offline-First**: Devices can operate independently and sync when reconnected
- **Local Network**: No cloud dependencies, operates on LAN
- **UUID-Based**: All entities use UUIDv4 to prevent ID collisions across offline devices
- **Soft Deletes**: Data is never physically deleted, only marked as deleted for sync integrity
- **Immutable Logs**: Stock changes are recorded in audit logs rather than direct mutations

---

## Monorepo Structure

This is a **Turborepo monorepo** using **pnpm workspaces**:

```
uru-monorepo/
├── apps/
│   ├── desktop/          # Tauri v2 + React desktop app (Mother Node)
│   └── mobile/           # React Native + Expo mobile app (Satellite Node)
├── packages/
│   └── types/            # Shared TypeScript types across all apps
├── docs/                 # Architecture and protocol documentation
├── scripts/              # Build and deployment scripts
└── turbo.json           # Turborepo configuration
```

### Package Manager

- **Required**: pnpm@10.0.0
- **Node Version**: >=18
- Install with: `npm install -g pnpm@10.0.0`

---

## Technology Stack

### Desktop App (Mother Node)

- **Framework**: Tauri v2 (Rust backend + Web frontend)
- **Frontend**:
  - TanStack Start (React framework)
  - TanStack Router (Type-safe routing)
  - TanStack Table (Data tables)
- **UI Components**:
  - Radix UI primitives
  - Shadcn/ui components (customized)
  - Tailwind CSS v4
- **State Management**: Zustand
- **Database**: SQLite via @tauri-apps/plugin-sql
- **Build Tool**: Vite v7
- **Testing**: Vitest + Testing Library

### Mobile App (Satellite Node)

- **Framework**: React Native 0.81.5 + Expo 54
- **UI Components**: RN Primitives (React Native port of Radix UI)
- **Styling**: NativeWind (Tailwind for React Native)
- **Database**: @op-engineering/op-sqlite
- **Animations**: React Native Reanimated + Worklets

### Shared Packages

- **@uru/types**: Shared TypeScript type definitions exported from `packages/types`

---

## Code Organization Patterns

### Desktop App Structure (`apps/desktop/src/`)

```
src/
├── components/
│   ├── charts/              # Analytics and data visualization components
│   ├── shops/               # Shop-specific components
│   ├── sidebars/            # Navigation sidebars
│   ├── tables/              # Data table components
│   └── ui/                  # Reusable UI components (Shadcn-based)
├── hooks/                   # Custom React hooks
│   ├── use-local-storage.ts
│   ├── use-shops.ts
│   └── use-module-enabled.ts
├── lib/
│   └── db/
│       └── repositories/    # Database access layer (Repository pattern)
├── routes/                  # TanStack Router file-based routes
│   └── shops/$shopId/       # Shop-scoped routes
│       ├── products/
│       ├── customers/
│       ├── orders/
│       └── ...
├── stores/                  # Zustand state stores
│   └── shop-store.ts
└── router.tsx              # Router configuration
```

### Tauri Backend Structure (`apps/desktop/src-tauri/src/`)

```
src/
├── features/
│   └── analytics/
│       ├── commands/        # Tauri commands (exposed to frontend)
│       ├── services/        # Business logic layer
│       ├── repositories/    # Data access layer
│       ├── dtos/            # Data transfer objects
│       └── utils/           # Feature-specific utilities
├── migrations/              # Database migrations
└── lib.rs                   # Main Rust entry point
```

**Rust Architecture Pattern**: Features use a layered architecture:
- **Commands**: Frontend-facing API (Tauri commands)
- **Services**: Business logic and orchestration
- **Repositories**: Database queries and data access
- **DTOs**: Type-safe data structures for API responses

### Mobile App Structure (`apps/mobile/`)

```
apps/mobile/
├── src/                     # Main source code
├── components/              # React Native components
├── assets/                  # Images, fonts, etc.
└── index.js                # Entry point
```

---

## Database Layer

### Schema Principles

1. **UUIDs Only**: All primary keys are UUIDv4 (NEVER use auto-increment integers)
2. **Soft Deletes**: Use `deleted_at` timestamp instead of DELETE queries
3. **Timestamps**: Every table has `created_at` and `updated_at` for sync
4. **Immutable Logs**: Use `inventory_movements` for stock changes (append-only ledger)

### Key Tables

- `shops`: Multi-tenant shop configurations
- `products`: Product catalog
- `customers`: Customer records
- `orders`: Sales orders
- `transactions`: Financial transactions
- `transaction_items`: Order line items
- `inventory_levels`: Current stock levels per location
- `inventory_movements`: Immutable stock change log
- `checkouts`: POS checkout sessions
- `pos_sessions`: POS session tracking
- `payments`: Payment records
- `refunds`: Refund records
- `shipments`: Shipping records
- `reviews`: Product reviews
- `brands`: Product brands
- `categories`: Product categories
- `locations`: Warehouse/store locations

### Repository Pattern

All database access goes through repositories:

```typescript
// TypeScript (Frontend)
import { db } from '@/lib/db/client'

interface ProductsRepository {
  findAll(shopId: string): Promise<Product[]>
  findById(id: string): Promise<Product | null>
  create(data: CreateProductInput): Promise<Product>
  update(id: string, data: UpdateProductInput): Promise<Product>
  delete(id: string): Promise<void> // Soft delete
}
```

```rust
// Rust (Backend)
pub struct ProductsRepository {
    db: Database,
}

impl ProductsRepository {
    pub async fn find_all(&self, shop_id: &str) -> Result<Vec<Product>>
    pub async fn find_by_id(&self, id: &str) -> Result<Option<Product>>
    pub async fn create(&self, data: CreateProductDto) -> Result<Product>
}
```

**Never use raw SQL in components or commands**. Always use repositories.

---

## Routing Conventions (Desktop)

Uses **TanStack Router** with file-based routing:

### File Naming

- `routes/shops/index.tsx` → `/shops`
- `routes/shops/$shopId/products/index.tsx` → `/shops/{shopId}/products`
- `routes/shops/$shopId/products/$productId/edit.tsx` → `/shops/{shopId}/products/{productId}/edit`
- `routes/shops/$shopId/products/new.tsx` → `/shops/{shopId}/products/new`

### Route Parameters

```typescript
// In route file
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/shops/$shopId/products/$productId')({
  component: ProductDetail,
})

function ProductDetail() {
  const { shopId, productId } = Route.useParams()
  // ...
}
```

### Path Aliases

TypeScript paths are configured with `@/*` alias:

```typescript
import { Button } from '@/components/ui/button'
import { useShops } from '@/hooks/use-shops'
import { db } from '@/lib/db/client'
```

---

## Styling Conventions

### Tailwind CSS v4

- **Config**: `@tailwindcss/vite` plugin (no tailwind.config.js needed for v4)
- **Import**: Import Tailwind in your CSS: `@import "tailwindcss"`

### Component Styling

```typescript
// Use class-variance-authority (CVA) for variants
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
  }
)
```

### UI Components

- **Location**: `apps/desktop/src/components/ui/`
- **Pattern**: Based on Shadcn/ui but customized for the project
- **Usage**: Import from `@/components/ui/*`

**Do NOT modify ui/ components unless specifically requested**. They follow Shadcn conventions.

---

## State Management

### Zustand Stores

Located in `apps/desktop/src/stores/`:

```typescript
// shop-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ShopStore {
  selectedShopId: string | null
  setSelectedShopId: (id: string) => void
}

export const useShopStore = create<ShopStore>()(
  persist(
    (set) => ({
      selectedShopId: null,
      setSelectedShopId: (id) => set({ selectedShopId: id }),
    }),
    { name: 'shop-store' }
  )
)
```

### Custom Hooks

Located in `apps/desktop/src/hooks/`:

- `use-local-storage.ts`: LocalStorage wrapper
- `use-shops.ts`: Shop data fetching
- `use-shop.ts`: Single shop operations
- `use-module-enabled.ts`: Feature flag checking
- `use-mobile.ts`: Mobile view detection

---

## Testing

### Desktop App

- **Framework**: Vitest
- **Testing Library**: @testing-library/react
- **DOM Environment**: jsdom
- **Run Tests**: `pnpm test` (in apps/desktop)
- **Dev Mode**: `pnpm test --watch`

### Test File Conventions

- Place tests next to source files: `button.test.tsx` next to `button.tsx`
- Or use `__tests__/` directory in the same folder

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

---

## Development Workflows

### Common Commands

```bash
# Root level (monorepo)
pnpm dev                  # Run all apps in dev mode
pnpm dev:desktop         # Run only desktop app
pnpm dev:mobile          # Run only mobile app
pnpm build               # Build all apps
pnpm lint                # Lint all packages
pnpm format              # Format all files with Prettier
pnpm check-types         # Type-check all packages

# Desktop app (apps/desktop)
pnpm dev                 # Start Tauri dev mode (Rust + Vite)
pnpm dev:web             # Start only web UI (no Tauri)
pnpm build               # Build for production
pnpm test                # Run tests
pnpm lint                # ESLint
pnpm format              # Prettier

# Mobile app (apps/mobile)
pnpm start               # Start Expo dev server
pnpm android             # Run on Android
pnpm ios                 # Run on iOS
pnpm web                 # Run on web
pnpm lint                # Lint
```

### Development Setup

1. **Install pnpm**: `npm install -g pnpm@10.0.0`
2. **Install dependencies**: `pnpm install` (at root)
3. **Setup database**: `./setup_database_and_data.sh` (creates test data)
4. **Start dev server**: `pnpm dev:desktop` or `pnpm dev:mobile`

### TypeScript Compilation

- **Desktop**: `noEmit: true` (Vite handles transpilation)
- **Shared types**: Must be built with `pnpm build` in `packages/types`
- **Type checking**: `pnpm check-types` (uses `tsc --noEmit`)

---

## Code Quality Standards

### TypeScript Configuration

Strict mode is enabled:

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true,
  "noUncheckedSideEffectImports": true
}
```

**Key Rules**:
- No `any` types (use `unknown` if necessary)
- No unused variables or parameters
- All switch cases must have breaks or returns
- Explicit return types for public functions

### Linting

- **Tool**: ESLint v9 (Flat config)
- **Config**: `eslint.config.js`
- **Prettier**: Integrated with `eslint-config-prettier`

### Formatting

- **Tool**: Prettier
- **Plugin**: `prettier-plugin-tailwindcss` (sorts Tailwind classes)
- **Config**: `prettier.config.js`

---

## Important Conventions for AI Assistants

### Database Operations

❌ **NEVER** do this:
```typescript
await db.execute('UPDATE products SET quantity = 10 WHERE id = ?', [id])
```

✅ **ALWAYS** do this:
```typescript
await productsRepository.update(id, { quantity: 10 })
```

### UUID Generation

❌ **NEVER** use auto-increment IDs:
```sql
CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT, ...)
```

✅ **ALWAYS** use UUIDs:
```typescript
import { v4 as uuidv4 } from 'uuid'

const product = {
  id: uuidv4(),
  name: 'Product Name',
  // ...
}
```

### Deleting Records

❌ **NEVER** physically delete:
```typescript
await db.execute('DELETE FROM products WHERE id = ?', [id])
```

✅ **ALWAYS** soft delete:
```typescript
await productsRepository.delete(id) // Sets deleted_at timestamp
```

### Component Creation

When creating new components:

1. **Use TypeScript**: All files should be `.tsx` or `.ts`
2. **Export named components**: `export function MyComponent() {}`
3. **Use path aliases**: Import with `@/` prefix
4. **Follow Shadcn patterns**: For UI components, check existing `ui/` components
5. **Add prop types**: Use TypeScript interfaces

```typescript
// Good component structure
interface ProductCardProps {
  product: Product
  onSelect?: (id: string) => void
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{product.name}</h3>
      {/* ... */}
    </div>
  )
}
```

### Route Creation

When adding new routes:

1. **Follow file naming**: Use kebab-case for route segments
2. **Use `$` for params**: `$shopId`, `$productId`
3. **Create index.tsx for lists**: `products/index.tsx` for product list
4. **Create new.tsx for creation**: `products/new.tsx` for new product form
5. **Create $id/edit.tsx for editing**: `products/$productId/edit.tsx`

### Tauri Commands (Rust)

When creating Tauri commands:

1. **Use `#[tauri::command]` macro**
2. **Return `Result<T, String>`** for error handling
3. **Follow feature structure**: commands → services → repositories
4. **Use DTOs for responses**: Don't expose database models directly

```rust
#[tauri::command]
pub async fn get_products(
    shop_id: String,
    state: State<'_, AppState>
) -> Result<Vec<ProductDto>, String> {
    let service = AnalyticsService::new(state.db.clone());
    service.get_products(&shop_id)
        .await
        .map_err(|e| e.to_string())
}
```

### State Management

- **Global state**: Use Zustand stores
- **Server state**: Use TanStack Query (when implemented)
- **Local state**: Use `useState`
- **Persisted state**: Use Zustand with `persist` middleware or `use-local-storage` hook

### Error Handling

```typescript
// Frontend
try {
  const result = await invoke('get_products', { shopId })
  return result
} catch (error) {
  console.error('Failed to fetch products:', error)
  toast.error('Failed to load products')
  return []
}

// Backend (Rust)
pub async fn get_products(&self, shop_id: &str) -> Result<Vec<Product>> {
    self.repository
        .find_all(shop_id)
        .await
        .context("Failed to fetch products")
}
```

---

## Sync Protocol (Future Implementation)

The system is designed to support WatermelonDB-style sync protocol:

### mDNS Discovery

- **Service Name**: `_uru-http._tcp.local`
- **Port**: 3000 (default)
- **Discovery**: Mobile apps scan LAN for Mother Node

### Sync Endpoints

- `GET /api/v1/sync/pull?last_pulled_at={timestamp}`
- `POST /api/v1/sync/push` with changes payload

### Authentication

- PIN-based pairing on first connection
- JWT tokens for subsequent requests
- Token in header: `Authorization: Bearer <TOKEN>`

See `docs/NETWORK_PROTOCOL.md` for full specification.

---

## File Naming Conventions

### TypeScript/React Files

- **Components**: PascalCase - `ProductCard.tsx`
- **Hooks**: kebab-case with use- prefix - `use-products.ts`
- **Utilities**: kebab-case - `format-currency.ts`
- **Stores**: kebab-case with -store suffix - `shop-store.ts`
- **Types**: kebab-case - `product-types.ts`
- **Repositories**: kebab-case with -repository suffix - `products-repository.ts`

### Rust Files

- **All files**: snake_case - `analytics_repository.rs`
- **Modules**: snake_case - `mod.rs`

### Routes

- **Folders**: kebab-case - `pos-sessions/`
- **Files**: kebab-case - `index.tsx`, `new.tsx`, `$id/edit.tsx`
- **Parameters**: camelCase with `$` prefix - `$shopId`, `$productId`

---

## Common Patterns & Best Practices

### Data Fetching Pattern

```typescript
// Using a custom hook
export function useProducts(shopId: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const result = await invoke<Product[]>('get_products', { shopId })
        setProducts(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [shopId])

  return { products, loading, error }
}

// In component
function ProductList() {
  const { shopId } = Route.useParams()
  const { products, loading, error } = useProducts(shopId)

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### Form Handling Pattern

```typescript
function ProductForm({ onSubmit, initialData }: ProductFormProps) {
  const [formData, setFormData] = useState(initialData || {})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await onSubmit(formData)
      toast.success('Product saved successfully')
    } catch (error) {
      toast.error('Failed to save product')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### Table Pattern (TanStack Table)

```typescript
import { useReactTable, getCoreRowModel } from '@tanstack/react-table'

function ProductsTable({ data }: { data: Product[] }) {
  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
    },
    // ...
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <table>
      {/* Render table using table.getHeaderGroups(), table.getRowModel() */}
    </table>
  )
}
```

---

## Git Workflow

### Branch Naming

- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Refactoring: `refactor/description`

### Commit Messages

Follow conventional commits:

```
feat: add product search functionality
fix: resolve inventory sync issue
refactor: improve database query performance
docs: update API documentation
chore: update dependencies
test: add unit tests for ProductRepository
```

### Pull Requests

When creating PRs:
1. Ensure all tests pass
2. Run `pnpm format` and `pnpm lint`
3. Update relevant documentation
4. Add description of changes
5. Reference any related issues

---

## Documentation References

For detailed information, refer to these documents:

- **Architecture**: `docs/ARCHITECTURE.md` - System architecture and business rules
- **Database Schema**: `docs/DATABASE_SCHEMA.md` - Complete database schema and ER diagrams
- **Network Protocol**: `docs/NETWORK_PROTOCOL.md` - Sync protocol and API specification
- **README**: `README.md` - Project overview and vision

---

## Quick Tips for AI Assistants

1. **Always check existing patterns** before creating new ones
2. **Use repositories** for all database access, never raw SQL in components
3. **Follow TypeScript strict mode** - no `any` types
4. **Use path aliases** (`@/`) for imports
5. **Soft delete only** - never physically delete records
6. **UUIDs everywhere** - no auto-increment IDs
7. **Test your changes** - run `pnpm test` before committing
8. **Format code** - run `pnpm format` before committing
9. **Check types** - run `pnpm check-types` to ensure type safety
10. **Follow file naming conventions** - kebab-case for files, PascalCase for components

---

## When in Doubt

1. **Check existing code** - Look for similar implementations in the codebase
2. **Read the docs** - Refer to `docs/` folder for architecture decisions
3. **Ask questions** - If the requirement is unclear, ask for clarification
4. **Keep it simple** - Don't over-engineer solutions
5. **Follow conventions** - Consistency is more important than cleverness

---

**Last Updated**: 2026-01-23
**Version**: 1.0.0
