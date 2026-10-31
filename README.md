# Brightloop Software - Enterprise Subscription Management System

Brightloop Software is an enterprise-grade Subscription Management and Billing engine built with React 18, Vite, TypeScript, and Tailwind CSS v4.

---

## 🚀 Key Modules & Architecture

### Phase 1: Project Setup & Authentication UI
- **Strict Signup Validation**: Password policy enforcing >8 characters, uppercase, lowercase, and special character requirements with real-time feedback.
- **Role-Based Protected Routing**: Distinct, isolated portals for `Admin`, `Internal Staff`, and `Customer` personas.
- **Forgot Password Interface**: Dispatches simulation password reset tokens and links.

### Phase 2: Admin Product Catalog & Plan Configuration
- **Product Catalog Management**: Products with base price, cost price, and sales notes.
- **Dynamic Variant Markups**: Brand variant selector adding custom markups (e.g. +$560 prime markup).
- **Flexible Subscription Plans**: Cadences (daily, weekly, monthly, yearly), minimum purchase quantities, availability date windows.
- **Policy Governance Toggles**: Automatic closure, pause permissions, renewal rules, and early termination controls.

### Phase 3: Sales Workflow & Subscription Management
- **Internal Staff Portal**: Tailored for Sales Representatives and Operations.
- **Quotation Generator**: Create formal quotes from standardized templates.
- **5-Stage Lifecycle Stepper**: Visual progression from `Draft` → `Quotation` → `Confirmed` → `Active` → `Closed`.
- **Itemized Subscription Details**: Line items with automated taxes, quantities, discounts, and payment terms.

### Phase 4: Automated Invoicing & Discount Rules UI
- **Discount Rules Engine**: Configure fixed-dollar ($) or percentage (%) discounts, minimum order thresholds, date limits, and global usage caps.
- **Invoice Governance**: Automated tax calculation, pre-filled client data, and status progression (`Draft`, `Confirmed`, `Paid`).
- **Interactive Actions**: Confirm, cancel, email dispatch simulation, and print-ready receipts.

### Phase 5: Treasury, Payments & Finance Lead Dashboard
- **Payment Recording UI**: Record incoming transactions against specific invoices with payment method, amount, date, and notes.
- **Finance Lead Analytics**: High-level KPIs for Active Subscriptions, Total Revenue, Payments Collected, and Overdue Invoices.
- **Cash Flow Telemetry**: Smooth cubic-bezier interactive SVG telemetry chart tracking rolling monthly liquidity.
- **Enterprise Performance**: Virtualized/paginated data table maintaining sub-2-second response times across 1,200+ synthesized subscriptions.

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Language**: TypeScript 5
- **Routing**: React Router DOM v7
- **Icons**: Lucide React

---

## 📦 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```

### 3. Production Build
```bash
npm run build
npm run preview
```
