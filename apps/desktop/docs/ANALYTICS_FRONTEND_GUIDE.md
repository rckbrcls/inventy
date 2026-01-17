# Guia de Integração Frontend - Analytics e Gráficos

Este documento serve como tutorial para implementar os gráficos analíticos no frontend, mapeando cada query disponível para o tipo de gráfico correspondente.

## Índice

- [Area Chart](#area-chart)
- [Bar Chart](#bar-chart)
- [Line Chart](#line-chart)
- [Pie Chart](#pie-chart)
- [Radar Chart](#radar-chart)
- [Radial Chart](#radial-chart)
- [Queries Avançadas](#queries-avançadas)

---

## Area Chart

Gráficos de área são ideais para mostrar dados acumulados ao longo do tempo, especialmente quando há múltiplas séries de dados.

### Query 1: Receita Acumulada por Dia (com Múltiplas Séries: Vendas vs Devoluções)

**Comando Tauri:** `get_cumulative_revenue(days?: number)`

**Tipo de Gráfico:** Area Chart com múltiplas séries

**Dados Retornados:**
```typescript
interface CumulativeRevenueDto {
  date: string;                    // Data no formato YYYY-MM-DD
  cumulativeRevenue: number;        // Receita acumulada até a data
  totalRevenue: number;             // Receita total do período
  dailyRevenue: number;             // Receita do dia
  dailyRefunds: number;             // Devoluções do dia
}
```

**Uso no Frontend:**
- **Série 1:** `cumulativeRevenue` - linha de receita acumulada
- **Série 2:** `dailyRefunds` - área de devoluções (stacked)
- **Tooltip:** Mostrar `dailyRevenue` e `dailyRefunds` por data

**Exemplo de Implementação:**
```typescript
const data = await invoke('get_cumulative_revenue', { days: 90 });

// Série para receita acumulada
const revenueSeries = data.map(d => ({
  date: d.date,
  value: d.cumulativeRevenue
}));

// Série para devoluções (stacked)
const refundsSeries = data.map(d => ({
  date: d.date,
  value: d.dailyRefunds
}));
```

---

### Query 2: Vendas e Estoque Movimentado ao Longo do Tempo (Stacked Area)

**Comando Tauri:** `get_stock_movements_area(days?: number)`

**Tipo de Gráfico:** Stacked Area Chart

**Dados Retornados:**
```typescript
interface StockMovementsAreaDto {
  date: string;                    // Data no formato YYYY-MM-DD
  cumulativeStockIn: number;        // Estoque acumulado de entrada
  cumulativeStockOut: number;       // Estoque acumulado de saída
  dailyStockIn: number;            // Entrada do dia
  dailyStockOut: number;            // Saída do dia
}
```

**Uso no Frontend:**
- **Série 1:** `dailyStockIn` - área de entrada (verde)
- **Série 2:** `dailyStockOut` - área de saída (vermelho, stacked)
- **Tooltip:** Mostrar valores diários e acumulados

**Exemplo de Implementação:**
```typescript
const data = await invoke('get_stock_movements_area', { days: 90 });

// Área de entrada (stacked)
const stockInSeries = data.map(d => ({
  date: d.date,
  value: d.dailyStockIn
}));

// Área de saída (stacked)
const stockOutSeries = data.map(d => ({
  date: d.date,
  value: d.dailyStockOut
}));
```

---

### Query 3: Receita por Método de Pagamento ao Longo do Tempo

**Comando Tauri:** `get_revenue_by_payment_method(days?: number)`

**Tipo de Gráfico:** Area Chart com múltiplas séries (uma por método de pagamento)

**Dados Retornados:**
```typescript
interface RevenueByPaymentMethodDto {
  date: string;                    // Data no formato YYYY-MM-DD
  paymentMethod: string;           // Método de pagamento (pix, credit_card, etc)
  dailyAmount: number;             // Valor diário por método
  cumulativeAmountByMethod: number; // Valor acumulado por método
}
```

**Uso no Frontend:**
- **Múltiplas Séries:** Uma série para cada `paymentMethod` único
- **Valor:** Usar `dailyAmount` ou `cumulativeAmountByMethod` dependendo da visualização
- **Cores:** Atribuir cores diferentes para cada método de pagamento

**Exemplo de Implementação:**
```typescript
const data = await invoke('get_revenue_by_payment_method', { days: 90 });

// Agrupar por método de pagamento
const methods = [...new Set(data.map(d => d.paymentMethod))];

const series = methods.map(method => ({
  name: method,
  data: data
    .filter(d => d.paymentMethod === method)
    .map(d => ({
      date: d.date,
      value: d.cumulativeAmountByMethod
    }))
}));
```

---

## Bar Chart

Gráficos de barras são ideais para comparações entre categorias, grupos ou períodos.

### Query 4: Top 10 Produtos Mais Vendidos (por Quantidade)

**Comando Tauri:** `get_top_products(days?: number, limit?: number)`

**Tipo de Gráfico:** Horizontal Bar Chart ou Vertical Bar Chart

**Dados Retornados:**
```typescript
interface TopProductDto {
  productId: string;               // ID do produto
  productName: string;              // Nome do produto
  totalQuantity: number;            // Quantidade total vendida
  totalRevenue: number;            // Receita total
  orderCount: number;               // Número de pedidos
}
```

**Uso no Frontend:**
- **Eixo X:** `productName`
- **Eixo Y:** `totalQuantity` (ou `totalRevenue` para outra visualização)
- **Tooltip:** Mostrar `totalRevenue`, `orderCount` e `totalQuantity`

**Exemplo de Implementação:**
```typescript
const data = await invoke('get_top_products', { days: 30, limit: 10 });

const chartData = data.map(product => ({
  name: product.productName,
  quantity: product.totalQuantity,
  revenue: product.totalRevenue,
  orders: product.orderCount
}));
```

---

### Query 5: Receita por Categoria

**Comando Tauri:** `get_revenue_by_category()`

**Tipo de Gráfico:** Vertical Bar Chart

**Dados Retornados:**
```typescript
interface RevenueByCategoryDto {
  categoryName: string;            // Nome da categoria
  totalRevenue: number;            // Receita total
  productCount: number;             // Quantidade de produtos
  orderCount: number;               // Quantidade de pedidos
}
```

**Uso no Frontend:**
- **Eixo X:** `categoryName`
- **Eixo Y:** `totalRevenue`
- **Tooltip:** Mostrar `productCount` e `orderCount`

---

### Query 6: Vendas Mensais (Últimos 12 Meses)

**Comando Tauri:** `get_monthly_sales(months?: number)`

**Tipo de Gráfico:** Vertical Bar Chart

**Dados Retornados:**
```typescript
interface MonthlySalesDto {
  month: string;                   // Mês no formato YYYY-MM
  monthlyRevenue: number;          // Receita mensal
  orderCount: number;              // Quantidade de pedidos
  avgOrderValue: number;           // Ticket médio
}
```

**Uso no Frontend:**
- **Eixo X:** `month` (formatar para exibição: "Jan 2024")
- **Eixo Y:** `monthlyRevenue`
- **Tooltip:** Mostrar `orderCount` e `avgOrderValue`

---

### Query 7: Produtos por Status de Estoque (Baixo, Médio, Alto)

**Comando Tauri:** `get_stock_status()`

**Tipo de Gráfico:** Vertical Bar Chart ou Horizontal Bar Chart

**Dados Retornados:**
```typescript
interface StockStatusDto {
  stockStatus: string;             // "Out of Stock", "Low Stock", "Medium Stock", "High Stock"
  productCount: number;            // Quantidade de produtos
  totalQuantity: number;           // Quantidade total em estoque
}
```

**Uso no Frontend:**
- **Eixo X:** `stockStatus`
- **Eixo Y:** `productCount`
- **Cores:** 
  - "Out of Stock" → Vermelho
  - "Low Stock" → Laranja
  - "Medium Stock" → Amarelo
  - "High Stock" → Verde

---

## Line Chart

Gráficos de linha são ideais para mostrar tendências temporais e comparações ao longo do tempo.

### Query 8: Tendência de Vendas Diárias (com Média Móvel de 7 dias)

**Comando Tauri:** `get_daily_sales_trend(days?: number)`

**Tipo de Gráfico:** Line Chart com múltiplas linhas

**Dados Retornados:**
```typescript
interface DailySalesTrendDto {
  date: string;                    // Data no formato YYYY-MM-DD
  dailyOrders: number;             // Pedidos do dia
  dailyRevenue: number;            // Receita do dia
  movingAvg7dRevenue?: number;    // Média móvel de 7 dias (receita)
  movingAvg7dOrders?: number;      // Média móvel de 7 dias (pedidos)
}
```

**Uso no Frontend:**
- **Linha 1:** `dailyRevenue` - receita diária (linha sólida)
- **Linha 2:** `movingAvg7dRevenue` - média móvel (linha tracejada)
- **Tooltip:** Mostrar valores diários e médias móveis

**Exemplo de Implementação:**
```typescript
const data = await invoke('get_daily_sales_trend', { days: 90 });

const revenueLine = data.map(d => ({
  date: d.date,
  value: d.dailyRevenue
}));

const movingAvgLine = data
  .filter(d => d.movingAvg7dRevenue !== null)
  .map(d => ({
    date: d.date,
    value: d.movingAvg7dRevenue
  }));
```

---

### Query 9: Crescimento de Clientes ao Longo do Tempo

**Comando Tauri:** `get_customer_growth(months?: number)`

**Tipo de Gráfico:** Line Chart com área preenchida

**Dados Retornados:**
```typescript
interface CustomerGrowthDto {
  month: string;                   // Mês no formato YYYY-MM
  newCustomers: number;            // Novos clientes no mês
  cumulativeCustomers: number;    // Clientes acumulados
  previousMonth?: number;          // Clientes do mês anterior
  growthPercentage?: number;       // Percentual de crescimento
}
```

**Uso no Frontend:**
- **Linha Principal:** `cumulativeCustomers` - crescimento acumulado
- **Área Preenchida:** `newCustomers` - novos clientes por mês
- **Tooltip:** Mostrar `growthPercentage` e `newCustomers`

---

### Query 10: Ticket Médio ao Longo do Tempo

**Comando Tauri:** `get_average_order_value(months?: number)`

**Tipo de Gráfico:** Line Chart

**Dados Retornados:**
```typescript
interface AverageOrderValueDto {
  month: string;                   // Mês no formato YYYY-MM
  orderCount: number;              // Quantidade de pedidos
  avgOrderValue: number;            // Ticket médio
  previousAvg?: number;             // Ticket médio do mês anterior
  avgChangePercentage?: number;     // Percentual de mudança
}
```

**Uso no Frontend:**
- **Linha:** `avgOrderValue` - evolução do ticket médio
- **Tooltip:** Mostrar `avgChangePercentage` e `orderCount`
- **Indicadores:** Destacar meses com crescimento positivo/negativo

---

## Pie Chart

Gráficos de pizza são ideais para mostrar distribuições percentuais e proporções.

### Query 11: Distribuição de Vendas por Método de Pagamento

**Comando Tauri:** `get_payment_method_distribution(days?: number)`

**Tipo de Gráfico:** Pie Chart ou Donut Chart

**Dados Retornados:**
```typescript
interface PaymentMethodDistributionDto {
  paymentMethod: string;           // Método de pagamento
  totalAmount: number;             // Valor total
  transactionCount: number;        // Quantidade de transações
  percentage: number;              // Percentual (0-100)
}
```

**Uso no Frontend:**
- **Valor:** `totalAmount` ou `percentage`
- **Label:** `paymentMethod`
- **Tooltip:** Mostrar `totalAmount`, `transactionCount` e `percentage`

---

### Query 12: Distribuição de Produtos por Categoria

**Comando Tauri:** `get_category_distribution()`

**Tipo de Gráfico:** Pie Chart ou Donut Chart

**Dados Retornados:**
```typescript
interface CategoryDistributionDto {
  categoryName: string;            // Nome da categoria
  productCount: number;             // Quantidade de produtos
  percentage: number;              // Percentual (0-100)
}
```

**Uso no Frontend:**
- **Valor:** `productCount` ou `percentage`
- **Label:** `categoryName`
- **Tooltip:** Mostrar `productCount` e `percentage`

---

### Query 13: Distribuição de Pedidos por Status

**Comando Tauri:** `get_order_status_distribution(days?: number)`

**Tipo de Gráfico:** Pie Chart ou Donut Chart

**Dados Retornados:**
```typescript
interface OrderStatusDistributionDto {
  paymentStatus: string;            // Status do pagamento
  orderCount: number;              // Quantidade de pedidos
  totalRevenue: number;             // Receita total
  orderPercentage: number;          // Percentual de pedidos (0-100)
  revenuePercentage: number;        // Percentual de receita (0-100)
}
```

**Uso no Frontend:**
- **Valor:** `orderCount` ou `orderPercentage`
- **Label:** `paymentStatus`
- **Tooltip:** Mostrar `totalRevenue` e ambos os percentuais
- **Cores:** Atribuir cores por status (paid: verde, pending: amarelo, etc)

---

### Query 14: Distribuição de Clientes por Grupo

**Comando Tauri:** `get_customer_group_distribution()`

**Tipo de Gráfico:** Pie Chart ou Donut Chart

**Dados Retornados:**
```typescript
interface CustomerGroupDistributionDto {
  groupName: string;               // Nome do grupo (ou "Sem Grupo")
  customerCount: number;            // Quantidade de clientes
  percentage: number;               // Percentual (0-100)
}
```

**Uso no Frontend:**
- **Valor:** `customerCount` ou `percentage`
- **Label:** `groupName`
- **Tooltip:** Mostrar `customerCount` e `percentage`

---

## Radar Chart

Gráficos de radar são ideais para comparar múltiplas métricas normalizadas em um único gráfico.

### Query 15: Métricas de Performance por Mês (Vendas, Receita, Clientes, Estoque)

**Comando Tauri:** `get_monthly_performance_metrics(months?: number)`

**Tipo de Gráfico:** Radar Chart (múltiplas séries, uma por mês)

**Dados Retornados:**
```typescript
interface MonthlyPerformanceMetricsDto {
  month: string;                    // Mês no formato YYYY-MM
  normalizedOrders: number;         // Pedidos normalizados (0-100)
  normalizedRevenue: number;        // Receita normalizada (0-100)
  normalizedCustomers: number;      // Clientes normalizados (0-100)
  normalizedStockSold: number;      // Estoque vendido normalizado (0-100)
}
```

**Uso no Frontend:**
- **Eixos do Radar:**
  1. Pedidos (`normalizedOrders`)
  2. Receita (`normalizedRevenue`)
  3. Clientes (`normalizedCustomers`)
  4. Estoque Vendido (`normalizedStockSold`)
- **Séries:** Uma série para cada mês (ou comparar meses selecionados)
- **Valores:** Todos já estão normalizados de 0-100

**Exemplo de Implementação:**
```typescript
const data = await invoke('get_monthly_performance_metrics', { months: 12 });

// Selecionar últimos 3 meses para comparação
const last3Months = data.slice(-3);

const radarData = last3Months.map(month => ({
  month: month.month,
  metrics: [
    { name: 'Pedidos', value: month.normalizedOrders },
    { name: 'Receita', value: month.normalizedRevenue },
    { name: 'Clientes', value: month.normalizedCustomers },
    { name: 'Estoque', value: month.normalizedStockSold }
  ]
}));
```

---

### Query 16: Métricas por Produto (Vendas, Receita, Margem, Estoque)

**Comando Tauri:** `get_product_metrics(days?: number, limit?: number)`

**Tipo de Gráfico:** Radar Chart (múltiplas séries, uma por produto)

**Dados Retornados:**
```typescript
interface ProductMetricsDto {
  productName: string;             // Nome do produto
  normalizedQuantity: number;      // Quantidade vendida normalizada (0-100)
  normalizedRevenue: number;        // Receita normalizada (0-100)
  normalizedMargin: number;         // Margem normalizada (0-100)
  normalizedStock: number;          // Estoque normalizado (0-100)
}
```

**Uso no Frontend:**
- **Eixos do Radar:**
  1. Quantidade (`normalizedQuantity`)
  2. Receita (`normalizedRevenue`)
  3. Margem (`normalizedMargin`)
  4. Estoque (`normalizedStock`)
- **Séries:** Uma série para cada produto (top 5-10 produtos)
- **Valores:** Todos já estão normalizados de 0-100

**Exemplo de Implementação:**
```typescript
const data = await invoke('get_product_metrics', { days: 30, limit: 5 });

const radarData = data.map(product => ({
  name: product.productName,
  metrics: [
    { name: 'Quantidade', value: product.normalizedQuantity },
    { name: 'Receita', value: product.normalizedRevenue },
    { name: 'Margem', value: product.normalizedMargin },
    { name: 'Estoque', value: product.normalizedStock }
  ]
}));
```

---

## Radial Chart

Gráficos radiais são ideais para mostrar progresso, percentuais e metas.

### Query 17: Progresso de Meta de Vendas Mensal

**Comando Tauri:** `get_monthly_sales_progress(targetRevenue?: number)`

**Tipo de Gráfico:** Radial Progress Chart (Gauge/Donut)

**Dados Retornados:**
```typescript
interface MonthlySalesProgressDto {
  currentRevenue: number;           // Receita atual do mês
  targetRevenue: number;             // Meta de receita
  progressPercentage: number;       // Percentual de progresso (0-100+)
  remaining: number;                 // Valor restante para atingir a meta
}
```

**Uso no Frontend:**
- **Valor Principal:** `progressPercentage` (0-100%)
- **Valores Secundários:** `currentRevenue` e `targetRevenue`
- **Indicador Visual:** 
  - 0-50%: Vermelho
  - 50-80%: Amarelo
  - 80-100%: Verde
  - >100%: Azul (meta superada)

**Exemplo de Implementação:**
```typescript
const data = await invoke('get_monthly_sales_progress', { 
  targetRevenue: 100000 
});

const progress = Math.min(data.progressPercentage, 100); // Limitar a 100% visualmente
const color = progress < 50 ? 'red' : progress < 80 ? 'yellow' : 'green';
```

---

### Query 18: Taxa de Conversão de Carrinhos para Pedidos

**Comando Tauri:** `get_conversion_rate(days?: number)`

**Tipo de Gráfico:** Radial Progress Chart (Gauge/Donut)

**Dados Retornados:**
```typescript
interface ConversionRateDto {
  totalCheckouts: number;           // Total de checkouts
  completedOrders: number;          // Pedidos completados
  conversionRate: number;           // Taxa de conversão (0-100)
}
```

**Uso no Frontend:**
- **Valor Principal:** `conversionRate` (0-100%)
- **Valores Secundários:** `totalCheckouts` e `completedOrders`
- **Indicador Visual:**
  - < 10%: Vermelho (baixa conversão)
  - 10-25%: Amarelo (média conversão)
  - > 25%: Verde (boa conversão)

---

### Query 19: Percentual de Estoque Ocupado (Capacidade)

**Comando Tauri:** `get_inventory_capacity(capacityLimit?: number)`

**Tipo de Gráfico:** Radial Progress Chart (Gauge/Donut)

**Dados Retornados:**
```typescript
interface InventoryCapacityDto {
  currentStock: number;             // Estoque atual
  capacityLimit: number;             // Capacidade máxima
  usagePercentage: number;           // Percentual de uso (0-100)
}
```

**Uso no Frontend:**
- **Valor Principal:** `usagePercentage` (0-100%)
- **Valores Secundários:** `currentStock` e `capacityLimit`
- **Indicador Visual:**
  - < 50%: Verde (capacidade ok)
  - 50-80%: Amarelo (atenção)
  - > 80%: Vermelho (próximo do limite)

---

## Queries Avançadas

Estas queries podem ser usadas em diferentes tipos de visualizações dependendo do contexto.

### Query 20: Ranking de Produtos com Percentil

**Comando Tauri:** `get_product_ranking(days?: number, limit?: number)`

**Tipo de Gráfico:** Bar Chart ou Table com indicadores visuais

**Dados Retornados:**
```typescript
interface ProductRankingDto {
  productName: string;             // Nome do produto
  totalRevenue: number;             // Receita total
  revenueRank: number;              // Posição no ranking
  revenuePercentile: number;        // Percentil (0-100)
}
```

**Uso no Frontend:**
- **Visualização:** Tabela ou Bar Chart ordenado por `revenueRank`
- **Indicador Visual:** Barra de progresso baseada em `revenuePercentile`
- **Tooltip:** Mostrar todos os valores

---

### Query 21: Comparação Mês a Mês (MoM - Month over Month)

**Comando Tauri:** `get_month_over_month_growth(months?: number)`

**Tipo de Gráfico:** Line Chart ou Bar Chart com indicadores de crescimento

**Dados Retornados:**
```typescript
interface MonthOverMonthGrowthDto {
  month: string;                    // Mês no formato YYYY-MM
  monthlyRevenue: number;           // Receita mensal
  previousMonthRevenue?: number;    // Receita do mês anterior
  momGrowthPercentage?: number;     // Percentual de crescimento MoM
}
```

**Uso no Frontend:**
- **Linha/Barras:** `monthlyRevenue`
- **Indicadores:** Setas ou cores baseadas em `momGrowthPercentage`
  - Positivo: Verde ↑
  - Negativo: Vermelho ↓
- **Tooltip:** Mostrar crescimento percentual

---

### Query 22: Vendas Acumuladas por Período (YTD - Year to Date)

**Comando Tauri:** `get_year_to_date_sales()`

**Tipo de Gráfico:** Area Chart ou Line Chart

**Dados Retornados:**
```typescript
interface YearToDateSalesDto {
  month: string;                    // Mês no formato YYYY-MM
  monthlyRevenue: number;           // Receita mensal
  ytdRevenue: number;               // Receita acumulada do ano
  monthlyOrders: number;            // Pedidos do mês
  ytdOrders: number;                // Pedidos acumulados do ano
}
```

**Uso no Frontend:**
- **Série 1:** `monthlyRevenue` - barras ou linha
- **Série 2:** `ytdRevenue` - área acumulada
- **Tooltip:** Mostrar valores mensais e acumulados

---

## Resumo Rápido por Tipo de Gráfico

### Area Chart
- Query 1: Receita Acumulada
- Query 2: Movimentação de Estoque
- Query 3: Receita por Método de Pagamento
- Query 22: Vendas YTD

### Bar Chart
- Query 4: Top Produtos
- Query 5: Receita por Categoria
- Query 6: Vendas Mensais
- Query 7: Status de Estoque
- Query 20: Ranking de Produtos

### Line Chart
- Query 8: Tendência de Vendas Diárias
- Query 9: Crescimento de Clientes
- Query 10: Ticket Médio
- Query 21: Crescimento MoM

### Pie Chart
- Query 11: Distribuição por Método de Pagamento
- Query 12: Distribuição por Categoria
- Query 13: Distribuição por Status
- Query 14: Distribuição por Grupo de Clientes

### Radar Chart
- Query 15: Métricas de Performance Mensal
- Query 16: Métricas por Produto

### Radial Chart
- Query 17: Progresso de Meta Mensal
- Query 18: Taxa de Conversão
- Query 19: Capacidade de Estoque

---

## Dicas de Implementação

### 1. Tratamento de Dados Nulos
Sempre verificar valores opcionais (`?`) antes de usar:
```typescript
const value = data.movingAvg7dRevenue ?? 0;
```

### 2. Formatação de Datas
```typescript
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
};

const formatMonth = (monthStr: string) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
};
```

### 3. Formatação de Valores Monetários
```typescript
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};
```

### 4. Cores Consistentes
Criar um mapa de cores para métodos de pagamento, status, etc:
```typescript
const paymentMethodColors = {
  pix: '#32CD32',
  credit_card: '#4169E1',
  debit_card: '#FF6347',
  // ...
};
```

### 5. Loading States
Sempre implementar estados de carregamento:
```typescript
const [loading, setLoading] = useState(true);
const [data, setData] = useState([]);

useEffect(() => {
  setLoading(true);
  invoke('get_cumulative_revenue', { days: 90 })
    .then(setData)
    .finally(() => setLoading(false));
}, []);
```

---

## Bibliotecas Recomendadas

### Gráficos
- **Recharts** - Biblioteca React para gráficos
- **Chart.js** - Biblioteca JavaScript versátil
- **Victory** - Biblioteca React com muitos tipos de gráficos
- **D3.js** - Para visualizações customizadas avançadas

### Exemplo com Recharts
```typescript
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={400}>
  <AreaChart data={data}>
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Area type="monotone" dataKey="cumulativeRevenue" stroke="#8884d8" fill="#8884d8" />
  </AreaChart>
</ResponsiveContainer>
```

---

## Status de Implementação

### ✅ Implementado

Os seguintes componentes foram implementados e estão disponíveis em `src/components/charts/`:

1. **Query 1: Receita Acumulada por Dia** ✅
   - Componente: `cumulative-revenue-area-chart.tsx`
   - Tipo: Area Chart com múltiplas séries
   - Status: Implementado e integrado ao dashboard

2. **Query 4: Top 10 Produtos Mais Vendidos** ✅
   - Componente: `top-products-bar-chart.tsx`
   - Tipo: Horizontal Bar Chart
   - Status: Implementado e integrado ao dashboard

3. **Query 8: Tendência de Vendas Diárias** ✅
   - Componente: `daily-sales-trend-line-chart.tsx`
   - Tipo: Line Chart com média móvel
   - Status: Implementado e integrado ao dashboard

4. **Query 11: Distribuição de Vendas por Método de Pagamento** ✅
   - Componente: `payment-method-distribution-pie-chart.tsx`
   - Tipo: Pie Chart
   - Status: Implementado e integrado ao dashboard

### 📋 Pendente

As seguintes queries ainda precisam ser implementadas:

- Query 2: Vendas e Estoque Movimentado ao Longo do Tempo
- Query 3: Receita por Método de Pagamento ao Longo do Tempo
- Query 5: Receita por Categoria
- Query 6: Vendas Mensais (Últimos 12 Meses)
- Query 7: Produtos por Status de Estoque
- Query 9: Crescimento de Clientes ao Longo do Tempo
- Query 10: Ticket Médio ao Longo do Tempo
- Query 12: Distribuição de Produtos por Categoria
- Query 13: Distribuição de Pedidos por Status
- Query 14: Distribuição de Clientes por Grupo
- Query 15: Métricas de Performance por Mês
- Query 16: Métricas por Produto
- Query 17: Progresso de Meta de Vendas Mensal
- Query 18: Taxa de Conversão de Carrinhos para Pedidos
- Query 19: Percentual de Estoque Ocupado
- Query 20: Ranking de Produtos com Percentil
- Query 21: Comparação Mês a Mês (MoM)
- Query 22: Vendas Acumuladas por Período (YTD)

---

## Conclusão

Este guia mapeia todas as 22 queries analíticas disponíveis para seus respectivos tipos de gráficos. Use este documento como referência ao implementar as visualizações no frontend, garantindo que cada query seja usada no tipo de gráfico mais apropriado para melhor compreensão dos dados.

**Última atualização:** 4 queries implementadas (18.2% completo)
