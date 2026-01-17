# Queries SQL Analíticas para Gráficos

Este documento contém queries SQL analíticas otimizadas para SQLite, considerando as capacidades de Window Functions e funções analíticas disponíveis desde a versão 3.25.0.

## Índice de Gráficos

- [Area Chart](#area-chart) - Dados acumulados ao longo do tempo
- [Bar Chart](#bar-chart) - Comparação de categorias/grupos
- [Line Chart](#line-chart) - Tendências temporais
- [Pie Chart](#pie-chart) - Distribuição percentual
- [Radar Chart](#radar-chart) - Comparação de múltiplas métricas
- [Radial Chart](#radial-chart) - Progresso/Metas

---

## Area Chart

### 1. Receita Acumulada por Dia (com Múltiplas Séries: Vendas vs Devoluções) ✅ CONCLUÍDO

```sql
-- Receita diária acumulada, separando vendas pagas e devoluções
SELECT 
    DATE(created_at) AS date,
    SUM(SUM(CASE WHEN payment_status = 'paid' THEN total_price ELSE 0 END)) 
        OVER (ORDER BY DATE(created_at)) AS cumulative_revenue,
    SUM(SUM(CASE WHEN payment_status = 'paid' THEN total_price ELSE 0 END)) 
        OVER () AS total_revenue,
    SUM(CASE WHEN payment_status = 'paid' THEN total_price ELSE 0 END) AS daily_revenue,
    SUM(CASE WHEN status = 'cancelled' THEN total_price ELSE 0 END) AS daily_refunds
FROM orders
WHERE _status != 'deleted'
  AND created_at >= date('now', '-90 days')
GROUP BY DATE(created_at)
ORDER BY date ASC;
```

### 2. Vendas e Estoque Movimentado ao Longo do Tempo (Stacked Area) ✅ CONCLUÍDO

```sql
-- Movimentações de estoque (entrada vs saída) acumuladas
SELECT 
    DATE(created_at) AS date,
    SUM(SUM(CASE WHEN type = 'in' THEN quantity ELSE 0 END)) 
        OVER (ORDER BY DATE(created_at)) AS cumulative_stock_in,
    SUM(SUM(CASE WHEN type = 'out' THEN quantity ELSE 0 END)) 
        OVER (ORDER BY DATE(created_at)) AS cumulative_stock_out,
    SUM(CASE WHEN type = 'in' THEN quantity ELSE 0 END) AS daily_stock_in,
    SUM(CASE WHEN type = 'out' THEN quantity ELSE 0 END) AS daily_stock_out
FROM inventory_movements
WHERE _status != 'deleted'
  AND created_at >= date('now', '-90 days')
GROUP BY DATE(created_at)
ORDER BY date ASC;
```

### 3. Receita por Método de Pagamento ao Longo do Tempo ✅ CONCLUÍDO

```sql
-- Receita diária por método de pagamento (Pix, Cartão, etc.)
SELECT 
    DATE(p.created_at) AS date,
    p.method AS payment_method,
    SUM(p.amount) AS daily_amount,
    SUM(SUM(p.amount)) OVER (
        PARTITION BY p.method 
        ORDER BY DATE(p.created_at)
    ) AS cumulative_amount_by_method
FROM payments p
INNER JOIN transactions t ON t.id = p.transaction_id
WHERE p.status = 'captured'
  AND p._status != 'deleted'
  AND p.created_at >= date('now', '-90 days')
GROUP BY DATE(p.created_at), p.method
ORDER BY date ASC, payment_method;
```

---

## Bar Chart

### 4. Top 10 Produtos Mais Vendidos (por Quantidade) ✅ CONCLUÍDO

```sql
-- Produtos mais vendidos nos últimos 30 dias
SELECT 
    ti.product_id,
    COALESCE(ti.name_snapshot, p.name) AS product_name,
    SUM(ti.quantity) AS total_quantity,
    SUM(ti.total_line) AS total_revenue,
    COUNT(DISTINCT t.id) AS order_count
FROM transaction_items ti
LEFT JOIN products p ON p.id = ti.product_id
INNER JOIN transactions t ON t.id = ti.transaction_id
WHERE t.type = 'sale'
  AND t.status = 'completed'
  AND t._status != 'deleted'
  AND t.created_at >= date('now', '-30 days')
GROUP BY ti.product_id, COALESCE(ti.name_snapshot, p.name)
ORDER BY total_quantity DESC
LIMIT 10;
```

### 5. Receita por Categoria ✅ CONCLUÍDO

```sql
-- Receita total por categoria
SELECT 
    c.name AS category_name,
    SUM(ti.total_line) AS total_revenue,
    COUNT(DISTINCT ti.product_id) AS product_count,
    COUNT(DISTINCT t.id) AS order_count
FROM transaction_items ti
INNER JOIN transactions t ON t.id = ti.transaction_id
INNER JOIN products p ON p.id = ti.product_id
INNER JOIN product_categories pc ON pc.product_id = p.id
INNER JOIN categories c ON c.id = pc.category_id
WHERE t.type = 'sale'
  AND t.status = 'completed'
  AND t._status != 'deleted'
GROUP BY c.id, c.name
ORDER BY total_revenue DESC;
```

### 6. Vendas Mensais (Últimos 12 Meses) ✅ CONCLUÍDO

```sql
-- Receita mensal dos últimos 12 meses
SELECT 
    strftime('%Y-%m', created_at) AS month,
    SUM(total_price) AS monthly_revenue,
    COUNT(*) AS order_count,
    AVG(total_price) AS avg_order_value
FROM orders
WHERE payment_status = 'paid'
  AND _status != 'deleted'
  AND created_at >= date('now', '-12 months')
GROUP BY strftime('%Y-%m', created_at)
ORDER BY month ASC;
```

### 7. Produtos por Status de Estoque (Baixo, Médio, Alto) ✅ CONCLUÍDO

```sql
-- Classificação de produtos por nível de estoque
SELECT 
    CASE 
        WHEN SUM(il.quantity_on_hand) = 0 THEN 'Out of Stock'
        WHEN SUM(il.quantity_on_hand) < 10 THEN 'Low Stock'
        WHEN SUM(il.quantity_on_hand) < 50 THEN 'Medium Stock'
        ELSE 'High Stock'
    END AS stock_status,
    COUNT(DISTINCT il.product_id) AS product_count,
    SUM(il.quantity_on_hand) AS total_quantity
FROM inventory_levels il
INNER JOIN products p ON p.id = il.product_id
WHERE il._status != 'deleted'
  AND il.stock_status = 'sellable'
GROUP BY 
    CASE 
        WHEN SUM(il.quantity_on_hand) = 0 THEN 'Out of Stock'
        WHEN SUM(il.quantity_on_hand) < 10 THEN 'Low Stock'
        WHEN SUM(il.quantity_on_hand) < 50 THEN 'Medium Stock'
        ELSE 'High Stock'
    END
ORDER BY 
    CASE stock_status
        WHEN 'Out of Stock' THEN 1
        WHEN 'Low Stock' THEN 2
        WHEN 'Medium Stock' THEN 3
        ELSE 4
    END;
```

---

## Line Chart

### 8. Tendência de Vendas Diárias (com Média Móvel de 7 dias) ✅ CONCLUÍDO

```sql
-- Vendas diárias com média móvel de 7 dias usando window functions
SELECT 
    DATE(created_at) AS date,
    COUNT(*) AS daily_orders,
    SUM(total_price) AS daily_revenue,
    AVG(SUM(total_price)) OVER (
        ORDER BY DATE(created_at) 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS moving_avg_7d_revenue,
    AVG(COUNT(*)) OVER (
        ORDER BY DATE(created_at) 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) AS moving_avg_7d_orders
FROM orders
WHERE payment_status = 'paid'
  AND _status != 'deleted'
  AND created_at >= date('now', '-90 days')
GROUP BY DATE(created_at)
ORDER BY date ASC;
```

### 9. Crescimento de Clientes ao Longo do Tempo ✅ CONCLUÍDO

```sql
-- Novos clientes por mês e crescimento acumulado
SELECT 
    strftime('%Y-%m', created_at) AS month,
    COUNT(*) AS new_customers,
    SUM(COUNT(*)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS cumulative_customers,
    LAG(COUNT(*)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS previous_month,
    ROUND(
        (COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY strftime('%Y-%m', created_at))) * 100.0 
        / NULLIF(LAG(COUNT(*)) OVER (ORDER BY strftime('%Y-%m', created_at)), 0),
        2
    ) AS growth_percentage
FROM customers
WHERE _status != 'deleted'
  AND created_at >= date('now', '-24 months')
GROUP BY strftime('%Y-%m', created_at)
ORDER BY month ASC;
```

### 10. Ticket Médio ao Longo do Tempo ✅ CONCLUÍDO

```sql
-- Ticket médio (AOV - Average Order Value) por mês
SELECT 
    strftime('%Y-%m', created_at) AS month,
    COUNT(*) AS order_count,
    AVG(total_price) AS avg_order_value,
    LAG(AVG(total_price)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS previous_avg,
    ROUND(
        (AVG(total_price) - LAG(AVG(total_price)) OVER (ORDER BY strftime('%Y-%m', created_at))) * 100.0
        / NULLIF(LAG(AVG(total_price)) OVER (ORDER BY strftime('%Y-%m', created_at)), 0),
        2
    ) AS avg_change_percentage
FROM orders
WHERE payment_status = 'paid'
  AND _status != 'deleted'
  AND created_at >= date('now', '-12 months')
GROUP BY strftime('%Y-%m', created_at)
ORDER BY month ASC;
```

---

## Pie Chart

### 11. Distribuição de Vendas por Método de Pagamento ✅ CONCLUÍDO

```sql
-- Percentual de vendas por método de pagamento
SELECT 
    p.method AS payment_method,
    SUM(p.amount) AS total_amount,
    COUNT(*) AS transaction_count,
    ROUND(
        SUM(p.amount) * 100.0 / SUM(SUM(p.amount)) OVER (),
        2
    ) AS percentage
FROM payments p
INNER JOIN transactions t ON t.id = p.transaction_id
WHERE p.status = 'captured'
  AND p._status != 'deleted'
  AND p.created_at >= date('now', '-30 days')
GROUP BY p.method
ORDER BY total_amount DESC;
```

### 12. Distribuição de Produtos por Categoria ✅ CONCLUÍDO

```sql
-- Quantidade de produtos por categoria
SELECT 
    c.name AS category_name,
    COUNT(DISTINCT pc.product_id) AS product_count,
    ROUND(
        COUNT(DISTINCT pc.product_id) * 100.0 / SUM(COUNT(DISTINCT pc.product_id)) OVER (),
        2
    ) AS percentage
FROM product_categories pc
INNER JOIN categories c ON c.id = pc.category_id
INNER JOIN products p ON p.id = pc.product_id
WHERE p._status != 'deleted'
GROUP BY c.id, c.name
ORDER BY product_count DESC;
```

### 13. Distribuição de Pedidos por Status ✅ CONCLUÍDO

```sql
-- Pedidos por status de pagamento
SELECT 
    payment_status,
    COUNT(*) AS order_count,
    SUM(total_price) AS total_revenue,
    ROUND(
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (),
        2
    ) AS order_percentage,
    ROUND(
        SUM(total_price) * 100.0 / SUM(SUM(total_price)) OVER (),
        2
    ) AS revenue_percentage
FROM orders
WHERE _status != 'deleted'
  AND created_at >= date('now', '-30 days')
GROUP BY payment_status
ORDER BY order_count DESC;
```

### 14. Distribuição de Clientes por Grupo ✅ CONCLUÍDO

```sql
-- Clientes por grupo de cliente
SELECT 
    COALESCE(cg.name, 'Sem Grupo') AS group_name,
    COUNT(DISTINCT cgm.customer_id) AS customer_count,
    ROUND(
        COUNT(DISTINCT cgm.customer_id) * 100.0 / 
        NULLIF(SUM(COUNT(DISTINCT cgm.customer_id)) OVER (), 0),
        2
    ) AS percentage
FROM customer_group_memberships cgm
INNER JOIN customer_groups cg ON cg.id = cgm.customer_group_id
INNER JOIN customers c ON c.id = cgm.customer_id
WHERE c._status != 'deleted'
GROUP BY cg.id, COALESCE(cg.name, 'Sem Grupo')
ORDER BY customer_count DESC;
```

---

## Radar Chart

### 15. Métricas de Performance por Mês (Vendas, Receita, Clientes, Estoque) ✅ CONCLUÍDO

```sql
-- Múltiplas métricas normalizadas para radar chart
-- Cada métrica é normalizada de 0 a 100 baseada no máximo do período
WITH monthly_metrics AS (
    SELECT 
        strftime('%Y-%m', o.created_at) AS month,
        COUNT(DISTINCT o.id) AS orders,
        SUM(o.total_price) AS revenue,
        COUNT(DISTINCT o.customer_id) AS customers,
        SUM(CASE WHEN im.type = 'out' THEN im.quantity ELSE 0 END) AS stock_sold
    FROM orders o
    LEFT JOIN transactions t ON t.id = (
        SELECT id FROM transactions 
        WHERE type = 'sale' AND _status != 'deleted' 
        ORDER BY created_at DESC LIMIT 1
    )
    LEFT JOIN inventory_movements im ON im.transaction_id = t.id
    WHERE o._status != 'deleted'
      AND o.created_at >= date('now', '-12 months')
    GROUP BY strftime('%Y-%m', o.created_at)
),
normalized AS (
    SELECT 
        month,
        ROUND(
            (orders * 100.0 / MAX(orders) OVER ()),
            2
        ) AS normalized_orders,
        ROUND(
            (revenue * 100.0 / MAX(revenue) OVER ()),
            2
        ) AS normalized_revenue,
        ROUND(
            (customers * 100.0 / MAX(customers) OVER ()),
            2
        ) AS normalized_customers,
        ROUND(
            (stock_sold * 100.0 / NULLIF(MAX(stock_sold) OVER (), 0)),
            2
        ) AS normalized_stock_sold
    FROM monthly_metrics
)
SELECT * FROM normalized ORDER BY month ASC;
```

### 16. Métricas por Produto (Vendas, Receita, Margem, Estoque) ✅ CONCLUÍDO

```sql
-- Métricas normalizadas por produto para radar chart
WITH product_metrics AS (
    SELECT 
        p.id,
        COALESCE(ti.name_snapshot, p.name) AS product_name,
        SUM(ti.quantity) AS total_quantity_sold,
        SUM(ti.total_line) AS total_revenue,
        SUM((ti.unit_price - COALESCE(ti.unit_cost, 0)) * ti.quantity) AS total_margin,
        COALESCE(SUM(il.quantity_on_hand), 0) AS current_stock
    FROM products p
    LEFT JOIN transaction_items ti ON ti.product_id = p.id
    LEFT JOIN transactions t ON t.id = ti.transaction_id AND t.type = 'sale'
    LEFT JOIN inventory_levels il ON il.product_id = p.id AND il._status != 'deleted'
    WHERE p._status != 'deleted'
      AND (t.created_at >= date('now', '-30 days') OR t.created_at IS NULL)
    GROUP BY p.id, COALESCE(ti.name_snapshot, p.name)
    HAVING total_quantity_sold > 0
    LIMIT 10
)
SELECT 
    product_name,
    ROUND(total_quantity_sold * 100.0 / MAX(total_quantity_sold) OVER (), 2) AS normalized_quantity,
    ROUND(total_revenue * 100.0 / MAX(total_revenue) OVER (), 2) AS normalized_revenue,
    ROUND(total_margin * 100.0 / NULLIF(MAX(total_margin) OVER (), 0), 2) AS normalized_margin,
    ROUND(current_stock * 100.0 / NULLIF(MAX(current_stock) OVER (), 0), 2) AS normalized_stock
FROM product_metrics
ORDER BY total_revenue DESC;
```

---

## Radial Chart

### 17. Progresso de Meta de Vendas Mensal ✅ CONCLUÍDO

```sql
-- Progresso para meta de vendas do mês atual
-- Assumindo uma meta de R$ 100.000,00 (ajustar conforme necessário)
WITH monthly_target AS (
    SELECT 
        SUM(total_price) AS current_revenue,
        100000.0 AS target_revenue  -- Meta em reais
    FROM orders
    WHERE payment_status = 'paid'
      AND _status != 'deleted'
      AND strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')
)
SELECT 
    current_revenue,
    target_revenue,
    ROUND(
        (current_revenue * 100.0 / target_revenue),
        2
    ) AS progress_percentage,
    ROUND(target_revenue - current_revenue, 2) AS remaining
FROM monthly_target;
```

### 18. Taxa de Conversão de Carrinhos para Pedidos ✅ CONCLUÍDO

```sql
-- Taxa de conversão de checkouts para orders
WITH conversion_metrics AS (
    SELECT 
        COUNT(DISTINCT c.id) AS total_checkouts,
        COUNT(DISTINCT o.id) AS completed_orders
    FROM checkouts c
    LEFT JOIN orders o ON o.created_at >= c.created_at 
        AND o.created_at <= datetime(c.created_at, '+1 day')
        AND o._status != 'deleted'
    WHERE c._status != 'deleted'
      AND c.created_at >= date('now', '-30 days')
)
SELECT 
    total_checkouts,
    completed_orders,
    ROUND(
        (completed_orders * 100.0 / NULLIF(total_checkouts, 0)),
        2
    ) AS conversion_rate
FROM conversion_metrics;
```

### 19. Percentual de Estoque Ocupado (Capacidade) ✅ CONCLUÍDO

```sql
-- Percentual de estoque utilizado (baseado em um limite teórico)
-- Ajustar capacity_limit conforme necessário
WITH inventory_capacity AS (
    SELECT 
        SUM(il.quantity_on_hand) AS current_stock,
        10000.0 AS capacity_limit  -- Capacidade máxima teórica
    FROM inventory_levels il
    WHERE il._status != 'deleted'
      AND il.stock_status = 'sellable'
)
SELECT 
    current_stock,
    capacity_limit,
    ROUND(
        (current_stock * 100.0 / capacity_limit),
        2
    ) AS usage_percentage
FROM inventory_capacity;
```

---

## Queries Avançadas com Window Functions

### 20. Ranking de Produtos com Percentil ✅ CONCLUÍDO

```sql
-- Ranking de produtos com percentil de vendas
SELECT 
    COALESCE(ti.name_snapshot, p.name) AS product_name,
    SUM(ti.total_line) AS total_revenue,
    RANK() OVER (ORDER BY SUM(ti.total_line) DESC) AS revenue_rank,
    ROUND(
        PERCENT_RANK() OVER (ORDER BY SUM(ti.total_line)) * 100,
        2
    ) AS revenue_percentile
FROM transaction_items ti
LEFT JOIN products p ON p.id = ti.product_id
INNER JOIN transactions t ON t.id = ti.transaction_id
WHERE t.type = 'sale'
  AND t.status = 'completed'
  AND t._status != 'deleted'
  AND t.created_at >= date('now', '-30 days')
GROUP BY ti.product_id, COALESCE(ti.name_snapshot, p.name)
ORDER BY total_revenue DESC
LIMIT 20;
```

### 21. Comparação Mês a Mês (MoM - Month over Month) ✅ CONCLUÍDO

```sql
-- Crescimento mês a mês usando LAG
SELECT 
    strftime('%Y-%m', created_at) AS month,
    SUM(total_price) AS monthly_revenue,
    LAG(SUM(total_price)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS previous_month_revenue,
    ROUND(
        ((SUM(total_price) - LAG(SUM(total_price)) OVER (ORDER BY strftime('%Y-%m', created_at))) * 100.0)
        / NULLIF(LAG(SUM(total_price)) OVER (ORDER BY strftime('%Y-%m', created_at)), 0),
        2
    ) AS mom_growth_percentage
FROM orders
WHERE payment_status = 'paid'
  AND _status != 'deleted'
  AND created_at >= date('now', '-12 months')
GROUP BY strftime('%Y-%m', created_at)
ORDER BY month ASC;
```

### 22. Vendas Acumuladas por Período (YTD - Year to Date) ✅ CONCLUÍDO

```sql
-- Vendas acumuladas do ano (YTD)
SELECT 
    strftime('%Y-%m', created_at) AS month,
    SUM(total_price) AS monthly_revenue,
    SUM(SUM(total_price)) OVER (
        PARTITION BY strftime('%Y', created_at)
        ORDER BY strftime('%Y-%m', created_at)
    ) AS ytd_revenue,
    COUNT(*) AS monthly_orders,
    SUM(COUNT(*)) OVER (
        PARTITION BY strftime('%Y', created_at)
        ORDER BY strftime('%Y-%m', created_at)
    ) AS ytd_orders
FROM orders
WHERE payment_status = 'paid'
  AND _status != 'deleted'
  AND strftime('%Y', created_at) = strftime('%Y', 'now')
GROUP BY strftime('%Y-%m', created_at)
ORDER BY month ASC;
```

---

## Notas Importantes

### Performance
- SQLite funciona bem com índices em colunas frequentemente filtradas (`created_at`, `status`, `type`)
- Para queries com muitas joins, considere criar índices compostos
- Window functions são eficientes em SQLite, mas evite em tabelas muito grandes sem índices

### Compatibilidade
- Todas as queries assumem SQLite 3.25.0 ou superior
- Funções de data (`date()`, `strftime()`) são específicas do SQLite
- Para PostgreSQL, ajustar funções de data (`DATE_TRUNC`, `TO_CHAR`)

### Parametrização
- Todas as queries devem usar bind parameters (ex: `$1`, `?`) para datas e limites
- Evitar SQL injection usando sempre prepared statements

### Normalização para Gráficos
- Queries de Radar Chart normalizam valores de 0-100 para comparação visual
- Queries de Radial Chart retornam percentuais de 0-100 para progresso circular
