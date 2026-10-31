import { Router, Request, Response } from 'express';
import { db } from '../db/connection';

export const quotationsRouter = Router();

function formatTemplate(raw: any) {
  let lineItemDrafts = [];
  try {
    lineItemDrafts = JSON.parse(raw.line_item_drafts_json || '[]');
  } catch {
    lineItemDrafts = [];
  }

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description || '',
    targetTier: raw.target_tier,
    defaultPlanId: raw.default_plan_id,
    defaultPaymentTerms: raw.default_payment_terms,
    defaultValidityDays: Number(raw.default_validity_days),
    lineItemDrafts,
  };
}

// GET /api/quotations/templates - Get all templates
quotationsRouter.get('/templates', (req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM quotation_templates').all();
    res.json(rows.map(formatTemplate));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quotations/generate - Generate quotation and initialize subscription
quotationsRouter.post('/generate', (req: Request, res: Response) => {
  try {
    const {
      templateId,
      customer,
      planId,
      paymentTerms = 'net_30',
      startDate,
      expiryDate,
      itemizedLines = [],
      notes = '',
      initialStatus = 'draft',
      salesRepName = 'Alex Vance (Sales Rep)',
    } = req.body;

    if (!customer || !customer.company) {
      return res.status(400).json({ error: 'Customer company and details are required' });
    }

    // Look up plan details
    const planRaw: any = db.prepare('SELECT * FROM subscription_plans WHERE id = ?').get(planId);
    const planName = planRaw ? planRaw.name : 'Enterprise Custom Plan';
    const planFrequency = planRaw ? planRaw.billing_frequency : 'monthly';

    const subId = `SUB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const quotationNumber = `QUO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const start = startDate || now.split('T')[0];
    let end = expiryDate;
    if (!end) {
      const exp = new Date();
      exp.setFullYear(exp.getFullYear() + 1);
      end = exp.toISOString().split('T')[0];
    }

    // Calculate line totals
    let subtotal = 0;
    let totalTax = 0;
    const finalLines = itemizedLines.map((line: any, idx: number) => {
      const qty = Number(line.quantity) || 1;
      const unit = Number(line.unitPrice) || 0;
      const lineSubtotal = qty * unit;
      const taxRate = Number(line.taxRatePercent) || 8.5;
      const lineTax = Number(((lineSubtotal * taxRate) / 100).toFixed(2));
      const lineTotal = Number((lineSubtotal + lineTax).toFixed(2));

      subtotal += lineSubtotal;
      totalTax += lineTax;

      return {
        id: line.id || `line_${subId}_${idx + 1}`,
        productId: line.productId || 'prod_custom',
        productName: line.productName || 'Catalog Product Line',
        variantId: line.variantId || null,
        variantLabel: line.variantLabel || 'Standard Catalog Edition',
        sku: line.sku || `SKU-${idx + 1}`,
        quantity: qty,
        unitPrice: unit,
        taxRatePercent: taxRate,
        taxAmount: lineTax,
        subtotal: lineSubtotal,
        totalAmount: lineTotal,
      };
    });

    const grandTotal = Number((subtotal + totalTax).toFixed(2));

    const history = [
      {
        status: initialStatus,
        timestamp: now,
        note: `Generated quotation proposal from template: ${templateId || 'Custom'}`,
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
      planId || 'plan_001',
      planName,
      planFrequency,
      initialStatus,
      start,
      end,
      paymentTerms,
      JSON.stringify(finalLines),
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

    const created: any = db.prepare('SELECT * FROM subscriptions WHERE id = ?').get(subId);

    res.status(201).json({
      id: created.id,
      quotationNumber: created.quotation_number,
      customer: JSON.parse(created.customer_json),
      planId: created.plan_id,
      planName: created.plan_name,
      planFrequency: created.plan_frequency,
      status: created.status,
      startDate: created.start_date,
      expiryDate: created.expiry_date,
      paymentTerms: created.payment_terms,
      itemizedLines: JSON.parse(created.itemized_lines_json),
      statusHistory: JSON.parse(created.status_history_json),
      subtotalAmount: Number(created.subtotal_amount),
      totalTaxAmount: Number(created.total_tax_amount),
      grandTotal: Number(created.grand_total),
      salesRepName: created.sales_rep_name,
      notes: created.notes,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
