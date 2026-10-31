# Brightloop Software - Enterprise Subscription Management System

Brightloop Software is an enterprise-grade full-stack Subscription Management, Quote-to-Cash, and Automated Billing Engine built with **React 18**, **Node.js Express**, **Native SQLite (`node:sqlite`)**, **Vite 6**, **TypeScript 5**, and **Tailwind CSS v4**.

---

## 🚀 Key Modules & Architecture

### Full-Stack Architecture
- **Native SQLite Database Engine**: Built with Node.js v24 `node:sqlite` (`DatabaseSync`), requiring zero external database daemons or network setup. Persisted locally in `server/data/brightloop.db`.
- **Modular Express REST API**: 9 dedicated routers (`auth`, `products`, `plans`, `quotations`, `subscriptions`, `invoices`, `discounts`, `payments`, `finance`) operating on port 5001 with sub-millisecond query performance.
- **Dual-Route Resilient API Client**: Universal typed client (`src/services/api.ts`) connecting seamlessly in development and production with automatic proxy fallbacks.
- **Full Database Synchronization**: Instant state synchronization across 5 React Contexts (`AuthContext`, `CatalogContext`, `SalesContext`, `InvoicingContext`, `FinanceContext`).

### UI & UX Experience
- **Day & Focused Night Themes**: Seamless theme switcher with high-contrast emerald/indigo dark surfaces and crystal-clear typography.
- **Micro-Interactions & Tactile Polish**: Button hover elevation (`hover-lift`), tactile click responses (`btn-tactile`), dynamic specular card shimmer (`card-shine`), pop-in modal curves, and pulsing live database status indicators.
- **Multi-Role Portals**: 1-click persona switcher between **Enterprise Admin**, **Sales Staff**, and **Customer Portal**.

### Business Logic & Workflows
- **Product Catalog & Dynamic Markups**: Tiered branding SLA markups (+560 Prime, +850 OEM, +1200 FedRAMP) with real-time profit margin percentage calculators.
- **Policy Governance Toggles**: Configure subscription plans with automated expiration, pause rules, and renewal controls.
- **Sales Workflow & Stepper Pipeline**: Visual 5-stage progression (`Draft` → `Quotation` → `Confirmed` → `Active` → `Closed`) with complete audit event history.
- **Auto-Invoice Engine**: Transitioning a subscription quote to `Confirmed` automatically creates an official invoice in SQLite with itemized lines, taxes, and payment terms.
- **Automated Ledger Reconciliation**: Recording incoming payments (ACH, Wire Transfer, Check, Credit Card) automatically marks the target invoice as `Paid`.
- **Treasury Telemetry & High-Volume Benchmarking**: Real-time SQL aggregations for MRR, collection rates, overdue metrics, and a 1,250-record subscription benchmark executing in under 5ms.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS v4, Lucide React, React Router DOM v7
- **Backend**: Node.js v24, Express v5, CORS, Concurrently, TSX
- **Database**: SQLite via Node.js native `DatabaseSync` (`node:sqlite`)
- **Testing**: Automated REST API smoke-test suite and End-to-End Quote-to-Cash lifecycle test runner

---

## 📦 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Run Concurrent Development Server (Frontend + Backend)
```bash
npm run dev
```
- **Frontend UI**: http://localhost:5173/
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/api/health

### 3. Verification & Testing Commands
```bash
# 1. Run the 12-point REST API Smoke Test
npm run test:api

# 2. Run the Full Quote-to-Cash Lifecycle Integration Test
npm run test:lifecycle

# 3. Inspect Current SQLite Database Records
npm run db:check

# 4. (Optional) Reset and re-seed the SQLite database to factory defaults
npm run seed

# 5. Production Build
npm run build
```
