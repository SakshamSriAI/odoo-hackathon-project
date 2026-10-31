import { User, UserRole, ResetPasswordRequest } from '../types/auth';
import { Product, BrandMarkupOption, SubscriptionPlan, PlanPolicyToggles } from '../types/catalog';
import { Subscription, SubscriptionStatus, QuotationTemplate, PaymentTerms, CustomerInfo, ItemizedProductLine } from '../types/sales';
import { Invoice, InvoiceStatus, DiscountRule, DiscountType } from '../types/invoicing';
import { PaymentTransaction, PaymentMethod, FinanceSummaryKPIs } from '../types/finance';

const getApiBase = () => {
  if (typeof window !== 'undefined' && (window.location.port === '5173' || window.location.port === '5174')) {
    return 'http://127.0.0.1:5001/api';
  }
  return '/api';
};

/**
 * Universal resilient fetcher that handles JSON serialization, error handling,
 * and automatic fallback between direct backend and dev proxy
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const base = getApiBase();
  const url = `${base}${cleanEndpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      let errorMsg = `Request failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) errorMsg = errorData.error;
      } catch {
        // response wasn't JSON
      }
      throw new Error(errorMsg);
    }
    return response.json();
  } catch (err: any) {
    // If direct connect failed in dev mode, attempt fallback to relative proxy
    if (base !== '/api') {
      try {
        const fallbackUrl = `/api${cleanEndpoint}`;
        const fallbackResponse = await fetch(fallbackUrl, { ...options, headers });
        if (fallbackResponse.ok) {
          return fallbackResponse.json();
        }
      } catch {
        // fallback also failed
      }
    }
    throw err;
  }
}

/* ====================================================================
   1. AUTHENTICATION API
   ==================================================================== */
export const authApi = {
  getUsers: () => apiFetch<User[]>('/auth/users'),
  login: (email: string, role?: UserRole, password?: string) =>
    apiFetch<{ success: boolean; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, role, password }),
    }),
  signup: (data: { name: string; email: string; role?: UserRole; organization?: string; password?: string }) =>
    apiFetch<{ success: boolean; user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  switchRole: (role: UserRole) =>
    apiFetch<{ success: boolean; user: User; token: string }>('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),
  resetPassword: (email: string) =>
    apiFetch<{ success: boolean; message: string; previewToken?: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  getResetRequests: () => apiFetch<ResetPasswordRequest[]>('/auth/reset-requests'),
};

/* ====================================================================
   2. CATALOG & PLANS API
   ==================================================================== */
export const catalogApi = {
  getMarkups: () => apiFetch<BrandMarkupOption[]>('/products/markups'),
  getProducts: () => apiFetch<Product[]>('/products'),
  getProduct: (id: string) => apiFetch<Product>(`/products/${id}`),
  createProduct: (data: Partial<Product>) =>
    apiFetch<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProduct: (id: string, updates: Partial<Product>) =>
    apiFetch<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteProduct: (id: string) =>
    apiFetch<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),
  addVariant: (productId: string, variant: { brandId: string; brandName: string; markupAmount: number; notes?: string }) =>
    apiFetch<Product>(`/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(variant),
    }),
  deleteVariant: (productId: string, variantId: string) =>
    apiFetch<Product>(`/products/${productId}/variants/${variantId}`, { method: 'DELETE' }),

  getPlans: () => apiFetch<SubscriptionPlan[]>('/plans'),
  getPlan: (id: string) => apiFetch<SubscriptionPlan>(`/plans/${id}`),
  createPlan: (data: Partial<SubscriptionPlan>) =>
    apiFetch<SubscriptionPlan>('/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updatePlan: (id: string, updates: Partial<SubscriptionPlan>) =>
    apiFetch<SubscriptionPlan>(`/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  togglePlanPolicy: (id: string, policyKey: keyof PlanPolicyToggles) =>
    apiFetch<SubscriptionPlan>(`/plans/${id}/toggle-policy`, {
      method: 'PATCH',
      body: JSON.stringify({ policyKey }),
    }),
  deletePlan: (id: string) =>
    apiFetch<{ success: boolean }>(`/plans/${id}`, { method: 'DELETE' }),
};

/* ====================================================================
   3. SALES & SUBSCRIPTION LIFECYCLE API
   ==================================================================== */
export const salesApi = {
  getTemplates: () => apiFetch<QuotationTemplate[]>('/quotations/templates'),
  generateQuotation: (data: {
    templateId?: string;
    customer: CustomerInfo;
    planId: string;
    paymentTerms: PaymentTerms;
    startDate?: string;
    expiryDate?: string;
    itemizedLines: ItemizedProductLine[];
    notes?: string;
    initialStatus?: SubscriptionStatus;
  }) =>
    apiFetch<Subscription>('/quotations/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSubscriptions: () => apiFetch<Subscription[]>('/subscriptions'),
  getSubscription: (id: string) => apiFetch<Subscription>(`/subscriptions/${id}`),
  createSubscription: (data: {
    customer: CustomerInfo;
    planId: string;
    paymentTerms: PaymentTerms;
    startDate?: string;
    expiryDate?: string;
    itemizedLines: ItemizedProductLine[];
    notes?: string;
    initialStatus?: SubscriptionStatus;
  }) =>
    apiFetch<Subscription>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  advanceStatus: (id: string, nextStatus: SubscriptionStatus, note?: string, actor?: string) =>
    apiFetch<Subscription>(`/subscriptions/${id}/advance`, {
      method: 'POST',
      body: JSON.stringify({ nextStatus, note, actor }),
    }),
  deleteSubscription: (id: string) =>
    apiFetch<{ success: boolean }>(`/subscriptions/${id}`, { method: 'DELETE' }),
};

/* ====================================================================
   4. INVOICING & DISCOUNTS API
   ==================================================================== */
export const invoicingApi = {
  getInvoices: () => apiFetch<Invoice[]>('/invoices'),
  getInvoice: (id: string) => apiFetch<Invoice>(`/invoices/${id}`),
  createInvoice: (data: Partial<Invoice>) =>
    apiFetch<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  confirmInvoice: (id: string) =>
    apiFetch<Invoice>(`/invoices/${id}/confirm`, { method: 'POST' }),
  cancelInvoice: (id: string) =>
    apiFetch<Invoice>(`/invoices/${id}/cancel`, { method: 'POST' }),
  markPaid: (id: string) =>
    apiFetch<Invoice>(`/invoices/${id}/pay`, { method: 'POST' }),
  sendInvoice: (id: string) =>
    apiFetch<{ success: boolean; message: string; invoice: Invoice }>(`/invoices/${id}/send`, { method: 'POST' }),

  getDiscounts: () => apiFetch<DiscountRule[]>('/discounts'),
  createDiscount: (data: Partial<DiscountRule>) =>
    apiFetch<DiscountRule>('/discounts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateDiscount: (id: string, updates: Partial<DiscountRule>) =>
    apiFetch<DiscountRule>(`/discounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteDiscount: (id: string) =>
    apiFetch<{ success: boolean }>(`/discounts/${id}`, { method: 'DELETE' }),
  validatePromo: (code: string, quantity: number, subtotal: number) =>
    apiFetch<{ valid: boolean; rule?: DiscountRule; discountAmount?: number; newSubtotal?: number; message?: string }>(
      '/discounts/validate',
      {
        method: 'POST',
        body: JSON.stringify({ code, quantity, subtotal }),
      }
    ),
};

/* ====================================================================
   5. TREASURY, PAYMENTS & FINANCE API
   ==================================================================== */
export const financeApi = {
  getKPIs: () => apiFetch<FinanceSummaryKPIs>('/finance/kpis'),
  getCashFlow: () => apiFetch<any[]>('/finance/cash-flow'),
  getBenchmark: (count: number = 1250) =>
    apiFetch<{ latencyMs: number; count: number; dataset: Subscription[] }>(`/finance/benchmark?count=${count}`),
  getPayments: () => apiFetch<PaymentTransaction[]>('/payments'),
  recordPayment: (data: {
    invoiceId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionDate?: string;
    referenceNotes?: string;
    staffRecordedBy?: string;
  }) =>
    apiFetch<PaymentTransaction>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
