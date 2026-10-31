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
  X,
} from 'lucide-react';

interface PaymentCard {
  id: string;
  brand: 'Visa' | 'Mastercard';
  last4: string;
  expiry: string;
  holder: string;
  isDefault: boolean;
}

export const CustomerPaymentMethodsPage: React.FC = () => {
  const { user } = useAuth();
  const { notify } = useNotification();
  const orgName = user?.organization || 'Acme Technologies Inc.';

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
      {/* 1. Payment Profile & Credentials Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
        {/* Header with Title and Add Payment Method Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Payment Profile & Credentials
          </h2>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Payment Method</span>
          </button>
        </div>

        {/* Credit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card) => {
            const isDefault = card.isDefault;

            return (
              <div
                key={card.id}
                className={`rounded-2xl p-6 transition-all flex flex-col justify-between min-h-[210px] ${
                  isDefault
                    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-lg'
                    : 'bg-white text-slate-900 border border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                {/* Card Top Row: Brand Logo & Status/Action */}
                <div className="flex items-center justify-between">
                  {/* Brand Logo */}
                  {card.brand === 'Visa' ? (
                    <span className="font-serif italic font-extrabold text-2xl tracking-tighter text-white select-none">
                      VISA
                    </span>
                  ) : (
                    <div className="flex items-center -space-x-2 select-none">
                      <span className="w-7 h-7 rounded-full bg-rose-500 opacity-90 inline-block" />
                      <span className="w-7 h-7 rounded-full bg-amber-400 opacity-90 inline-block" />
                    </div>
                  )}

                  {/* Status Pill or Set as Default Button */}
                  {isDefault ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Default Card
                    </span>
                  ) : (
                    <button
                      onClick={() => setDefaultCard(card.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                {/* Card Middle Row: Masked Number & Expiry */}
                <div className="flex items-baseline justify-between my-4">
                  <div
                    className={`text-xl font-mono tracking-widest font-semibold ${
                      isDefault ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    •••• •••• •••• {card.last4}
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-[10px] uppercase tracking-wider font-medium ${
                        isDefault ? 'text-slate-400' : 'text-slate-400'
                      }`}
                    >
                      Expires
                    </div>
                    <div
                      className={`text-sm font-mono font-bold ${
                        isDefault ? 'text-slate-200' : 'text-slate-700'
                      }`}
                    >
                      {card.expiry}
                    </div>
                  </div>
                </div>

                {/* Card Bottom Row: Cardholder & Auto-Renew Status */}
                <div className="pt-2 border-t border-slate-100/10 space-y-1">
                  <div
                    className={`text-sm font-medium ${
                      isDefault ? 'text-slate-200' : 'text-slate-700'
                    }`}
                  >
                    {card.holder}
                  </div>
                  <div
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isDefault ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    AUTO-RENEW LINKED
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Corporate Tax & Invoicing Entity Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Corporate Tax & Invoicing Entity
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Block 1: Legal Business Entity */}
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="text-xs text-slate-400 font-medium">
              Legal Business Entity:
            </div>
            <div className="text-base font-bold text-slate-900">
              {orgName}
            </div>
          </div>

          {/* Block 2: Federal Tax / EIN */}
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="text-xs text-slate-400 font-medium">
              Federal Tax / EIN:
            </div>
            <div className="text-base font-mono font-bold text-slate-900">
              US–EIN–94–3829102
            </div>
          </div>

          {/* Block 3: Standard Payment Terms */}
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-2xs space-y-2">
            <div className="text-xs text-slate-400 font-medium">
              Standard Payment Terms:
            </div>
            <div className="text-base font-bold text-slate-900 leading-snug">
              <div>Net 30</div>
              <div>Automated ACH / Card</div>
            </div>
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
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 cursor-pointer"
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
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold transition-colors shadow-xs cursor-pointer"
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
