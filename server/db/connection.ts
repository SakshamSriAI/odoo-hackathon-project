import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

// Database storage directory
const DB_DIR = path.resolve(process.cwd(), 'server', 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'brightloop.db');

export const db = new DatabaseSync(DB_PATH);

// Enable foreign keys and WAL mode for high performance
db.exec('PRAGMA foreign_keys = ON;');

/**
 * Initializes the database tables with proper constraints and indices.
 */
export function initializeSchema(): void {
  db.exec(`
    -- 1. Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'staff', 'customer')),
      avatar_url TEXT,
      organization TEXT,
      password_hash TEXT,
      created_at TEXT NOT NULL
    );

    -- 2. Password Resets Table
    CREATE TABLE IF NOT EXISTS password_resets (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    -- 3. Brand Markups Table
    CREATE TABLE IF NOT EXISTS brand_markups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      markup_amount REAL NOT NULL,
      description TEXT,
      badge_color TEXT
    );

    -- 4. Products Table
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      sales_price REAL NOT NULL,
      cost_price REAL NOT NULL,
      notes TEXT,
      sku_prefix TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- 5. Product Variants Table
    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      brand_id TEXT NOT NULL,
      brand_name TEXT NOT NULL,
      variant_sku TEXT NOT NULL,
      variant_label TEXT NOT NULL,
      markup_amount REAL NOT NULL,
      final_sales_price REAL NOT NULL,
      cost_price REAL NOT NULL,
      calculated_margin_dollars REAL NOT NULL,
      calculated_margin_percent REAL NOT NULL,
      notes TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- 6. Subscription Plans Table
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      description TEXT,
      billing_frequency TEXT NOT NULL CHECK(billing_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
      minimum_quantity INTEGER NOT NULL DEFAULT 1,
      availability_start_date TEXT NOT NULL,
      availability_end_date TEXT NOT NULL,
      auto_close_on_expiration INTEGER NOT NULL DEFAULT 0,
      allow_pause INTEGER NOT NULL DEFAULT 1,
      allow_renewal INTEGER NOT NULL DEFAULT 1,
      allow_early_closure INTEGER NOT NULL DEFAULT 1,
      associated_product_ids_json TEXT NOT NULL DEFAULT '[]',
      base_price REAL NOT NULL,
      featured_badge TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
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
      line_item_drafts_json TEXT NOT NULL DEFAULT '[]'
    );

    -- 8. Subscriptions Table
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      quotation_number TEXT NOT NULL,
      customer_json TEXT NOT NULL,
      plan_id TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      plan_frequency TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('draft', 'quotation', 'confirmed', 'active', 'closed')),
      start_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      payment_terms TEXT NOT NULL,
      itemized_lines_json TEXT NOT NULL DEFAULT '[]',
      status_history_json TEXT NOT NULL DEFAULT '[]',
      subtotal_amount REAL NOT NULL,
      total_tax_amount REAL NOT NULL,
      grand_total REAL NOT NULL,
      sales_rep_id TEXT,
      sales_rep_name TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- 9. Invoices Table
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      subscription_id TEXT,
      quotation_number TEXT,
      customer_json TEXT NOT NULL,
      invoice_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('draft', 'confirmed', 'paid', 'cancelled')),
      line_items_json TEXT NOT NULL DEFAULT '[]',
      subtotal REAL NOT NULL,
      discount_total REAL NOT NULL DEFAULT 0,
      tax_total REAL NOT NULL,
      grand_total REAL NOT NULL,
      applied_discount_code TEXT,
      payment_terms TEXT NOT NULL,
      notes TEXT,
      sent_at TEXT,
      confirmed_at TEXT,
      paid_at TEXT,
      cancelled_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- 10. Discount Rules Table
    CREATE TABLE IF NOT EXISTS discount_rules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      type TEXT NOT NULL CHECK(type IN ('fixed', 'percentage')),
      value REAL NOT NULL,
      minimum_purchase_quantity INTEGER NOT NULL DEFAULT 1,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      usage_limit INTEGER NOT NULL DEFAULT 100,
      times_used INTEGER NOT NULL DEFAULT 0,
      applicable_product_ids_json TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- 11. Payment Transactions Table
    CREATE TABLE IF NOT EXISTS payment_transactions (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL,
      subscription_id TEXT,
      customer_name TEXT NOT NULL,
      customer_company TEXT NOT NULL,
      payment_method TEXT NOT NULL CHECK(payment_method IN ('credit_card', 'wire_transfer', 'ach', 'check', 'other')),
      amount REAL NOT NULL,
      transaction_date TEXT NOT NULL,
      reference_notes TEXT,
      staff_recorded_by TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'cleared',
      created_at TEXT NOT NULL
    );

    -- Indices for high-performance lookup
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
    CREATE INDEX IF NOT EXISTS idx_plans_freq ON subscription_plans(billing_frequency);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
    CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
    CREATE INDEX IF NOT EXISTS idx_invoices_sub ON invoices(subscription_id);
    CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payment_transactions(invoice_id);
    CREATE INDEX IF NOT EXISTS idx_discounts_code ON discount_rules(code);
  `);
}
