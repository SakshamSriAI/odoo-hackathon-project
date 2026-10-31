import { Router, Request, Response } from 'express';
import { db } from '../db/connection';

export const paymentsRouter = Router();

function formatPayment(raw: any) {
  return {
    id: raw.id,
    invoiceId: raw.invoice_id,
    subscriptionId: raw.subscription_id || undefined,
    customerName: raw.customer_name,
    customerCompany: raw.customer_company,
    paymentMethod: raw.payment_method,
    amount: Number(raw.amount),
    transactionDate: raw.transaction_date,
    referenceNotes: raw.reference_notes || '',
    staffRecordedBy: raw.staff_recorded_by,
    status: raw.status,
    createdAt: raw.created_at,
  };
}

// GET /api/payments - Get all payment transactions
paymentsRouter.get('/', (req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM payment_transactions ORDER BY created_at DESC').all();
    res.json(rows.map(formatPayment));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments - Record transaction and reconcile invoice
paymentsRouter.post('/', (req: Request, res: Response) => {
  try {
    const {
      invoiceId,
      amount,
      paymentMethod = 'ach',
      transactionDate,
      referenceNotes = '',
      staffRecordedBy = 'Alex Vance (Sales Ops)',
    } = req.body;

    if (!invoiceId || amount === undefined || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid invoiceId and positive amount are required' });
    }

    const invoice: any = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: `Target invoice ${invoiceId} not found` });
    }

    let customer = { name: 'Customer', company: 'Enterprise Client' };
    try { customer = JSON.parse(invoice.customer_json || '{}'); } catch {}

    const txnId = req.body.id || `TXN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const txnDate = transactionDate || now.split('T')[0];

    db.prepare(`
      INSERT INTO payment_transactions (
        id, invoice_id, subscription_id, customer_name, customer_company,
        payment_method, amount, transaction_date, reference_notes,
        staff_recorded_by, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'cleared', ?)
    `).run(
      txnId,
      invoiceId,
      invoice.subscription_id || null,
      customer.name,
      customer.company,
      paymentMethod,
      Number(amount),
      txnDate,
      referenceNotes,
      staffRecordedBy,
      now
    );

    // Auto-reconcile target invoice: sum all cleared payments for this invoice
    const allPaidForInvoice = Number(
      (db.prepare('SELECT SUM(amount) as total FROM payment_transactions WHERE invoice_id = ? AND status = ?').get(invoiceId, 'cleared') as any).total || 0
    );

    if (allPaidForInvoice >= Number(invoice.grand_total)) {
      db.prepare('UPDATE invoices SET status = ?, paid_at = ?, updated_at = ? WHERE id = ?').run(
        'paid',
        now,
        now,
        invoiceId
      );
    } else if (invoice.status === 'draft') {
      db.prepare('UPDATE invoices SET status = ?, updated_at = ? WHERE id = ?').run(
        'confirmed',
        now,
        invoiceId
      );
    }

    const created = db.prepare('SELECT * FROM payment_transactions WHERE id = ?').get(txnId);
    res.status(201).json(formatPayment(created));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
