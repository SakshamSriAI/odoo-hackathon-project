export type PaymentMethod =
  | 'credit_card'
  | 'wire_transfer'
  | 'ach'
  | 'check'
  | 'other';

export interface PaymentTransaction {
  id: string; // e.g. TXN-2026-0042
  invoiceId: string;
  subscriptionId?: string;
  customerName: string;
  customerCompany: string;
  paymentMethod: PaymentMethod;
  amount: number;
  transactionDate: string; // YYYY-MM-DD
  referenceNotes: string;
  staffRecordedBy: string;
  status: 'cleared' | 'pending' | 'failed';
  createdAt: string;
}

export interface FinanceSummaryKPIs {
  activeSubscriptionsCount: number;
  totalRevenue: number;
  paymentsCollected: number;
  overdueInvoicesCount: number;
  overdueAmount: number;
  collectionRatePercent: number;
  monthlyRecurringRevenue: number;
  averageContractValue: number;
}

export interface FinanceFilterState {
  searchTerm: string;
  dateRange: 'all' | 'last_30_days' | 'current_quarter' | 'year_to_date' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  status: string;
  cadence: string;
  minAmount?: number;
  maxAmount?: number;
}
