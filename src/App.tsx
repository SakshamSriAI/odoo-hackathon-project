import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { CatalogProvider } from './context/CatalogContext';
import { SalesProvider } from './context/SalesContext';
import { InvoicingProvider } from './context/InvoicingContext';
import { FinanceProvider } from './context/FinanceContext';
import { ProtectedRoute } from './components/routing/ProtectedRoute';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { ProductsPage } from './pages/admin/ProductsPage';
import { PlansPage } from './pages/admin/PlansPage';
import { DiscountRulesPage } from './pages/admin/DiscountRulesPage';
import { InvoicesPage } from './pages/admin/InvoicesPage';
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { SubscriptionsPage } from './pages/staff/SubscriptionsPage';
import { QuotationsPage } from './pages/staff/QuotationsPage';
import { PaymentsPage } from './pages/staff/PaymentsPage';
import { FinanceLeadDashboardPage } from './pages/finance/FinanceLeadDashboardPage';
import { CustomerDashboardPage } from './pages/customer/CustomerDashboardPage';
import { CustomerSubscriptionsPage } from './pages/customer/CustomerSubscriptionsPage';
import { CustomerInvoicesPage } from './pages/customer/CustomerInvoicesPage';
import { CustomerPaymentMethodsPage } from './pages/customer/CustomerPaymentMethodsPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Root redirector based on authentication state and role
const RootRedirect: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/${user.role}`} replace />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <CatalogProvider>
              <SalesProvider>
                <InvoicingProvider>
                  <FinanceProvider>
                    <Routes>
                      {/* Public Auth Routes */}
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignupPage />} />
                      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                      {/* Root Dispatcher */}
                      <Route path="/" element={<RootRedirect />} />

                      {/* 1. Admin Portal (Protected: Admin only) */}
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <DashboardLayout
                              portalRole="admin"
                              title="Enterprise Administration"
                              subtitle="Overview of product catalog, plans, active discount rules, and billing metrics"
                            >
                              <AdminDashboardPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/products"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <DashboardLayout
                              portalRole="admin"
                              title="Product Catalog & Markups"
                              subtitle="Manage base software products, pricing structures, and dynamic brand markup tiers"
                            >
                              <ProductsPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/plans"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <DashboardLayout
                              portalRole="admin"
                              title="Subscription Plans"
                              subtitle="Configure recurring billing cadences, minimum order quantities, and lifecycle policies"
                            >
                              <PlansPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/discounts"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <DashboardLayout
                              portalRole="admin"
                              title="Discount Rules & Promos"
                              subtitle="Configure tiered percentage and fixed-dollar promotional discounts and quotas"
                            >
                              <DiscountRulesPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/invoices"
                        element={
                          <ProtectedRoute allowedRoles={['admin']}>
                            <DashboardLayout
                              portalRole="admin"
                              title="Invoices & Billing Audit"
                              subtitle="Review and manage customer tax invoices, automated line items, and dispatches"
                            >
                              <InvoicesPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/finance"
                        element={
                          <ProtectedRoute allowedRoles={['admin', 'staff']}>
                            <DashboardLayout
                              portalRole="admin"
                              title="Finance Lead Dashboard"
                              subtitle="Revenue metrics, recurring subscription telemetry, and payment reconciliation"
                            >
                              <FinanceLeadDashboardPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />

                      {/* 2. Internal Staff Portal (Protected: Staff only) */}
                      <Route
                        path="/staff"
                        element={
                          <ProtectedRoute allowedRoles={['staff']}>
                            <DashboardLayout
                              portalRole="staff"
                              title="Sales & Operations Portal"
                              subtitle="Generate customer quotations, monitor subscription lifecycles, and record payments"
                            >
                              <StaffDashboardPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/staff/quotations"
                        element={
                          <ProtectedRoute allowedRoles={['staff']}>
                            <DashboardLayout
                              portalRole="staff"
                              title="Quotation Builder"
                              subtitle="Generate and customize standardized subscription proposals and estimates"
                            >
                              <QuotationsPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/staff/subscriptions"
                        element={
                          <ProtectedRoute allowedRoles={['staff']}>
                            <DashboardLayout
                              portalRole="staff"
                              title="Subscriptions Pipeline"
                              subtitle="Track customer subscriptions through confirmation, activation, and renewal"
                            >
                              <SubscriptionsPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/staff/invoices"
                        element={
                          <ProtectedRoute allowedRoles={['staff']}>
                            <DashboardLayout
                              portalRole="staff"
                              title="Invoices Audit"
                              subtitle="Review generated customer invoices, statuses, and payment receipts"
                            >
                              <InvoicesPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/staff/payments"
                        element={
                          <ProtectedRoute allowedRoles={['staff']}>
                            <DashboardLayout
                              portalRole="staff"
                              title="Payment Transactions"
                              subtitle="Record and reconcile incoming client transactions against open invoices"
                            >
                              <PaymentsPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/finance"
                        element={
                          <ProtectedRoute allowedRoles={['staff', 'admin']}>
                            <DashboardLayout
                              portalRole="staff"
                              title="Finance Lead Dashboard"
                              subtitle="Revenue metrics, recurring subscription telemetry, and payment reconciliation"
                            >
                              <FinanceLeadDashboardPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />

                      {/* 3. Customer Portal (Protected: Customer only) */}
                      <Route
                        path="/customer"
                        element={
                          <ProtectedRoute allowedRoles={['customer']}>
                            <DashboardLayout
                              portalRole="customer"
                              title="Subscriber Dashboard"
                              subtitle="Overview of your active software subscriptions, renewals, and invoices"
                            >
                              <CustomerDashboardPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/customer/subscriptions"
                        element={
                          <ProtectedRoute allowedRoles={['customer']}>
                            <DashboardLayout
                              portalRole="customer"
                              title="Active Plans & Licenses"
                              subtitle="Detailed view of active licenses, seats, and service tiers"
                            >
                              <CustomerSubscriptionsPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/customer/invoices"
                        element={
                          <ProtectedRoute allowedRoles={['customer']}>
                            <DashboardLayout
                              portalRole="customer"
                              title="Billing History & Invoices"
                              subtitle="Download official tax receipts and itemized invoices"
                            >
                              <CustomerInvoicesPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/customer/payment-methods"
                        element={
                          <ProtectedRoute allowedRoles={['customer']}>
                            <DashboardLayout
                              portalRole="customer"
                              title="Payment Methods & Preferences"
                              subtitle="Manage corporate credit cards and automated billing accounts"
                            >
                              <CustomerPaymentMethodsPage />
                            </DashboardLayout>
                          </ProtectedRoute>
                        }
                      />

                      {/* Error / Security Routing */}
                      <Route path="/unauthorized" element={<UnauthorizedPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </FinanceProvider>
                </InvoicingProvider>
              </SalesProvider>
            </CatalogProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};
export default App;
