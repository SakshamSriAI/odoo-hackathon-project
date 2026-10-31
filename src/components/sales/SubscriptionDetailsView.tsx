import React from 'react';
import { Subscription } from '../../types/sales';
import { SubscriptionPipelineStepper } from './SubscriptionPipelineStepper';
import {
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Layers,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  Download,
  Copy,
  ArrowLeft,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

interface SubscriptionDetailsViewProps {
  subscription: Subscription;
  onBack?: () => void;
}

export const SubscriptionDetailsView: React.FC<SubscriptionDetailsViewProps> = ({
  subscription,
  onBack,
}) => {
  const { notify } = useNotification();

  const handleCopyId = () => {
    navigator.clipboard.writeText(subscription.id);
    notify('info', 'Copied to Clipboard', `Subscription number ${subscription.id} copied.`);
  };

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700 border-slate-300',
    quotation: 'bg-blue-50 text-blue-800 border-blue-200',
    confirmed: 'bg-amber-50 text-amber-800 border-amber-200',
    active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    closed: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const paymentTermLabels: Record<string, string> = {
    net_15: 'Net 15 Days',
    net_30: 'Net 30 Days',
    net_60: 'Net 60 Days',
    due_on_receipt: 'Due Upon Receipt',
    quarterly_advance: 'Quarterly Advance',
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="btn-tactile inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Subscriptions Ledger</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {subscription.id}
            </h2>
            <button
              onClick={handleCopyId}
              className="btn-tactile p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Copy Subscription ID"
            >
              <Copy className="w-4 h-4" />
            </button>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase border badge-interactive ${
                statusColors[subscription.status]
              }`}
            >
              {subscription.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
            <span>
              Quotation Reference: <strong className="font-mono text-slate-700">{subscription.quotationNumber}</strong>
            </span>
            <span>•</span>
            <span>
              Sales Representative: <strong className="text-slate-700">{subscription.salesRepName}</strong>
            </span>
            <span>•</span>
            <span>
              Created: {new Date(subscription.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => notify('info', 'Document Downloaded', `Generated formal quotation statement for ${subscription.id}.`)}
            className="btn-tactile inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Quotation PDF</span>
          </button>
        </div>
      </div>

      {/* Visual Status Pipeline (Stepper) Component */}
      <SubscriptionPipelineStepper subscription={subscription} />

      {/* 2-Column Metadata Cards: Customer Details & Contract Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Details Card */}
        <div className="hover-lift bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              <span>Customer & Subscriber Profile</span>
            </h3>
            <span className="text-[10px] text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded badge-interactive">
              Verified Account
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Organization / Entity</span>
              <span className="text-sm font-bold text-slate-900">{subscription.customer.company}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Authorized Signer</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {subscription.customer.name}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Direct Email</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {subscription.customer.email}
                </span>
              </div>
            </div>

            {subscription.customer.phone && (
              <div>
                <span className="text-slate-400 block text-[11px]">Phone Contact</span>
                <span className="text-slate-700 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {subscription.customer.phone}
                </span>
              </div>
            )}

            {subscription.customer.address && (
              <div>
                <span className="text-slate-400 block text-[11px]">Registered Billing Address</span>
                <span className="text-slate-700 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {subscription.customer.address}
                </span>
              </div>
            )}

            {subscription.customer.taxId && (
              <div>
                <span className="text-slate-400 block text-[11px]">Tax / VAT ID</span>
                <span className="font-mono text-slate-700">{subscription.customer.taxId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contract & Plan Terms Card */}
        <div className="hover-lift bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Plan Type & Payment Terms</span>
            </h3>
            <span className="text-[10px] text-purple-700 font-bold uppercase bg-purple-50 px-2 py-0.5 rounded badge-interactive">
              {subscription.planFrequency} Cadence
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Configured Subscription Plan</span>
              <span className="text-sm font-bold text-slate-900">{subscription.planName}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Contract Start Date</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {subscription.startDate}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Expiry / Term Date</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  {subscription.expiryDate}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Designated Payment Terms</span>
              <span className="font-semibold text-indigo-700 flex items-center gap-1.5 mt-0.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                {paymentTermLabels[subscription.paymentTerms] || subscription.paymentTerms}
              </span>
            </div>

            {subscription.notes && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 italic">
                "{subscription.notes}"
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Itemized Product Lines Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Itemized Subscription Product Lines
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of subscribed software licenses, brand markups (+560), and automatically calculated taxes
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 badge-interactive">
            {subscription.itemizedLines.length} Itemized Product(s)
          </span>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Line # & Description</th>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Taxes (8.5%)</th>
                <th className="py-3 px-4 text-right">Amount ($ USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscription.itemizedLines.map((line, idx) => (
                <tr key={line.id} className="interactive-row">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{line.productName}</div>
                    <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">
                      {line.variantLabel || 'Standard Catalog Edition'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {line.sku}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                    {line.quantity}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-800">
                    ${line.unitPrice.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                    ${line.taxAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    ${line.totalAmount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Calculation Totals Summary */}
        <div className="p-6 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="text-xs text-slate-500 max-w-sm">
            Taxes are calculated automatically according to state and local jurisdiction rules.
            Payment terms enforced per contract: <strong>{paymentTermLabels[subscription.paymentTerms] || subscription.paymentTerms}</strong>.
          </div>

          <div className="space-y-1.5 text-right w-full sm:w-auto">
            <div className="flex justify-between sm:justify-end gap-6 text-xs text-slate-600">
              <span>Itemized Subtotal:</span>
              <span className="font-mono font-semibold">${subscription.subtotalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between sm:justify-end gap-6 text-xs text-slate-600">
              <span>Combined Sales Taxes:</span>
              <span className="font-mono">${subscription.totalTaxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between sm:justify-end gap-6 text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Grand Total Payable:</span>
              <span className="font-mono text-indigo-600 text-lg">
                ${subscription.grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Pipeline Transition History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <span>Status Pipeline Transition Audit History</span>
        </h3>

        <div className="space-y-2">
          {subscription.statusHistory.map((log, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                  {idx + 1}
                </span>
                <span className="font-bold uppercase text-slate-800">{log.status}</span>
                <span className="text-slate-500">— {log.note}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {new Date(log.timestamp).toLocaleString()} ({log.actor})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
