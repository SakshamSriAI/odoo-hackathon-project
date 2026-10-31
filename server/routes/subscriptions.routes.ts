import { Router, Request, Response } from 'express';
import { db } from '../db/connection';

export const subscriptionsRouter = Router();

function formatSubscription(raw: any) {
  let customer = { name: '', company: '', email: '' };
  let itemizedLines = [];
  let statusHistory = [];

  try { customer = JSON.parse(raw.customer_json || '{}'); } catch {}
  try { itemizedLines = JSON.parse(raw.itemized_lines_json || '[]'); } catch {}
  try { statusHistory = JSON.parse(raw.status_history_json || '[]'); } catch {}

  return {
    id: raw.id,
    quotationNumber: raw.quotation_number,
    customer,
    planId: raw.plan_id,
    planName: raw.plan_name,
    planFrequency: raw.plan_frequency,
    status: raw.status,
    startDate: raw.start_date,
    expiryDate: raw.expiry_date,
    paymentTerms: raw.payment_terms,
    itemizedLines,
    statusHistory,
    subtotalAmount: Number(raw.subtotal_amount),
    totalTaxAmount: Number(raw.total_tax_amount),
    grandTotal: Number(raw.grand_total),
    salesRepId: raw.sales_rep_id,
    salesRepName: raw.sales_rep_name,
    notes: raw.notes || '',
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// GET /api/subscriptions - Get all subscriptions
subscriptionsRouter.get('/', (req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM subscriptions ORDER BY created_at DESC').all();
    res.json(rows.map(formatSubscription));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/subscriptions/:id - Get single subscription
subscriptionsRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const raw = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id);
    if (!raw) return res.status(404).json({ error: 'Subscription not found' });
    res.json(formatSubscription(raw));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subscriptions - Create subscription
subscriptionsRouter.post('/', (req: Request, res: Response) => {
  try {
    const {
      customer,
      planId = 'plan_001',
      paymentTerms = 'net_30',
      startDate,
      expiryDate,
      itemizedLines = [],
      notes = '',
      initialStatus = 'draft',
      salesRepName = 'Alex Vance',
    } = req.body;

    if (!customer || !customer.company) {
      return res.status(400).json({ error: 'Customer information is required' });
    }

    const subId = req.body.id || `SUB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const quotationNumber = req.body.quotationNumber || `QUO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const planRaw: any = db.prepare('SELECT * FROM subscription_plans WHERE id = ?').get(planId);
    const planName = planRaw ? planRaw.name : 'Custom Enterprise Plan';
    const planFrequency = planRaw ? planRaw.billing_frequency : 'monthly';

    const start = startDate || now.split('T')[0];
    let end = expiryDate;
    if (!end) {
      const exp = new Date();
      exp.setFullYear(exp.getFullYear() + 1);
      end = exp.toISOString().split('T')[0];
    }

    let subtotal = 0;
    let totalTax = 0;
    const lines = itemizedLines.map((line: any, idx: number) => {
      const qty = Number(line.quantity) || 1;
      const unit = Number(line.unitPrice) || 0;
      const lineSub = qty * unit;
      const taxRate = Number(line.taxRatePercent) || 8.5;
      const lineTax = Number(((lineSub * taxRate) / 100).toFixed(2));
      const lineTot = Number((lineSub + lineTax).toFixed(2));

      subtotal += lineSub;
      totalTax += lineTax;

      return {
        id: line.id || `line_${subId}_${idx + 1}`,
        productId: line.productId || 'prod_custom',
        productName: line.productName || 'Line Item',
        variantId: line.variantId || null,
        variantLabel: line.variantLabel || 'Standard Edition',
        sku: line.sku || `SKU-${idx + 1}`,
        quantity: qty,
        unitPrice: unit,
        taxRatePercent: taxRate,
        taxAmount: lineTax,
        subtotal: lineSub,
        totalAmount: lineTot,
      };
    });

    const grandTotal = Number((subtotal + totalTax).toFixed(2));
    const history = [
      {
        status: initialStatus,
        timestamp: now,
        note: `Subscription initialized at ${initialStatus.toUpperCase()} stage`,
        actor: salesRepName,
      },
    ];

    db.prepare(`
      INSERT INTO subscriptions (
        id, quotation_number, customer_json, plan_id, plan_name, plan_frequency,
        status, start_date, expiry_date, payment_terms, itemized_lines_json,
        status_history_json, subtotal_amount, total_tax_amount, grand_total,
        sales_rep_id, sales_rep_name, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      subId,
      quotationNumber,
      JSON.stringify(customer),
      planId,
      planName,
      planFrequency,
      initialStatus,
      start,
      end,
      paymentTerms,
      JSON.stringify(lines),
      JSON.stringify(history),
      subtotal,
      totalTax,
      grandTotal,
      'usr_staff_01',
      salesRepName,
      notes,
      now,
      now
    );

    const created = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(subId);
    res.status(201).json(formatSubscription(created));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/subscriptions/:id/advance - Advance visual 5-stage status stepper
subscriptionsRouter.post('/:id/advance', (req: Request, res: Response) => {
  try {
    const raw: any = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id);
    if (!raw) return res.status(404).json({ error: 'Subscription not found' });

    const { nextStatus, note, actor = 'Alex Vance (Sales Rep)' } = req.body;
    const validStatuses = ['draft', 'quotation', 'confirmed', 'active', 'closed'];

    if (!validStatuses.includes(nextStatus)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    let history = [];
    try { history = JSON.parse(raw.status_history_json || '[]'); } catch {}

    const now = new Date().toISOString();
    const defaultNotes: Record<string, string> = {
      quotation: 'Quotation delivered to client email',
      confirmed: 'Customer confirmed contract agreement',
      active: 'Subscription activated & recurrent invoicing live',
      closed: 'Subscription contract ended / closed',
    };

    history.push({
      status: nextStatus,
      timestamp: now,
      note: note || defaultNotes[nextStatus] || `Advanced to ${nextStatus}`,
      actor,
    });

    db.prepare(`
      UPDATE subscriptions SET
        status = ?,
        status_history_json = ?,
        updated_at = ?
      WHERE id = ?
    `).run(nextStatus, JSON.stringify(history), now, req.params.id);

    // If advanced to confirmed or active, check if invoice already exists; if not, auto-generate invoice!
    if (nextStatus === 'confirmed' || nextStatus === 'active') {
      const existingInv = db.prepare('SELECT id FROM invoices WHERE subscription_id = ?').get(raw.id);
      if (!existingInv) {
        const invId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        let lines: any[] = [];
        try { lines = JSON.parse(raw.itemized_lines_json || '[]'); } catch {}

        db.prepare(`
          INSERT INTO invoices (
            id, subscription_id, quotation_number, customer_json, invoice_date,
            due_date, status, line_items_json, subtotal, discount_total, tax_total,
            grand_total, payment_terms, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)
        `).run(
          invId,
          raw.id,
          raw.quotation_number,
          raw.customer_json,
          now.split('T')[0],
          raw.expiry_date,
          'confirmed',
          raw.itemized_lines_json,
          raw.subtotal_amount,
          raw.total_tax_amount,
          raw.grand_total,
          raw.payment_terms,
          `Automated billing generated upon ${nextStatus.toUpperCase()} subscription activation.`,
          now,
          now
        );
      }
    }

    const updated = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(req.params.id);
    res.json(formatSubscription(updated));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/subscriptions/:id - Delete subscription
subscriptionsRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const existing = db.prepare('SELECT id FROM subscriptions WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Subscription not found' });

    db.prepare('DELETE FROM subscriptions WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: `Subscription ${req.params.id} deleted` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
