import { useState } from 'react';
import { useApp } from '../contexts/AppContext';

type Mode = 'login' | 'register' | 'forgot';

const G = '#4A7A56';
const BG = '#EDE9E1';
const TEXT = '#1C2B1A';
const MUTED = '#6B7B69';

export default function PsychAuth() {
  const { registerPsychologist, loginPsychologist, sendPasswordReset, beginRecovery, navigate, psychologist, isAdmin } = useApp();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function reset(newMode: Mode) {
    setMode(newMode);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);

    if (mode === 'login') {
      const ok = await loginPsychologist(email, password);
      if (ok) {
        // redirect handled by App.tsx based on subscription
      } else {
        setError('Имэйл эсвэл нууц үг буруу байна.');
      }
    } else if (mode === 'register') {
      if (!name || !email || !password) { setError('Бүх талбарыг бөглөнө үү.'); setBusy(false); return; }
      if (password.length < 6) { setError('Нууц үг дор хаяж 6 тэмдэгт байх ёстой.'); setBusy(false); return; }
      const ok = await registerPsychologist(name, email, password);
      if (ok) navigate('psych-subscription');
      else setError('Бүртгэл аль хэдийн байна. Нэвтэрнэ үү.');
    } else {
      if (!email) { setError('Имэйл хаягаа оруулна уу.'); setBusy(false); return; }
      const result = await sendPasswordReset(email);
      if (result.ok) beginRecovery(email);
      else setError('Тухайн имэйлтэй бүртгэл олдсонгүй.');
    }
    setBusy(false);
  }

  const inputCls = 'w-full px-4 py-3 border border-stone-200 rounded-2xl focus:ring-2 outline-none transition text-sm';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('home')}
          className="mb-6 flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: MUTED }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Нүүр хуудас
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ backgroundColor: '#E8F0EB' }}>
              <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none" style={{ color: G }}>
                <circle cx="14" cy="9" r="5" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M5 25c0-5 4-9 9-9s9 4 9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: TEXT }}>
              {mode === 'login' ? 'Сэтгэлзүйч нэвтрэх' : mode === 'register' ? 'Бүртгүүлэх' : 'Нууц үг сэргээх'}
            </h1>
            <p className="text-sm" style={{ color: MUTED }}>
              {mode === 'login' ? 'Тавтай морил' : mode === 'register' ? 'Шинэ бүртгэл үүсгэх' : 'Бүртгэлтэй имэйлээ оруулна уу'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT }}>Нэр</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Таны нэр" className={inputCls}
                  style={{ '--tw-ring-color': G } as React.CSSProperties} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT }}>Имэйл</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com" className={inputCls} />
            </div>
            {mode !== 'forgot' && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT }}>Нууц үг</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className={inputCls} />
                {mode === 'login' && (
                  <button type="button" onClick={() => reset('forgot')}
                    className="mt-1.5 text-xs hover:underline" style={{ color: G }}>
                    Нууц үгээ мартсан уу?
                  </button>
                )}
              </div>
            )}
            <button type="submit" disabled={busy}
              className="w-full text-white py-3 rounded-2xl font-semibold disabled:opacity-50 transition-opacity mt-2 text-sm"
              style={{ backgroundColor: G }}>
              {busy ? 'Түр хүлээнэ үү...' : mode === 'login' ? 'Нэвтрэх' : mode === 'register' ? 'Бүртгүүлэх' : 'Нууц үг сэргээх'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm" style={{ color: MUTED }}>
            {mode === 'login' ? (
              <>Бүртгэл байхгүй юу?{' '}
                <button onClick={() => reset('register')} className="font-semibold hover:underline" style={{ color: G }}>Бүртгүүлэх</button>
              </>
            ) : mode === 'register' ? (
              <>Бүртгэлтэй юу?{' '}
                <button onClick={() => reset('login')} className="font-semibold hover:underline" style={{ color: G }}>Нэвтрэх</button>
              </>
            ) : (
              <button onClick={() => reset('login')} className="font-semibold hover:underline" style={{ color: G }}>Нэвтрэх хэсэгт буцах</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
