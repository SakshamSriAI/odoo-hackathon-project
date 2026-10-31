-- ====================================================================
-- Brightloop Enterprise Subscription Management System
-- Supabase (PostgreSQL) Production Schema & Seed Data
-- ====================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'staff', 'customer')),
  avatar_url TEXT,
  organization TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Password Resets Table
CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Brand Markups Table
CREATE TABLE IF NOT EXISTS brand_markups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  markup_amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  badge_color TEXT
);

-- 4. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  sales_price NUMERIC(10, 2) NOT NULL,
  cost_price NUMERIC(10, 2) NOT NULL,
  notes TEXT,
  sku_prefix TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  brand_id TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  variant_sku TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  markup_amount NUMERIC(10, 2) NOT NULL,
  final_sales_price NUMERIC(10, 2) NOT NULL,
  cost_price NUMERIC(10, 2) NOT NULL,
  calculated_margin_dollars NUMERIC(10, 2) NOT NULL,
  calculated_margin_percent NUMERIC(5, 2) NOT NULL,
  notes TEXT
);

-- 6. Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  billing_frequency TEXT NOT NULL CHECK(billing_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  minimum_quantity INTEGER NOT NULL DEFAULT 1,
  availability_start_date DATE NOT NULL,
  availability_end_date DATE NOT NULL,
  auto_close_on_expiration BOOLEAN NOT NULL DEFAULT FALSE,
  allow_pause BOOLEAN NOT NULL DEFAULT TRUE,
  allow_renewal BOOLEAN NOT NULL DEFAULT TRUE,
  allow_early_closure BOOLEAN NOT NULL DEFAULT TRUE,
  associated_product_ids_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  base_price NUMERIC(10, 2) NOT NULL,
  featured_badge TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Quotation Templates Table
CREATE TABLE IF NOT EXISTS quotation_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_tier TEXT NOT NULL,
  default_plan_id TEXT NOT NULL,
  default_payment_terms TEXT NOT NULL,
  default_validity_days INTEGER NOT NULL DEFAULT 30,
  line_item_drafts_json JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 8. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  quotation_number TEXT NOT NULL,
  customer_json JSONB NOT NULL,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_frequency TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('draft', 'quotation', 'confirmed', 'active', 'closed')),
  start_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  payment_terms TEXT NOT NULL,
  itemized_lines_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  status_history_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal_amount NUMERIC(12, 2) NOT NULL,
  total_tax_amount NUMERIC(12, 2) NOT NULL,
  grand_total NUMERIC(12, 2) NOT NULL,
  sales_rep_id TEXT,
  sales_rep_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  subscription_id TEXT,
  quotation_number TEXT,
  customer_json JSONB NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('draft', 'confirmed', 'paid', 'cancelled')),
  line_items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC(12, 2) NOT NULL,
  discount_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_total NUMERIC(12, 2) NOT NULL,
  grand_total NUMERIC(12, 2) NOT NULL,
  applied_discount_code TEXT,
  payment_terms TEXT NOT NULL,
  notes TEXT,
  sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Discount Rules Table
CREATE TABLE IF NOT EXISTS discount_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK(type IN ('fixed', 'percentage')),
  value NUMERIC(10, 2) NOT NULL,
  minimum_purchase_quantity INTEGER NOT NULL DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  usage_limit INTEGER NOT NULL DEFAULT 100,
  times_used INTEGER NOT NULL DEFAULT 0,
  applicable_product_ids_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  subscription_id TEXT,
  customer_name TEXT NOT NULL,
  customer_company TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK(payment_method IN ('credit_card', 'ach', 'wire_transfer', 'check')),
  amount NUMERIC(12, 2) NOT NULL,
  transaction_date DATE NOT NULL,
  reference_notes TEXT,
  staff_recorded_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'cleared',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indices for sub-millisecond query execution
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_product_variants_prod_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_sub_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payment_transactions(invoice_id);

-- Enable Row Level Security (RLS) & Public Access for Hackathon Demo
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on product_variants" ON product_variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on subscription_plans" ON subscription_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on quotation_templates" ON quotation_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on subscriptions" ON subscriptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on discount_rules" ON discount_rules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on payment_transactions" ON payment_transactions FOR ALL USING (true) WITH CHECK (true);
