import React, { useState, useEffect } from 'react';
import { useSales } from '../../context/SalesContext';
import { useCatalog } from '../../context/CatalogContext';
import { useNotification } from '../../context/NotificationContext';
import {
  CustomerInfo,
  ItemizedProductLine,
  PaymentTerms,
  QuotationTemplate,
} from '../../types/sales';
import {
  X,
  FileSpreadsheet,
  Plus,
  Trash2,
  DollarSign,
  Building,
  User,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface QuotationGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (subId: string) => void;
}

export const QuotationGeneratorModal: React.FC<QuotationGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { templates, createSubscriptionFromTemplate, createSubscription } = useSales();
  const { products, plans } = useCatalog();
  const { notify } = useNotification();

  // Template selection
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    templates[0]?.id || 'tmpl_enterprise_cloud'
  );

  // Customer state
  const [company, setCompany] = useState('Vanguard Logistics Global');
  const [contactName, setContactName] = useState('Jonathan Pierce (VP Infrastructure)');
  const [email, setEmail] = useState('jpierce@vanguardlogistics.com');
  const [phone, setPhone] = useState('+1 (555) 762-9011');
  const [address, setAddress] = useState('800 Harbor Blvd, Seattle, WA 98104');
  const [taxId, setTaxId] = useState('US-WA-91-849102');

  // Plan and contract terms
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || 'plan_001');
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('net_30');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');

  // Itemized Product Lines
  const [lines, setLines] = useState<ItemizedProductLine[]>([]);

  // Load template lines whenever template selection changes
  useEffect(() => {
    const tmpl = templates.find((t) => t.id === selectedTemplateId);
    if (!tmpl) return;

    setSelectedPlanId(tmpl.defaultPlanId);
    setPaymentTerms(tmpl.defaultPaymentTerms);

    const generatedLines: ItemizedProductLine[] = tmpl.lineItemDrafts.map((draft, idx) => {
      const prod = products.find((p) => p.id === draft.productId) || products[0];
      const variant =
        prod?.variants.find((v) => v.id === draft.variantId) || prod?.variants[0];

      const unitPrice = variant ? variant.finalSalesPrice : prod ? prod.salesPrice : 1000;
      const quantity = draft.quantity || 1;
      const subtotal = quantity * unitPrice;
      const taxRate = 8.5;
      const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
      const totalAmount = Number((subtotal + taxAmount).toFixed(2));

      return {
        id: `line_${Math.random().toString(36).substring(2, 9)}`,
        productId: prod ? prod.id : 'prod_default',
        productName: prod ? prod.name : 'Catalog Item',
        variantId: variant?.id,
        variantLabel: variant?.variantLabel || 'Base Catalog Configuration',
        sku: variant?.variantSku || prod?.skuPrefix || `BL-LINE-${idx + 1}`,
        quantity,
        unitPrice,
        taxRatePercent: taxRate,
        taxAmount,
        subtotal,
        totalAmount,
      };
    });

    setLines(generatedLines);
  }, [selectedTemplateId, templates, products]);

  if (!isOpen) return null;

  // Add line item
  const handleAddLine = () => {
    const prod = products[0];
    if (!prod) return;
    const variant = prod.variants[0];
    const unitPrice = variant ? variant.finalSalesPrice : prod.salesPrice;
    const subtotal = unitPrice * 1;
    const taxAmount = Number(((subtotal * 8.5) / 100).toFixed(2));

    const newLine: ItemizedProductLine = {
      id: `line_${Math.random().toString(36).substring(2, 9)}`,
      productId: prod.id,
      productName: prod.name,
      variantId: variant?.id,
      variantLabel: variant?.variantLabel || 'Base Catalog Configuration',
      sku: variant?.variantSku || prod.skuPrefix,
      quantity: 1,
      unitPrice,
      taxRatePercent: 8.5,
      taxAmount,
      subtotal,
      totalAmount: subtotal + taxAmount,
    };
    setLines([...lines, newLine]);
  };

  const handleUpdateLine = (id: string, updates: Partial<ItemizedProductLine>) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;
        const updated = { ...line, ...updates };

        // Recalculate totals
        const qty = updated.quantity;
        const price = updated.unitPrice;
        const subtotal = qty * price;
        const tax = Number(((subtotal * updated.taxRatePercent) / 100).toFixed(2));
        updated.subtotal = subtotal;
        updated.taxAmount = tax;
        updated.totalAmount = subtotal + tax;

        return updated;
      })
    );
  };

  const handleRemoveLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  // Totals
  const subtotalSum = lines.reduce((acc, l) => acc + l.subtotal, 0);
  const taxesSum = lines.reduce((acc, l) => acc + l.taxAmount, 0);
  const grandTotalSum = subtotalSum + taxesSum;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!company.trim()) {
      notify('error', 'Company Required', 'Please provide the client company name.');
      return;
    }
    if (lines.length === 0) {
      notify('error', 'Line Items Required', 'Please add at least one product line item.');
      return;
    }

    const customer: CustomerInfo = {
      id: `cust_${Math.random().toString(36).substring(2, 8)}`,
      name: contactName.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      taxId: taxId.trim(),
    };

    const newSub = createSubscription({
      customer,
      planId: selectedPlanId,
      paymentTerms,
      startDate,
      expiryDate,
      itemizedLines: lines,
      notes: notes.trim() || `Generated via ${templates.find((t) => t.id === selectedTemplateId)?.name}`,
      initialStatus: 'draft',
    });

    notify(
      'success',
      'Quotation Generated & Subscription Initialized',
      `Created ${newSub.id} for ${company} totaling $${grandTotalSum.toLocaleString()}.`
    );

    if (onSuccess) onSuccess(newSub.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded uppercase">
                Sales Rep Workflow
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Phase 3 Implementation</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Generate New Subscription from Quotation Template
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Step 1: Template Selection */}
          <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-blue-950 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                <span>Choose Quotation Blueprint Template *</span>
              </label>
              <span className="text-[11px] text-blue-700 font-medium">
                Auto-populates products, markups & terms
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {templates.map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-white text-blue-950 shadow-xs ring-2 ring-blue-500/20'
                        : 'border-blue-200/60 bg-blue-100/40 text-slate-700 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold leading-tight">{tmpl.name}</div>
                      <span className="inline-block mt-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                        {tmpl.targetTier}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                      {tmpl.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Customer Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-slate-500" />
              <span>Customer & Subscriber Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="sub-company">
                  Client Company Name *
                </label>
                <input
                  id="sub-company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="sub-contact">
                  Primary Contact Person *
                </label>
                <input
                  id="sub-contact"
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Jane Doe (Director of Eng)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="sub-email">
                  Billing Email Address *
                </label>
                <input
                  id="sub-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="billing@company.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="sub-tax">
                  Tax / VAT ID (Optional)
                </label>
                <input
                  id="sub-tax"
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="e.g. US-EIN-94-3829102"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Plan Type & Payment Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subscription Plan Type *
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.billingFrequency.toUpperCase()} • Min {p.minimumQuantity} units)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Terms *
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="net_15">Net 15 Days</option>
                <option value="net_30">Net 30 Days</option>
                <option value="net_60">Net 60 Days</option>
                <option value="due_on_receipt">Due Upon Receipt</option>
                <option value="quarterly_advance">Quarterly Advance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Step 4: Itemized Product Lines Data Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Itemized Product Lines & Pricing
                </h4>
                <p className="text-[11px] text-slate-500">
                  Itemized product units, brand markups (+560), quantities, and calculated taxes
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddLine}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Line</span>
              </button>
            </div>

            {/* Itemized Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-2.5 px-3">Product & Variant (+Markup)</th>
                    <th className="py-2.5 px-3 w-20">Qty</th>
                    <th className="py-2.5 px-3 w-28">Unit Price</th>
                    <th className="py-2.5 px-3 w-24">Taxes (8.5%)</th>
                    <th className="py-2.5 px-3 w-28 text-right">Amount</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lines.map((line) => (
                    <tr key={line.id} className="hover:bg-slate-50/50">
                      {/* Product & Variant dropdown */}
                      <td className="py-2.5 px-3">
                        <select
                          value={line.productId}
                          onChange={(e) => {
                            const newProd = products.find((p) => p.id === e.target.value);
                            if (newProd) {
                              const variant = newProd.variants[0];
                              const unitPrice = variant ? variant.finalSalesPrice : newProd.salesPrice;
                              handleUpdateLine(line.id, {
                                productId: newProd.id,
                                productName: newProd.name,
                                variantId: variant?.id,
                                variantLabel: variant?.variantLabel || 'Base Catalog Configuration',
                                sku: variant?.variantSku || newProd.skuPrefix,
                                unitPrice,
                              });
                            }
                          }}
                          className="w-full p-1.5 rounded-lg border border-slate-200 text-xs bg-white mb-1"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (${p.salesPrice.toLocaleString()} base)
                            </option>
                          ))}
                        </select>
                        <div className="text-[11px] text-indigo-600 font-medium">
                          Variant: {line.variantLabel}
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) =>
                            handleUpdateLine(line.id, {
                              quantity: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                          className="w-16 px-2 py-1 rounded border border-slate-200 text-center font-bold text-xs"
                        />
                      </td>

                      {/* Unit Price */}
                      <td className="py-2.5 px-3 font-mono font-medium">
                        ${line.unitPrice.toLocaleString()}
                      </td>

                      {/* Taxes */}
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        ${line.taxAmount.toLocaleString()}
                      </td>

                      {/* Line Amount */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ${line.totalAmount.toLocaleString()}
                      </td>

                      {/* Remove */}
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(line.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Remove Line"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Summary Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="text-xs text-slate-500">
                  Itemized across <strong>{lines.length} lines</strong> with automated 8.5% state & local taxes.
                </div>

                <div className="space-y-1 text-right text-xs">
                  <div className="text-slate-600">
                    Subtotal: <span className="font-mono font-semibold">${subtotalSum.toLocaleString()}</span>
                  </div>
                  <div className="text-slate-600">
                    Calculated Taxes: <span className="font-mono">${taxesSum.toLocaleString()}</span>
                  </div>
                  <div className="text-sm font-bold text-indigo-950 pt-1 border-t border-slate-200">
                    Grand Total Payable: <span className="font-mono text-base text-indigo-600">${grandTotalSum.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Quotation & Initialize Pipeline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
