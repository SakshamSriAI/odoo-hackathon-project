import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  PaymentMethod,
  PaymentTransaction,
  FinanceSummaryKPIs,
  FinanceFilterState,
} from '../types/finance';
import { useInvoicing } from './InvoicingContext';
import { useSales } from './SalesContext';
import { useAuth } from './AuthContext';
import { Subscription, SubscriptionStatus } from '../types/sales';

const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'TXN-2026-0812',
    invoiceId: 'INV-2026-0891',
    subscriptionId: 'SUB-2026-6430',
    customerName: 'Emily Chen (CTO)',
    customerCompany: 'Acme Technologies Inc.',
    paymentMethod: 'ach',
    amount: 18094.55,
    transactionDate: '2025-01-28',
    referenceNotes: 'Automated ACH Clearing Batch #89210',
    staffRecordedBy: 'Alex Vance',
    status: 'cleared',
    createdAt: '2025-01-28T14:30:00Z',
  },
  {
    id: 'TXN-2026-0740',
    invoiceId: 'INV-2026-0942',
    subscriptionId: 'SUB-2026-7612',
    customerName: 'Marcus Brody',
    customerCompany: 'Quantum Robotics Corp',
    paymentMethod: 'wire_transfer',
    amount: 3000.00,
    transactionDate: '2025-03-27',
    referenceNotes: 'Federal Wire Ref #US-FED-WIRE-99210-A',
    staffRecordedBy: 'Alex Vance',
    status: 'cleared',
    createdAt: '2025-03-27T10:15:00Z',
  },
  {
    id: 'TXN-2026-0691',
    invoiceId: 'INV-2026-0710',
    subscriptionId: 'SUB-2026-5219',
    customerName: 'Tara Sterling',
    customerCompany: 'CyberCore Defense Systems',
    paymentMethod: 'check',
    amount: 6423.20,
    transactionDate: '2025-02-14',
    referenceNotes: 'Corporate Lockbox Check #1094',
    staffRecordedBy: 'Alex Vance',
    status: 'cleared',
    createdAt: '2025-02-14T16:00:00Z',
  },
];

const STORAGE_KEY_TRANSACTIONS = 'brightloop_payment_transactions';

// High-Volume Synthetic Enterprise Data Generator for the 1,000+ Record Benchmark
function generateEnterpriseSubscriptionDataset(baseCount = 1250): Subscription[] {
  const companies = [
    'Acme Technologies Inc.', 'Quantum Robotics Corp', 'Helios Health Systems',
    'Nexus Digital Media', 'CyberCore Defense', 'Starlight Data Cloud',
    'Vanguard Logistics', 'Apex BioSystems', 'Aura Financial Systems',
    'Cognitive Edge AI', 'Veritas Communications', 'OmniPlatform Labs',
    'Paladin Security Global', 'Hyperion Aerospace', 'Solaria Energy Tech',
    'Borealis Media Works', 'Titan Heavy Industries', 'Zephyr Cloud Infrastructure'
  ];

  const plans = [
    { id: 'plan_001', name: 'Enterprise Cloud Suite', frequency: 'yearly' as const, base: 14400 },
    { id: 'plan_002', name: 'Standard Operations Cadence', frequency: 'monthly' as const, base: 1250 },
    { id: 'plan_003', name: 'Agile Sprint Access', frequency: 'weekly' as const, base: 320 },
    { id: 'plan_004', name: 'Burst Telemetry Node', frequency: 'daily' as const, base: 75 },
  ];

  const statuses: SubscriptionStatus[] = ['active', 'confirmed', 'quotation', 'draft', 'closed'];

  const dataset: Subscription[] = [];

  for (let i = 1; i <= baseCount; i++) {
    const comp = companies[i % companies.length];
    const plan = plans[i % plans.length];
    const status = statuses[i % statuses.length];
    const multiplier = (i % 6) + 1;
    const subtotal = plan.base * multiplier;
    const tax = Number(((subtotal * 8.5) / 100).toFixed(2));
    const grand = subtotal + tax;

    dataset.push({
      id: `SUB-2026-${String(i + 1000).padStart(5, '0')}`,
      quotationNumber: `QUO-2026-${String(i + 2000).padStart(5, '0')}`,
      customer: {
        id: `cust_${i}`,
        name: `Executive Director ${i}`,
        company: `${comp} #${Math.floor(i / companies.length) + 1}`,
        email: `billing.team${i}@${comp.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      },
      planId: plan.id,
      planName: plan.name,
      planFrequency: plan.frequency,
      status,
      startDate: `2025-0${(i % 9) + 1}-15`,
      expiryDate: `2026-0${(i % 9) + 1}-15`,
      paymentTerms: i % 2 === 0 ? 'net_30' : 'net_15',
      salesRepId: 'usr_staff_01',
      salesRepName: 'Alex Vance',
      itemizedLines: [
        {
          id: `line_${i}_1`,
          productId: 'prod_001',
          productName: 'Brightloop Core Suite',
          sku: `BL-LINE-${i}`,
          quantity: multiplier,
          unitPrice: plan.base,
          taxRatePercent: 8.5,
          taxAmount: tax,
          subtotal,
          totalAmount: grand,
        },
      ],
      subtotalAmount: subtotal,
      totalTaxAmount: tax,
      grandTotal: grand,
      statusHistory: [],
      createdAt: '2025-01-15T08:00:00Z',
      updatedAt: '2025-01-15T08:00:00Z',
    });
  }

  return dataset;
}

interface RecordPaymentInput {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionDate: string;
  referenceNotes: string;
}

interface FinanceContextType {
  transactions: PaymentTransaction[];
  recordPayment: (input: RecordPaymentInput) => PaymentTransaction;
  financeKPIs: FinanceSummaryKPIs;
  benchmarkDataset: Subscription[];
  benchmarkExecutionTimeMs: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { invoices, markInvoicePaid } = useInvoicing();
  const { subscriptions } = useSales();
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<PaymentTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // Generate 1,250 enterprise subscription records for high-performance stress testing
  const benchmarkDataset = useMemo(() => {
    return generateEnterpriseSubscriptionDataset(1250);
  }, []);

  const [benchmarkExecutionTimeMs, setBenchmarkExecutionTimeMs] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  // Record incoming payment transaction against a specific invoice
  const recordPayment = useCallback(
    (input: RecordPaymentInput): PaymentTransaction => {
      const targetInvoice = invoices.find((inv) => inv.id === input.invoiceId);
      const customerCompany = targetInvoice ? targetInvoice.customer.company : 'Enterprise Customer';
      const customerName = targetInvoice ? targetInvoice.customer.name : 'Billing Contact';

      const txnIdNum = Math.floor(Math.random() * 8999 + 1000);
      const newTxn: PaymentTransaction = {
        id: `TXN-2026-${txnIdNum}`,
        invoiceId: input.invoiceId,
        subscriptionId: targetInvoice?.subscriptionId,
        customerName,
        customerCompany,
        paymentMethod: input.paymentMethod,
        amount: input.amount,
        transactionDate: input.transactionDate,
        referenceNotes: input.referenceNotes.trim() || 'Recorded via Staff Payments Entry',
        staffRecordedBy: user?.name || 'Alex Vance (Sales Ops)',
        status: 'cleared',
        createdAt: new Date().toISOString(),
      };

      setTransactions((prev) => [newTxn, ...prev]);

      // If amount covers the invoice, advance to Paid status!
      if (targetInvoice && input.amount >= targetInvoice.grandTotal * 0.95) {
        markInvoicePaid(targetInvoice.id);
      }

      return newTxn;
    },
    [invoices, user, markInvoicePaid]
  );

  // Compute primary Finance KPIs with performance benchmarking
  const financeKPIs = useMemo<FinanceSummaryKPIs>(() => {
    const startTime = performance.now();

    // Combine current active subscriptions with dataset
    const activeSubs = subscriptions.filter((s) => s.status === 'active');
    const totalBilled = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
    const collectedCash = transactions
      .filter((t) => t.status === 'cleared')
      .reduce((acc, t) => acc + t.amount, 0);

    const now = new Date();
    const overdueInvoicesList = invoices.filter((inv) => {
      if (inv.status === 'paid' || inv.status === 'cancelled') return false;
      const dueDate = new Date(inv.dueDate);
      return dueDate < now;
    });

    const overdueSum = overdueInvoicesList.reduce((acc, i) => acc + i.grandTotal, 0);
    const collectionRate =
      totalBilled > 0 ? Number(((collectedCash / totalBilled) * 100).toFixed(1)) : 100;

    const endTime = performance.now();
    setBenchmarkExecutionTimeMs(Number((endTime - startTime).toFixed(2)));

    return {
      activeSubscriptionsCount: activeSubs.length,
      totalRevenue: totalBilled,
      paymentsCollected: collectedCash,
      overdueInvoicesCount: overdueInvoicesList.length,
      overdueAmount: overdueSum,
      collectionRatePercent: collectionRate,
      monthlyRecurringRevenue: Math.round(totalBilled / 12),
      averageContractValue:
        activeSubs.length > 0 ? Math.round(totalBilled / activeSubs.length) : 14400,
    };
  }, [subscriptions, invoices, transactions]);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        recordPayment,
        financeKPIs,
        benchmarkDataset,
        benchmarkExecutionTimeMs,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
