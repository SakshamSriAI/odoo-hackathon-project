import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  CreditCard,
  Building2,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Lock,
  Trash2,
  Calendar,
  AlertCircle,
  X,
} from 'lucide-react';

interface PaymentCard {
  id: string;
  brand: 'Visa' | 'Mastercard' | 'Amex';
  last4: string;
  expiry: string;
  holder: string;
  isDefault: boolean;
}

export const CustomerPaymentMethodsPage: React.FC = () => {
  const { user } = useAuth();
  const { notify } = useNotification();

  const [cards, setCards] = useState<PaymentCard[]>([
    {
      id: 'card_01',
      brand: 'Visa',
      last4: '4242',
      expiry: '12/28',
      holder: 'Acme Technologies Inc. Treasury',
      isDefault: true,
    },
    {
      id: 'card_02',
      brand: 'Mastercard',
      last4: '8831',
      expiry: '09/27',
      holder: 'Emily Chen (CTO Corporate)',
      isDefault: false,
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvc, setNewCardCvc] = useState('');
  const [newCardHolder, setNewCardHolder] = useState('');

  const setDefaultCard = (id: string) => {
    setCards((prev) =>
      prev.map((c) => ({
        ...c,
        isDefault: c.id === id,
      }))
    );
    notify('success', 'Default Payment Card Updated', 'The selected card is now set as primary.');
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber || !newCardExpiry || !newCardHolder) {
      notify('error', 'Incomplete Form', 'Please fill in all credit card fields.');
      return;
    }
    const last4 = newCardNumber.slice(-4) || '9999';
    const newCard: PaymentCard = {
      id: `card_${Date.now()}`,
      brand: 'Visa',
      last4,
      expiry: newCardExpiry,
      holder: newCardHolder,
      isDefault: cards.length === 0,
    };
    setCards((prev) => [...prev, newCard]);
    setIsAddModalOpen(false);
    setNewCardNumber('');
    setNewCardExpiry('');
    setNewCardCvc('');
    setNewCardHolder('');
    notify('success', 'Payment Method Added', `Card ending in ${last4} has been registered.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
            <Lock className="w-3.5 h-3.5" />
            <span>PCI-DSS Level 1 Encrypted</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Payment Profile & Credentials</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure automated settlement cards and billing tax details for {user?.organization || 'Acme Technologies Inc.'}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Payment Method</span>
        </button>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`p-5 rounded-2xl border transition-all ${
              card.isDefault
                ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white border-slate-800 shadow-lg'
                : 'bg-white text-slate-900 border-slate-200 shadow-2xs hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                    card.isDefault ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {card.brand}
                </div>
                <div>
                  <div className={`text-xs font-bold ${card.isDefault ? 'text-white' : 'text-slate-900'}`}>
                    •••• •••• •••• {card.last4}
                  </div>
                  <div
                    className={`text-[11px] ${
                      card.isDefault ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    Expires {card.expiry}
                  </div>
                </div>
              </div>

              {card.isDefault ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                  <span>Default Card</span>
                </span>
              ) : (
                <button
                  onClick={() => setDefaultCard(card.id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Set as Default
                </button>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <span className={`text-[11px] ${card.isDefault ? 'text-slate-300' : 'text-slate-500'}`}>
                {card.holder}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
                Auto-Renew Linked
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Corporate Tax Identification Box */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>Corporate Tax & Invoicing Entity</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-400 text-[11px] font-medium">Legal Business Entity</div>
            <div className="text-slate-900 font-bold mt-0.5">{user?.organization || 'Acme Technologies Inc.'}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-400 text-[11px] font-medium">Federal Tax / EIN</div>
            <div className="text-slate-900 font-mono font-bold mt-0.5">US-EIN-94-3829102</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-400 text-[11px] font-medium">Standard Payment Terms</div>
            <div className="text-slate-900 font-bold mt-0.5">Net 30 Automated ACH / Card</div>
          </div>
        </div>
      </div>

      {/* Add Card Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Add Corporate Payment Card</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Technologies Inc."
                  value={newCardHolder}
                  onChange={(e) => setNewCardHolder(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Card Number</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  placeholder="4242 4242 4242 4242"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiration (MM/YY)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="12/28"
                    value={newCardExpiry}
                    onChange={(e) => setNewCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CVC / Security Code</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="•••"
                    value={newCardCvc}
                    onChange={(e) => setNewCardCvc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>Card data is tokenized securely and stored compliant with PCI-DSS Level 1 standards.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold transition-colors shadow-xs"
                >
                  Save Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
