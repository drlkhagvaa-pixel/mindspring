import { useState } from 'react';
import { useApp } from '../contexts/AppContext';

const G = '#4A7A56';
const BG = '#EDE9E1';
const TEXT = '#1C2B1A';
const MUTED = '#6B7B69';

export default function ClientLogin() {
  const { getClientByCode, navigate } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const client = await getClientByCode(code.trim());
    setBusy(false);
    if (!client) {
      setError('Буруу код. Сэтгэлзүйчтэйгээ холбогдоно уу.');
      return;
    }
    navigate('client-tests', { selectedClientId: client.id });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: BG }}>
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
                <rect x="4" y="10" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M9 10V7a5 5 0 0110 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="14" cy="17" r="2" fill="currentColor"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: TEXT }}>Нэвтрэх код</h1>
            <p className="text-sm" style={{ color: MUTED }}>
              Сэтгэлзүйчийн өгсөн 6 тэмдэгтийн кодоо оруулна уу
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="XXXXXX"
              maxLength={6}
              className="w-full text-center text-3xl font-mono font-bold tracking-[0.5em] px-4 py-5 border-2 border-stone-200 rounded-2xl outline-none transition uppercase"
              style={{ color: TEXT }}
              onFocus={(e) => (e.target.style.borderColor = G)}
              onBlur={(e) => (e.target.style.borderColor = '#e7e5e4')}
            />
            <button
              type="submit"
              disabled={code.length < 6 || busy}
              className="w-full text-white py-3.5 rounded-2xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity text-sm"
              style={{ backgroundColor: G }}
            >
              {busy ? 'Шалгаж байна...' : 'Нэвтрэх'}
            </button>
          </form>

          <p className="text-center text-xs mt-5" style={{ color: MUTED }}>
            Кодоо мартсан бол сэтгэлзүйчтэйгээ холбогдоно уу
          </p>
        </div>
      </div>
    </div>
  );
}
