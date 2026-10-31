import { Router, Request, Response } from 'express';
import { db } from '../db/connection';

export const productsRouter = Router();

// Helper to format product with its variants
function formatProduct(raw: any, variants: any[] = []) {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type,
    salesPrice: Number(raw.sales_price),
    costPrice: Number(raw.cost_price),
    notes: raw.notes || '',
    skuPrefix: raw.sku_prefix,
    status: raw.status,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    variants: variants.map((v) => ({
      id: v.id,
      brandId: v.brand_id,
      brandName: v.brand_name,
      variantSku: v.variant_sku,
      variantLabel: v.variant_label,
      markupAmount: Number(v.markup_amount),
      finalSalesPrice: Number(v.final_sales_price),
      costPrice: Number(v.cost_price),
      calculatedMarginDollars: Number(v.calculated_margin_dollars),
      calculatedMarginPercent: Number(v.calculated_margin_percent),
      notes: v.notes || '',
    })),
  };
}

// GET /api/products/markups - Get brand markup options
productsRouter.get('/markups', (req: Request, res: Response) => {
  try {
    const markups = db.prepare(`
      SELECT id, name, code, markup_amount as markupAmount, description, badge_color as badgeColor
      FROM brand_markups
    `).all();
    res.json(markups);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products - Get all products with variants
productsRouter.get('/', (req: Request, res: Response) => {
  try {
    const rawProducts: any[] = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
    const allVariants: any[] = db.prepare('SELECT * FROM product_variants').all();

    const result = rawProducts.map((p) => {
      const pVariants = allVariants.filter((v) => v.product_id === p.id);
      return formatProduct(p, pVariants);
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id - Get single product
productsRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const p: any = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!p) return res.status(404).json({ error: 'Product not found' });

    const pVariants: any[] = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(p.id);
    res.json(formatProduct(p, pVariants));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products - Create product
productsRouter.post('/', (req: Request, res: Response) => {
  try {
    const { name, type, salesPrice, costPrice, notes = '', skuPrefix, variants = [] } = req.body;

    if (!name || !type || salesPrice === undefined || costPrice === undefined) {
      return res.status(400).json({ error: 'Name, type, salesPrice, and costPrice are required' });
    }

    const id = req.body.id || `prod_${Date.now()}`;
    const prefix = skuPrefix || `BL-${name.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO products (id, name, type, sales_price, cost_price, notes, sku_prefix, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
    `).run(id, name, type, salesPrice, costPrice, notes, prefix, now, now);

    // Insert variants if provided
    const insertVariant = db.prepare(`
      INSERT INTO product_variants (
        id, product_id, brand_id, brand_name, variant_sku, variant_label,
        markup_amount, final_sales_price, cost_price, calculated_margin_dollars,
        calculated_margin_percent, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const v of variants) {
      const vId = v.id || `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const markup = Number(v.markupAmount) || 0;
      const finalPrice = Number(v.finalSalesPrice) || (salesPrice + markup);
      const vCost = Number(v.costPrice) || costPrice;
      const marginDollars = finalPrice - vCost;
      const marginPercent = finalPrice > 0 ? Number(((marginDollars / finalPrice) * 100).toFixed(1)) : 0;

      insertVariant.run(
        vId, id, v.brandId || 'brand_standard', v.brandName || 'Standard Edition',
        v.variantSku || `${prefix}-${v.brandId || 'STD'}`,
        v.variantLabel || `${v.brandName || 'Standard'} (+${markup} Markup)`,
        markup, finalPrice, vCost, marginDollars, marginPercent, v.notes || ''
      );
    }

    const createdVariants: any[] = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(id);
    const createdProduct = formatProduct(
      db.prepare('SELECT * FROM products WHERE id = ?').get(id),
      createdVariants
    );

    res.status(201).json(createdProduct);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id - Update product
productsRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const { name, type, salesPrice, costPrice, notes, skuPrefix, status } = req.body;
    const existing: any = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        sales_price = COALESCE(?, sales_price),
        cost_price = COALESCE(?, cost_price),
        notes = COALESCE(?, notes),
        sku_prefix = COALESCE(?, sku_prefix),
        status = COALESCE(?, status),
        updated_at = ?
      WHERE id = ?
    `).run(name, type, salesPrice, costPrice, notes, skuPrefix, status, now, req.params.id);

    const updatedVariants: any[] = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(req.params.id);
    const updatedProduct = formatProduct(
      db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id),
      updatedVariants
    );

    res.json(updatedProduct);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id - Delete product
productsRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const existing: any = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(req.params.id);
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);

    res.json({ success: true, message: `Product ${req.params.id} and associated variants deleted` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/:id/variants - Add variant to product
productsRouter.post('/:id/variants', (req: Request, res: Response) => {
  try {
    const product: any = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const { brandId, brandName, markupAmount, notes = '' } = req.body;
    if (!brandId || !brandName || markupAmount === undefined) {
      return res.status(400).json({ error: 'brandId, brandName, and markupAmount are required' });
    }

    const variantId = `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const brandCode = brandId.replace('brand_', '').toUpperCase();
    const variantSku = `${product.sku_prefix}-${brandCode}`;
    const variantLabel = `${brandName} (+${markupAmount} Markup)`;
    const finalSalesPrice = Number(product.sales_price) + Number(markupAmount);
    const costPrice = Number(product.cost_price);
    const marginDollars = finalSalesPrice - costPrice;
    const marginPercent = finalSalesPrice > 0 ? Number(((marginDollars / finalSalesPrice) * 100).toFixed(1)) : 0;

    db.prepare(`
      INSERT INTO product_variants (
        id, product_id, brand_id, brand_name, variant_sku, variant_label,
        markup_amount, final_sales_price, cost_price, calculated_margin_dollars,
        calculated_margin_percent, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      variantId, product.id, brandId, brandName, variantSku, variantLabel,
      markupAmount, finalSalesPrice, costPrice, marginDollars, marginPercent, notes
    );

    const variants: any[] = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(product.id);
    res.status(201).json(formatProduct(product, variants));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id/variants/:variantId - Remove variant
productsRouter.delete('/:id/variants/:variantId', (req: Request, res: Response) => {
  try {
    db.prepare('DELETE FROM product_variants WHERE id = ? AND product_id = ?').run(
      req.params.variantId,
      req.params.id
    );

    const product: any = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const variants: any[] = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(product.id);
    res.json(formatProduct(product, variants));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
