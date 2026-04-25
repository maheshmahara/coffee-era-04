-- Coffee ERP Database Schema

-- Users & Auth
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin','manager','operator','viewer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Input Parameters (mirrors Excel Inputs sheet)
CREATE TABLE IF NOT EXISTS input_parameters (
    id SERIAL PRIMARY KEY,
    batch_name VARCHAR(100) NOT NULL,
    batch_date DATE DEFAULT CURRENT_DATE,
    created_by INTEGER REFERENCES users(id),

    -- Volumes & Prices
    fresh_cherry_qty NUMERIC(12,3) DEFAULT 0,
    fresh_cherry_price NUMERIC(12,2) DEFAULT 0,
    dry_cherry_qty NUMERIC(12,3) DEFAULT 0,
    dry_cherry_price NUMERIC(12,2) DEFAULT 0,
    parchment_qty NUMERIC(12,3) DEFAULT 0,
    parchment_price NUMERIC(12,2) DEFAULT 0,
    green_bean_qty NUMERIC(12,3) DEFAULT 0,
    green_bean_price NUMERIC(12,2) DEFAULT 0,

    -- Yield Assumptions
    fresh_to_parchment_yield NUMERIC(6,4) DEFAULT 0.30,
    dry_to_green_yield NUMERIC(6,4) DEFAULT 0.50,
    parchment_to_green_yield NUMERIC(6,4) DEFAULT 0.75,
    green_to_roasted_yield NUMERIC(6,4) DEFAULT 0.85,
    cups_per_kg_roasted NUMERIC(8,2) DEFAULT 50,

    -- Processing Costs (Rs/kg)
    transport_cost_per_kg NUMERIC(10,2) DEFAULT 30,
    fresh_processing_cost_per_kg NUMERIC(10,2) DEFAULT 20,
    dry_cleaning_cost_per_kg NUMERIC(10,2) DEFAULT 10,
    hulling_electricity_per_kg NUMERIC(10,2) DEFAULT 25,
    hulling_labour_per_kg NUMERIC(10,2) DEFAULT 10,
    roasting_electricity_per_kg NUMERIC(10,2) DEFAULT 25,
    roasting_labour_per_kg NUMERIC(10,2) DEFAULT 10,
    packaging_cost_per_kg NUMERIC(10,2) DEFAULT 60,
    cafe_variable_cost_per_cup NUMERIC(10,2) DEFAULT 30,
    cup_selling_price NUMERIC(10,2) DEFAULT 130,

    -- Fixed Costs
    annual_fixed_cost NUMERIC(14,2) DEFAULT 416000,

    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','confirmed','archived')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Procurement Records
CREATE TABLE IF NOT EXISTS procurement (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES input_parameters(id),
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('fresh_cherry','dry_cherry','parchment','green_bean')),
    supplier_name VARCHAR(100),
    quantity_kg NUMERIC(12,3) NOT NULL,
    price_per_kg NUMERIC(10,2) NOT NULL,
    total_cost NUMERIC(14,2) GENERATED ALWAYS AS (quantity_kg * price_per_kg) STORED,
    purchase_date DATE DEFAULT CURRENT_DATE,
    invoice_ref VARCHAR(50),
    transport_cost NUMERIC(12,2) DEFAULT 0,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Processing Stages
CREATE TABLE IF NOT EXISTS processing_stages (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES input_parameters(id),
    stage VARCHAR(30) NOT NULL CHECK (stage IN ('pulping','hulling','roasting','packaging')),
    input_qty_kg NUMERIC(12,3),
    output_qty_kg NUMERIC(12,3),
    actual_yield NUMERIC(6,4),
    electricity_cost NUMERIC(12,2) DEFAULT 0,
    labour_cost NUMERIC(12,2) DEFAULT 0,
    other_cost NUMERIC(12,2) DEFAULT 0,
    process_date DATE DEFAULT CURRENT_DATE,
    operator_name VARCHAR(100),
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Costing Results (calculated from batch inputs)
CREATE TABLE IF NOT EXISTS costing_results (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES input_parameters(id) UNIQUE,
    source_type VARCHAR(20) NOT NULL,

    -- Output quantities
    roasted_output_kg NUMERIC(12,4),
    cups_produced NUMERIC(12,2),

    -- Costs
    procurement_cost NUMERIC(14,2),
    transport_cost NUMERIC(14,2),
    processing_cost NUMERIC(14,2),
    hulling_cost NUMERIC(14,2),
    roasting_cost NUMERIC(14,2),
    packaging_cost NUMERIC(14,2),
    total_variable_cost NUMERIC(14,2),

    -- Unit economics
    cost_per_roasted_kg NUMERIC(12,4),
    coffee_cost_per_cup NUMERIC(12,4),

    -- Revenue & Profit
    cup_sales_revenue NUMERIC(14,2),
    cafe_variable_cost NUMERIC(14,2),
    contribution_before_fixed NUMERIC(14,2),
    annual_fixed_cost NUMERIC(14,2),
    net_profit NUMERIC(14,2),
    net_margin NUMERIC(8,6),
    breakeven_cups_per_day NUMERIC(10,4),

    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    item_type VARCHAR(30) NOT NULL CHECK (item_type IN ('fresh_cherry','dry_cherry','parchment','green_bean','roasted_bean','packaged')),
    quantity_kg NUMERIC(12,3) NOT NULL DEFAULT 0,
    location VARCHAR(100) DEFAULT 'Main Warehouse',
    batch_ref VARCHAR(50),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    updated_by INTEGER REFERENCES users(id)
);

-- Sales Records
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    sale_date DATE DEFAULT CURRENT_DATE,
    product_type VARCHAR(50) DEFAULT 'cafe_cup',
    quantity_cups INTEGER DEFAULT 0,
    quantity_kg NUMERIC(10,3) DEFAULT 0,
    unit_price NUMERIC(10,2) NOT NULL,
    total_revenue NUMERIC(14,2) GENERATED ALWAYS AS (
        CASE WHEN quantity_cups > 0 THEN quantity_cups * unit_price
             ELSE quantity_kg * unit_price END
    ) STORED,
    customer_type VARCHAR(50) DEFAULT 'retail',
    notes TEXT,
    recorded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense Ledger (Chart of Accounts based on Accounts_Map)
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    expense_date DATE DEFAULT CURRENT_DATE,
    main_title VARCHAR(100) NOT NULL,
    sub_title VARCHAR(100),
    gl_group VARCHAR(50),
    amount NUMERIC(14,2) NOT NULL,
    batch_id INTEGER REFERENCES input_parameters(id),
    reference_no VARCHAR(50),
    notes TEXT,
    recorded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_procurement_batch ON procurement(batch_id);
CREATE INDEX idx_processing_batch ON processing_stages(batch_id);
CREATE INDEX idx_costing_batch ON costing_results(batch_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_gl ON expenses(gl_group);

-- Admin user is seeded by backend/start.sh at runtime with correct bcrypt hash

-- Seed demo data
INSERT INTO input_parameters (
    batch_name, batch_date,
    fresh_cherry_qty, fresh_cherry_price,
    dry_cherry_qty, dry_cherry_price,
    parchment_qty, parchment_price,
    green_bean_qty, green_bean_price,
    status, notes
) VALUES 
(
    'Batch-2024-001', '2024-01-15',
    500, 250, 500, 400, 500, 1400, 0, 1900,
    'confirmed', 'Initial demo batch from Excel import'
),
(
    'Batch-2024-002', '2024-02-10',
    800, 260, 300, 410, 600, 1420, 100, 1950,
    'confirmed', 'February batch'
),
(
    'Batch-2024-003', '2024-03-05',
    1000, 255, 400, 395, 700, 1380, 200, 1900,
    'draft', 'March batch - pending confirmation'
) ON CONFLICT DO NOTHING;

-- Seed inventory
INSERT INTO inventory (item_type, quantity_kg, location) VALUES
('fresh_cherry', 500, 'Collection Point A'),
('dry_cherry', 300, 'Drying Beds B'),
('parchment', 150, 'Storage Room 1'),
('green_bean', 80, 'Green Bean Store'),
('roasted_bean', 45, 'Roastery'),
('packaged', 30, 'Dispatch Bay')
ON CONFLICT DO NOTHING;


-- =========================
-- CRM EXTENSION TABLES
-- =========================

CREATE TABLE IF NOT EXISTS collectors (
    id SERIAL PRIMARY KEY,
    collector_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(100),
    district VARCHAR(100),
    municipality VARCHAR(100),
    village VARCHAR(100),
    address VARCHAR(255),
    contract_status VARCHAR(30) DEFAULT 'non_contracted',
    payment_type VARCHAR(30) DEFAULT 'cash',
    preferred_source_type VARCHAR(20),
    bank_details TEXT,
    notes TEXT,
    rating INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE procurement ADD COLUMN IF NOT EXISTS collector_id INTEGER REFERENCES collectors(id);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(120) NOT NULL,
    customer_type VARCHAR(30) DEFAULT 'cafe',
    phone VARCHAR(30),
    email VARCHAR(100),
    district VARCHAR(100),
    city VARCHAR(100),
    address VARCHAR(255),
    payment_terms VARCHAR(100),
    credit_limit NUMERIC(12,2) DEFAULT 0,
    roast_preference VARCHAR(50),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_contacts (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    role_title VARCHAR(80),
    phone VARCHAR(30),
    email VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    lead_title VARCHAR(120) NOT NULL,
    source VARCHAR(50) DEFAULT 'referral',
    stage VARCHAR(30) DEFAULT 'new',
    expected_value NUMERIC(12,2) DEFAULT 0,
    probability INTEGER DEFAULT 10,
    expected_close_date DATE,
    next_follow_up_date DATE,
    customer_id INTEGER REFERENCES customers(id),
    contact_id INTEGER REFERENCES customer_contacts(id),
    owner_user_id INTEGER REFERENCES users(id),
    summary TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotations (
    id SERIAL PRIMARY KEY,
    quote_no VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(30) DEFAULT 'draft',
    quote_date DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    customer_id INTEGER REFERENCES customers(id),
    contact_id INTEGER REFERENCES customer_contacts(id),
    lead_id INTEGER REFERENCES leads(id),
    currency VARCHAR(10) DEFAULT 'NPR',
    subtotal NUMERIC(12,2) DEFAULT 0,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    tax_amount NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) DEFAULT 0,
    line_items JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_orders (
    id SERIAL PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(30) DEFAULT 'new',
    payment_status VARCHAR(30) DEFAULT 'pending',
    fulfillment_status VARCHAR(30) DEFAULT 'queued',
    order_date DATE DEFAULT CURRENT_DATE,
    delivery_date DATE,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    contact_id INTEGER REFERENCES customer_contacts(id),
    quotation_id INTEGER REFERENCES quotations(id),
    product_type VARCHAR(50) DEFAULT 'roasted_bean',
    quantity_kg NUMERIC(10,3) DEFAULT 0,
    quantity_cups INTEGER DEFAULT 0,
    unit_price NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(12,2) DEFAULT 0,
    line_items JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    task_type VARCHAR(40) DEFAULT 'follow_up',
    status VARCHAR(30) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    due_date DATE,
    completed_at TIMESTAMPTZ,
    assigned_to INTEGER REFERENCES users(id),
    collector_id INTEGER REFERENCES collectors(id),
    customer_id INTEGER REFERENCES customers(id),
    contact_id INTEGER REFERENCES customer_contacts(id),
    lead_id INTEGER REFERENCES leads(id),
    quotation_id INTEGER REFERENCES quotations(id),
    order_id INTEGER REFERENCES customer_orders(id),
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS communication_logs (
    id SERIAL PRIMARY KEY,
    direction VARCHAR(20) DEFAULT 'outbound',
    channel VARCHAR(30) DEFAULT 'phone',
    subject VARCHAR(150),
    summary TEXT,
    communication_at TIMESTAMPTZ DEFAULT NOW(),
    collector_id INTEGER REFERENCES collectors(id),
    customer_id INTEGER REFERENCES customers(id),
    contact_id INTEGER REFERENCES customer_contacts(id),
    lead_id INTEGER REFERENCES leads(id),
    quotation_id INTEGER REFERENCES quotations(id),
    order_id INTEGER REFERENCES customer_orders(id),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_procurement_collector ON procurement(collector_id);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(customer_name);
CREATE INDEX IF NOT EXISTS idx_contacts_customer ON customer_contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON customer_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_comms_customer ON communication_logs(customer_id);

INSERT INTO collectors (collector_name, phone, district, municipality, village, contract_status, payment_type, preferred_source_type, rating, notes)
VALUES ('Gulmi Village Collector', '9800000000', 'Gulmi', 'Resunga', 'Simichaur', 'contracted', 'cash', 'parchment', 5, 'Priority supplier for high quality parchment')
ON CONFLICT DO NOTHING;

INSERT INTO customers (customer_name, customer_type, phone, email, district, city, payment_terms, roast_preference, notes)
VALUES ('Himalayan Brew Cafe', 'cafe', '9811111111', 'brew@example.com', 'Kathmandu', 'Kathmandu', 'Net 15', 'medium', 'Buys roasted beans monthly')
ON CONFLICT DO NOTHING;

INSERT INTO customer_contacts (customer_id, full_name, role_title, phone, email, is_primary, notes)
SELECT c.id, 'Sita Manager', 'Owner', '9822222222', 'sita@example.com', TRUE, 'Main buying contact'
FROM customers c WHERE c.customer_name = 'Himalayan Brew Cafe'
ON CONFLICT DO NOTHING;

INSERT INTO leads (lead_title, source, stage, expected_value, probability, customer_id, contact_id, summary)
SELECT 'Monthly roasted bean supply', 'referral', 'proposal_sent', 180000, 60, c.id, cc.id, 'Potential recurring wholesale customer'
FROM customers c
LEFT JOIN customer_contacts cc ON cc.customer_id = c.id AND cc.is_primary = TRUE
WHERE c.customer_name = 'Himalayan Brew Cafe'
ON CONFLICT DO NOTHING;

INSERT INTO quotations (quote_no, status, customer_id, contact_id, subtotal, total_amount, notes)
SELECT 'QT-001', 'sent', c.id, cc.id, 175000, 175000, 'Starter quotation for 50kg monthly supply'
FROM customers c
LEFT JOIN customer_contacts cc ON cc.customer_id = c.id AND cc.is_primary = TRUE
WHERE c.customer_name = 'Himalayan Brew Cafe'
ON CONFLICT DO NOTHING;

INSERT INTO customer_orders (order_no, status, payment_status, fulfillment_status, customer_id, contact_id, quotation_id, product_type, quantity_kg, unit_price, total_amount, notes)
SELECT 'SO-001', 'confirmed', 'pending', 'queued', c.id, cc.id, q.id, 'roasted_bean', 25, 2800, 70000, 'Initial trial order'
FROM customers c
LEFT JOIN customer_contacts cc ON cc.customer_id = c.id AND cc.is_primary = TRUE
LEFT JOIN quotations q ON q.customer_id = c.id AND q.quote_no = 'QT-001'
WHERE c.customer_name = 'Himalayan Brew Cafe'
ON CONFLICT DO NOTHING;
