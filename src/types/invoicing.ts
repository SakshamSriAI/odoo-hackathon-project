import { CustomerInfo, PaymentTerms } from './sales';

export type DiscountType = 'fixed' | 'percentage';

export type DiscountStatus = 'active' | 'scheduled' | 'expired' | 'disabled';

export interface DiscountRule {
  id: string;
  name: string;
  code: string;
  description: string;
  type: DiscountType; // fixed ($) or percentage (%)
  value: number; // e.g. 500 ($) or 15 (%)
  minimumPurchaseQuantity: number; // e.g. 5
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  usageLimit: number; // e.g. 50
  timesUsed: number; // e.g. 24
  applicableProductIds: string[];
  status: DiscountStatus;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'draft' | 'confirmed' | 'paid' | 'cancelled';

export interface InvoiceLineItem {
  id: string;
  description: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxRatePercent: number; // e.g. 8.5%
  taxAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id: string; // e.g. INV-2026-0042
  subscriptionId?: string;
  quotationNumber?: string;
  customer: CustomerInfo;
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  appliedDiscountCode?: string;
  paymentTerms: PaymentTerms;
  notes?: string;
  sentAt?: string;
  confirmedAt?: string;
  paidAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}
