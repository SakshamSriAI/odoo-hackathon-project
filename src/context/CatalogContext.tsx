import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  ProductVariant,
  BrandMarkupOption,
  SubscriptionPlan,
  BillingFrequency,
  PlanPolicyToggles,
} from '../types/catalog';
import { catalogApi } from '../services/api';

export const DEFAULT_BRAND_MARKUPS: BrandMarkupOption[] = [
  {
    id: 'brand_prime',
    name: 'Brightloop Prime Edition',
    code: 'PRIME-560',
    markupAmount: 560,
    description: 'Tier-1 enterprise SLA & priority distributed runtime markup (+$560)',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'brand_oem',
    name: 'Brightloop OEM Partner Brand',
    code: 'OEM-850',
    markupAmount: 850,
    description: 'Dedicated white-label tenant & hardware optimization markup (+$850)',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'brand_gov',
    name: 'GovCloud / FedRAMP Certified',
    code: 'FED-1200',
    markupAmount: 1200,
    description: 'Air-gapped compliance & cryptographic isolation markup (+$1,200)',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'brand_standard',
    name: 'Brightloop Core Standard',
    code: 'STD-150',
    markupAmount: 150,
    description: 'Standard packaged tier enhancement markup (+$150)',
    badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_001',
    name: 'Brightloop Cloud Orchestrator',
    type: 'software_license',
    salesPrice: 2400,
    costPrice: 950,
    notes: 'Primary node license for distributed container cluster orchestration and telemetry.',
    skuPrefix: 'BL-CLOUD-ORCH',
    status: 'active',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
    variants: [
      {
        id: 'var_001_1',
        brandId: 'brand_prime',
        brandName: 'Brightloop Prime Edition',
        variantSku: 'BL-CLOUD-ORCH-PRIME',
        variantLabel: 'Prime Edition (+560 Markup)',
        markupAmount: 560,
        finalSalesPrice: 2960, // 2400 + 560
        costPrice: 950,
        calculatedMarginDollars: 2010, // 2960 - 950
        calculatedMarginPercent: 67.9,
        notes: 'Includes 99.99% uptime guarantee SLA.',
      },
      {
        id: 'var_001_2',
        brandId: 'brand_oem',
        brandName: 'Brightloop OEM Partner Brand',
        variantSku: 'BL-CLOUD-ORCH-OEM',
        variantLabel: 'OEM Partner (+850 Markup)',
        markupAmount: 850,
        finalSalesPrice: 3250, // 2400 + 850
        costPrice: 950,
        calculatedMarginDollars: 2300,
        calculatedMarginPercent: 70.8,
        notes: 'Reseller co-branding enabled.',
      },
    ],
  },
  {
    id: 'prod_002',
    name: 'Real-Time Billing & Invoicing Engine',
    type: 'subscription_service',
    salesPrice: 1850,
    costPrice: 620,
    notes: 'Automated invoice generation, tax calculations, and discount rules execution module.',
    skuPrefix: 'BL-BILL-ENG',
    status: 'active',
    createdAt: '2025-01-22T14:30:00Z',
    updatedAt: '2025-01-22T14:30:00Z',
    variants: [
      {
        id: 'var_002_1',
        brandId: 'brand_prime',
        brandName: 'Brightloop Prime Edition',
        variantSku: 'BL-BILL-ENG-PRIME',
        variantLabel: 'Prime Edition (+560 Markup)',
        markupAmount: 560,
        finalSalesPrice: 2410, // 1850 + 560
        costPrice: 620,
        calculatedMarginDollars: 1790,
        calculatedMarginPercent: 74.3,
        notes: 'Priority queue for ledger settlement.',
      },
    ],
  },
  {
    id: 'prod_003',
    name: 'Advanced Telemetry & Analytics Hub',
    type: 'cloud_addon',
    salesPrice: 750,
    costPrice: 280,
    notes: 'Aggregated analytics pipeline for usage consumption tracking and subscriber churn prediction.',
    skuPrefix: 'BL-ANALYTICS-HUB',
    status: 'active',
    createdAt: '2025-02-05T09:15:00Z',
    updatedAt: '2025-02-05T09:15:00Z',
    variants: [
      {
        id: 'var_003_1',
        brandId: 'brand_standard',
        brandName: 'Brightloop Core Standard',
        variantSku: 'BL-ANALYTICS-HUB-STD',
        variantLabel: 'Standard Enhancement (+150 Markup)',
        markupAmount: 150,
        finalSalesPrice: 900,
        costPrice: 280,
        calculatedMarginDollars: 620,
        calculatedMarginPercent: 68.9,
      },
    ],
  },
];

const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_001',
    name: 'Enterprise Cloud Suite (Yearly)',
    code: 'BL-PLAN-ENT-YR',
    description: 'Comprehensive annual subscription for large enterprise accounts with full product suite.',
    billingFrequency: 'yearly',
    minimumQuantity: 5,
    availabilityStartDate: '2025-01-01',
    availabilityEndDate: '2027-12-31',
    basePrice: 14400,
    featuredBadge: 'Most Popular',
    policies: {
      autoCloseOnExpiration: false, // Closes on its own: disabled (renews instead)
      allowPause: true,             // Can be paused: enabled
      allowRenewal: true,           // Can be renewed: enabled
      allowEarlyClosure: true,      // Can be closed early: enabled
    },
    associatedProductIds: ['prod_001', 'prod_002'],
    status: 'active',
    createdAt: '2025-01-05T08:00:00Z',
    updatedAt: '2025-01-05T08:00:00Z',
  },
  {
    id: 'plan_002',
    name: 'Standard Operations Cadence (Monthly)',
    code: 'BL-PLAN-STD-MO',
    description: 'Flexible monthly billing plan for fast-growing companies and mid-market organizations.',
    billingFrequency: 'monthly',
    minimumQuantity: 2,
    availabilityStartDate: '2025-02-01',
    availabilityEndDate: '2026-12-31',
    basePrice: 1250,
    policies: {
      autoCloseOnExpiration: false,
      allowPause: true,
      allowRenewal: true,
      allowEarlyClosure: true,
    },
    associatedProductIds: ['prod_001', 'prod_003'],
    status: 'active',
    createdAt: '2025-02-01T11:00:00Z',
    updatedAt: '2025-02-01T11:00:00Z',
  },
  {
    id: 'plan_003',
    name: 'Agile Sprint Access (Weekly)',
    code: 'BL-PLAN-SPRINT-WK',
    description: 'Weekly recurring plan tailored for short-duration project teams and temporary environments.',
    billingFrequency: 'weekly',
    minimumQuantity: 1,
    availabilityStartDate: '2025-03-01',
    availabilityEndDate: '2026-06-30',
    basePrice: 320,
    policies: {
      autoCloseOnExpiration: true,  // Auto-closes on its own
      allowPause: false,            // Cannot be paused
      allowRenewal: true,
      allowEarlyClosure: true,
    },
    associatedProductIds: ['prod_002'],
    status: 'active',
    createdAt: '2025-03-01T09:30:00Z',
    updatedAt: '2025-03-01T09:30:00Z',
  },
  {
    id: 'plan_004',
    name: 'High-Performance Burst Compute (Daily)',
    code: 'BL-PLAN-BURST-DAY',
    description: 'On-demand daily subscription for intensive load-testing and end-of-quarter simulations.',
    billingFrequency: 'daily',
    minimumQuantity: 10,
    availabilityStartDate: '2025-04-01',
    availabilityEndDate: '2026-12-31',
    basePrice: 75,
    policies: {
      autoCloseOnExpiration: true,  // Auto-closes on its own
      allowPause: false,            // Cannot be paused
      allowRenewal: false,          // No auto-renewal (one-off daily runs)
      allowEarlyClosure: true,      // Can be closed early
    },
    associatedProductIds: ['prod_001'],
    status: 'active',
    createdAt: '2025-04-01T16:00:00Z',
    updatedAt: '2025-04-01T16:00:00Z',
  },
];

interface CatalogContextType {
  products: Product[];
  plans: SubscriptionPlan[];
  brandMarkups: BrandMarkupOption[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'variants'>, initialBrandMarkupId?: string) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addVariantToProduct: (productId: string, brandId: string, customMarkup?: number, customNotes?: string) => ProductVariant | null;
  removeVariantFromProduct: (productId: string, variantId: string) => void;
  addPlan: (plan: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>) => SubscriptionPlan;
  updatePlan: (id: string, updates: Partial<SubscriptionPlan>) => void;
  deletePlan: (id: string) => void;
  togglePlanPolicy: (planId: string, policyKey: keyof PlanPolicyToggles) => void;
  addCustomBrandMarkup: (name: string, markupAmount: number, code: string) => BrandMarkupOption;
}

const PRODUCTS_STORAGE_KEY = 'brightloop_catalog_products';
const PLANS_STORAGE_KEY = 'brightloop_catalog_plans';
const BRANDS_STORAGE_KEY = 'brightloop_catalog_brands';

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    try {
      const saved = localStorage.getItem(PLANS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_PLANS;
    } catch {
      return INITIAL_PLANS;
    }
  });

  const [brandMarkups, setBrandMarkups] = useState<BrandMarkupOption[]>(() => {
    try {
      const saved = localStorage.getItem(BRANDS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_BRAND_MARKUPS;
    } catch {
      return DEFAULT_BRAND_MARKUPS;
    }
  });

  // Initial server fetch to synchronize with SQLite backend
  useEffect(() => {
    let isMounted = true;
    catalogApi.getProducts()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch((err) => console.warn('[Catalog] Using cached products:', err.message));

    catalogApi.getPlans()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setPlans(data);
        }
      })
      .catch((err) => console.warn('[Catalog] Using cached plans:', err.message));

    catalogApi.getMarkups()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setBrandMarkups(data);
        }
      })
      .catch((err) => console.warn('[Catalog] Using cached markups:', err.message));

    return () => {
      isMounted = false;
    };
  }, []);

  // Persist state changes to localStorage cache
  useEffect(() => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem(BRANDS_STORAGE_KEY, JSON.stringify(brandMarkups));
  }, [brandMarkups]);

  // Product Operations
  const addProduct = useCallback(
    (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'variants'>, initialBrandMarkupId?: string) => {
      const newId = `prod_${Math.random().toString(36).substring(2, 9)}`;
      const now = new Date().toISOString();

      let variants: ProductVariant[] = [];
      if (initialBrandMarkupId) {
        const brand = brandMarkups.find((b) => b.id === initialBrandMarkupId);
        if (brand) {
          const finalPrice = productData.salesPrice + brand.markupAmount;
          const marginDollars = finalPrice - productData.costPrice;
          const marginPercent = Number(((marginDollars / finalPrice) * 100).toFixed(1));
          variants.push({
            id: `var_${Math.random().toString(36).substring(2, 9)}`,
            brandId: brand.id,
            brandName: brand.name,
            variantSku: `${productData.skuPrefix || 'BL-PROD'}-${brand.code}`,
            variantLabel: `${brand.name} (+${brand.markupAmount} Markup)`,
            markupAmount: brand.markupAmount,
            finalSalesPrice: finalPrice,
            costPrice: productData.costPrice,
            calculatedMarginDollars: marginDollars,
            calculatedMarginPercent: marginPercent,
            notes: `Auto-generated with brand markup ${brand.name}`,
          });
        }
      }

      const newProduct: Product = {
        ...productData,
        id: newId,
        variants,
        createdAt: now,
        updatedAt: now,
      };

      setProducts((prev) => [newProduct, ...prev]);

      // Sync with backend SQLite
      catalogApi.createProduct(newProduct).catch((err) =>
        console.error('[Catalog] Backend product creation error:', err)
      );

      return newProduct;
    },
    [brandMarkups]
  );

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== id) return prod;
        const updated = { ...prod, ...updates, updatedAt: new Date().toISOString() };
        // Recalculate variant prices if salesPrice or costPrice changed
        if (updates.salesPrice !== undefined || updates.costPrice !== undefined) {
          const newBase = updates.salesPrice ?? prod.salesPrice;
          const newCost = updates.costPrice ?? prod.costPrice;
          updated.variants = prod.variants.map((v) => {
            const finalSalesPrice = newBase + v.markupAmount;
            const marginDollars = finalSalesPrice - newCost;
            const marginPercent = Number(((marginDollars / finalSalesPrice) * 100).toFixed(1));
            return {
              ...v,
              costPrice: newCost,
              finalSalesPrice,
              calculatedMarginDollars: marginDollars,
              calculatedMarginPercent: marginPercent,
            };
          });
        }
        return updated;
      })
    );

    // Sync with backend SQLite
    catalogApi.updateProduct(id, updates).catch((err) =>
      console.error('[Catalog] Backend product update error:', err)
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    // Sync with backend SQLite
    catalogApi.deleteProduct(id).catch((err) =>
      console.error('[Catalog] Backend product delete error:', err)
    );
  }, []);

  const addVariantToProduct = useCallback(
    (productId: string, brandId: string, customMarkup?: number, customNotes?: string): ProductVariant | null => {
      const brand = brandMarkups.find((b) => b.id === brandId);
      if (!brand) return null;

      const markupAmount = customMarkup !== undefined ? customMarkup : brand.markupAmount;
      let createdVariant: ProductVariant | null = null;

      setProducts((prev) =>
        prev.map((prod) => {
          if (prod.id !== productId) return prod;

          const finalSalesPrice = prod.salesPrice + markupAmount;
          const marginDollars = finalSalesPrice - prod.costPrice;
          const marginPercent = Number(((marginDollars / finalSalesPrice) * 100).toFixed(1));

          createdVariant = {
            id: `var_${Math.random().toString(36).substring(2, 9)}`,
            brandId: brand.id,
            brandName: brand.name,
            variantSku: `${prod.skuPrefix || 'BL'}-${brand.code}-${Math.floor(Math.random() * 900 + 100)}`,
            variantLabel: `${brand.name} (+${markupAmount} Markup)`,
            markupAmount,
            finalSalesPrice,
            costPrice: prod.costPrice,
            calculatedMarginDollars: marginDollars,
            calculatedMarginPercent: marginPercent,
            notes: customNotes || `Includes ${brand.name} markup of +$${markupAmount}`,
          };

          return {
            ...prod,
            variants: [...prod.variants, createdVariant],
            updatedAt: new Date().toISOString(),
          };
        })
      );

      // Sync with backend SQLite
      if (brand) {
        catalogApi.addVariant(productId, {
          brandId: brand.id,
          brandName: brand.name,
          markupAmount,
          notes: customNotes,
        }).catch((err) =>
          console.error('[Catalog] Backend variant addition error:', err)
        );
      }

      return createdVariant;
    },
    [brandMarkups]
  );

  const removeVariantFromProduct = useCallback((productId: string, variantId: string) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        return {
          ...prod,
          variants: prod.variants.filter((v) => v.id !== variantId),
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Sync with backend SQLite
    catalogApi.deleteVariant(productId, variantId).catch((err) =>
      console.error('[Catalog] Backend variant removal error:', err)
    );
  }, []);

  // Plan Operations
  const addPlan = useCallback((planData: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `plan_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    const newPlan: SubscriptionPlan = {
      ...planData,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    setPlans((prev) => [newPlan, ...prev]);

    // Sync with backend SQLite
    catalogApi.createPlan(newPlan).catch((err) =>
      console.error('[Catalog] Backend plan creation error:', err)
    );

    return newPlan;
  }, []);

  const updatePlan = useCallback((id: string, updates: Partial<SubscriptionPlan>) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === id ? { ...plan, ...updates, updatedAt: new Date().toISOString() } : plan
      )
    );

    // Sync with backend SQLite
    catalogApi.updatePlan(id, updates).catch((err) =>
      console.error('[Catalog] Backend plan update error:', err)
    );
  }, []);

  const deletePlan = useCallback((id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));

    // Sync with backend SQLite
    catalogApi.deletePlan(id).catch((err) =>
      console.error('[Catalog] Backend plan delete error:', err)
    );
  }, []);

  const togglePlanPolicy = useCallback((planId: string, policyKey: keyof PlanPolicyToggles) => {
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== planId) return plan;
        return {
          ...plan,
          policies: {
            ...plan.policies,
            [policyKey]: !plan.policies[policyKey],
          },
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Sync with backend SQLite
    catalogApi.togglePlanPolicy(planId, policyKey).catch((err) =>
      console.error('[Catalog] Backend policy toggle error:', err)
    );
  }, []);

  const addCustomBrandMarkup = useCallback(
    (name: string, markupAmount: number, code: string): BrandMarkupOption => {
      const newBrand: BrandMarkupOption = {
        id: `brand_${Math.random().toString(36).substring(2, 9)}`,
        name,
        markupAmount,
        code: code.toUpperCase(),
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        description: `Custom Brand Markup of +$${markupAmount}`,
      };
      setBrandMarkups((prev) => [...prev, newBrand]);
      return newBrand;
    },
    []
  );

  return (
    <CatalogContext.Provider
      value={{
        products,
        plans,
        brandMarkups,
        addProduct,
        updateProduct,
        deleteProduct,
        addVariantToProduct,
        removeVariantFromProduct,
        addPlan,
        updatePlan,
        deletePlan,
        togglePlanPolicy,
        addCustomBrandMarkup,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = () => {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};
