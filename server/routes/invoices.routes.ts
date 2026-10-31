import { Router, Request, Response } from 'express';
import { db } from '../db/connection';

export const invoicesRouter = Router();

function formatInvoice(raw: any) {
  let customer = { name: '', company: '', email: '' };
  let lineItems = [];

  try { customer = JSON.parse(raw.customer_json || '{}'); } catch {}
  try { lineItems = JSON.parse(raw.line_items_json || '[]'); } catch {}

  return {
    id: raw.id,
    subscriptionId: raw.subscription_id || undefined,
    quotationNumber: raw.quotation_number || undefined,
    customer,
    invoiceDate: raw.invoice_date,
    dueDate: raw.due_date,
    status: raw.status,
    lineItems,
    subtotal: Number(raw.subtotal),
    discountTotal: Number(raw.discount_total || 0),
    taxTotal: Number(raw.tax_total),
    grandTotal: Number(raw.grand_total),
    appliedDiscountCode: raw.applied_discount_code || undefined,
    paymentTerms: raw.payment_terms,
    notes: raw.notes || '',
    sentAt: raw.sent_at || undefined,
    confirmedAt: raw.confirmed_at || undefined,
    paidAt: raw.paid_at || undefined,
    cancelledAt: raw.cancelled_at || undefined,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// GET /api/invoices - Get all invoices
invoicesRouter.get('/', (req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM invoices ORDER BY created_at DESC').all();
    res.json(rows.map(formatInvoice));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/invoices/:id - Get single invoice
invoicesRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const raw = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
    if (!raw) return res.status(404).json({ error: 'Invoice not found' });
    res.json(formatInvoice(raw));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/invoices - Create invoice
invoicesRouter.post('/', (req: Request, res: Response) => {
  try {
    const {
      subscriptionId,
      quotationNumber,
      customer,
      invoiceDate,
      dueDate,
      lineItems = [],
      subtotal,
      discountTotal = 0,
      taxTotal,
      grandTotal,
      appliedDiscountCode,
      paymentTerms = 'net_30',
      notes = '',
      status = 'draft',
    } = req.body;

    if (!customer || !customer.company) {
      return res.status(400).json({ error: 'Customer information is required' });
    }

    const id = req.body.id || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const invDate = invoiceDate || now.split('T')[0];

    let due = dueDate;
    if (!due) {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      due = d.toISOString().split('T')[0];
    }

    const sub = Number(subtotal) || 0;
    const tax = Number(taxTotal) || 0;
    const total = grandTotal !== undefined ? Number(grandTotal) : Number((sub + tax - discountTotal).toFixed(2));

    db.prepare(`
      INSERT INTO invoices (
        id, subscription_id, quotation_number, customer_json, invoice_date,
        due_date, status, line_items_json, subtotal, discount_total, tax_total,
        grand_total, applied_discount_code, payment_terms, notes,
        confirmed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      subscriptionId || null,
      quotationNumber || null,
      JSON.stringify(customer),
      invDate,
      due,
      status,
      JSON.stringify(lineItems),
      sub,
      discountTotal,
      tax,
      total,
      appliedDiscountCode || null,
      paymentTerms,
      notes,
      status === 'confirmed' ? now : null,
      now,
      now
    );

    const created = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);
    res.status(201).json(formatInvoice(created));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/invoices/:id/confirm - Confirm invoice
invoicesRouter.post('/:id/confirm', (req: Request, res: Response) => {
  try {
    const raw: any = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
    if (!raw) return res.status(404).json({ error: 'Invoice not found' });

    const now = new Date().toISOString();
    db.prepare('UPDATE invoices SET status = ?, confirmed_at = ?, updated_at = ? WHERE id = ?').run(
      'confirmed',
      now,
      now,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
    res.json(formatInvoice(updated));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/invoices/:id/cancel - Cancel invoice
invoicesRouter.post('/:id/cancel', (req: Request, res: Response) => {
  try {
    const raw: any = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
    if (!raw) return res.status(404).json({ error: 'Invoice not found' });

    const now = new Date().toISOString();
    db.prepare('UPDATE invoices SET status = ?, cancelled_at = ?, updated_at = ? WHERE id = ?').run(
      'cancelled',
      now,
      now,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
    res.json(formatInvoice(updated));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/invoices/:id/pay - Mark invoice as paid
invoicesRouter.post('/:id/pay', (req: Request, res: Response) => {
  try {
    const raw: any = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
    if (!raw) return res.status(404).json({ error: 'Invoice not found' });

    const now = new Date().toISOString();
    db.prepare('UPDATE invoices SET status = ?, paid_at = ?, updated_at = ? WHERE id = ?').run(
      'paid',
      now,
      now,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
    res.json(formatInvoice(updated));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/invoices/:id/send - Send invoice notification
invoicesRouter.post('/:id/send', (req: Request, res: Response) => {
  try {
    const raw: any = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
    if (!raw) return res.status(404).json({ error: 'Invoice not found' });

    const now = new Date().toISOString();
    db.prepare('UPDATE invoices SET sent_at = ?, updated_at = ? WHERE id = ?').run(
      now,
      now,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
    res.json({
      success: true,
      message: `Invoice ${req.params.id} dispatched to ${(JSON.parse(raw.customer_json)).email}`,
      invoice: formatInvoice(updated),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
