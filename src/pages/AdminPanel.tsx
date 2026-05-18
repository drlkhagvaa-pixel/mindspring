import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Psychologist, SubscriptionPlan } from '../types';

const G = '#4A7A56';
const DG = '#2D5A37';
const BG = '#EDE9E1';
const TEXT = '#1C2B1A';
const MUTED = '#6B7B69';

function statusLabel(p: Psychologist) {
  if (p.subscriptionStatus === 'active') {
    const exp = p.subscriptionExpiresAt ? new Date(p.subscriptionExpiresAt) : null;
    const daysLeft = exp ? Math.ceil((exp.getTime() - Date.now()) / 86400000) : null;
    return { text: `Идэвхтэй${daysLeft ? ` (${daysLeft} өдөр)` : ''}`, cls: 'bg-green-100 text-green-700' };
  }
  if (p.subscriptionStatus === 'pending') return { text: 'Хүлээгдэж байна', cls: 'bg-amber-100 text-amber-700' };
  return { text: 'Дууссан', cls: 'bg-red-100 text-red-600' };
}

export default function AdminPanel() {
  const { navigate, isAdmin, logoutPsychologist, activateSubscription } = useApp();
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [activating, setActivating] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');

  const { getPendingPsychologists } = useApp();

  useEffect(() => {
    if (!isAdmin) { navigate('psych-dashboard'); return; }
    getPendingPsychologists().then((data) => {
      setPsychologists(data);
      setLoading(false);
    }).catch((err) => {
      setFetchError(String(err));
      setLoading(false);
    });
  }, []);

  async function handleActivate(psych: Psychologist, plan: SubscriptionPlan) {
    setActivating(psych.id);
    await activateSubscription(psych.id, plan);
    setPsychologists((prev) =>
      prev.map((p) => {
        if (p.id !== psych.id) return p;
        const now = new Date();
        const exp = new Date(now);
        if (plan === 'monthly') exp.setDate(exp.getDate() + 30);
        else exp.setFullYear(exp.getFullYear() + 1);
        return { ...p, subscriptionStatus: 'active', subscriptionPlan: plan, subscriptionExpiresAt: exp.toISOString() };
      })
    );
    setActivating(null);
  }

  const displayed = filter === 'pending'
    ? psychologists.filter((p) => p.subscriptionStatus === 'pending')
    : psychologists;

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      {/* Header */}
      <div className="bg-white border-b border-stone-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('psych-dashboard')}
              className="flex items-center gap-2 text-sm" style={{ color: MUTED }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Буцах
            </button>
            <span className="text-stone-200">|</span>
            <h1 className="font-bold" style={{ color: TEXT }}>Admin — Захиалгын удирдлага</h1>
          </div>
          <button onClick={logoutPsychologist} className="text-sm text-red-400 hover:text-red-600 transition-colors">
            Гарах
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Нийт', value: psychologists.length, color: G },
            { label: 'Хүлээгдэж байна', value: psychologists.filter((p) => p.subscriptionStatus === 'pending').length, color: '#D97706' },
            { label: 'Идэвхтэй', value: psychologists.filter((p) => p.subscriptionStatus === 'active').length, color: '#059669' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-sm mt-1" style={{ color: MUTED }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-5">
          {(['pending', 'all'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all border"
              style={filter === f
                ? { backgroundColor: G, color: 'white', borderColor: G }
                : { backgroundColor: 'white', color: MUTED, borderColor: '#e7e5e4' }
              }>
              {f === 'pending' ? 'Хүлээгдэж байна' : 'Бүгд'}
            </button>
          ))}
        </div>

        {fetchError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm break-all">
            Алдаа: {fetchError}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16" style={{ color: MUTED }}>Ачааллаж байна...</div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-stone-200">
            <p style={{ color: MUTED }}>
              {filter === 'pending' ? 'Хүлээгдэж буй хүсэлт байхгүй байна.' : 'Бүртгэлтэй сэтгэлзүйч байхгүй байна.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((p) => {
              const status = statusLabel(p);
              return (
                <div key={p.id} className="bg-white rounded-xl border border-stone-100 shadow-sm p-5">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: G }}>
                        {p.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: TEXT }}>{p.name}</p>
                        <p className="text-sm" style={{ color: MUTED }}>{p.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.cls}`}>
                            {status.text}
                          </span>
                          {p.subscriptionPlan && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E8F0EB', color: G }}>
                              {p.subscriptionPlan === 'monthly' ? '1 сар сонгосон' : '1 жил сонгосон'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Activate buttons */}
                    <div className="flex items-center gap-2">
                      {p.subscriptionStatus !== 'active' ? (
                        <>
                          <button
                            onClick={() => handleActivate(p, 'monthly')}
                            disabled={activating === p.id}
                            className="text-sm px-4 py-2 rounded-xl font-medium border-2 transition-all hover:opacity-80 disabled:opacity-40"
                            style={{ borderColor: G, color: G }}
                          >
                            {activating === p.id ? '...' : '1 сар идэвхжүүлэх'}
                          </button>
                          <button
                            onClick={() => handleActivate(p, 'yearly')}
                            disabled={activating === p.id}
                            className="text-sm px-4 py-2 rounded-xl font-medium text-white transition-all hover:opacity-90 disabled:opacity-40"
                            style={{ backgroundColor: DG }}
                          >
                            {activating === p.id ? '...' : '1 жил идэвхжүүлэх'}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleActivate(p, 'monthly')}
                            disabled={activating === p.id}
                            className="text-xs px-3 py-1.5 rounded-xl font-medium border transition-all hover:opacity-80"
                            style={{ borderColor: '#e7e5e4', color: MUTED }}
                          >
                            +1 сар сунгах
                          </button>
                          <button
                            onClick={() => handleActivate(p, 'yearly')}
                            disabled={activating === p.id}
                            className="text-xs px-3 py-1.5 rounded-xl font-medium border transition-all hover:opacity-80"
                            style={{ borderColor: G, color: G }}
                          >
                            +1 жил сунгах
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
