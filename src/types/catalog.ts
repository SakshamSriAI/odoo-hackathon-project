export type ProductType =
  | 'software_license'
  | 'subscription_service'
  | 'cloud_addon'
  | 'support_tier'
  | 'hardware_device';

export interface BrandMarkupOption {
  id: string;
  name: string;
  code: string;
  markupAmount: number; // e.g. 560
  description?: string;
  badgeColor?: string;
}

export interface ProductVariant {
  id: string;
  brandId: string;
  brandName: string;
  variantSku: string;
  variantLabel: string;
  markupAmount: number; // e.g. 560 added to base sales price
  finalSalesPrice: number; // baseSalesPrice + markupAmount
  costPrice: number;
  calculatedMarginDollars: number;
  calculatedMarginPercent: number;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  salesPrice: number;
  costPrice: number;
  notes: string;
  variants: ProductVariant[];
  skuPrefix: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export type BillingFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface PlanPolicyToggles {
  autoCloseOnExpiration: boolean; // "dictate if the plan closes on its own"
  allowPause: boolean;            // "if it can be paused"
  allowRenewal: boolean;          // "if it can be renewed"
  allowEarlyClosure: boolean;     // "if it can be closed early"
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description: string;
  billingFrequency: BillingFrequency;
  minimumQuantity: number;
  availabilityStartDate: string; // YYYY-MM-DD
  availabilityEndDate: string;   // YYYY-MM-DD
  policies: PlanPolicyToggles;
  associatedProductIds: string[];
  basePrice: number;
  featuredBadge?: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}
