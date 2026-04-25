

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
