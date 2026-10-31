import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Subscription,
  SubscriptionStatus,
  QuotationTemplate,
  CustomerInfo,
  ItemizedProductLine,
  PaymentTerms,
} from '../types/sales';
import { useCatalog } from './CatalogContext';
import { useAuth } from './AuthContext';
import { salesApi } from '../services/api';

export const DEFAULT_TEMPLATES: QuotationTemplate[] = [
  {
    id: 'tmpl_enterprise_cloud',
    name: 'Enterprise Cloud Acceleration Template',
    description: 'Pre-packaged for mid-to-large organizations deploying orchestrated container services and automated billing.',
    targetTier: 'Enterprise Annual Tier',
    defaultPlanId: 'plan_001',
    defaultPaymentTerms: 'net_30',
    defaultValidityDays: 30,
    lineItemDrafts: [
      { productId: 'prod_001', variantId: 'var_001_1', quantity: 5 }, // Prime edition (+560 markup)
      { productId: 'prod_002', variantId: 'var_002_1', quantity: 2 },
    ],
  },
  {
    id: 'tmpl_growth_saas',
    name: 'Growth SaaS Operations Template',
    description: 'Designed for fast-growing SaaS startups needing recurring billing automation and analytics telemetry.',
    targetTier: 'Growth Monthly Tier',
    defaultPlanId: 'plan_002',
    defaultPaymentTerms: 'due_on_receipt',
    defaultValidityDays: 14,
    lineItemDrafts: [
      { productId: 'prod_002', variantId: 'var_002_1', quantity: 1 },
      { productId: 'prod_003', variantId: 'var_003_1', quantity: 3 },
    ],
  },
  {
    id: 'tmpl_burst_compute',
    name: 'High-Throughput Burst Telemetry Template',
    description: 'Specialized for temporary load testing, simulation bursts, and security compliance verification.',
    targetTier: 'Dedicated Sprint Tier',
    defaultPlanId: 'plan_003',
    defaultPaymentTerms: 'net_15',
    defaultValidityDays: 7,
    lineItemDrafts: [
      { productId: 'prod_001', variantId: 'var_001_2', quantity: 1 }, // OEM partner (+850 markup)
      { productId: 'prod_003', variantId: 'var_003_1', quantity: 5 },
    ],
  },
];

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'SUB-2026-6430',
    quotationNumber: 'QUO-2026-0812',
    customer: {
      id: 'cust_acme',
      name: 'Emily Chen (CTO)',
      company: 'Acme Technologies Inc.',
      email: 'customer@brightloop.io',
      phone: '+1 (555) 234-5678',
      address: '100 Innovation Way, Suite 400, San Francisco, CA 94107',
      taxId: 'US-EIN-94-3829102',
    },
    planId: 'plan_001',
    planName: 'Enterprise Cloud Suite (Yearly)',
    planFrequency: 'yearly',
    status: 'active',
    startDate: '2025-01-15',
    expiryDate: '2026-01-15',
    paymentTerms: 'net_30',
    salesRepId: 'usr_staff_01',
    salesRepName: 'Alex Vance',
    notes: 'Premier strategic account with dedicated 99.99% enterprise SLA.',
    createdAt: '2025-01-10T11:00:00Z',
    updatedAt: '2025-01-15T09:00:00Z',
    itemizedLines: [
      {
        id: 'line_01',
        productId: 'prod_001',
        productName: 'Brightloop Cloud Orchestrator',
        variantId: 'var_001_1',
        variantLabel: 'Prime Edition (+560 Markup)',
        sku: 'BL-CLOUD-ORCH-PRIME',
        quantity: 5,
        unitPrice: 2960, // 2400 + 560
        taxRatePercent: 8.5,
        taxAmount: 1258,
        subtotal: 14800,
        totalAmount: 16058,
      },
      {
        id: 'line_02',
        productId: 'prod_002',
        productName: 'Real-Time Billing & Invoicing Engine',
        variantId: 'var_002_1',
        variantLabel: 'Prime Edition (+560 Markup)',
        sku: 'BL-BILL-ENG-PRIME',
        quantity: 2,
        unitPrice: 2410,
        taxRatePercent: 8.5,
        taxAmount: 409.7,
        subtotal: 4820,
        totalAmount: 5229.7,
      },
    ],
    subtotalAmount: 19620,
    totalTaxAmount: 1667.7,
    grandTotal: 21287.7,
    statusHistory: [
      { status: 'draft', timestamp: '2025-01-10T11:00:00Z', note: 'Created initial quotation draft from Enterprise Template.', actor: 'Alex Vance' },
      { status: 'quotation', timestamp: '2025-01-11T14:30:00Z', note: 'Dispatched official quote to Emily Chen (CTO).', actor: 'Alex Vance' },
      { status: 'confirmed', timestamp: '2025-01-14T16:15:00Z', note: 'Acme procurement executed master agreement.', actor: 'Alex Vance' },
      { status: 'active', timestamp: '2025-01-15T09:00:00Z', note: 'Subscription activated and licenses provisioned.', actor: 'System Provisioner' },
    ],
  },
  {
    id: 'SUB-2026-7612',
    quotationNumber: 'QUO-2026-1044',
    customer: {
      id: 'cust_quantum',
      name: 'Marcus Brody',
      company: 'Quantum Robotics Corp',
      email: 'm.brody@quantumrobotics.ai',
      phone: '+1 (555) 879-1122',
      address: '450 Tech Hub Parkway, Cambridge, MA 02142',
      taxId: 'US-EIN-04-8839210',
    },
    planId: 'plan_002',
    planName: 'Standard Operations Cadence (Monthly)',
    planFrequency: 'monthly',
    status: 'confirmed',
    startDate: '2025-04-01',
    expiryDate: '2026-03-31',
    paymentTerms: 'net_15',
    salesRepId: 'usr_staff_01',
    salesRepName: 'Alex Vance',
    notes: 'Customer accepted quotation; awaiting payment verification prior to live rollout.',
    createdAt: '2025-03-20T10:00:00Z',
    updatedAt: '2025-03-25T15:30:00Z',
    itemizedLines: [
      {
        id: 'line_03',
        productId: 'prod_002',
        productName: 'Real-Time Billing & Invoicing Engine',
        variantId: 'var_002_1',
        variantLabel: 'Prime Edition (+560 Markup)',
        sku: 'BL-BILL-ENG-PRIME',
        quantity: 1,
        unitPrice: 2410,
        taxRatePercent: 8.5,
        taxAmount: 204.85,
        subtotal: 2410,
        totalAmount: 2614.85,
      },
      {
        id: 'line_04',
        productId: 'prod_003',
        productName: 'Advanced Telemetry & Analytics Hub',
        variantId: 'var_003_1',
        variantLabel: 'Standard Enhancement (+150 Markup)',
        sku: 'BL-ANALYTICS-HUB-STD',
        quantity: 4,
        unitPrice: 900,
        taxRatePercent: 8.5,
        taxAmount: 306,
        subtotal: 3600,
        totalAmount: 3906,
      },
    ],
    subtotalAmount: 6010,
    totalTaxAmount: 510.85,
    grandTotal: 6520.85,
    statusHistory: [
      { status: 'draft', timestamp: '2025-03-20T10:00:00Z', note: 'Draft initialized from Growth SaaS Template.', actor: 'Alex Vance' },
      { status: 'quotation', timestamp: '2025-03-21T11:00:00Z', note: 'Formal quote delivered to Marcus Brody.', actor: 'Alex Vance' },
      { status: 'confirmed', timestamp: '2025-03-25T15:30:00Z', note: 'Customer accepted contract terms and provided purchase order.', actor: 'Alex Vance' },
    ],
  },
  {
    id: 'SUB-2026-8824',
    quotationNumber: 'QUO-2026-1189',
    customer: {
      id: 'cust_helios',
      name: 'Dr. Evelyn Martinez',
      company: 'Helios Health Systems',
      email: 'emartinez@helioshealth.org',
      phone: '+1 (555) 432-8800',
      address: '77 Medical Plaza, Denver, CO 80202',
      taxId: 'US-EIN-84-1294821',
    },
    planId: 'plan_001',
    planName: 'Enterprise Cloud Suite (Yearly)',
    planFrequency: 'yearly',
    status: 'quotation',
    startDate: '2025-05-01',
    expiryDate: '2026-04-30',
    paymentTerms: 'net_60',
    salesRepId: 'usr_staff_01',
    salesRepName: 'Alex Vance',
    notes: 'HIPAA and SOC2 compliance addendum attached to quotation proposal.',
    createdAt: '2025-04-02T13:45:00Z',
    updatedAt: '2025-04-03T09:15:00Z',
    itemizedLines: [
      {
        id: 'line_05',
        productId: 'prod_001',
        productName: 'Brightloop Cloud Orchestrator',
        variantId: 'var_001_1',
        variantLabel: 'Prime Edition (+560 Markup)',
        sku: 'BL-CLOUD-ORCH-PRIME',
        quantity: 3,
        unitPrice: 2960,
        taxRatePercent: 8.5,
        taxAmount: 754.8,
        subtotal: 8880,
        totalAmount: 9634.8,
      },
    ],
    subtotalAmount: 8880,
    totalTaxAmount: 754.8,
    grandTotal: 9634.8,
    statusHistory: [
      { status: 'draft', timestamp: '2025-04-02T13:45:00Z', note: 'Quotation drafted with HIPAA customizations.', actor: 'Alex Vance' },
      { status: 'quotation', timestamp: '2025-04-03T09:15:00Z', note: 'Sent proposal PDF to hospital board review.', actor: 'Alex Vance' },
    ],
  },
  {
    id: 'SUB-2026-9041',
    quotationNumber: 'QUO-2026-1205',
    customer: {
      id: 'cust_nexus',
      name: 'Julian Thorne',
      company: 'Nexus Digital Media',
      email: 'jthorne@nexusmedia.io',
      phone: '+1 (555) 901-2345',
      address: '220 Sunset Blvd, Los Angeles, CA 90028',
    },
    planId: 'plan_003',
    planName: 'Agile Sprint Access (Weekly)',
    planFrequency: 'weekly',
    status: 'draft',
    startDate: '2025-05-15',
    expiryDate: '2025-08-15',
    paymentTerms: 'net_15',
    salesRepId: 'usr_staff_01',
    salesRepName: 'Alex Vance',
    notes: 'Initial requirements discovery completed; assembling custom quote.',
    createdAt: '2025-04-10T16:00:00Z',
    updatedAt: '2025-04-10T16:00:00Z',
    itemizedLines: [
      {
        id: 'line_06',
        productId: 'prod_003',
        productName: 'Advanced Telemetry & Analytics Hub',
        variantId: 'var_003_1',
        variantLabel: 'Standard Enhancement (+150 Markup)',
        sku: 'BL-ANALYTICS-HUB-STD',
        quantity: 2,
        unitPrice: 900,
        taxRatePercent: 8.5,
        taxAmount: 153,
        subtotal: 1800,
        totalAmount: 1953,
      },
    ],
    subtotalAmount: 1800,
    totalTaxAmount: 153,
    grandTotal: 1953,
    statusHistory: [
      { status: 'draft', timestamp: '2025-04-10T16:00:00Z', note: 'Draft started from Sprint Telemetry template.', actor: 'Alex Vance' },
    ],
  },
  {
    id: 'SUB-2026-5219',
    quotationNumber: 'QUO-2025-0511',
    customer: {
      id: 'cust_cyber',
      name: 'Tara Sterling',
      company: 'CyberCore Defense Systems',
      email: 'tsterling@cybercore.net',
      phone: '+1 (555) 678-9900',
      address: '500 Security Plaza, Reston, VA 20190',
    },
    planId: 'plan_001',
    planName: 'Enterprise Cloud Suite (Yearly)',
    planFrequency: 'yearly',
    status: 'closed',
    startDate: '2024-03-01',
    expiryDate: '2025-03-01',
    paymentTerms: 'net_30',
    salesRepId: 'usr_staff_01',
    salesRepName: 'Alex Vance',
    notes: 'Completed full annual subscription cycle. Transferred to GovCloud 2026 renewal.',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2025-03-01T23:59:59Z',
    itemizedLines: [
      {
        id: 'line_07',
        productId: 'prod_001',
        productName: 'Brightloop Cloud Orchestrator',
        variantId: 'var_001_1',
        variantLabel: 'Prime Edition (+560 Markup)',
        sku: 'BL-CLOUD-ORCH-PRIME',
        quantity: 2,
        unitPrice: 2960,
        taxRatePercent: 8.5,
        taxAmount: 503.2,
        subtotal: 5920,
        totalAmount: 6423.2,
      },
    ],
    subtotalAmount: 5920,
    totalTaxAmount: 503.2,
    grandTotal: 6423.2,
    statusHistory: [
      { status: 'draft', timestamp: '2024-02-15T10:00:00Z', note: 'Draft initial quote', actor: 'Alex Vance' },
      { status: 'quotation', timestamp: '2024-02-18T11:00:00Z', note: 'Sent quotation', actor: 'Alex Vance' },
      { status: 'confirmed', timestamp: '2024-02-22T14:00:00Z', note: 'Customer accepted', actor: 'Alex Vance' },
      { status: 'active', timestamp: '2024-03-01T00:00:00Z', note: 'Live subscription', actor: 'System' },
      { status: 'closed', timestamp: '2025-03-01T23:59:59Z', note: '12-month lifecycle concluded successfully.', actor: 'System' },
    ],
  },
];

const STORAGE_KEY_SUBSCRIPTIONS = 'brightloop_sales_subscriptions';
const STORAGE_KEY_TEMPLATES = 'brightloop_quotation_templates';

interface CreateSubscriptionInput {
  customer: CustomerInfo;
  planId: string;
  paymentTerms: PaymentTerms;
  startDate: string;
  expiryDate: string;
  itemizedLines: ItemizedProductLine[];
  notes?: string;
  initialStatus?: SubscriptionStatus;
}

interface SalesContextType {
  subscriptions: Subscription[];
  templates: QuotationTemplate[];
  selectedSubscription: Subscription | null;
  setSelectedSubscription: (sub: Subscription | null) => void;
  createSubscriptionFromTemplate: (
    templateId: string,
    customer: CustomerInfo,
    customOverrides?: Partial<CreateSubscriptionInput>
  ) => Subscription;
  createSubscription: (input: CreateSubscriptionInput) => Subscription;
  advanceSubscriptionStatus: (
    subscriptionId: string,
    targetStatus: SubscriptionStatus,
    note?: string
  ) => boolean;
  deleteSubscription: (id: string) => void;
  getSubscriptionById: (id: string) => Subscription | undefined;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { plans, products } = useCatalog();
  const { user } = useAuth();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SUBSCRIPTIONS);
      return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTIONS;
    } catch {
      return INITIAL_SUBSCRIPTIONS;
    }
  });

  const [templates, setTemplates] = useState<QuotationTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TEMPLATES);
      return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
    } catch {
      return DEFAULT_TEMPLATES;
    }
  });

  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(
    () => subscriptions[0] || null
  );

  // Initial server fetch to synchronize with SQLite backend
  useEffect(() => {
    let isMounted = true;
    salesApi.getSubscriptions()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setSubscriptions(data);
          setSelectedSubscription((prev) => {
            if (!prev) return data[0];
            const found = data.find((s) => s.id === prev.id);
            return found || data[0];
          });
        }
      })
      .catch((err) => console.warn('[Sales] Using cached subscriptions:', err.message));

    salesApi.getTemplates()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setTemplates(data);
        }
      })
      .catch((err) => console.warn('[Sales] Using cached templates:', err.message));

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SUBSCRIPTIONS, JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
  }, [templates]);

  // Create subscription from template
  const createSubscriptionFromTemplate = useCallback(
    (
      templateId: string,
      customer: CustomerInfo,
      customOverrides?: Partial<CreateSubscriptionInput>
    ): Subscription => {
      const template = templates.find((t) => t.id === templateId) || templates[0];
      const targetPlan = plans.find((p) => p.id === template.defaultPlanId) || plans[0];

      // Build itemized lines from template draft products
      const lines: ItemizedProductLine[] = template.lineItemDrafts.map((draft, idx) => {
        const prod = products.find((p) => p.id === draft.productId) || products[0];
        const variant = prod?.variants.find((v) => v.id === draft.variantId) || prod?.variants[0];

        const unitPrice = variant ? variant.finalSalesPrice : prod ? prod.salesPrice : 1000;
        const quantity = draft.quantity || 1;
        const subtotal = quantity * unitPrice;
        const taxRate = 8.5;
        const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
        const totalAmount = Number((subtotal + taxAmount).toFixed(2));

        return {
          id: `line_${Math.random().toString(36).substring(2, 9)}`,
          productId: prod ? prod.id : 'prod_default',
          productName: prod ? prod.name : 'Catalog Item',
          variantId: variant?.id,
          variantLabel: variant?.variantLabel || 'Base Catalog Configuration',
          sku: variant?.variantSku || prod?.skuPrefix || `BL-LINE-${idx + 1}`,
          quantity,
          unitPrice,
          taxRatePercent: taxRate,
          taxAmount,
          subtotal,
          totalAmount,
        };
      });

      const effectiveLines = customOverrides?.itemizedLines && customOverrides.itemizedLines.length > 0
        ? customOverrides.itemizedLines
        : lines;

      const subtotalAmount = effectiveLines.reduce((acc, l) => acc + l.subtotal, 0);
      const totalTaxAmount = effectiveLines.reduce((acc, l) => acc + l.taxAmount, 0);
      const grandTotal = subtotalAmount + totalTaxAmount;

      const now = new Date();
      const startDate = customOverrides?.startDate || now.toISOString().split('T')[0];
      const expiry = new Date(now);
      expiry.setDate(expiry.getDate() + (template.defaultValidityDays || 30));
      const expiryDate = customOverrides?.expiryDate || expiry.toISOString().split('T')[0];

      const subIdNum = Math.floor(Math.random() * 8999 + 1000);
      const quoIdNum = Math.floor(Math.random() * 8999 + 1000);

      const newSub: Subscription = {
        id: `SUB-2026-${subIdNum}`,
        quotationNumber: `QUO-2026-${quoIdNum}`,
        customer,
        planId: targetPlan ? targetPlan.id : 'plan_001',
        planName: targetPlan ? targetPlan.name : 'Standard Subscription Plan',
        planFrequency: targetPlan ? targetPlan.billingFrequency : 'monthly',
        status: customOverrides?.initialStatus || 'draft',
        startDate,
        expiryDate,
        paymentTerms: customOverrides?.paymentTerms || template.defaultPaymentTerms || 'net_30',
        itemizedLines: effectiveLines,
        subtotalAmount,
        totalTaxAmount,
        grandTotal,
        salesRepId: user?.id || 'usr_staff_01',
        salesRepName: user?.name || 'Alex Vance',
        notes: customOverrides?.notes || `Generated from ${template.name}`,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        statusHistory: [
          {
            status: customOverrides?.initialStatus || 'draft',
            timestamp: now.toISOString(),
            note: `Generated new quotation draft using ${template.name}`,
            actor: user?.name || 'Alex Vance',
          },
        ],
      };

      setSubscriptions((prev) => [newSub, ...prev]);
      setSelectedSubscription(newSub);

      // Persist to backend SQLite
      salesApi.createSubscription({
        customer,
        planId: newSub.planId,
        paymentTerms: newSub.paymentTerms,
        startDate: newSub.startDate,
        expiryDate: newSub.expiryDate,
        itemizedLines: newSub.itemizedLines,
        notes: newSub.notes,
        initialStatus: newSub.status,
      }).catch((err) => console.error('[Sales] Backend subscription creation failed:', err));

      return newSub;
    },
    [templates, plans, products, user]
  );

  // Create manual subscription
  const createSubscription = useCallback(
    (input: CreateSubscriptionInput): Subscription => {
      const targetPlan = plans.find((p) => p.id === input.planId) || plans[0];
      const subtotalAmount = input.itemizedLines.reduce((acc, l) => acc + l.subtotal, 0);
      const totalTaxAmount = input.itemizedLines.reduce((acc, l) => acc + l.taxAmount, 0);
      const grandTotal = subtotalAmount + totalTaxAmount;

      const now = new Date().toISOString();
      const subIdNum = Math.floor(Math.random() * 8999 + 1000);
      const quoIdNum = Math.floor(Math.random() * 8999 + 1000);

      const newSub: Subscription = {
        id: `SUB-2026-${subIdNum}`,
        quotationNumber: `QUO-2026-${quoIdNum}`,
        customer: input.customer,
        planId: targetPlan.id,
        planName: targetPlan.name,
        planFrequency: targetPlan.billingFrequency,
        status: input.initialStatus || 'draft',
        startDate: input.startDate,
        expiryDate: input.expiryDate,
        paymentTerms: input.paymentTerms,
        itemizedLines: input.itemizedLines,
        subtotalAmount,
        totalTaxAmount,
        grandTotal,
        salesRepId: user?.id || 'usr_staff_01',
        salesRepName: user?.name || 'Alex Vance',
        notes: input.notes,
        createdAt: now,
        updatedAt: now,
        statusHistory: [
          {
            status: input.initialStatus || 'draft',
            timestamp: now,
            note: 'Initialized custom subscription quotation',
            actor: user?.name || 'Alex Vance',
          },
        ],
      };

      setSubscriptions((prev) => [newSub, ...prev]);
      setSelectedSubscription(newSub);

      // Persist to backend SQLite
      salesApi.createSubscription({
        customer: input.customer,
        planId: input.planId,
        paymentTerms: input.paymentTerms,
        startDate: input.startDate,
        expiryDate: input.expiryDate,
        itemizedLines: input.itemizedLines,
        notes: input.notes,
        initialStatus: input.initialStatus,
      }).catch((err) => console.error('[Sales] Backend subscription creation failed:', err));

      return newSub;
    },
    [plans, user]
  );

  // Stepper Pipeline Transition
  const advanceSubscriptionStatus = useCallback(
    (subscriptionId: string, targetStatus: SubscriptionStatus, note?: string): boolean => {
      let success = false;
      const now = new Date().toISOString();

      setSubscriptions((prev) =>
        prev.map((sub) => {
          if (sub.id !== subscriptionId) return sub;

          const defaultNotes: Record<SubscriptionStatus, string> = {
            draft: 'Returned subscription to Draft stage.',
            quotation: 'Quotation published and sent to customer.',
            confirmed: 'Customer signed quotation; agreement confirmed.',
            active: 'Provisioned software licenses; subscription is now actively recurring.',
            closed: 'Subscription term concluded or terminated; moved to Closed stage.',
          };

          const logNote = note || defaultNotes[targetStatus];
          const newLog = {
            status: targetStatus,
            timestamp: now,
            note: logNote,
            actor: user?.name || 'Alex Vance (Sales Rep)',
          };

          const updated: Subscription = {
            ...sub,
            status: targetStatus,
            statusHistory: [...sub.statusHistory, newLog],
            updatedAt: now,
          };

          if (selectedSubscription?.id === subscriptionId) {
            setSelectedSubscription(updated);
          }
          success = true;
          return updated;
        })
      );

      // Persist to backend SQLite
      salesApi.advanceStatus(subscriptionId, targetStatus, note, user?.name).catch((err) =>
        console.error('[Sales] Backend advance status failed:', err)
      );

      return success;
    },
    [user, selectedSubscription]
  );

  const deleteSubscription = useCallback(
    (id: string) => {
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      if (selectedSubscription?.id === id) {
        setSelectedSubscription(null);
      }
      // Persist to backend SQLite
      salesApi.deleteSubscription(id).catch((err) =>
        console.error('[Sales] Backend delete subscription failed:', err)
      );
    },
    [selectedSubscription]
  );

  const getSubscriptionById = useCallback(
    (id: string) => {
      return subscriptions.find((s) => s.id === id);
    },
    [subscriptions]
  );

  return (
    <SalesContext.Provider
      value={{
        subscriptions,
        templates,
        selectedSubscription,
        setSelectedSubscription,
        createSubscriptionFromTemplate,
        createSubscription,
        advanceSubscriptionStatus,
        deleteSubscription,
        getSubscriptionById,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = () => {
  const context = useContext(SalesContext);
  if (!context) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
