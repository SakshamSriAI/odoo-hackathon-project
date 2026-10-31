import { Router, Request, Response } from 'express';
import { db } from '../db/connection';

export const discountsRouter = Router();

function formatDiscount(raw: any) {
  let applicableProductIds = [];
  try { applicableProductIds = JSON.parse(raw.applicable_product_ids_json || '[]'); } catch {}

  return {
    id: raw.id,
    name: raw.name,
    code: raw.code,
    description: raw.description || '',
    type: raw.type,
    value: Number(raw.value),
    minimumPurchaseQuantity: Number(raw.minimum_purchase_quantity),
    startDate: raw.start_date,
    endDate: raw.end_date,
    usageLimit: Number(raw.usage_limit),
    timesUsed: Number(raw.times_used || 0),
    applicableProductIds,
    status: raw.status,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// GET /api/discounts - Get all discount rules
discountsRouter.get('/', (req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM discount_rules ORDER BY created_at DESC').all();
    res.json(rows.map(formatDiscount));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/discounts - Create discount rule
discountsRouter.post('/', (req: Request, res: Response) => {
  try {
    const {
      name,
      code,
      description = '',
      type,
      value,
      minimumPurchaseQuantity = 1,
      startDate,
      endDate,
      usageLimit = 100,
      applicableProductIds = [],
    } = req.body;

    if (!name || !code || !type || value === undefined) {
      return res.status(400).json({ error: 'Name, code, type, and value are required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = db.prepare('SELECT id FROM discount_rules WHERE code = ?').get(cleanCode);
    if (existing) {
      return res.status(409).json({ error: `Discount rule with promo code ${cleanCode} already exists` });
    }

    const id = req.body.id || `rule_${Date.now()}`;
    const now = new Date().toISOString();
    const start = startDate || now.split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const end = endDate || nextYear.toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO discount_rules (
        id, name, code, description, type, value, minimum_purchase_quantity,
        start_date, end_date, usage_limit, times_used, applicable_product_ids_json,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 'active', ?, ?)
    `).run(
      id,
      name.trim(),
      cleanCode,
      description.trim(),
      type,
      Number(value),
      Number(minimumPurchaseQuantity),
      start,
      end,
      Number(usageLimit),
      JSON.stringify(applicableProductIds),
      now,
      now
    );

    const created = db.prepare('SELECT * FROM discount_rules WHERE id = ?').get(id);
    res.status(201).json(formatDiscount(created));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/discounts/:id - Update discount rule
discountsRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const existing: any = db.prepare('SELECT * FROM discount_rules WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Discount rule not found' });

    const {
      name,
      code,
      description,
      type,
      value,
      minimumPurchaseQuantity,
      startDate,
      endDate,
      usageLimit,
      applicableProductIds,
      status,
    } = req.body;

    const now = new Date().toISOString();
    const cleanCode = code ? code.trim().toUpperCase() : existing.code;
    const currentProducts = applicableProductIds !== undefined
      ? JSON.stringify(applicableProductIds)
      : existing.applicable_product_ids_json;

    db.prepare(`
      UPDATE discount_rules SET
        name = COALESCE(?, name),
        code = ?,
        description = COALESCE(?, description),
        type = COALESCE(?, type),
        value = COALESCE(?, value),
        minimum_purchase_quantity = COALESCE(?, minimum_purchase_quantity),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        usage_limit = COALESCE(?, usage_limit),
        applicable_product_ids_json = ?,
        status = COALESCE(?, status),
        updated_at = ?
      WHERE id = ?
    `).run(
      name,
      cleanCode,
      description,
      type,
      value,
      minimumPurchaseQuantity,
      startDate,
      endDate,
      usageLimit,
      currentProducts,
      status,
      now,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM discount_rules WHERE id = ?').get(req.params.id);
    res.json(formatDiscount(updated));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/discounts/:id - Delete discount rule
discountsRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const existing = db.prepare('SELECT id FROM discount_rules WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Discount rule not found' });

    db.prepare('DELETE FROM discount_rules WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: `Discount rule ${req.params.id} deleted` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/discounts/validate - Validate promo code
discountsRouter.post('/validate', (req: Request, res: Response) => {
  try {
    const { code, quantity = 1, subtotal = 0 } = req.body;
    if (!code) return res.status(400).json({ error: 'Promo code is required' });

    const cleanCode = code.trim().toUpperCase();
    const raw: any = db.prepare('SELECT * FROM discount_rules WHERE code = ? AND status = ?').get(cleanCode, 'active');

    if (!raw) {
      return res.status(404).json({ valid: false, message: 'Invalid or inactive promo code.' });
    }

    const rule = formatDiscount(raw);
    const today = new Date().toISOString().split('T')[0];

    if (today < rule.startDate || today > rule.endDate) {
      return res.status(400).json({ valid: false, message: 'This promotion is not active for the current date.' });
    }

    if (rule.timesUsed >= rule.usageLimit) {
      return res.status(400).json({ valid: false, message: 'This promotion has reached its maximum usage limit.' });
    }

    if (quantity < rule.minimumPurchaseQuantity) {
      return res.status(400).json({
        valid: false,
        message: `Order quantity (${quantity}) does not satisfy minimum requirement of ${rule.minimumPurchaseQuantity} units.`,
      });
    }

    const calculatedDeduction = rule.type === 'percentage'
      ? Number(((subtotal * rule.value) / 100).toFixed(2))
      : Math.min(rule.value, subtotal);

    res.json({
      valid: true,
      rule,
      discountAmount: calculatedDeduction,
      newSubtotal: Math.max(0, subtotal - calculatedDeduction),
      message: `Applied ${rule.name}: -$${calculatedDeduction.toLocaleString()} discount`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
