# Data Grid Implementation Guide

This document outlines the standard implementation and patterns used for data grids (data tables) across the Inventy desktop application.

## Technology Stack

- **[TanStack Table (v8)](https://tanstack.com/table/v8)**: Headless UI for building powerful tables & datagrids.
- **Lucide React**: Icon library for visual indicators (sorting, columns, actions).
- **Shadcn UI Components**:
  - `Table`: Base table styling.
  - `Badge`: Visual status indicators.
  - `Button`: Interactive elements (sorting headers, pagination).
  - `DropdownMenu`: Column visibility and row actions.
  - `Input`: Search and filtering.
  - `Checkbox`: Row selection.

## Core Features

### 1. Sorting

All tables support multi-column sorting. Headers are interactive and toggle between `asc`, `desc`, and `none`.

- **Implementation**: Wrap header text in a `Button` with `variant="ghost"` and an `ArrowUpDown` icon.
- **Example**:
  ```tsx
  header: ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Column Name
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
  ```

### 2. Filtering

Global or column-specific filtering is implemented via the `Input` component.

- **Implementation**: Bound to `table.getColumn(name)?.setFilterValue()`.

### 3. Column Visibility

Users can customize which columns are visible using the "Customize Columns" dropdown.

- **Icon**: `Columns` from Lucide.
- **Label**: "Customize Columns".

### 4. Row Selection

Implemented using `Checkbox` components in the first column and header.

## Visual Patterns

### Badges (Status Icons)

Used for statuses (Inventory, Debtors) and movement types.

- **Common Variants**:
  - `secondary`: Neutral/In-stock/Income.
  - `outline`: Low-stock/Adjustment.
  - `destructive`: Out-of-stock/Blocked/Expense.

### Data Formatting

- **Dates**: Formatted using `date-fns` as `dd/MM/yy HH:mm`.
- **Currency**: Formatted using `Intl.NumberFormat` with `BRL` currency and `pt-BR` locale.

## Table Locations

- **Inventory**: `src/routes/inventory/index.tsx`
- **Debtors**: `src/routes/debtors/index.tsx`
- **Movements**: `src/routes/movements.tsx`
- **Transactions**: `src/routes/transactions/index.tsx`
