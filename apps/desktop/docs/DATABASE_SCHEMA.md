# O Schema Generalista (Inventy)

Este documento detalha a modelagem de dados "Generalista" utilizada no Inventy. O objetivo é suportar qualquer tipo de produto (físico, digital, serviço), qualquer fluxo de pagamento e qualquer logística.

## Índice

- [1. Produtos (Products)](#1-produtos-products)
- [2. Estoque (Inventory)](#2-estoque-inventory)
- [3. Transações (Transactions)](#3-transacoes-transactions)
- [4. Pagamentos (Payments)](#4-pagamentos-payments)
- [5. Carrinho/Checkout](#5-carrinhocheckout)
- [6. Pedidos (Orders)](#6-pedidos-orders)
- [7. Entregas (Shipments)](#7-entregas-shipments)
- [8. Clientes (Customers)](#8-clientes-customers)
- [9. Autenticação (Auth)](#9-autenticacao-auth)
- [10. Atendimento (Inquiries)](#10-atendimento-inquiries)
- [11. Sincronização (Sync)](#11-sincronizacao-sync)

---

## 1. Produtos (Products)

Criar uma tabela única que suporte **absolutamente qualquer produto** (de um alfinete a um ebook, de uma hora de consultoria a um caminhão de areia) exige uma abordagem híbrida.

Você não pode criar colunas para "Voltagem" ou "Tamanho da Manga", pois isso quebraria a normalização do banco quando você inserisse uma "Maçã".

A solução padrão da indústria (usada por Shopify, Magento, BigCommerce) é dividir em: **Colunas Rígidas** (o que todo produto tem) e **Colunas Flexíveis** (JSON/NoSQL para especificidades).

Aqui está a estrutura definitiva de colunas para esse cenário:

### 1. Identidade e Controle (Core)

Estas colunas são obrigatórias para qualquer item.

- `id` (UUID/Integer): Identificador único do sistema.
- `sku` (String): _Stock Keeping Unit_. O código único universal do produto (ex: "NIKE-AIR-BLK-42").
- `type` (Enum): Define o comportamento do produto.
- Values: `physical`, `digital`, `service`, `subscription`, `bundle`.

- `status` (Enum): Controle de visibilidade.
- Values: `draft`, `active`, `archived`, `out_of_stock`.

- `name` (String): O nome comercial do produto.
- `slug` (String): A URL amigável (ex: `tenis-nike-air`).
- `gtin_ean` (String): Código de barras global (EAN/UPC) – essencial para Google Shopping e marketplace.

### 2. Financeiro e Comercial

Preço e custo se aplicam a tudo.

- `price` (Decimal): O preço de venda base.
- `promotional_price` (Decimal): Preço "de/por" ou oferta.
- `cost_price` (Decimal): Custo de aquisição/produção (para cálculo de margem).
- `currency` (String): Código ISO da moeda (BRL, USD).
- `tax_code` (String): NCM (Brasil) ou HS Code (Global). Obrigatório para emitir nota fiscal e calcular impostos.

### 3. Logística e Dimensões (O "Envio")

Aqui resolvemos a questão de loja física vs. virtual.

- `is_shippable` (Boolean): Se `true`, exige cálculo de frete. Se `false` (serviço/digital), pula o checkout de envio.
- `weight_g` (Integer): Peso em gramas (usado para correios/transportadoras).
- `width_mm` (Integer): Largura.
- `height_mm` (Integer): Altura.
- `depth_mm` (Integer): Profundidade/Comprimento.
- `warehouse_location` (String): Onde está na loja física ou CD (ex: "Corredor B, Prateleira 4").

### 4. A "Mágica" Generalista (Onde tudo cabe)

Esta é a parte mais importante. Em vez de criar colunas, você usa um campo de dados semi-estruturados (JSONB no Postgres, JSON no MySQL).

- `attributes` (JSONB): Armazena as características específicas que variam por categoria.
- _Exemplo Camiseta:_ `{"color": "Azul", "size": "M", "material": "Algodão"}`
- _Exemplo Celular:_ `{"storage": "128GB", "ram": "8GB", "screen": "6.1"}`
- _Exemplo Comida:_ `{"flavor": "Laranja", "calories": "150kcal", "vegan": true}`

- `metadata` (JSONB): Dados técnicos ocultos ou integrações.
- Ex: `{"supplier_id": 99, "google_category_id": 155, "download_url": "s3://..."}`

### 5. Relacionamento e Variação (Pai/Filho)

Para lidar com o problema da "Camiseta que tem P, M e G".

- `parent_id` (FK): Aponta para o produto "pai" se este for uma variação. Se for nulo, é um produto principal.
- `brand_id` (FK): Relacionamento com tabela de marcas.
- `category_id` (FK): Relacionamento com tabela de categorias.

---

### Exemplo de SQL (PostgreSQL)

Aqui está como isso ficaria na prática, cobrindo todos os cenários:

```sql
CREATE TABLE products (
    -- Identidade
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('physical', 'digital', 'service', 'bundle')),
    status VARCHAR(20) DEFAULT 'draft',
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    gtin_ean VARCHAR(20),

    -- Financeiro
    price DECIMAL(10, 2) NOT NULL,
    promotional_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    currency CHAR(3) DEFAULT 'BRL',
    tax_ncm VARCHAR(20), -- Fiscal

    -- Logística
    is_shippable BOOLEAN DEFAULT TRUE,
    weight_g INTEGER DEFAULT 0,
    width_mm INTEGER DEFAULT 0,
    height_mm INTEGER DEFAULT 0,
    depth_mm INTEGER DEFAULT 0,

    -- Dados Flexíveis (A chave do generalismo)
    attributes JSONB, -- Ex: {"cor": "Vermelho", "voltagem": "220v"}
    metadata JSONB,   -- Ex: {"link_download": "..."}

    -- Organização
    category_id UUID,
    brand_id UUID,
    parent_id UUID REFERENCES products(id), -- Para variações (SKUs filhos)

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

```

### Por que essa estrutura funciona para tudo?

1. **Loja Física:** Usa o campo `sku` para bipar no caixa e o `tax_ncm` para a nota fiscal.
2. **Loja Virtual (Produto Físico):** Usa `weight_g` e dimensões para calcular frete nos Correios/Transportadora.
3. **Produto Digital (Ebook/Curso):** `is_shippable` é `false`, `weight_g` é 0, e o link de entrega fica dentro de `metadata` ou uma tabela auxiliar de entregáveis.
4. **Produtos Complexos:** Se for um computador, as 50 especificações técnicas vão para o JSON `attributes`, sem sujar o banco de dados.

---

## 2. Estoque (Inventory)

Para manter o nível "super generalista" e profissional, o segredo do inventário não é apenas saber "quanto" você tem, mas **onde** está, **em que estado** está e **para quem** está reservado.

O maior erro de modelagem é colocar o campo `quantity` dentro da tabela de produtos. Isso impede que você tenha o mesmo produto em duas lojas diferentes ou em um depósito e na prateleira.

Aqui está a estrutura definitiva de inventário, dividida em **Locais** (Onde) e **Saldos** (O Quanto).

---

### 1. Tabela Auxiliar: Locais de Estoque (`locations`)

Antes de ter estoque, você precisa definir _onde_ ele cabe. Isso resolve o problema de "Loja Física" vs "Virtual" vs "Caminhão de Entrega".

- `id` (UUID): Identificador.
- `name` (String): "Loja Centro", "Depósito SP", "Estoque Virtual Fornecedor".
- `type` (Enum): Define a lógica de venda.
- Values: `warehouse` (CD), `store` (Loja Física), `transit` (Em transporte), `virtual` (Dropshipping/Infoproduto), `customer` (Entregue).

- `is_sellable` (Boolean): Se o estoque deste local aparece no site para venda. (Ex: Estoque de "Avarias" seria `false`).
- `address_data` (JSONB): Endereço físico para cálculo de frete de origem.

---

### 2. Tabela Principal: Saldos de Estoque (`inventory_levels`)

Esta é a tabela que responde "Quantos iPhone 15 eu tenho na Loja X?". Ela deve ser única por **Produto + Local + Lote**.

#### Chaves e Relacionamentos

- `id` (UUID): Identificador único do registro de saldo.
- `product_id` (FK): De qual produto estamos falando.
- `location_id` (FK): Em qual armazém/loja ele está.

#### Quantidades (A "Matemática" do Estoque)

Nunca use apenas um campo "quantidade". Você precisa saber o que é físico e o que já foi prometido.

- `quantity_on_hand` (Integer/Decimal): **Estoque Físico Total**. O que você contaria se fosse lá na prateleira agora.
- `quantity_reserved` (Integer/Decimal): **Estoque Comprometido**. Itens vendidos online que ainda não saíram do prédio, ou itens no carrinho de compras (se você reservar carrinho).
- `quantity_available` (Generated/Calculated): Coluna virtual ou calculada na query (`on_hand` - `reserved`). É isso que o site mostra para o cliente comprar.

#### Especificidades (O "Generalismo")

Aqui cobrimos alimentos, eletrônicos e moda.

- `batch_number` (String): Número do lote. Essencial para rastreio de validade ou recall.
- `serial_number` (String): Para itens únicos (ex: IMEI de celular, chassi de carro). Se preenchido, a quantidade geralmente é 1.
- `expiry_date` (Date): Validade. Se o produto vencer, o sistema pode automaticamente marcar como não vendível.
- `sku_vendor` (String): O código que o fornecedor usa (as vezes diferente do seu SKU).

#### Controle de Qualidade

- `stock_status` (Enum): O estado desse item específico.
- Values: `sellable` (Vendível), `damaged` (Avariado), `quarantine` (Em análise/CQ), `expired` (Vencido).

#### Auditoria

- `last_counted_at` (Timestamp): Data do último inventário físico (balanço). Ajuda a saber a confiabilidade do número.
- `aisle_bin_slot` (String): Endereço exato dentro do armazém (Corredor A, Pote 2).

---

### 3. Exemplo de SQL (PostgreSQL)

```sql
-- Primeiro, definimos ONDE as coisas podem estar
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('warehouse', 'store', 'transit', 'virtual')),
    is_sellable BOOLEAN DEFAULT TRUE, -- Se o e-commerce puxa estoque daqui
    address_data JSONB -- Para cálculo de frete de saída
);

-- Agora, o inventário de fato
CREATE TABLE inventory_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- O tripé do estoque: O Que, Onde e Qual Lote
    product_id UUID NOT NULL REFERENCES products(id),
    location_id UUID NOT NULL REFERENCES locations(id),

    -- Granularidade
    batch_number VARCHAR(100), -- Para iogurtes, tintas, remédios
    serial_number VARCHAR(100), -- Para celulares, carros (Quantidade será 1)
    expiry_date DATE,

    -- Quantidades
    quantity_on_hand DECIMAL(15, 4) DEFAULT 0, -- Decimal permite vender 1.5kg de areia
    quantity_reserved DECIMAL(15, 4) DEFAULT 0,

    -- Status
    stock_status VARCHAR(20) DEFAULT 'sellable' CHECK (stock_status IN ('sellable', 'damaged', 'quarantine', 'expired')),
    aisle_bin_slot VARCHAR(50), -- Localização micro (Prateleira 3B)

    last_counted_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Garante que não dupliquemos o mesmo lote no mesmo local
    UNIQUE (product_id, location_id, batch_number, serial_number, stock_status)
);

```

### Casos de Uso Reais com essa Estrutura:

1. **Venda Online com Retirada na Loja (Omnichannel):**

- O sistema verifica `inventory_levels` onde `location_type = 'store'` e `stock_status = 'sellable'`.
- Ao comprar, aumenta o `quantity_reserved` na Loja Física, impedindo que alguém na loja pegue o produto da prateleira antes do funcionário separar.

2. **Produto Perecível (Supermercado):**

- Você tem 100 iogurtes.
- 50 são do Lote A (Vence amanhã).
- 50 são do Lote B (Vence mês que vem).
- São duas linhas na tabela. O sistema pode fazer uma promoção automática apenas para o Lote A.

3. **Dropshipping / Infoproduto:**

- Cria-se um `location` do tipo `virtual`.
- A `quantity_on_hand` pode ser definida como 999.999 (infinito) ou espelhar via API o estoque do fornecedor.

4. **Caminhão de Entrega:**

- Quando o produto sai do depósito para entrega, você não dá baixa no item. Você faz uma **transferência** do `location_id` (Depósito) para o `location_id` (Caminhão 01 - Transit). Se o caminhão for roubado ou o item voltar, você ainda tem o registro contábil de que o item existia.

---

## 3. Transações (Transactions)

Para atingir o nível máximo de generalização em **Transações**, você não pode pensar apenas em "Vendas". Uma transação é **qualquer evento que altera o estado financeiro ou de estoque** da empresa.

Isso inclui: Venda (PDV/E-commerce), Compra (de fornecedor), Devolução (RMA), Perda (roubo/quebra), Transferência (entre estoques) e Ajuste de Balanço.

A arquitetura correta aqui é baseada no conceito de **Ledger (Livro Razão)**. Separamos a transação em três camadas: **O Cabeçalho (O Evento)**, **Os Itens (O Conteúdo)** e **Os Movimentos (As Consequências)**.

Aqui está a estrutura definitiva:

---

### 1. O Cabeçalho: `transactions`

Esta tabela representa o "contrato" ou o evento macro. Ela diz **o que** está acontecendo, **quem** está envolvido e **quando**.

- `id` (UUID): Identificador único.
- `type` (Enum): O campo mais crítico. Define a regra de negócio.
- Values: `sale_order` (Venda), `purchase_order` (Compra de Fornecedor), `transfer` (Transferência), `adjustment` (Correção de Estoque), `return` (Devolução/Troca).

- `status` (Enum): O ciclo de vida.
- Values: `draft`, `pending_payment`, `paid`, `processing`, `shipped`, `delivered`, `completed`, `cancelled`, `refunded`.

- `channel` (String): Origem da transação (ex: "POS Loja 1", "App Android", "Marketplace X", "Backoffice").
- **Atores (Quem):**
- `customer_id` (UUID): Cliente (pode ser nulo em ajustes internos).
- `supplier_id` (UUID): Fornecedor (usado em compras).
- `staff_id` (UUID): Quem operou o caixa ou criou o pedido.

- **Financeiro Macro:**
- `currency` (String): BRL, USD.
- `total_gross` (Decimal): Soma dos itens.
- `total_discount` (Decimal): Desconto global.
- `total_tax` (Decimal): Impostos somados.
- `total_shipping` (Decimal): Frete cobrado.
- `total_net` (Decimal): O valor final a pagar.

- **Dados Congelados (Snapshots):**
- `billing_address` (JSONB): Endereço de cobrança copiado no momento da compra (não use FK, pois o cliente muda de casa).
- `shipping_address` (JSONB): Endereço de entrega copiado.

---

### 2. Os Detalhes: `transaction_items`

Aqui listamos o que foi transacionado. O segredo do generalismo aqui é o **Snapshotting** (copiar os dados do produto para garantir integridade histórica). Se o preço do produto mudar amanhã, essa venda antiga deve manter o preço antigo.

- `id` (UUID): PK.
- `transaction_id` (FK): Vínculo com o pai.
- `product_id` (FK): Vínculo com o produto (para relatórios).
- `sku_snapshot` (String): O SKU no momento da venda.
- `name_snapshot` (String): O nome no momento da venda.
- `quantity` (Decimal): Quantidade (suporta fracionados, ex: 1.5kg).
- `unit_price` (Decimal): Preço unitário **cobrado**.
- `unit_cost` (Decimal): Custo do produto **naquele momento** (essencial para calcular lucro real depois).
- `tax_details` (JSONB): Detalhes fiscais específicos desta linha (ICMS, IPI, VAT).
- `metadata` (JSONB): Personalizações (ex: "Escrever 'Parabéns' no bolo").

---

### 3. As Consequências Físicas: `inventory_movements` (O Stock Ledger)

Esta tabela é o **rastro** de auditoria. Nenhuma quantidade em `inventory_levels` muda sem que um registro seja criado aqui.

- `id` (UUID): PK.
- `transaction_id` (FK): Qual venda/compra gerou isso?
- `transaction_item_id` (FK): Qual item específico?
- `product_id` (FK): O produto.
- `location_id` (FK): De onde saiu ou para onde foi.
- `type` (Enum): `in` (entrada), `out` (saída).
- `quantity` (Decimal): Valor sempre positivo.
- `balance_before` (Decimal): Quanto tinha antes (auditoria).
- `balance_after` (Decimal): Quanto ficou depois (auditoria).
- `reason` (String): Ex: "Venda #123", "Quebra no transporte", "Chegada de Fornecedor".

---

### 4. As Consequências Financeiras: `payments`

Separar o pagamento da transação é vital, pois uma venda de R$ 100 pode ser paga com: R$ 50 em Dinheiro + R$ 50 em Cartão.

- `id` (UUID): PK.
- `transaction_id` (FK): Vínculo.
- `method` (Enum): `credit_card`, `debit_card`, `cash`, `pix`, `bank_slip`, `store_credit`.
- `amount` (Decimal): Valor desta parcela.
- `status` (Enum): `pending`, `authorized`, `captured`, `failed`, `refunded`.
- `gateway_data` (JSONB): Dados retornados pelo Stripe/Pagar.me/Adyen (NSU, Authorization Code, Token).

---

### Exemplo de SQL (PostgreSQL)

```sql
-- 1. O Cabeçalho da Transação
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Definição do Evento
    type VARCHAR(50) NOT NULL CHECK (type IN ('sale', 'purchase', 'transfer', 'return', 'adjustment')),
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    channel VARCHAR(100), -- 'pos_01', 'website', 'app'

    -- Participantes
    customer_id UUID, -- Null se for compra de fornecedor
    supplier_id UUID, -- Null se for venda
    staff_id UUID,    -- Quem processou

    -- Valores Monetários (Agregados)
    currency CHAR(3) DEFAULT 'BRL',
    total_items DECIMAL(15, 2) DEFAULT 0,
    total_shipping DECIMAL(15, 2) DEFAULT 0,
    total_discount DECIMAL(15, 2) DEFAULT 0,
    total_net DECIMAL(15, 2) DEFAULT 0, -- O valor final da nota

    -- Contexto Logístico
    shipping_method VARCHAR(100),
    shipping_address JSONB, -- Snapshot do endereço
    billing_address JSONB,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Os Itens da Transação
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    product_id UUID REFERENCES products(id), -- Pode ser null se o produto for deletado, mas snapshots salvam

    -- Snapshots (Garantia Histórica)
    sku_snapshot VARCHAR(100),
    name_snapshot VARCHAR(255),

    -- Matemática da Linha
    quantity DECIMAL(15, 4) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL, -- Valor de Venda
    unit_cost DECIMAL(15, 2),          -- Valor de Custo (Para relatório de margem)

    total_line DECIMAL(15, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,

    -- Flexibilidade
    attributes_snapshot JSONB, -- Ex: A cor escolhida na hora da compra
    tax_details JSONB -- Ex: {"icms_rate": 18, "ipi": 0}
);

-- 3. Movimentação Física (O Rastro do Estoque)
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    inventory_level_id UUID REFERENCES inventory_levels(id), -- Liga com a tabela de saldo anterior

    type VARCHAR(10) CHECK (type IN ('in', 'out')),
    quantity DECIMAL(15, 4) NOT NULL,

    -- Auditoria
    previous_balance DECIMAL(15, 4),
    new_balance DECIMAL(15, 4),

    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Pagamentos
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),

    payment_method VARCHAR(50) NOT NULL, -- credit_card, pix, cash
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',

    provider_transaction_id VARCHAR(255), -- ID no Stripe/Pagar.me
    metadata JSONB, -- JSON cru do gateway de pagamento

    created_at TIMESTAMP DEFAULT NOW()
);

```

### Cenários Complexos Resolvidos por essa Estrutura:

1. **Troca de Produto (Cliente devolve Azul P e leva Vermelho M):**

- Cria-se uma `transaction` do tipo `exchange` (ou `return` seguida de `sale`).
- Item 1: Camisa Azul (Quantidade -1, Valor Negativo ou marcado como estorno).
- Item 2: Camisa Vermelha (Quantidade 1, Valor Positivo).
- `inventory_movements`: Entrada de 1 no estoque de "Avarias" ou "Principal" (depende da avaliação física) e Saída de 1 do estoque "Principal".
- `payments`: Se houver diferença de preço, registra-se apenas o pagamento do delta.

2. **Transferência entre Lojas:**

- `transaction` tipo `transfer`. Origem: Loja A, Destino: Loja B.
- Preço unitário é 0 (ou preço de custo, para contabilidade interna).
- Gera dois `inventory_movements`: Um `out` na Loja A e um `in` na Loja B (ou `in` no local "Em Trânsito" primeiro).

3. **Venda de Kit (Computador + Monitor):**

- O `transaction_item` pode ser o ID do Kit.
- Mas, via lógica de aplicação (backend), gera-se múltiplos `inventory_movements` para baixar os componentes individuais (CPU, Teclado, Monitor) da tabela de estoque.

4. **Pagamento Misto:**

- Total da Venda: R$ 200,00.
- Tabela `payments` registro 1: R$ 100,00 (Cash).
- Tabela `payments` registro 2: R$ 100,00 (Credit Card).
- ## A soma dos pagamentos bate com o `total_net` da transação? Se sim, `status` muda para `paid`.

## 4. Pagamentos (Payments)

Para elevar o módulo de **Payments** ao nível "Enterprise/Global", precisamos entender que um pagamento não é um evento atômico (pagou/não pagou). É um **ciclo de vida** complexo que envolve autorização, captura, liquidação (settlement), fraude e conciliação bancária.

Um sistema generalista precisa suportar desde o **"Dinheiro na mão do caixa"** até **"Cartão de Crédito em 12x com juros"**, **"Pix"**, **"Criptomoedas"** e **"Buy Now Pay Later (Klarna/Affirm)"**.

Aqui está a modelagem definitiva para pagamentos:

---

### 1. A Tabela Mestre: `payments`

Esta tabela registra a intenção e a execução da movimentação financeira de entrada.

- `id` (UUID): Identificador único do pagamento.
- `transaction_id` (FK): A qual venda/pedido isso pertence.
- _Nota:_ Uma transação pode ter múltiplos pagamentos (Ex: Pagar R$ 50 no crédito e R$ 20 no Pix).

- **Valores e Moeda:**
- `amount` (Decimal): O valor total desta tentativa de pagamento.
- `currency` (String): ISO (BRL, USD). Vital para vendas internacionais.
- `exchange_rate` (Decimal): Se a loja vende em BRL mas recebe em USD, aqui fica a taxa de conversão do dia.

- **O Mecanismo (Quem processa):**
- `provider` (String): O processador (Ex: `stripe`, `pagar.me`, `adyen`, `mercadopago`, `manual_cash`).
- `method` (Enum): A forma de pagamento.
- Values: `credit_card`, `debit_card`, `pix`, `boleto`, `voucher`, `bank_transfer`, `cash`, `wallet`, `crypto`.

- **Parcelamento (A jabuticaba brasileira e tendência global):**
- `installments` (Integer): Número de parcelas (1 a 24).
- `installment_amount` (Decimal): Valor de cada parcela.
- `interest_rate` (Decimal): Taxa de juros aplicada (se houver).

- **Ciclo de Vida (State Machine):**
- `status` (Enum):
- `pending`: Aguardando (ex: boleto gerado, pix não pago).
- `authorized`: O banco disse "tem saldo", mas o dinheiro não saiu (Pre-auth).
- `captured`: O dinheiro foi efetivamente cobrado.
- `declined`: Recusado pelo banco/fraude.
- `voided`: Cancelado antes da captura (desfeito).
- `refunded`: Devolvido total ou parcialmente.
- `charged_back`: O cliente contestou a compra no banco (o pesadelo do lojista).

- **Identificadores Externos (Rastreabilidade):**
- `provider_transaction_id` (String): O ID único lá no Stripe/Pagar.me (Ex: `ch_3Lk...`). Essencial para fazer estorno via API depois.
- `authorization_code` (String): O código que aparece na filipeta da maquininha (NSU/Auth Code).

- **Dados Flexíveis (Onde mora o detalhe):**
- `payment_details` (JSONB): Detalhes específicos do método que não merecem coluna.
- _Cartão:_ `{"brand": "visa", "last4": "4242", "exp_month": 12, "exp_year": 2025, "holder_name": "JOAO SILVA"}`
- _Pix:_ `{"qr_code": "...", "copy_paste": "...", "expiration": "2024-..."}`
- _Boleto:_ `{"barcode": "...", "url_pdf": "..."}`

- `metadata` (JSONB): Dados crus de retorno do gateway (para debug).

- **Segurança e Datas:**
- `risk_score` (Integer): Pontuação de fraude (0-100) retornada pelo sistema antifraude (ClearSale, Radar).
- `authorized_at` (Timestamp): Quando o banco aprovou.
- `captured_at` (Timestamp): Quando a loja confirmou a captura.

---

### 2. A Tabela de Estornos: `refunds`

Nunca, jamais edite a tabela `payments` para mudar o valor para zero ou negativo. Contabilmente isso é um erro. Um estorno é uma transação nova e oposta.

- `id` (UUID): PK.
- `payment_id` (FK): Qual pagamento original está sendo devolvido.
- `amount` (Decimal): Quanto foi devolvido. (Permite estorno parcial: pagou 100, devolveu 20).
- `reason` (String): "Cliente desistiu", "Produto defeituoso", "Fraude".
- `status` (Enum): `pending`, `succeeded`, `failed`.
- `provider_refund_id` (String): ID do estorno no gateway (Ex: `re_3Lk...`).
- `created_at` (Timestamp): Data da devolução.

---

### Exemplo de SQL (PostgreSQL)

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),

    -- O Dinheiro
    amount DECIMAL(15, 2) NOT NULL,
    currency CHAR(3) DEFAULT 'BRL',

    -- O Método
    provider VARCHAR(50) NOT NULL, -- 'stripe', 'adyen', 'pos_stone'
    method VARCHAR(50) NOT NULL, -- 'credit_card', 'pix'

    -- Parcelamento
    installments SMALLINT DEFAULT 1,

    -- Estados
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    -- pending, authorized, captured, declined, voided, refunded, charged_back

    -- Integração Técnica
    provider_transaction_id VARCHAR(255), -- ID da transação no Gateway
    authorization_code VARCHAR(100), -- NSU ou Auth Code

    -- Detalhes ricos (Generalista)
    payment_details JSONB,
    -- Ex Card: {"last4": "4242", "brand": "mastercard"}
    -- Ex Pix: {"qr_code_url": "..."}

    -- Auditoria de Fraude
    risk_level VARCHAR(20), -- 'low', 'medium', 'high', 'critical'

    -- Timestamps Críticos
    created_at TIMESTAMP DEFAULT NOW(),
    authorized_at TIMESTAMP,
    captured_at TIMESTAMP,
    voided_at TIMESTAMP
);

CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id),

    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, succeeded, failed
    reason VARCHAR(255),

    provider_refund_id VARCHAR(255),

    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID -- ID do funcionário que autorizou o estorno
);

```

### Casos de Uso Avançados Resolvidos:

#### 1. Autorização e Captura Tardia (Posto de Gasolina / Hotel)

- **Cenário:** Você passa o cartão no hotel no check-in, eles bloqueiam R$ 1.000 (Caução). No check-out, você gastou apenas R$ 800.
- **Fluxo no Banco:**

1. Cria `payment` com `status = 'authorized'`, `amount = 1000`.
2. No check-out, o sistema envia comando de captura para o gateway de apenas R$ 800.
3. Atualiza `payment`: `status = 'captured'`, `amount = 800`, `captured_at = NOW()`. O banco libera os R$ 200 restantes para o cliente.

#### 2. Split de Pagamento (Entrada + Parcelado)

- **Cenário:** Compra de R$ 2.000. Cliente dá R$ 500 no Pix e parcela R$ 1.500 em 10x.
- **Registro:**
- Registro 1 na tabela `payments`: Método `pix`, Valor `500`, Status `captured`.
- Registro 2 na tabela `payments`: Método `credit_card`, Valor `1500`, Installments `10`, Status `captured`.
- A aplicação soma os `payments` com status `captured` vinculados ao `transaction_id`. Se soma == total do pedido, libera o pedido.

#### 3. Chargeback (O Cliente Ligou no Banco e Cancelou)

- Este é um evento assíncrono. O gateway avisa sua API via Webhook dias depois da venda.
- **Ação:** O sistema busca o `payment` pelo `provider_transaction_id`.
- Atualiza `status` para `charged_back`.
- Automaticamente gatilha um alerta para o time financeiro e bloqueia a conta do usuário se necessário.

#### 4. Conciliação (Conferir se o dinheiro caiu)

- Você adicionaria uma tabela extra ou colunas: `settlement_date` (Data prevista do depósito na conta da empresa) e `settlement_batch_id`.
- Isso permite saber: "Vendi hoje, mas o dinheiro desse cartão só cai na conta dia 15/02 já descontada a taxa de 3%".

### O Poder do JSONB `payment_details`

É aqui que você evita criar 50 colunas nulas.

- **Se for Pix:** Guarda o Hash `copy_paste`.
- **Se for Boleto:** Guarda a `linha_digitavel` e a `vencimento`.
- **Se for Cripto:** Guarda a `hash_transaction` da Blockchain e a `wallet_address` de origem.
- ## **Se for Dinheiro:** Pode ficar vazio ou guardar `{"troco_para": 100}`.

## 5. Carrinho/Checkout

O **Checkout** é a entidade mais volátil e complexa do sistema. Diferente de um `Order` (que é um documento imutável de história), o `Checkout` é um "rascunho vivo".

O cliente adiciona itens, remove, muda o endereço, troca o cartão, aplica cupom, remove cupom.

Para um sistema generalista, o Checkout precisa resolver três dores principais:

1. **Persistência:** Começar no celular, terminar no desktop.
2. **Marketing:** Recuperação de Carrinho Abandonado.
3. **Performance:** Calcular impostos e fretes sem criar lixo no banco de dados principal.

Aqui está a modelagem definitiva para a tabela `checkouts`.

---

### 1. Estrutura da Tabela: `checkouts`

A grande sacada aqui é usar **JSONB para os itens**.
_Por que?_ Porque em um carrinho, não precisamos de integridade referencial estrita (Foreign Keys) para cada item. Se você criar uma tabela filha `checkout_items`, você terá milhões de inserts/deletes inúteis. O JSON é mais rápido para leitura/escrita nesse cenário de "rascunho".

```sql
CREATE TABLE checkouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identidade e Acesso
    token VARCHAR(100) UNIQUE NOT NULL, -- Token público (na URL ou Cookie) para acesso sem login
    user_id UUID, -- Opcional. Se o usuário logar, vinculamos aqui.
    email VARCHAR(255), -- Vital! Preenchido assim que o usuário digita no input (antes de comprar)

    -- O Conteúdo (A "Cesta")
    -- Estrutura: [{"sku": "A", "qty": 1, "attributes": {...}}, ...]
    items JSONB DEFAULT '[]'::JSONB,

    -- O Contexto Logístico (Rascunho)
    shipping_address JSONB, -- O endereço sendo digitado (ainda não validado)
    billing_address JSONB,

    -- Seleções do Usuário
    shipping_line JSONB, -- Ex: {"code": "sedex", "price": 15.00, "carrier": "Correios"}
    applied_discount_codes JSONB, -- Array de cupons aplicados ["NATAL10"]

    -- O Financeiro (Calculado em tempo real)
    currency CHAR(3) DEFAULT 'BRL',
    subtotal_price DECIMAL(15, 2) DEFAULT 0, -- Soma dos produtos
    total_tax DECIMAL(15, 2) DEFAULT 0,
    total_shipping DECIMAL(15, 2) DEFAULT 0,
    total_discounts DECIMAL(15, 2) DEFAULT 0,
    total_price DECIMAL(15, 2) DEFAULT 0, -- O valor final a pagar

    -- Ciclo de Vida e Regras
    status VARCHAR(20) DEFAULT 'open',
    -- open (ativo), completed (virou pedido), expired (muito tempo inativo)

    reservation_expires_at TIMESTAMP, -- Se você "segura" o estoque (estilo ingresso de show)
    completed_at TIMESTAMP, -- Data que virou Order

    -- Metadados Técnicos
    metadata JSONB, -- Origem (Instagram, Google), User Agent, IP
    recovery_url VARCHAR(255), -- Link mágico para retomar o carrinho no e-mail

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW() -- Importante para limpar carrinhos velhos (Cron Job)
);

```

---

### 2. Aprofundando nos Campos Críticos

#### A. O Campo `items` (JSONB)

Em vez de uma tabela separada, guardamos o estado atual dos itens aqui. Isso permite flexibilidade total.
Exemplo de conteúdo:

```json
[
  {
    "product_id": "uuid...",
    "variant_id": "uuid...",
    "sku": "TSHIRT-BLK-M",
    "quantity": 2,
    "unit_price": 50.0,
    "properties": {
      "custom_text": "Parabéns João",
      "gift_wrap": true
    }
  }
]
```

> **Nota:** O preço aqui é um "snapshot temporário". Se o administrador mudar o preço do produto no banco, o checkout deve ser recalculado quando o usuário der "refresh", a menos que você tenha uma regra de "garantia de preço".

#### B. Recuperação de Carrinho (`email` + `recovery_url`)

A regra de ouro do e-commerce: **Capture o e-mail primeiro.**
Se o usuário digitar o e-mail e fechar a aba, você tem um lead.

- `email`: Salve via AJAX no evento `onBlur` do campo de input.
- `recovery_url`: Um link como `loja.com/checkout?token=xyz123`. Enviado no e-mail "Você esqueceu algo?".

#### C. Reserva de Estoque (`reservation_expires_at`)

Para sistemas de alta demanda (ingressos, sneakers limitados), você precisa reservar o item no momento do checkout, não do pagamento.

- Ao adicionar ao carrinho, o sistema define `reservation_expires_at = NOW() + 15 minutes`.
- O sistema de estoque considera essa quantidade como `quantity_reserved` até o tempo expirar.

---

### 3. O Fluxo: Do Checkout ao Order

A transição de Checkout para Order é o momento mais crítico da arquitetura. É uma "transfusão" de dados.

1. **Gatilho:** Usuário clica em "Finalizar Compra" e o pagamento é aprovado (ou boleto gerado).
2. **Validação:**

- O estoque ainda existe?
- O preço total (`total_price`) bate com a soma dos itens atuais? (Evita fraude de injeção de HTML).

3. **Conversão (Transaction DB):**

- Cria-se o registro na tabela `orders`.
- Cria-se registros na tabela `order_items` (agora sim, relacional e rígido) baseados no JSON `items` do checkout.
- Cria-se o registro em `transactions`.

4. **Encerramento:**

- Atualiza `checkouts`: `status = 'completed'`, `completed_at = NOW()`.
- Apaga o cookie do navegador ou gera um novo token limpo.

### 4. Por que separar Checkout Address de User Address?

Você deve ter notado `shipping_address` como JSON no checkout.

- **Cenário:** O usuário quer mandar um presente para a tia que mora no Acre.
- Ele não quer, necessariamente, adicionar esse endereço no "Livro de Endereços" permanente do perfil dele.
- Ele digita no checkout. O sistema salva o JSON no `checkout`.
- Se a compra for efetivada, esse JSON é copiado para o `order`.
- O cadastro do usuário (`user_addresses`) permanece limpo, contendo apenas os endereços principais dele.

### 5. Lógica de "Merge" (A complexidade oculta)

O checkout precisa lidar com o "Visitante que faz Login".

1. Usuário anônimo adiciona 3 itens ao carrinho (Token A).
2. Usuário decide fazer Login.
3. O sistema descobre que ele já tinha um carrinho antigo "aberto" na conta dele (Token B) com 1 item.
4. **Ação de Merge:** O sistema deve pegar os itens do Token A, somar com os do Token B, atualizar o `user_id` do Token A e descartar o Token B.

## Essa tabela suporta essa lógica mantendo o histórico limpo via `updated_at`.

## 6. Pedidos (Orders)

Para tornar a tabela `orders` verdadeiramente **generalista**, ela precisa funcionar como um **documento legal imutável**.

Diferente do carrinho (`checkout`), que é rascunho, ou do produto, que muda de preço, o Pedido é uma fotografia de um momento no tempo. Se você vender uma consultoria, um carro ou um ebook, a estrutura do pedido deve ser agnóstica ao item.

Aqui estão os atributos generalistas essenciais explicados a fundo:

---

### 1. A Trindade de Status (Desacoplamento)

Sistemas amadores usam apenas um campo `status` (Ex: Pendente, Pago, Enviado). Isso falha no mundo real.
Para ser generalista, você precisa separar o progresso do pedido em três eixos independentes:

- **`status` (Ciclo de Vida do Contrato):**
- Define se o pedido está "vivo".
- Ex: `open` (ativo), `archived` (antigo), `cancelled` (morto).

- **`payment_status` (Fluxo Financeiro):**
- Ex: `unpaid`, `partially_paid` (pagou metade no Pix, falta o resto), `paid`, `refunded`, `partially_refunded`.
- _Cenário:_ Um restaurante (Paga DEPOIS de consumir) vs E-commerce (Paga ANTES de enviar).

- **`fulfillment_status` (Fluxo Logístico/Entrega):**
- Ex: `unfulfilled`, `scheduled` (serviços agendados), `partially_fulfilled` (enviou só metade), `fulfilled`, `returned`.
- _Cenário:_ Você pode ter um pedido `paid` mas `unfulfilled` (Pré-venda). Ou um pedido `fulfilled` mas `unpaid` (Venda faturada para empresa/Boleto a prazo).

### 2. Identidade e Origem (`channel` & `tags`)

Como o pedido pode vir de qualquer lugar, você precisa saber a fonte para relatórios e regras de negócio.

- **`channel` (String):**
- Identifica a porta de entrada.
- Exemplos: `web_store`, `mobile_app`, `pos_store_01` (Caixa físico), `whatsapp_bot`, `amazon_marketplace`.

- **`tags` (Array/JSONB):**
- O sistema de etiquetagem flexível para operação.
- Exemplos: `["vip_customer", "suspected_fraud", "urgent_delivery", "black_friday"]`.
- Isso permite que o time de logística filtre: "Me dê todos os pedidos com tag `urgent`".

### 3. O Snapshot Financeiro (Imutabilidade)

O pedido **não pode** depender de cálculos dinâmicos. Todos os valores devem ser salvos como valores fixos (Hardcoded) no momento da criação.

- **`currency` (String):** BRL, USD. O pedido nasce e morre na moeda original.
- **`tax_lines` (JSONB):**
- Em vez de apenas um total, guarde o detalhe fiscal.
- Ex: `[{"title": "ICMS", "rate": 0.18, "amount": 18.00}, {"title": "IPI", "rate": 0.05, "amount": 5.00}]`.
- Isso serve para qualquer país e qualquer regime tributário.

- **`discount_applications` (JSONB):**
- Rastreabilidade de _por que_ o preço baixou.
- Ex: `[{"code": "NATAL10", "amount": 10.00, "type": "percentage"}, {"description": "Desconto Gerente", "amount": 50.00}]`.

### 4. Campos de "Extensibilidade" (A Mágica do JSONB)

Aqui é onde você resolve o problema de "produtos estranhos" ou "regras B2B" sem criar colunas novas.

- **`custom_attributes` (JSONB):**
- Dados que o **cliente** preencheu e são visíveis para ele.
- _Floricultura:_ `{"key": "Mensagem Cartão", "value": "Te amo mãe"}`.
- _B2B:_ `{"key": "Número da PO", "value": "PO-998877"}`.
- _Delivery:_ `{"key": "Instrução", "value": "Tocar interfone 2x"}`.

- **`metadata` (JSONB):**
- Dados ocultos do sistema/backend (não visíveis ao cliente).
- _Integração:_ `{"erp_order_id": "999", "sync_status": "success"}`.
- _Marketing:_ `{"utm_source": "google", "utm_campaign": "verao2026"}`.

- **`risk_analysis` (JSONB):**
- Dados de fraude consolidados.
- Ex: `{"score": 85, "recommendation": "review", "provider": "clearsale"}`.

### 5. Snapshot do Cliente (`customer_snapshot`)

Este é um erro clássico: Relacionar o Pedido ao Cliente apenas por ID (`customer_id`).
**O Problema:** Se o cliente mudar o e-mail ou o telefone amanhã, o histórico do pedido antigo muda incorretamente. Ou se o usuário for deletado (LGPD), o pedido quebra.

**A Solução Generalista:**

- **`customer_snapshot` (JSONB):**
- Cópia dos dados do cliente _no momento da compra_.
- `{"name": "João", "email": "joao@email.com", "phone": "1199999999", "tax_id": "CPF..."}`.
- Isso garante a integridade da nota fiscal para sempre.

---

### Exemplo de SQL (PostgreSQL)

Aqui está a implementação técnica desses conceitos:

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificadores
    order_number BIGINT GENERATED BY DEFAULT AS IDENTITY, -- Sequencial simples para humanos (#1001)
    idempotency_key VARCHAR(100) UNIQUE, -- Previne duplicação técnica (clique duplo no botão comprar)
    channel VARCHAR(50) DEFAULT 'web', -- De onde veio

    -- Relacionamentos
    shop_id UUID, -- Para sistemas Multi-tenant/Marketplace
    customer_id UUID, -- Link "vivo" (pode ser null se Guest)

    -- Máquina de Estados (O Triângulo de Status)
    status VARCHAR(20) DEFAULT 'open', -- open, archived, cancelled
    payment_status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, authorized, paid, refunded, voided
    fulfillment_status VARCHAR(20) DEFAULT 'unfulfilled', -- unfulfilled, partial, fulfilled, restocked

    -- O Dinheiro (Snapshot Imutável)
    currency CHAR(3) DEFAULT 'BRL',
    subtotal_price DECIMAL(15, 2) NOT NULL, -- Soma dos itens
    total_discounts DECIMAL(15, 2) DEFAULT 0,
    total_tax DECIMAL(15, 2) DEFAULT 0,
    total_shipping DECIMAL(15, 2) DEFAULT 0,
    total_tip DECIMAL(15, 2) DEFAULT 0, -- Gorjeta (Comum em Food Service)
    total_price DECIMAL(15, 2) NOT NULL, -- O valor que saiu do bolso do cliente

    -- Dados Ricos (JSONB)
    tax_lines JSONB DEFAULT '[]', -- Detalhe dos impostos
    discount_codes JSONB DEFAULT '[]', -- Cupons usados

    -- Extensibilidade
    note TEXT, -- Campo simples de observação
    tags TEXT[], -- Array de strings para filtros rápidos
    custom_attributes JSONB DEFAULT '[]', -- Campos extras do cliente (KV Pair)
    metadata JSONB DEFAULT '{}', -- Campos técnicos ocultos

    -- Snapshots de Segurança
    customer_snapshot JSONB NOT NULL, -- Dados do cliente congelados
    billing_address JSONB, -- Endereço fiscal congelado
    shipping_address JSONB, -- Endereço entrega congelado

    -- Rastreabilidade Temporal
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    cancelled_at TIMESTAMP,
    closed_at TIMESTAMP -- Quando o pedido foi arquivado
);

```

### Resumo da Generalização

Essa estrutura suporta:

1. **Venda de Carro:** `fulfillment_status` vira "Aguardando Retirada", `metadata` guarda o número do Chassi.
2. **Assinatura de Software:** `shipping_address` é nulo, `fulfillment_status` vira "Fulfilled" automaticamente ao enviar o e-mail de ativação.
3. **Pizza:** `custom_attributes` guarda "Sem cebola", `total_tip` guarda a gorjeta do motoboy.
4. ## **B2B Industrial:** `payment_status` fica `unpaid` (Faturado 30 dias), `metadata` guarda código de aprovação do gerente.

## 7. Entregas (Shipments)

Para o **Shipment** (Envio/Fulfillment), o nível "super generalista" exige que o sistema suporte desde um motoboy entregando uma pizza em 30 minutos até um container vindo da China que leva 60 dias e troca de transportadora 3 vezes.

A regra de ouro aqui é: **O Shipment é a verdade física.** O `Order` é o que o cliente _queria_, o `Shipment` é o que você efetivamente _mandou_ (que pode ser menos, dividido ou substituído).

Aqui está a modelagem definitiva para Logística e Entregas:

---

### 1. Conceitos Fundamentais

Antes da tabela, entenda o que ela resolve:

1. **Split Shipment (Envio Dividido):** O cliente comprou Geladeira + Livro. A Geladeira sai do CD (Transportadora A). O Livro sai da Loja (Correios). São 2 Shipments para 1 Order.
2. **Multi-Modal:** O shipment pode ser uma caminhão (`truck`), um download (`digital`), ou uma retirada (`pickup_in_store`).
3. **Custo Real vs. Custo Cobrado:** O cliente pagou R$ 20 de frete no pedido. Mas, na hora de gerar a etiqueta, custou R$ 18,50 para a empresa. O Shipment guarda o custo _operacional_.

---

### 2. A Tabela Mestre: `shipments`

```sql
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Vínculos
    order_id UUID NOT NULL REFERENCES orders(id),
    location_id UUID REFERENCES locations(id), -- De onde saiu (CD, Loja, Fornecedor Dropshipping)

    -- Máquina de Estados Logística
    status VARCHAR(30) DEFAULT 'pending',
    -- pending: Aguardando separação
    -- ready_to_ship: Etiqueta gerada/Embalado
    -- shipped: Coletado pela transportadora (Saiu do prédio)
    -- in_transit: Em trânsito (Updates intermediários)
    -- out_for_delivery: Saiu para entrega ao destinatário
    -- delivered: Entregue
    -- failed_attempt: Destinatário ausente
    -- exception: Extravio/Roubo/Avaria
    -- returned_to_sender: Devolvido

    -- Quem transporta (Carrier)
    carrier_company VARCHAR(100), -- "Correios", "FedEx", "Uber Flash", "Loggi"
    carrier_service VARCHAR(100), -- "Sedex 10", "Standard Ground", "Moto Express"
    tracking_number VARCHAR(100), -- O código de rastreio principal
    tracking_url TEXT, -- Link direto para rastreio

    -- Dimensões Reais do Pacote (Auditabilidade)
    weight_g INTEGER, -- Peso final da caixa fechada (pode divergir da soma dos produtos)
    height_mm INTEGER,
    width_mm INTEGER,
    depth_mm INTEGER,
    package_type VARCHAR(50), -- "box", "envelope", "pallet", "tube"

    -- Documentação e Etiquetas
    shipping_label_url TEXT, -- Link para o PDF/ZPL da etiqueta gerada
    invoice_url TEXT, -- Link da Nota Fiscal de Transporte (CTe ou NFe)
    invoice_key VARCHAR(100), -- Chave de acesso da NFe (Brasil)

    -- Custos Operacionais (Segredo Industrial)
    cost_amount DECIMAL(15, 2), -- Quanto a empresa pagou para a transportadora
    insurance_amount DECIMAL(15, 2), -- Valor segurado

    -- Datas Críticas
    estimated_delivery_at TIMESTAMP, -- O SLA prometido
    shipped_at TIMESTAMP, -- Quando a transportadora bipou
    delivered_at TIMESTAMP, -- O sucesso

    -- Extensibilidade
    metadata JSONB, -- Ex: {"locker_code": "1234"} para armários inteligentes
    customs_info JSONB, -- Ex: {"hs_code": "...", "country_of_origin": "BR"} para exportação

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

```

### 3. O Conteúdo do Pacote: `shipment_items`

Não basta dizer que o pacote saiu. Você precisa dizer **exatamente o que está dentro dele**.
Se o cliente comprou 5 cadeiras, mas só cabem 2 por caixa, você terá 3 Shipments. O `shipment_items` faz a ponte matemática.

```sql
CREATE TABLE shipment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES shipments(id),

    -- Conexão com o Pedido
    order_item_id UUID NOT NULL, -- Referência à linha original do pedido

    -- O que foi enviado NESTE pacote
    quantity INTEGER NOT NULL,

    -- Controle de Qualidade (Opcional mas Enterprise)
    batch_number VARCHAR(100), -- Qual lote exato foi pego? (Rastreabilidade de validade)
    serial_numbers TEXT[] -- Array de Seriais se for eletrônico (Ex: [IMEI1, IMEI2])
);

```

---

### 4. Casos de Uso Generalistas Explicados

#### A. O "Digital Fulfillment" (Ebook/Curso/Gift Card)

- **Carrier:** `email` ou `system`.
- **Tracking Number:** Nulo ou um ID de transação interna.
- **Status:** Vai direto de `pending` para `delivered` em segundos.
- **Metadata:** Guarda o link de acesso ou o código do Gift Card (`{"redemption_code": "XYZ-123"}`).

#### B. "Click & Collect" / "Retira na Loja"

- **Carrier:** `customer` (O cliente é o transportador).
- **Location ID:** A loja onde o produto está esperando.
- **Status:**
- `ready_to_ship` = "Pronto para retirada" (Cliente recebe notificação).
- `delivered` = "Cliente retirou no balcão".

- **Metadata:** `{"pickup_person": "Nome da Esposa", "id_document": "RG..."}`.

#### C. Dropshipping (Venda sem Estoque)

- **Location ID:** ID do Fornecedor na China/Parceiro.
- **Tracking Number:** Código internacional (LP...CN).
- **Custo:** O `cost_amount` é quanto o fornecedor cobrou de frete de você.
- **Customs Info:** Preenchido com dados de importação.

#### D. Frota Própria (Caminhão da Empresa)

- **Carrier:** `own_fleet`.
- **Tracking:** Pode ser a placa do caminhão ou ID da rota.
- **Metadata:** `{"driver_name": "Seu Zé", "vehicle_plate": "ABC-1234"}`.

### 5. O Fluxo de Tracking (A tabela oculta `shipment_events`)

Para sistemas muito avançados (que mostram a linha do tempo "Saiu de Cajamar" -> "Chegou em Curitiba"), você não guarda isso apenas no `status`. Você tem uma tabela de eventos (History Log).

```sql
CREATE TABLE shipment_events (
    id UUID PRIMARY KEY,
    shipment_id UUID REFERENCES shipments(id),
    status VARCHAR(50), -- status normalizado
    description TEXT, -- "Objeto encaminhado para Unidade de Tratamento"
    location VARCHAR(255), -- "Curitiba / PR"
    happened_at TIMESTAMP, -- Data real do evento
    raw_data JSONB -- O JSON bruto que a API dos Correios/FedEx devolveu
);

```

### Resumo da Arquitetura Logística

Com essa estrutura `shipments` + `shipment_items`:

1. Você sabe que o **Pedido #50** teve 3 pacotes.
2. Pacote 1 (Shipment A): Saiu da Loja SP, via Motoboy, entregue em 2h.
3. Pacote 2 (Shipment B): Saiu do CD ES, via Transportadora, entregue em 3 dias.
4. Pacote 3 (Shipment C): Digital (Manual PDF), via Email, entregue na hora.

## Tudo isso vivendo harmoniosamente na mesma tabela.

## 8. Clientes (Customers)

Para completar a nossa arquitetura "super generalista", o **Cliente** (Customer) talvez seja a entidade mais mal compreendida.

O erro comum é tratar Cliente apenas como uma "Pessoa Física com CPF". Mas e se o cliente for uma **Empresa** (B2B)? E se for uma **ONG**? E se for um **Departamento do Governo**? E se for um **Hóspede** que compra anonimamente?

Para ser universal, a tabela de clientes precisa separar **Acesso (Login)** de **Identidade (Perfil)** e **Contexto (Comportamento)**.

Aqui está a modelagem definitiva para `customers`.

---

### 1. A Estrutura Base: Pessoas e Organizações

A primeira grande decisão: **Pessoa Física vs. Jurídica**.
Em vez de tabelas separadas, usamos uma única tabela com "estratégia de camaleão".

```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tipo Fundamental
    type VARCHAR(20) NOT NULL DEFAULT 'individual',
    -- 'individual' (B2C), 'business' (B2B), 'government', 'organization'

    -- Identidade Base
    email VARCHAR(255) UNIQUE, -- Chave principal de contato (pode ser NULL para clientes de loja física anônimos)
    phone VARCHAR(50), -- Com DDI (+55...)

    -- O Camaleão (Nomes)
    first_name VARCHAR(100), -- "João" ou NULL se for empresa
    last_name VARCHAR(100),  -- "Silva" ou NULL se for empresa
    company_name VARCHAR(255), -- "Tech Solutions Ltda" ou NULL se for pessoa

    -- Documentos (O pesadelo global resolvido)
    tax_id VARCHAR(50), -- O número em si (CPF, CNPJ, SSN, VAT ID)
    tax_id_type VARCHAR(20), -- O tipo (br_cpf, br_cnpj, us_ssn, eu_vat)
    state_tax_id VARCHAR(50), -- Inscrição Estadual (Para B2B)

    -- Gestão de Conta
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, blocked, guest (não tem login)
    currency CHAR(3) DEFAULT 'BRL', -- Moeda preferida
    language CHAR(2) DEFAULT 'pt', -- Idioma preferido (en, es)

    -- Marketing e Segmentação
    tags TEXT[], -- ["vip", "bad_payer", "wholesale", "influencer"]
    accepts_marketing BOOLEAN DEFAULT FALSE,

    -- Grupos e Segmentos
    customer_group_id UUID, -- Link para tabela de grupos (Ex: "Revendedores Ouro" que têm 10% off)

    -- Métricas Acumuladas (Cache para performance)
    total_spent DECIMAL(15, 2) DEFAULT 0, -- LTV (Lifetime Value)
    orders_count INTEGER DEFAULT 0,
    last_order_at TIMESTAMP,

    -- Extensibilidade
    notes TEXT, -- "Cliente chato, cuidado", "Prefere ser chamado de Dr."
    metadata JSONB, -- IDs externos, integração ERP
    custom_attributes JSONB, -- "Data de Aniversário", "Nome do Cão", "Time de Futebol"

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

```

---

### 2. Aprofundando nos Atributos Generalistas

#### A. O "Camaleão" de Nomes

- **B2C (Varejo):** Preenche `first_name` e `last_name`. `company_name` fica NULL.
- **B2B (Atacado):** Preenche `company_name`. Pode usar `first_name` para o "Nome do Comprador/Representante".
- **Nome de Exibição:** No backend (código), você cria um _getter_ virtual:

```javascript
get displayName() {
    return this.company_name || `${this.first_name} ${this.last_name}`;
}

```

#### B. Documentos Globais (`tax_id`)

Nunca crie colunas chamadas `cpf` ou `cnpj`. Se sua empresa expandir para a Argentina amanhã, você terá que criar `dni`.

- **Solução:** Par `valor` + `tipo`.
- Exemplo Brasil: `tax_id: "123.456.789-00"`, `tax_id_type: "br_cpf"`.
- Exemplo Europa: `tax_id: "DE123456789"`, `tax_id_type: "eu_vat"`.
- Isso permite validação dinâmica baseada no tipo.

#### C. O Cliente "Guest" (Convidado)

Muitos clientes compram sem criar senha.

- Eles existem na tabela `customers`? **Sim.**
- O campo `status` é marcado como `guest`.
- Se amanhã ele decidir "criar conta" usando o mesmo e-mail, você apenas muda o status para `active` e define uma senha na tabela de autenticação (separada). O histórico de compras é preservado!

---

### 3. Tabela Satélite: `customer_addresses`

Clientes têm múltiplos endereços. Nunca coloque endereço na tabela principal.

```sql
CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),

    -- Rótulo
    type VARCHAR(20) DEFAULT 'shipping', -- shipping, billing, both
    is_default BOOLEAN DEFAULT FALSE,

    -- Dados
    first_name VARCHAR(100), -- Quem recebe pode ser diferente do dono da conta
    last_name VARCHAR(100),
    company VARCHAR(100),

    address1 VARCHAR(255), -- Rua, Número
    address2 VARCHAR(255), -- Complemento
    city VARCHAR(100),
    province_code VARCHAR(10), -- SP, RJ, CA, NY
    country_code CHAR(2), -- BR, US
    postal_code VARCHAR(20), -- CEP
    phone VARCHAR(50), -- Telefone específico deste local

    metadata JSONB -- "Portão azul", "Deixar na portaria"
);

```

### 4. Tabela de Relacionamentos B2B (A "Hierarquia")

Se você vende para empresas grandes, o "Cliente" é a Coca-Cola, mas quem compra é o "João".

Você pode resolver isso adicionando um `parent_id` na tabela `customers` (Auto-relacionamento).

- **Coca-Cola Matriz (ID 1):** `type=business`, `parent_id=null`.
- **Coca-Cola Filial Sul (ID 2):** `type=business`, `parent_id=1`.
- **João Comprador (ID 3):** `type=individual`, `parent_id=2` (Vinculado à filial).

Isso permite relatórios: "Quanto a Coca-Cola inteira gastou?" (Soma recursiva).

---

### 5. Dados Comportamentais vs. Cadastrais

Um erro comum é misturar o que o cliente **é** com o que o cliente **faz**.

- **O que ele é (Tabela Customers):** Nome, CPF, E-mail.
- **O que ele faz (Métricas/Tags):**
- Não calcule LTV (Lifetime Value) toda vez que abrir o painel.
- Use os campos cacheados `total_spent` e `orders_count`.
- Toda vez que uma `Order` muda para `paid`, um gatilho (trigger ou job) incrementa esses campos no Cliente.
- Isso permite filtros instantâneos: _"Mostre clientes que gastaram mais de R$ 5.000"_.

### 6. Casos de Uso Generalistas

1. **Marketplace / Multi-loja:**

- Se você tem várias lojas, o cliente é único ou por loja?
- Geralmente, adiciona-se `store_id` (se for isolado) ou mantém global (se for SSO - Single Sign On).

2. **Influenciador (Affiliate):**

- O cliente também pode ser um parceiro.
- Use `tags` ("influencer") e `metadata` (`{"commission_rate": 0.10, "coupon_code": "JOAO10"}`).

3. **Cliente "Sujo" (Legado):**

- Importou dados de um sistema velho e faltam campos?
- O schema é flexível (quase tudo é _nullable_), exceto o ID.
- Use `notes` para documentar a importação: "Importado do SAP em 2024".

### Resumo da Arquitetura de Cliente

- **Cliente:** Quem é (Entidade Legal).
- **Endereços:** Onde ele está.
- **User/Auth (Tabela Externa):** Credenciais de login (Senha, 2FA). _Não misture senha na tabela de cliente!_
- **Grupos:** Regras de negócio (Atacado, Varejo, VIP).

## Essa estrutura permite que o mesmo registro no banco represente um adolescente comprando um tênis ou uma multinacional comprando 10 mil licenças de software.

## 9. Autenticação (Auth)

A **Autenticação** é o porteiro do seu sistema. Para ser generalista, ela precisa ignorar completamente _quem_ é a pessoa (se é um CEO, um estagiário ou um cliente comprando bala) e focar apenas em _como_ essa pessoa prova que é ela mesma.

O erro número 1 é colocar colunas como `is_admin` ou `permissions` na tabela de usuários. Isso mistura **Autenticação** (Quem sou eu) com **Autorização** (O que posso fazer).

Aqui está a modelagem definitiva para um sistema de identidade moderno (compatível com OAuth2, OIDC, SAML e Passwordless).

---

### 1. A Tabela Mestre: `users` (Identity Provider)

Esta tabela guarda a credencial raiz. Note que ela é "magra". Ela não tem endereço, nem histórico de compras. Ela só serve para Logar.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificador Principal (Login Handle)
    email VARCHAR(255) UNIQUE, -- Essencial para recuperação de conta
    phone VARCHAR(50) UNIQUE, -- Para sistemas Mobile-First (WhatsApp Login)

    -- Segurança de Senha (Local Strategy)
    password_hash VARCHAR(255), -- NUNCA senha pura. Use Argon2 ou Bcrypt. Pode ser NULL se usar apenas Google/Social.
    security_stamp VARCHAR(100), -- Um UUID que muda toda vez que a senha muda. Invalida tokens antigos instantaneamente.

    -- Segurança de Acesso (Lockout Mechanism)
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_phone_verified BOOLEAN DEFAULT FALSE,
    failed_login_attempts INTEGER DEFAULT 0, -- Contador para Brute Force
    lockout_end_at TIMESTAMP, -- "Sua conta está bloqueada por 30 min"

    -- Autenticação Multifator (MFA/2FA)
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(100), -- O segredo do Google Authenticator/Authy (TOTP)
    mfa_backup_codes TEXT[], -- Códigos de recuperação de emergência

    -- Auditoria
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(45), -- IPv4 ou IPv6
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- O Elo com o Mundo Real (Polimorfismo Lógico)
    -- Não usamos FK rígida aqui para manter a tabela pura, mas logicamente conecta-se a perfis
    profile_type VARCHAR(20), -- 'customer', 'staff', 'system'
    status VARCHAR(20) DEFAULT 'active' -- active, suspended, banned, pending_deletion
);

```

---

### 2. Tabela de Login Social: `user_identities` (OAuth/SSO)

Hoje em dia, obrigar o usuário a criar senha é perder conversão. Ele quer clicar em "Entrar com Google" ou "Entrar com Apple".
Para ser generalista, um usuário (`users`) pode ter N identidades.

```sql
CREATE TABLE user_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Quem é o provedor?
    provider VARCHAR(50) NOT NULL,
    -- 'google', 'facebook', 'apple', 'github', 'microsoft_azure_ad', 'saml_enterprise'

    -- Quem é o usuário lá?
    provider_user_id VARCHAR(255) NOT NULL, -- O ID numérico/string que o Google manda (sub)

    -- Dados de Conexão (Para renovar acesso)
    access_token TEXT, -- O token para chamar APIs do Google em nome do user (Opcional)
    refresh_token TEXT, -- Para pegar novos tokens
    expires_at TIMESTAMP,

    profile_data JSONB, -- Snapshot do perfil que veio do Google (Avatar, Locale)

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (provider, provider_user_id) -- Garante que um ID do Google só pertença a um user
);

```

---

### 3. Tabela de Sessões: `user_sessions` (Device Management)

Sistemas modernos (como Netflix ou bancos) permitem ver "Dispositivos Conectados" e derrubar um específico. JWTs puros não permitem isso facilmente. Você precisa de uma tabela de sessões ativas (Refresh Tokens).

```sql
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Este ID vai dentro do Refresh Token (JTI)
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Impressão Digital do Dispositivo
    user_agent TEXT, -- "Chrome on Windows 10"
    ip_address VARCHAR(45),
    device_type VARCHAR(20), -- 'mobile', 'desktop', 'tablet'
    location VARCHAR(100), -- "São Paulo, BR" (GeoIP)

    -- Validade
    token_hash VARCHAR(255), -- Hash do Refresh Token entregue ao user (segurança extra)
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP, -- Se preenchido, o token foi "morto" manualmente (Logout forçado)

    created_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP -- Para saber "Visto por último há 2 dias"
);

```

---

### 4. Aprofundando nos Conceitos Generalistas

#### A. O `security_stamp` (A Válvula de Segurança)

Imagine que um hacker roubou o Cookie/Token do usuário. O usuário percebe e troca a senha.
Se o Token antigo continuar valendo, a troca de senha foi inútil.
**Como funciona:**

1. Todo Token (JWT) tem o `security_stamp` atual criptografado dentro dele.
2. Quando o usuário muda a senha, o sistema gera um NOVO `security_stamp` aleatório no banco.
3. Quando o hacker tentar usar o token antigo, a API compara o stamp do token com o do banco.
4. Como são diferentes, o sistema rejeita o acesso: "Token inválido/Senha alterada".

#### B. Separação `users` vs `customers` vs `staff`

Essa é a chave da arquitetura limpa.

- **Tabela `users`:** Cuida de login, senha, 2FA. (Segurança).
- **Tabela `customers`:** Cuida de compras, endereço, histórico. (Negócio).
- **Tabela `staff`:** Cuida de salário, departamento, turno. (RH).

**Como conectar?**
Geralmente, no momento do login, o backend faz:

1. Autentica o `user` (ID: 100).
2. Verifica: Esse email está na tabela `customers`? Sim, ID: 500.
3. Verifica: Esse email está na tabela `staff`? Não.
4. Gera o Token com claims: `{uid: 100, role: "customer", customer_id: 500}`.

Isso permite que um dia, o mesmo e-mail seja **Cliente** (compra produtos) e **Staff** (trabalha no suporte), com permissões diferentes, mas uma única senha.

#### C. Passkeys e WebAuthn (O Futuro)

Para suportar Login com Biometria (TouchID/FaceID) sem senha, você precisaria de uma tabela `user_credentials` (padrão FIDO2).
Ela guarda a chave pública gerada pelo celular do usuário. É uma extensão natural dessa arquitetura, funcionando similar à tabela `identities`.

### 5. Controle de Acesso (Authorization - RBAC)

Embora não seja estritamente "Autenticação", o modelo generalista precisa de Roles (Papéis).
Não use colunas booleanas (`is_admin`, `is_manager`). Use uma tabela de ligação.

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) UNIQUE, -- 'admin', 'editor', 'customer_support'
    permissions TEXT[] -- ['product:create', 'order:refund', 'user:view']
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id),
    role_id UUID REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

```

### Resumo da Arquitetura

1. **Usuário esqueceu a senha?** Interage com `users` (gera token de reset, atualiza `password_hash` e `security_stamp`).
2. **Usuário logou com Google?** Cria linha em `users` (sem senha) e linha em `user_identities`.
3. **Usuário trocou de celular?** O sistema vê na tabela `sessions` que um novo `device_type` apareceu.
4. **Admin quer banir usuário?** Atualiza `users.status = 'banned'`. O middleware de autenticação checa isso em cada requisição.

## Essa estrutura é usada por gigantes como Auth0, Cognito e Firebase Auth por baixo dos panos.

## 10. Atendimento (Inquiries)

Para a aba de **Contato**, se você pensar apenas como "um formulário que envia um e-mail", você estará criando um site de padaria de 1999.

Em um sistema **super generalista**, a "Aba de Contato" é a porta de entrada para três mundos gigantescos:

1. **Suporte (Helpdesk):** "Meu produto veio quebrado."
2. **Vendas (CRM/Leads):** "Quero um orçamento para 500 peças."
3. **Legal/Institucional:** "Quero trabalhar aí" ou "Apaguem meus dados (LGPD)".

Portanto, não chame a tabela de `contact_messages`. Chame de **`inquiries`** (Solicitações/Atendimentos) ou **`tickets`**. Ela deve funcionar como um hub de mensageria centralizado.

Aqui está a modelagem definitiva para gerenciar o contato com o mundo externo.

---

### 1. A Tabela Mestre: `inquiries` (O Cabeçalho do Atendimento)

Esta tabela representa a **thread** (o fio da meada). Ela agrupa toda a conversa sobre um assunto específico.

- `id` (UUID): Identificador único (o famoso "Número de Protocolo").
- `protocol_number` (String): Um ID amigável para o humano (ex: "20241020-ABCD").
- **A Classificação (Triagem Automática):**
- `type` (Enum): Define o fluxo de trabalho.
- Values: `support` (problema), `lead` (venda), `general` (dúvida), `partnership` (parceria), `data_privacy` (LGPD).

- `priority` (Enum): `low`, `normal`, `high`, `urgent`.
- `status` (Enum): O ciclo de vida.
- Values: `new` (ninguém viu), `open` (em análise), `pending_customer` (esperando resposta do cliente), `resolved` (concluído), `closed` (arquivado).

- **A Origem (Omnichannel):**
- `source` (Enum): De onde veio isso?
- Values: `contact_form`, `email`, `whatsapp`, `phone_call` (registrado manualmente), `live_chat`, `instagram_dm`.

- **Quem é o Solicitante (Snapshot vs Vínculo):**
- `user_id` / `customer_id` (UUID): Vínculo opcional se a pessoa já for cadastrada.
- `requester_snapshot` (JSONB): **Obrigatório.**
- Mesmo se o usuário for logado, guarde o contato _daquele momento_.
- `{"name": "Maria", "email": "maria@gmail.com", "phone": "..."}`.
- Isso permite que não-clientes (Leads) entrem em contato sem criar conta no sistema.

- **Roteamento Interno:**
- `department` (String): "Financeiro", "Comercial", "Suporte Técnico".
- `assigned_to_staff_id` (UUID): Qual funcionário é o "dono" desse problema agora.

- **Contexto Rico:**
- `subject` (String): O título da mensagem.
- `metadata` (JSONB): Onde a mágica acontece.
- _No E-commerce:_ `{"order_id": "..."}` (Estou reclamando deste pedido).
- _No Software:_ `{"browser": "Chrome", "os": "Windows 11"}` (Bug report).
- _No Imobiliário:_ `{"property_ref": "AP-202"}` (Tenho interesse neste apê).

---

### 2. A Tabela de Diálogo: `inquiry_messages` (O Chat)

Nunca guarde a mensagem no cabeçalho. Um contato quase sempre vira um "vai e volta". Essa tabela guarda o histórico cronológico.

- `id` (UUID): PK.
- `inquiry_id` (FK): Vínculo com o protocolo.
- **O Autor:**
- `sender_type` (Enum): `customer`, `staff`, `system` (bot/auto-reply).
- `sender_id` (UUID): ID do usuário ou funcionário (se houver).

- **O Conteúdo:**
- `body` (Text): A mensagem em si (suporte a Markdown ou HTML).
- `internal_note` (Boolean): Se `true`, é uma nota que só os funcionários veem ("O cliente está nervoso, cuidado").

- **Anexos (Evidências):**
- `attachments` (JSONB): Array de links.
- `[{"url": "s3://...", "name": "print_erro.png", "type": "image/png"}]`.

- **Rastreabilidade:**
- `read_at` (Timestamp): Quando o destinatário leu (o "check azul" do WhatsApp).
- `channel_message_id` (String): ID externo (se veio do WhatsApp/Email) para threading.

---

### 3. Tabela de Avaliação: `inquiry_surveys` (CSAT/NPS)

Em um sistema profissional, todo contato fechado gera uma pesquisa de satisfação.

- `inquiry_id` (FK): Vínculo.
- `score` (Integer): 1 a 5 (CSAT) ou 0 a 10 (NPS).
- `feedback` (Text): "O atendente foi ótimo, mas o produto é ruim."
- `created_at` (Timestamp).

---

### Exemplo de SQL (PostgreSQL)

```sql
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identidade Visual do Protocolo
    protocol_number VARCHAR(50) UNIQUE NOT NULL, -- Ex: 2024-XA92

    -- Classificação
    type VARCHAR(50) DEFAULT 'general', -- support, sales, partnership
    status VARCHAR(50) DEFAULT 'new', -- new, open, pending, solved, closed, spam
    priority VARCHAR(20) DEFAULT 'normal',

    -- Origem
    source VARCHAR(50) DEFAULT 'web_form', -- email, whatsapp, phone

    -- Solicitante (Híbrido: Vínculo ou Snapshot)
    customer_id UUID REFERENCES customers(id), -- Opcional
    requester_data JSONB NOT NULL,
    -- Ex: {"name": "João", "email": "j@test.com", "phone": "1199..."}

    -- Responsabilidade
    department VARCHAR(50), -- 'sales', 'tech_support'
    assigned_staff_id UUID REFERENCES users(id),

    -- Assunto
    subject VARCHAR(255),

    -- Links Inteligentes
    related_order_id UUID, -- Se for dúvida sobre pedido
    related_product_id UUID, -- Se for dúvida sobre produto
    metadata JSONB, -- Contexto técnico (URL onde estava, Browser, IP)

    -- Prazos (SLA)
    sla_due_at TIMESTAMP, -- Quando isso DEVE ser respondido
    resolved_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inquiry_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL REFERENCES inquiries(id),

    -- Quem falou?
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('customer', 'staff', 'bot')),
    sender_id UUID, -- Pode ser null se for cliente não cadastrado

    -- O que falou?
    body TEXT,
    is_internal_note BOOLEAN DEFAULT FALSE, -- O cliente não vê isso

    -- Arquivos
    attachments JSONB DEFAULT '[]',

    -- Metadados de Mensageria
    external_id VARCHAR(255), -- ID do email no Gmail ou MessageID do Twilio
    read_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW()
);

```

### Por que esses atributos são "Generalistas"?

1. **Transformação em Lead (Vendas):**

- Alguém preenche o formulário: "Tenho interesse no plano Enterprise".
- Cria-se um `inquiry` do tipo `sales`.
- O vendedor conversa via `inquiry_messages`.
- Se fechar negócio, você tem todo o histórico da negociação vinculado ao futuro Cliente.

2. **Multicanal (Omnichannel):**

- O sistema pode ler uma caixa de e-mail (IMAP) e transformar cada e-mail novo em uma linha na tabela `inquiries`.
- Se o cliente responder o e-mail, o sistema acha o `inquiry` pelo ID no título ("Re: [Protocolo 123]") e insere uma nova linha em `inquiry_messages`.
- Para o atendente, parece um chat.

3. **Formulários Dinâmicos:**

- No seu frontend, você pode ter formulários diferentes.
- Formulário "Trabalhe Conosco" -> Salva no `metadata`: `{"linkedin": "...", "portfolio": "..."}`.
- Formulário "Orçamento" -> Salva no `metadata`: `{"budget": 50000}`.

- O banco de dados não muda, o `metadata` absorve a variação.

4. **Notas Internas (`is_internal_note`):**

- Isso é vital. O cliente manda uma dúvida difícil.
- Atendente A comenta na thread: "Ei Chefe, como respondo isso?" (`internal_note = true`).
- Chefe responde: "Diga que é erro de DNS" (`internal_note = true`).
- Atendente responde ao cliente: "Prezado, verifique seu DNS" (`internal_note = false`).
- O cliente nunca vê a conversa interna, mas fica tudo registrado para auditoria.

### Resumo

A aba "Contato" não é um fim, é um começo. Com essa estrutura, você não está criando apenas um formulário, está criando a base para um **Zendesk** ou **Salesforce** próprio dentro do seu sistema.

---

## 11. Sincronização (Sync)

A arquitetura do sistema segue um modelo **Hybrid Cloud + Local Nodes** (baseado em WatermelonDB), onde o desktop opera como um "Mother Node" com banco de dados local (SQLite) que sincroniza totalmente com a nuvem (Supabase/PostgreSQL).

### Estrutura Base

Para suportar o protocolo de consistência eventual, **todas as tabelas** utilizam as seguintes colunas de controle:

```sql
-- Exemplo de colunas obrigatórias para Sync
ALTER TABLE table_name ADD COLUMN _status VARCHAR(20) DEFAULT 'created'; -- created, updated, deleted, synced
ALTER TABLE table_name ADD COLUMN _changed_at TIMESTAMP DEFAULT NOW(); -- Hash ou Timestamp de controle
ALTER TABLE table_name ADD COLUMN updated_at TIMESTAMP DEFAULT NOW(); -- Âncora LWW
```

### Mecanismo de Funcionamento

1.  **Offline-First**: Toda escrita (INSERT/UPDATE) ocorre primeiro no SQLite local, marcando `_status = 'created'` ou `'updated'`.
2.  **Push (Upload)**: Um worker em segundo plano envia registros "sujos" (`_status != 'synced'`) para o Supabase via API.
3.  **Pull (Download)**: O sistema solicita ao Supabase registros onde `updated_at > last_pulled_at`.
4.  **Resolução de Conflitos**: Estratégia **Last Write Wins (LWW)** baseada no timestamp `updated_at`.
