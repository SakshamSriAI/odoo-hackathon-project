import { BillingFrequency } from './catalog';

export type SubscriptionStatus =
  | 'draft'
  | 'quotation'
  | 'confirmed'
  | 'active'
  | 'closed';

export type PaymentTerms =
  | 'net_15'
  | 'net_30'
  | 'net_60'
  | 'due_on_receipt'
  | 'quarterly_advance';

export interface ItemizedProductLine {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantLabel?: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent: number; // e.g. 8.5
  taxAmount: number;      // calculated
  subtotal: number;       // quantity * unitPrice
  totalAmount: number;    // subtotal + taxAmount
}

export interface CustomerInfo {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  description: string;
  targetTier: string;
  defaultPlanId: string;
  defaultPaymentTerms: PaymentTerms;
  defaultValidityDays: number;
  lineItemDrafts: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
}

export interface StatusTransitionLog {
  status: SubscriptionStatus;
  timestamp: string;
  note: string;
  actor: string;
}

export interface Subscription {
  id: string; // Unique subscription number, e.g. SUB-2026-8941
  quotationNumber: string; // QUO-2026-1042
  customer: CustomerInfo;
  planId: string;
  planName: string;
  planFrequency: BillingFrequency;
  status: SubscriptionStatus;
  statusHistory: StatusTransitionLog[];
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  paymentTerms: PaymentTerms;
  itemizedLines: ItemizedProductLine[];
  subtotalAmount: number;
  totalTaxAmount: number;
  grandTotal: number;
  salesRepId: string;
  salesRepName: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
