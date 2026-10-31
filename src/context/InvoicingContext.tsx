import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  DiscountRule,
  DiscountType,
  Invoice,
  InvoiceStatus,
  InvoiceLineItem,
} from '../types/invoicing';
import { Subscription } from '../types/sales';

export const INITIAL_DISCOUNT_RULES: DiscountRule[] = [
  {
    id: 'disc_001',
    name: 'Enterprise High-Volume Tier Discount',
    code: 'ENT-VOL-15',
    description: '15% percentage discount for enterprise orders purchasing 5 or more subscription units.',
    type: 'percentage',
    value: 15, // 15%
    minimumPurchaseQuantity: 5,
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    usageLimit: 100,
    timesUsed: 24,
    applicableProductIds: ['prod_001', 'prod_002'],
    status: 'active',
    createdAt: '2025-01-05T08:00:00Z',
    updatedAt: '2025-01-05T08:00:00Z',
  },
  {
    id: 'disc_002',
    name: 'New Subscriber Welcome Credit',
    code: 'WELCOME-500',
    description: '$500 fixed credit on initial qualifying subscription onboarding.',
    type: 'fixed',
    value: 500, // $500 fixed
    minimumPurchaseQuantity: 1,
    startDate: '2025-01-01',
    endDate: '2026-06-30',
    usageLimit: 50,
    timesUsed: 38,
    applicableProductIds: ['prod_001', 'prod_002', 'prod_003'],
    status: 'active',
    createdAt: '2025-01-10T12:00:00Z',
    updatedAt: '2025-01-10T12:00:00Z',
  },
  {
    id: 'disc_003',
    name: 'Mid-Market Growth Incentive',
    code: 'GROWTH-10',
    description: '10% recurring discount for mid-market accounts subscribing to at least 3 seats.',
    type: 'percentage',
    value: 10,
    minimumPurchaseQuantity: 3,
    startDate: '2025-03-01',
    endDate: '2026-12-31',
    usageLimit: 200,
    timesUsed: 82,
    applicableProductIds: ['prod_002', 'prod_003'],
    status: 'active',
    createdAt: '2025-03-01T10:00:00Z',
    updatedAt: '2025-03-01T10:00:00Z',
  },
  {
    id: 'disc_004',
    name: 'Year-End Enterprise Flash Incentive',
    code: 'YEAREND-1200',
    description: '$1,200 fixed deduction for large-scale cluster commitments of 10+ units.',
    type: 'fixed',
    value: 1200,
    minimumPurchaseQuantity: 10,
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    usageLimit: 25,
    timesUsed: 5,
    applicableProductIds: ['prod_001'],
    status: 'active',
    createdAt: '2026-10-01T09:00:00Z',
    updatedAt: '2026-10-01T09:00:00Z',
  },
];

const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-2026-0891',
    subscriptionId: 'SUB-2026-6430',
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
    invoiceDate: '2025-01-15',
    dueDate: '2025-02-14',
    status: 'paid',
    paymentTerms: 'net_30',
    appliedDiscountCode: 'ENT-VOL-15',
    notes: 'Official recurring invoice for Enterprise Cloud Suite Annual term.',
    confirmedAt: '2025-01-16T10:00:00Z',
    sentAt: '2025-01-16T10:15:00Z',
    paidAt: '2025-01-28T14:30:00Z',
    createdAt: '2025-01-15T09:00:00Z',
    updatedAt: '2025-01-28T14:30:00Z',
    lineItems: [
      {
        id: 'inv_line_01',
        description: 'Brightloop Cloud Orchestrator (Prime Edition +$560)',
        sku: 'BL-CLOUD-ORCH-PRIME',
        quantity: 5,
        unitPrice: 2960,
        discountAmount: 2220, // 15% discount
        taxRatePercent: 8.5,
        taxAmount: 1069.3,
        totalAmount: 13649.3,
      },
      {
        id: 'inv_line_02',
        description: 'Real-Time Billing & Invoicing Engine (Prime Edition)',
        sku: 'BL-BILL-ENG-PRIME',
        quantity: 2,
        unitPrice: 2410,
        discountAmount: 723,
        taxRatePercent: 8.5,
        taxAmount: 348.25,
        totalAmount: 4445.25,
      },
    ],
    subtotal: 19620,
    discountTotal: 2943,
    taxTotal: 1417.55,
    grandTotal: 18094.55,
  },
  {
    id: 'INV-2026-0942',
    subscriptionId: 'SUB-2026-7612',
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
    invoiceDate: '2025-03-25',
    dueDate: '2025-04-09',
    status: 'confirmed',
    paymentTerms: 'net_15',
    notes: 'Confirmed by procurement department. Awaiting automated ACH settlement.',
    confirmedAt: '2025-03-26T11:20:00Z',
    sentAt: '2025-03-26T11:30:00Z',
    createdAt: '2025-03-25T15:30:00Z',
    updatedAt: '2025-03-26T11:30:00Z',
    lineItems: [
      {
        id: 'inv_line_03',
        description: 'Real-Time Billing & Invoicing Engine (Prime Edition)',
        sku: 'BL-BILL-ENG-PRIME',
        quantity: 1,
        unitPrice: 2410,
        discountAmount: 0,
        taxRatePercent: 8.5,
        taxAmount: 204.85,
        totalAmount: 2614.85,
      },
      {
        id: 'inv_line_04',
        description: 'Advanced Telemetry & Analytics Hub (Standard)',
        sku: 'BL-ANALYTICS-HUB-STD',
        quantity: 4,
        unitPrice: 900,
        discountAmount: 360, // 10% discount
        taxRatePercent: 8.5,
        taxAmount: 275.4,
        totalAmount: 3515.4,
      },
    ],
    subtotal: 6010,
    discountTotal: 360,
    taxTotal: 480.25,
    grandTotal: 6130.25,
  },
  {
    id: 'INV-2026-1025',
    subscriptionId: 'SUB-2026-8824',
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
    invoiceDate: '2025-04-05',
    dueDate: '2025-06-04',
    status: 'draft',
    paymentTerms: 'net_60',
    notes: 'Draft invoice assembled from confirmed quotation proposal. Ready for review.',
    createdAt: '2025-04-05T09:00:00Z',
    updatedAt: '2025-04-05T09:00:00Z',
    lineItems: [
      {
        id: 'inv_line_05',
        description: 'Brightloop Cloud Orchestrator (Prime Edition +$560)',
        sku: 'BL-CLOUD-ORCH-PRIME',
        quantity: 3,
        unitPrice: 2960,
        discountAmount: 0,
        taxRatePercent: 8.5,
        taxAmount: 754.8,
        totalAmount: 9634.8,
      },
    ],
    subtotal: 8880,
    discountTotal: 0,
    taxTotal: 754.8,
    grandTotal: 9634.8,
  },
];

const STORAGE_KEY_DISCOUNTS = 'brightloop_discount_rules';
const STORAGE_KEY_INVOICES = 'brightloop_invoices';

interface CreateDiscountRuleInput {
  name: string;
  code: string;
  description: string;
  type: DiscountType;
  value: number;
  minimumPurchaseQuantity: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  applicableProductIds?: string[];
}

interface InvoicingContextType {
  discountRules: DiscountRule[];
  invoices: Invoice[];
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (inv: Invoice | null) => void;
  addDiscountRule: (input: CreateDiscountRuleInput) => DiscountRule;
  updateDiscountRule: (id: string, updates: Partial<DiscountRule>) => void;
  deleteDiscountRule: (id: string) => void;
  confirmInvoice: (id: string) => boolean;
  cancelInvoice: (id: string) => boolean;
  sendInvoice: (id: string) => boolean;
  markInvoicePaid: (id: string) => boolean;
  generateInvoiceFromSubscription: (sub: Subscription) => Invoice;
  getInvoiceById: (id: string) => Invoice | undefined;
}

const InvoicingContext = createContext<InvoicingContextType | undefined>(undefined);

export const InvoicingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [discountRules, setDiscountRules] = useState<DiscountRule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DISCOUNTS);
      return saved ? JSON.parse(saved) : INITIAL_DISCOUNT_RULES;
    } catch {
      return INITIAL_DISCOUNT_RULES;
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INVOICES);
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(
    () => invoices[0] || null
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DISCOUNTS, JSON.stringify(discountRules));
  }, [discountRules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  // Discount Operations
  const addDiscountRule = useCallback((input: CreateDiscountRuleInput): DiscountRule => {
    const now = new Date().toISOString();
    const newRule: DiscountRule = {
      id: `disc_${Math.random().toString(36).substring(2, 9)}`,
      name: input.name.trim(),
      code: input.code.trim().toUpperCase(),
      description: input.description.trim(),
      type: input.type,
      value: input.value,
      minimumPurchaseQuantity: Math.max(1, input.minimumPurchaseQuantity || 1),
      startDate: input.startDate,
      endDate: input.endDate,
      usageLimit: Math.max(1, input.usageLimit || 1),
      timesUsed: 0,
      applicableProductIds: input.applicableProductIds || [],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    setDiscountRules((prev) => [newRule, ...prev]);
    return newRule;
  }, []);

  const updateDiscountRule = useCallback((id: string, updates: Partial<DiscountRule>) => {
    setDiscountRules((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      )
    );
  }, []);

  const deleteDiscountRule = useCallback((id: string) => {
    setDiscountRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Invoice Operational Actions (Confirm, Cancel, Send, Mark Paid)
  const confirmInvoice = useCallback((id: string): boolean => {
    let success = false;
    const now = new Date().toISOString();
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        success = true;
        const updated = {
          ...inv,
          status: 'confirmed' as InvoiceStatus,
          confirmedAt: now,
          updatedAt: now,
        };
        if (selectedInvoice?.id === id) setSelectedInvoice(updated);
        return updated;
      })
    );
    return success;
  }, [selectedInvoice]);

  const cancelInvoice = useCallback((id: string): boolean => {
    let success = false;
    const now = new Date().toISOString();
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        success = true;
        const updated = {
          ...inv,
          status: 'cancelled' as InvoiceStatus,
          cancelledAt: now,
          updatedAt: now,
        };
        if (selectedInvoice?.id === id) setSelectedInvoice(updated);
        return updated;
      })
    );
    return success;
  }, [selectedInvoice]);

  const sendInvoice = useCallback((id: string): boolean => {
    let success = false;
    const now = new Date().toISOString();
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        success = true;
        const updated = {
          ...inv,
          sentAt: now,
          updatedAt: now,
        };
        if (selectedInvoice?.id === id) setSelectedInvoice(updated);
        return updated;
      })
    );
    return success;
  }, [selectedInvoice]);

  const markInvoicePaid = useCallback((id: string): boolean => {
    let success = false;
    const now = new Date().toISOString();
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        success = true;
        const updated = {
          ...inv,
          status: 'paid' as InvoiceStatus,
          paidAt: now,
          updatedAt: now,
        };
        if (selectedInvoice?.id === id) setSelectedInvoice(updated);
        return updated;
      })
    );
    return success;
  }, [selectedInvoice]);

  // Generate invoice from subscription
  const generateInvoiceFromSubscription = useCallback((sub: Subscription): Invoice => {
    const now = new Date();
    const invoiceDate = now.toISOString().split('T')[0];
    const due = new Date(now);
    due.setDate(due.getDate() + 30);
    const dueDate = due.toISOString().split('T')[0];

    const invoiceId = `INV-2026-${Math.floor(Math.random() * 8999 + 1000)}`;

    const lineItems: InvoiceLineItem[] = sub.itemizedLines.map((line) => ({
      id: `inv_item_${Math.random().toString(36).substring(2, 9)}`,
      description: `${line.productName} (${line.variantLabel || 'Standard'})`,
      sku: line.sku,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      discountAmount: 0,
      taxRatePercent: line.taxRatePercent,
      taxAmount: line.taxAmount,
      totalAmount: line.totalAmount,
    }));

    const newInvoice: Invoice = {
      id: invoiceId,
      subscriptionId: sub.id,
      quotationNumber: sub.quotationNumber,
      customer: sub.customer,
      invoiceDate,
      dueDate,
      status: 'draft',
      lineItems,
      subtotal: sub.subtotalAmount,
      discountTotal: 0,
      taxTotal: sub.totalTaxAmount,
      grandTotal: sub.grandTotal,
      paymentTerms: sub.paymentTerms,
      notes: `Automated invoice generated for ${sub.id}`,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setSelectedInvoice(newInvoice);
    return newInvoice;
  }, []);

  const getInvoiceById = useCallback(
    (id: string) => invoices.find((inv) => inv.id === id),
    [invoices]
  );

  return (
    <InvoicingContext.Provider
      value={{
        discountRules,
        invoices,
        selectedInvoice,
        setSelectedInvoice,
        addDiscountRule,
        updateDiscountRule,
        deleteDiscountRule,
        confirmInvoice,
        cancelInvoice,
        sendInvoice,
        markInvoicePaid,
        generateInvoiceFromSubscription,
        getInvoiceById,
      }}
    >
      {children}
    </InvoicingContext.Provider>
  );
};

export const useInvoicing = () => {
  const context = useContext(InvoicingContext);
  if (!context) {
    throw new Error('useInvoicing must be used within an InvoicingProvider');
  }
  return context;
};
