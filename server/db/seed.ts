import { db, initializeSchema } from './connection';

export function seedDatabase(force = false): void {
  initializeSchema();

  const userCount = Number(
    (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count
  );

  if (userCount > 0 && !force) {
    console.log('✓ Database already seeded. Skipping initial seeding.');
    return;
  }

  if (force) {
    console.log('⟳ Force re-seeding: clearing existing database tables...');
    db.exec(`
      DELETE FROM payment_transactions;
      DELETE FROM invoices;
      DELETE FROM subscriptions;
      DELETE FROM quotation_templates;
      DELETE FROM discount_rules;
      DELETE FROM subscription_plans;
      DELETE FROM product_variants;
      DELETE FROM products;
      DELETE FROM brand_markups;
      DELETE FROM password_resets;
      DELETE FROM users;
    `);
  }

  console.log('🌱 Seeding Brightloop database...');

  // 1. Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, email, name, role, avatar_url, organization, password_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    'usr_admin_01',
    'admin@brightloop.io',
    'Sarah Connor',
    'admin',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'Brightloop HQ - Global Administration',
    'Brightloop#Admin2026!',
    '2025-01-15T08:00:00Z'
  );

  insertUser.run(
    'usr_staff_01',
    'staff@brightloop.io',
    'Alex Vance',
    'staff',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'Brightloop Sales Operations',
    'Brightloop#Staff2026!',
    '2025-02-10T10:30:00Z'
  );

  insertUser.run(
    'usr_cust_01',
    'customer@brightloop.io',
    'Emily Chen',
    'customer',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'Acme Technologies Inc.',
    'Brightloop#Cust2026!',
    '2025-03-01T14:15:00Z'
  );

  // 2. Brand Markups
  const insertMarkup = db.prepare(`
    INSERT INTO brand_markups (id, name, code, markup_amount, description, badge_color)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertMarkup.run(
    'brand_prime',
    'Brightloop Prime Edition',
    'PRIME-560',
    560,
    'Tier-1 enterprise SLA & priority distributed runtime markup (+$560)',
    'bg-indigo-50 text-indigo-700 border-indigo-200'
  );

  insertMarkup.run(
    'brand_oem',
    'Brightloop OEM Partner Brand',
    'OEM-850',
    850,
    'Dedicated white-label tenant & hardware optimization markup (+$850)',
    'bg-purple-50 text-purple-700 border-purple-200'
  );

  insertMarkup.run(
    'brand_gov',
    'GovCloud / FedRAMP Certified',
    'FED-1200',
    1200,
    'Air-gapped compliance & cryptographic isolation markup (+$1,200)',
    'bg-amber-50 text-amber-700 border-amber-200'
  );

  insertMarkup.run(
    'brand_standard',
    'Brightloop Core Standard',
    'STD-150',
    150,
    'Standard packaged tier enhancement markup (+$150)',
    'bg-slate-50 text-slate-700 border-slate-200'
  );

  // 3. Products & Variants
  const insertProduct = db.prepare(`
    INSERT INTO products (id, name, type, sales_price, cost_price, notes, sku_prefix, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertVariant = db.prepare(`
    INSERT INTO product_variants (
      id, product_id, brand_id, brand_name, variant_sku, variant_label,
      markup_amount, final_sales_price, cost_price, calculated_margin_dollars,
      calculated_margin_percent, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Product 1
  insertProduct.run(
    'prod_001',
    'Brightloop Cloud Orchestrator',
    'software_license',
    2400,
    950,
    'Primary node license for distributed container cluster orchestration and telemetry.',
    'BL-CLOUD-ORCH',
    'active',
    '2025-01-10T10:00:00Z',
    '2025-01-10T10:00:00Z'
  );

  insertVariant.run(
    'var_001_1',
    'prod_001',
    'brand_prime',
    'Brightloop Prime Edition',
    'BL-CLOUD-ORCH-PRIME',
    'Prime Edition (+560 Markup)',
    560,
    2960,
    950,
    2010,
    67.9,
    'Includes 99.99% uptime guarantee SLA.'
  );

  insertVariant.run(
    'var_001_2',
    'prod_001',
    'brand_gov',
    'GovCloud / FedRAMP Certified',
    'BL-CLOUD-ORCH-FED',
    'GovCloud FedRAMP High (+1,200)',
    1200,
    3600,
    950,
    2650,
    73.6,
    'ITAR & HIPAA compliant isolated VPC cluster.'
  );

  // Product 2
  insertProduct.run(
    'prod_002',
    'Brightloop Real-time Telemetry Engine',
    'subscription_service',
    1800,
    600,
    'High-throughput metric ingestion pipeline processing 250k events/sec with sub-second dashboard rendering.',
    'BL-TELEMETRY',
    'active',
    '2025-01-12T11:00:00Z',
    '2025-01-12T11:00:00Z'
  );

  insertVariant.run(
    'var_002_1',
    'prod_002',
    'brand_prime',
    'Brightloop Prime Edition',
    'BL-TELEMETRY-PRIME',
    'Prime Edition (+560 Markup)',
    560,
    2360,
    600,
    1760,
    74.5,
    'Unlimited retention and hot index query optimization.'
  );

  insertVariant.run(
    'var_002_2',
    'prod_002',
    'brand_oem',
    'Brightloop OEM Partner Brand',
    'BL-TELEMETRY-OEM',
    'OEM White-label Edition (+850)',
    850,
    2650,
    600,
    2050,
    77.3,
    'Branded tenant console for tier-1 resale distributors.'
  );

  // Product 3
  insertProduct.run(
    'prod_003',
    'Edge Gateway Micro-Daemon',
    'software_license',
    950,
    350,
    'Lightweight C++ daemon providing local cryptographic verification and cache warming.',
    'BL-EDGE-GW',
    'active',
    '2025-01-15T09:00:00Z',
    '2025-01-15T09:00:00Z'
  );

  insertVariant.run(
    'var_003_1',
    'prod_003',
    'brand_standard',
    'Brightloop Core Standard',
    'BL-EDGE-GW-STD',
    'Core Edition (+150 Markup)',
    150,
    1100,
    350,
    750,
    68.1,
    'Packaged for ARM64 & x86 IoT edge nodes.'
  );

  // Product 4
  insertProduct.run(
    'prod_004',
    'Enterprise Audit & Compliance Suite',
    'cloud_addon',
    3200,
    1100,
    'SOC-2 Type II immutable log streaming with real-time audit tamper verification.',
    'BL-AUDIT-SUITE',
    'active',
    '2025-01-18T14:30:00Z',
    '2025-01-18T14:30:00Z'
  );

  insertVariant.run(
    'var_004_1',
    'prod_004',
    'brand_gov',
    'GovCloud / FedRAMP Certified',
    'BL-AUDIT-FED',
    'FedRAMP High Isolation (+1,200)',
    1200,
    4400,
    1100,
    3300,
    75.0,
    'Meets DoD Impact Level 5 compliance.'
  );

  // 4. Subscription Plans
  const insertPlan = db.prepare(`
    INSERT INTO subscription_plans (
      id, name, code, description, billing_frequency, minimum_quantity,
      availability_start_date, availability_end_date, auto_close_on_expiration,
      allow_pause, allow_renewal, allow_early_closure, associated_product_ids_json,
      base_price, featured_badge, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPlan.run(
    'plan_001',
    'Enterprise Annual Suite (Full Stack)',
    'BL-ENT-ANNUAL',
    'Yearly enterprise commitment with automated scaling and priority 24/7 dedicated engineering support.',
    'yearly',
    5,
    '2025-01-01',
    '2027-12-31',
    0, 1, 1, 1,
    JSON.stringify(['prod_001', 'prod_002', 'prod_004']),
    14500,
    'Most Popular',
    'active',
    '2025-01-01T00:00:00Z',
    '2025-01-01T00:00:00Z'
  );

  insertPlan.run(
    'plan_002',
    'Growth Monthly SaaS Flexible',
    'BL-GROWTH-MO',
    'Flexible 30-day recurring cloud subscription for expanding teams with pause controls.',
    'monthly',
    2,
    '2025-01-01',
    '2026-12-31',
    0, 1, 1, 1,
    JSON.stringify(['prod_001', 'prod_002']),
    1450,
    'Flexible',
    'active',
    '2025-01-01T00:00:00Z',
    '2025-01-01T00:00:00Z'
  );

  insertPlan.run(
    'plan_003',
    'Weekly Continuous Delivery Trial',
    'BL-CD-WEEKLY',
    '7-day sprint testing cadence for transient integration environments and validation pipelines.',
    'weekly',
    1,
    '2025-02-01',
    '2026-06-30',
    1, 0, 1, 1,
    JSON.stringify(['prod_002', 'prod_003']),
    380,
    'Testing',
    'active',
    '2025-02-01T00:00:00Z',
    '2025-02-01T00:00:00Z'
  );

  insertPlan.run(
    'plan_004',
    'Daily High-Performance Compute Burst',
    'BL-BURST-DAILY',
    '24-hour cycle burst plan for peak transaction processing and ad-hoc batch calculations.',
    'daily',
    10,
    '2025-03-01',
    '2026-12-31',
    1, 0, 0, 1,
    JSON.stringify(['prod_001']),
    95,
    'On Demand',
    'active',
    '2025-03-01T00:00:00Z',
    '2025-03-01T00:00:00Z'
  );

  // 5. Quotation Templates
  const insertTemplate = db.prepare(`
    INSERT INTO quotation_templates (
      id, name, description, target_tier, default_plan_id, default_payment_terms,
      default_validity_days, line_item_drafts_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertTemplate.run(
    'tmpl_enterprise_cloud',
    'Enterprise Multi-Cloud Infrastructure Blueprint',
    'Pre-packaged enterprise blueprint including Orchestrator Prime and Telemetry with net-30 terms.',
    'Tier-1 Enterprise',
    'plan_001',
    'net_30',
    45,
    JSON.stringify([
      { productId: 'prod_001', variantId: 'var_001_1', quantity: 3 },
      { productId: 'prod_002', variantId: 'var_002_1', quantity: 2 },
      { productId: 'prod_004', variantId: 'var_004_1', quantity: 1 },
    ])
  );

  insertTemplate.run(
    'tmpl_startup_growth',
    'High-Growth Tech Startup Foundation',
    'Balanced compute and metrics for mid-sized organizations with net-15 monthly terms.',
    'Mid-Market Growth',
    'plan_002',
    'net_15',
    30,
    JSON.stringify([
      { productId: 'prod_001', quantity: 1 },
      { productId: 'prod_002', quantity: 1 },
    ])
  );

  insertTemplate.run(
    'tmpl_edge_iot',
    'Edge Gateway & Distributed Fleet',
    'Tailored for IoT deployments and distributed retail node installations.',
    'Hardware & Edge',
    'plan_002',
    'due_on_receipt',
    60,
    JSON.stringify([
      { productId: 'prod_003', variantId: 'var_003_1', quantity: 20 },
      { productId: 'prod_002', quantity: 1 },
    ])
  );

  // 6. Subscriptions
  const insertSubscription = db.prepare(`
    INSERT INTO subscriptions (
      id, quotation_number, customer_json, plan_id, plan_name, plan_frequency,
      status, start_date, expiry_date, payment_terms, itemized_lines_json,
      status_history_json, subtotal_amount, total_tax_amount, grand_total,
      sales_rep_id, sales_rep_name, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const acmeCustomer = {
    id: 'cust_acme_01',
    name: 'Emily Chen (VP Platform Engineering)',
    company: 'Acme Technologies Inc.',
    email: 'emily.chen@acmetechnologies.com',
    phone: '+1 (555) 392-8192',
    address: '450 Silicon Avenue, Suite 800, San Jose, CA 95113',
    taxId: 'US-EIN-94-3829102',
  };

  const acmeLines = [
    {
      id: 'line_acme_1',
      productId: 'prod_001',
      productName: 'Brightloop Cloud Orchestrator',
      variantId: 'var_001_1',
      variantLabel: 'Prime Edition (+560 Markup)',
      sku: 'BL-CLOUD-ORCH-PRIME',
      quantity: 4,
      unitPrice: 2960,
      taxRatePercent: 8.5,
      taxAmount: 1006.4,
      subtotal: 11840,
      totalAmount: 12846.4,
    },
    {
      id: 'line_acme_2',
      productId: 'prod_002',
      productName: 'Brightloop Real-time Telemetry Engine',
      variantId: 'var_002_1',
      variantLabel: 'Prime Edition (+560 Markup)',
      sku: 'BL-TELEMETRY-PRIME',
      quantity: 2,
      unitPrice: 2360,
      taxRatePercent: 8.5,
      taxAmount: 401.2,
      subtotal: 4720,
      totalAmount: 5121.2,
    },
  ];

  const acmeHistory = [
    { status: 'draft', timestamp: '2025-01-10T09:00:00Z', note: 'Quote initialized from Blueprint', actor: 'Alex Vance' },
    { status: 'quotation', timestamp: '2025-01-11T14:30:00Z', note: 'Dispatched formal proposal to Emily Chen', actor: 'Alex Vance' },
    { status: 'confirmed', timestamp: '2025-01-14T11:15:00Z', note: 'Customer accepted and signed contract', actor: 'Emily Chen' },
    { status: 'active', timestamp: '2025-01-15T00:00:00Z', note: 'Provisioned license keys & active billing cycle initiated', actor: 'System' },
  ];

  insertSubscription.run(
    'SUB-2026-0891',
    'QUO-2026-1042',
    JSON.stringify(acmeCustomer),
    'plan_001',
    'Enterprise Annual Suite (Full Stack)',
    'yearly',
    'active',
    '2025-01-15',
    '2026-01-14',
    'net_30',
    JSON.stringify(acmeLines),
    JSON.stringify(acmeHistory),
    16560,
    1407.6,
    17967.6,
    'usr_staff_01',
    'Alex Vance',
    'Primary corporate master contract for Acme Tech cloud infrastructure.',
    '2025-01-10T09:00:00Z',
    '2025-01-15T00:00:00Z'
  );

  // Sub 2 (Confirmed)
  const vanguardCustomer = {
    id: 'cust_vanguard_02',
    name: 'Jonathan Pierce (VP Infrastructure)',
    company: 'Vanguard Logistics Global',
    email: 'jpierce@vanguardlogistics.com',
    phone: '+1 (555) 762-9011',
    address: '800 Harbor Blvd, Seattle, WA 98104',
    taxId: 'US-WA-91-849102',
  };

  const vanguardLines = [
    {
      id: 'line_vg_1',
      productId: 'prod_003',
      productName: 'Edge Gateway Micro-Daemon',
      variantId: 'var_003_1',
      variantLabel: 'Core Edition (+150 Markup)',
      sku: 'BL-EDGE-GW-STD',
      quantity: 12,
      unitPrice: 1100,
      taxRatePercent: 8.5,
      taxAmount: 1122,
      subtotal: 13200,
      totalAmount: 14322,
    },
  ];

  insertSubscription.run(
    'SUB-2026-0924',
    'QUO-2026-1077',
    JSON.stringify(vanguardCustomer),
    'plan_002',
    'Growth Monthly SaaS Flexible',
    'monthly',
    'confirmed',
    '2025-03-01',
    '2026-02-28',
    'net_30',
    JSON.stringify(vanguardLines),
    JSON.stringify([
      { status: 'draft', timestamp: '2025-02-20T10:00:00Z', note: 'Created proposal', actor: 'Alex Vance' },
      { status: 'quotation', timestamp: '2025-02-22T12:00:00Z', note: 'Sent quotation to Jonathan Pierce', actor: 'Alex Vance' },
      { status: 'confirmed', timestamp: '2025-02-26T16:45:00Z', note: 'Digital signature completed', actor: 'Jonathan Pierce' },
    ]),
    13200,
    1122,
    14322,
    'usr_staff_01',
    'Alex Vance',
    'Fleet distribution for logistics edge tracking.',
    '2025-02-20T10:00:00Z',
    '2025-02-26T16:45:00Z'
  );

  // Sub 3 (Quotation)
  const helixCustomer = {
    id: 'cust_helix_03',
    name: 'Dr. Aris Thorne (Chief Data Officer)',
    company: 'Helix Genomic Therapeutics',
    email: 'thorne@helixgenomics.org',
    phone: '+1 (555) 419-7023',
    address: '1200 BioMed Way, Cambridge, MA 02142',
    taxId: 'US-MA-04-981240',
  };

  const helixLines = [
    {
      id: 'line_hx_1',
      productId: 'prod_001',
      productName: 'Brightloop Cloud Orchestrator',
      variantId: 'var_001_2',
      variantLabel: 'GovCloud FedRAMP High (+1,200)',
      sku: 'BL-CLOUD-ORCH-FED',
      quantity: 2,
      unitPrice: 3600,
      taxRatePercent: 8.5,
      taxAmount: 612,
      subtotal: 7200,
      totalAmount: 7812,
    },
    {
      id: 'line_hx_2',
      productId: 'prod_004',
      productName: 'Enterprise Audit & Compliance Suite',
      variantId: 'var_004_1',
      variantLabel: 'FedRAMP High Isolation (+1,200)',
      sku: 'BL-AUDIT-FED',
      quantity: 1,
      unitPrice: 4400,
      taxRatePercent: 8.5,
      taxAmount: 374,
      subtotal: 4400,
      totalAmount: 4774,
    },
  ];

  insertSubscription.run(
    'SUB-2026-1011',
    'QUO-2026-1120',
    JSON.stringify(helixCustomer),
    'plan_001',
    'Enterprise Annual Suite (Full Stack)',
    'yearly',
    'quotation',
    '2025-04-01',
    '2026-03-31',
    'net_60',
    JSON.stringify(helixLines),
    JSON.stringify([
      { status: 'draft', timestamp: '2025-02-28T09:15:00Z', note: 'Created quote draft', actor: 'Alex Vance' },
      { status: 'quotation', timestamp: '2025-03-01T15:00:00Z', note: 'Dispatched FedRAMP compliance proposal', actor: 'Alex Vance' },
    ]),
    11600,
    986,
    12586,
    'usr_staff_01',
    'Alex Vance',
    'Air-gapped compute deployment for genomic analysis.',
    '2025-02-28T09:15:00Z',
    '2025-03-01T15:00:00Z'
  );

  // 7. Invoices
  const insertInvoice = db.prepare(`
    INSERT INTO invoices (
      id, subscription_id, quotation_number, customer_json, invoice_date,
      due_date, status, line_items_json, subtotal, discount_total, tax_total,
      grand_total, applied_discount_code, payment_terms, notes, sent_at,
      confirmed_at, paid_at, cancelled_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertInvoice.run(
    'INV-2026-0001',
    'SUB-2026-0891',
    'QUO-2026-1042',
    JSON.stringify(acmeCustomer),
    '2025-01-15',
    '2025-02-14',
    'paid',
    JSON.stringify(acmeLines),
    16560,
    0,
    1407.6,
    17967.6,
    null,
    'net_30',
    'Automated annual subscription settlement invoice.',
    '2025-01-15T09:00:00Z',
    '2025-01-15T09:00:00Z',
    '2025-01-20T14:30:00Z',
    null,
    '2025-01-15T09:00:00Z',
    '2025-01-20T14:30:00Z'
  );

  insertInvoice.run(
    'INV-2026-0002',
    'SUB-2026-0924',
    'QUO-2026-1077',
    JSON.stringify(vanguardCustomer),
    '2025-02-26',
    '2025-03-28',
    'confirmed',
    JSON.stringify(vanguardLines),
    13200,
    0,
    1122,
    14322,
    null,
    'net_30',
    'Due upon net-30 term agreement.',
    '2025-02-26T17:00:00Z',
    '2025-02-26T17:00:00Z',
    null,
    null,
    '2025-02-26T17:00:00Z',
    '2025-02-26T17:00:00Z'
  );

  insertInvoice.run(
    'INV-2026-0003',
    'SUB-2026-1011',
    'QUO-2026-1120',
    JSON.stringify(helixCustomer),
    '2025-03-01',
    '2025-04-30',
    'draft',
    JSON.stringify(helixLines),
    11600,
    0,
    986,
    12586,
    null,
    'net_60',
    'Draft billing record awaiting client quote sign-off.',
    null,
    null,
    null,
    null,
    '2025-03-01T15:00:00Z',
    '2025-03-01T15:00:00Z'
  );

  // 8. Discount Rules
  const insertDiscount = db.prepare(`
    INSERT INTO discount_rules (
      id, name, code, description, type, value, minimum_purchase_quantity,
      start_date, end_date, usage_limit, times_used, applicable_product_ids_json,
      status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDiscount.run(
    'rule_001',
    'Enterprise Volume Tier Promotion',
    'ENT-VOL-15',
    'Automatic 15% discount for bulk licenses exceeding 5 units.',
    'percentage',
    15,
    5,
    '2025-01-01',
    '2026-12-31',
    50,
    18,
    JSON.stringify(['prod_001', 'prod_002']),
    'active',
    '2025-01-01T00:00:00Z',
    '2025-01-01T00:00:00Z'
  );

  insertDiscount.run(
    'rule_002',
    'New Customer Annual Incentive',
    'WELCOME-500',
    'Flat $500 initial deduction on annual contracts.',
    'fixed',
    500,
    1,
    '2025-01-01',
    '2026-06-30',
    100,
    42,
    JSON.stringify(['prod_001', 'prod_002', 'prod_004']),
    'active',
    '2025-01-01T00:00:00Z',
    '2025-01-01T00:00:00Z'
  );

  insertDiscount.run(
    'rule_003',
    'GovCloud Early Adopter Incentive',
    'GOV-SAVE-20',
    '20% deduction on FedRAMP compliance suites.',
    'percentage',
    20,
    2,
    '2025-02-01',
    '2026-12-31',
    25,
    7,
    JSON.stringify(['prod_004']),
    'active',
    '2025-02-01T00:00:00Z',
    '2025-02-01T00:00:00Z'
  );

  // 9. Payment Transactions
  const insertPayment = db.prepare(`
    INSERT INTO payment_transactions (
      id, invoice_id, subscription_id, customer_name, customer_company,
      payment_method, amount, transaction_date, reference_notes, staff_recorded_by,
      status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertPayment.run(
    'TXN-2026-0001',
    'INV-2026-0001',
    'SUB-2026-0891',
    'Emily Chen',
    'Acme Technologies Inc.',
    'ach',
    17967.6,
    '2025-01-20',
    'Automated corporate ACH clearance via JPMorgan Chase #ACH-9821034',
    'Alex Vance (Staff Operations)',
    'cleared',
    '2025-01-20T14:30:00Z'
  );

  insertPayment.run(
    'TXN-2026-0002',
    'INV-2026-0001',
    'SUB-2026-0891',
    'Emily Chen',
    'Acme Technologies Inc.',
    'credit_card',
    2500,
    '2025-02-01',
    'On-demand auxiliary support retainer charge Visa *4242',
    'Alex Vance',
    'cleared',
    '2025-02-01T10:00:00Z'
  );

  console.log('✓ Brightloop database seeded successfully with comprehensive operational records.');
}

// Allow direct CLI execution: `tsx server/db/seed.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase(true);
}
