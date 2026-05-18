import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { SubscriptionPlan } from '../types';

const G = '#4A7A56';
const DG = '#2D5A37';
const BG = '#EDE9E1';
const TEXT = '#1C2B1A';
const MUTED = '#6B7B69';

const BANK = {
  bank: 'Хас Банк',
  account: 'MN71003200 5005702263',
  holder: 'Батнасан Лхагвадорж',
};

const PLANS = [
  { id: 'monthly' as SubscriptionPlan, label: '1 сар', price: '20,000₮', note: '', color: '#E8F0EB', border: G },
  { id: 'yearly' as SubscriptionPlan, label: '1 жил', price: '100,000₮', note: '2 сар үнэгүй', color: '#D1E4D8', border: DG },
];

export default function PsychSubscription() {
  const { navigate, logoutPsychologist, psychologist, selectPlan } = useApp();
  const [selected, setSelected] = useState<SubscriptionPlan | null>(psychologist?.subscriptionPlan ?? null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    if (!selected) return;
    setBusy(true);
    await selectPlan(selected);
    setBusy(false);
    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: BG }}>
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E8F0EB' }}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: G }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: TEXT }}>Мэдэгдэл илгээгдлээ</h2>
          <p className="text-sm mb-6" style={{ color: MUTED }}>
            Та <strong>{selected === 'monthly' ? '1 сарын' : '1 жилийн'}</strong> захиалга сонгосон байна.
            Төлбөрөө шилжүүлсний дараа таны бүртгэлийг идэвхжүүлэх болно.
          </p>
          <button onClick={() => navigate('psych-pending')}
            className="w-full text-white py-3 rounded-2xl font-semibold text-sm"
            style={{ backgroundColor: G }}>
            Хүлээх хэсэг рүү
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <div className="max-w-xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ backgroundColor: '#E8F0EB' }}>
            <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none" style={{ color: G }}>
              <path d="M14 3C8.5 3 5 7 5 12C5 14.5 6 16.5 8 18C6.8 19.2 6 21 6 23C6 26 8.5 28 11 28C12 28 12.8 27.7 13.5 27.3V29H14.5V27.3C15.2 27.7 16 28 17 28C19.5 28 22 26 22 23C22 21 21.2 19.2 20 18C22 16.5 23 14.5 23 12C23 7 19.5 3 14 3Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: TEXT }}>MindSpring Mongolia</h1>
          <p className="text-sm" style={{ color: MUTED }}>
            Сэтгэлзүйн үнэлгээний платформ — захиалга сонгоно уу
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              className="rounded-2xl p-6 text-center transition-all border-2 relative"
              style={selected === plan.id
                ? { borderColor: plan.border, backgroundColor: plan.color }
                : { borderColor: '#e7e5e4', backgroundColor: 'white' }
              }
            >
              {plan.note && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: DG }}
                >
                  {plan.note}
                </span>
              )}
              <p className="text-lg font-bold mb-1" style={{ color: TEXT }}>{plan.label}</p>
              <p className="text-2xl font-bold" style={{ color: selected === plan.id ? DG : G }}>{plan.price}</p>
              {selected === plan.id && (
                <div className="mt-3 w-5 h-5 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: G }}>
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Bank transfer info */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-6">
          <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: TEXT }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: G }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Банкны шилжүүлгийн мэдээлэл
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Банк', value: BANK.bank },
              { label: 'Дансны дугаар', value: BANK.account },
              { label: 'Хүлээн авагч', value: BANK.holder },
              { label: 'Гүйлгээний утга', value: `MindSpring - ${psychologist?.name ?? 'нэр'} - ${selected === 'monthly' ? '1 сар' : selected === 'yearly' ? '1 жил' : 'сонгоно уу'}` },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-start py-2 border-b border-stone-50 last:border-0">
                <span className="text-sm" style={{ color: MUTED }}>{row.label}</span>
                <span className="text-sm font-semibold text-right max-w-[60%]" style={{ color: TEXT }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl text-xs" style={{ backgroundColor: '#FEF9EC', color: '#92400e' }}>
            ⚠️ Гүйлгээний утгыг заавал зөв бичнэ үү. Дараа нь таны бүртгэлийг идэвхжүүлнэ.
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!selected || busy}
          className="w-full text-white py-3.5 rounded-2xl font-semibold text-sm disabled:opacity-40 transition-opacity hover:opacity-90"
          style={{ backgroundColor: G }}
        >
          {busy ? 'Хадгалж байна...' : 'Төлбөр шилжүүлсэн — баталгаажуулна уу'}
        </button>

        <div className="mt-4 text-center">
          <button onClick={logoutPsychologist} className="text-sm hover:underline" style={{ color: MUTED }}>
            Гарах
          </button>
        </div>
      </div>
    </div>
  );
}
