import { Router, Request, Response } from 'express';
import { db } from '../db/connection';

export const plansRouter = Router();

function formatPlan(raw: any) {
  let associatedProductIds: string[] = [];
  try {
    associatedProductIds = JSON.parse(raw.associated_product_ids_json || '[]');
  } catch {
    associatedProductIds = [];
  }

  return {
    id: raw.id,
    name: raw.name,
    code: raw.code,
    description: raw.description || '',
    billingFrequency: raw.billing_frequency,
    minimumQuantity: Number(raw.minimum_quantity),
    availabilityStartDate: raw.availability_start_date,
    availabilityEndDate: raw.availability_end_date,
    policies: {
      autoCloseOnExpiration: Boolean(raw.auto_close_on_expiration),
      allowPause: Boolean(raw.allow_pause),
      allowRenewal: Boolean(raw.allow_renewal),
      allowEarlyClosure: Boolean(raw.allow_early_closure),
    },
    associatedProductIds,
    basePrice: Number(raw.base_price),
    featuredBadge: raw.featured_badge || undefined,
    status: raw.status,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// GET /api/plans - Get all plans
plansRouter.get('/', (req: Request, res: Response) => {
  try {
    const rows = db.prepare('SELECT * FROM subscription_plans ORDER BY created_at DESC').all();
    res.json(rows.map(formatPlan));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/plans/:id - Get single plan
plansRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const raw = db.prepare('SELECT * FROM subscription_plans WHERE id = ?').get(req.params.id);
    if (!raw) return res.status(404).json({ error: 'Subscription plan not found' });
    res.json(formatPlan(raw));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/plans - Create plan
plansRouter.post('/', (req: Request, res: Response) => {
  try {
    const {
      name,
      code,
      description = '',
      billingFrequency,
      minimumQuantity = 1,
      availabilityStartDate,
      availabilityEndDate,
      policies = {},
      associatedProductIds = [],
      basePrice,
      featuredBadge,
      status = 'active',
    } = req.body;

    if (!name || !billingFrequency || basePrice === undefined) {
      return res.status(400).json({ error: 'Name, billingFrequency, and basePrice are required' });
    }

    const id = req.body.id || `plan_${Date.now()}`;
    const planCode = code || `BL-${billingFrequency.slice(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const now = new Date().toISOString();

    const startDate = availabilityStartDate || now.split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const endDate = availabilityEndDate || nextYear.toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO subscription_plans (
        id, name, code, description, billing_frequency, minimum_quantity,
        availability_start_date, availability_end_date, auto_close_on_expiration,
        allow_pause, allow_renewal, allow_early_closure, associated_product_ids_json,
        base_price, featured_badge, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      planCode,
      description,
      billingFrequency,
      minimumQuantity,
      startDate,
      endDate,
      policies.autoCloseOnExpiration ? 1 : 0,
      policies.allowPause !== false ? 1 : 0,
      policies.allowRenewal !== false ? 1 : 0,
      policies.allowEarlyClosure !== false ? 1 : 0,
      JSON.stringify(associatedProductIds),
      basePrice,
      featuredBadge || null,
      status,
      now,
      now
    );

    const created = db.prepare('SELECT * FROM subscription_plans WHERE id = ?').get(id);
    res.status(201).json(formatPlan(created));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/plans/:id - Update plan
plansRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const existing: any = db.prepare('SELECT * FROM subscription_plans WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Subscription plan not found' });

    const {
      name,
      code,
      description,
      billingFrequency,
      minimumQuantity,
      availabilityStartDate,
      availabilityEndDate,
      policies,
      associatedProductIds,
      basePrice,
      featuredBadge,
      status,
    } = req.body;

    const now = new Date().toISOString();
    const currentPolicies = {
      autoCloseOnExpiration: Boolean(existing.auto_close_on_expiration),
      allowPause: Boolean(existing.allow_pause),
      allowRenewal: Boolean(existing.allow_renewal),
      allowEarlyClosure: Boolean(existing.allow_early_closure),
      ...(policies || {}),
    };

    const currentProducts = associatedProductIds !== undefined
      ? JSON.stringify(associatedProductIds)
      : existing.associated_product_ids_json;

    db.prepare(`
      UPDATE subscription_plans SET
        name = COALESCE(?, name),
        code = COALESCE(?, code),
        description = COALESCE(?, description),
        billing_frequency = COALESCE(?, billing_frequency),
        minimum_quantity = COALESCE(?, minimum_quantity),
        availability_start_date = COALESCE(?, availability_start_date),
        availability_end_date = COALESCE(?, availability_end_date),
        auto_close_on_expiration = ?,
        allow_pause = ?,
        allow_renewal = ?,
        allow_early_closure = ?,
        associated_product_ids_json = ?,
        base_price = COALESCE(?, base_price),
        featured_badge = COALESCE(?, featured_badge),
        status = COALESCE(?, status),
        updated_at = ?
      WHERE id = ?
    `).run(
      name,
      code,
      description,
      billingFrequency,
      minimumQuantity,
      availabilityStartDate,
      availabilityEndDate,
      currentPolicies.autoCloseOnExpiration ? 1 : 0,
      currentPolicies.allowPause ? 1 : 0,
      currentPolicies.allowRenewal ? 1 : 0,
      currentPolicies.allowEarlyClosure ? 1 : 0,
      currentProducts,
      basePrice,
      featuredBadge,
      status,
      now,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM subscription_plans WHERE id = ?').get(req.params.id);
    res.json(formatPlan(updated));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/plans/:id/toggle-policy - Toggle a specific lifecycle policy directly
plansRouter.patch('/:id/toggle-policy', (req: Request, res: Response) => {
  try {
    const raw: any = db.prepare('SELECT * FROM subscription_plans WHERE id = ?').get(req.params.id);
    if (!raw) return res.status(404).json({ error: 'Subscription plan not found' });

    const { policyKey } = req.body;
    const validKeys = ['autoCloseOnExpiration', 'allowPause', 'allowRenewal', 'allowEarlyClosure'];
    if (!validKeys.includes(policyKey)) {
      return res.status(400).json({ error: `Invalid policyKey. Must be one of: ${validKeys.join(', ')}` });
    }

    const columnMap: Record<string, string> = {
      autoCloseOnExpiration: 'auto_close_on_expiration',
      allowPause: 'allow_pause',
      allowRenewal: 'allow_renewal',
      allowEarlyClosure: 'allow_early_closure',
    };

    const col = columnMap[policyKey];
    const currentVal = Number(raw[col]) === 1 ? 0 : 1;
    const now = new Date().toISOString();

    db.prepare(`UPDATE subscription_plans SET ${col} = ?, updated_at = ? WHERE id = ?`).run(
      currentVal,
      now,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM subscription_plans WHERE id = ?').get(req.params.id);
    res.json(formatPlan(updated));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/plans/:id - Delete plan
plansRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const existing = db.prepare('SELECT id FROM subscription_plans WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Subscription plan not found' });

    db.prepare('DELETE FROM subscription_plans WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: `Subscription plan ${req.params.id} deleted` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
