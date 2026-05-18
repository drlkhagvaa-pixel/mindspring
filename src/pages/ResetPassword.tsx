import { useState } from 'react';
import { useApp } from '../contexts/AppContext';

const G = '#4A7A56';
const BG = '#EDE9E1';
const TEXT = '#1C2B1A';
const MUTED = '#6B7B69';

export default function ResetPassword() {
  const { setNewPassword, navigate, isRecovery } = useApp();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Нууц үг дор хаяж 6 тэмдэгт байх ёстой.'); return; }
    if (password !== confirm) { setError('Нууц үг таарахгүй байна.'); return; }
    setBusy(true);
    const ok = await setNewPassword(password);
    if (ok) setDone(true);
    else setError('Нууц үг шинэчлэхэд алдаа гарлаа.');
    setBusy(false);
  }

  const inputCls = 'w-full px-4 py-3 border border-stone-200 rounded-2xl outline-none transition text-sm';

  if (isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: BG }}>
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E8F0EB' }}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: G }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: TEXT }}>Имэйлийг шалгана уу</h2>
          <p className="text-sm mb-6" style={{ color: MUTED }}>
            Нууц үг сэргээх холбоосыг имэйл хаяг руу тань илгээлээ. Холбоос дарж нууц үгээ шинэчилнэ үү.
          </p>
          <button onClick={() => navigate('psych-login')}
            className="w-full text-white py-3 rounded-2xl font-semibold text-sm"
            style={{ backgroundColor: G }}>
            Нэвтрэх хуудас руу буцах
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: BG }}>
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: TEXT }}>Нууц үг шинэчлэгдлээ!</h2>
          <p className="text-sm mb-6" style={{ color: MUTED }}>Шинэ нууц үгээрээ нэвтэрч орно уу.</p>
          <button onClick={() => navigate('psych-login')}
            className="w-full text-white py-3 rounded-2xl font-semibold text-sm"
            style={{ backgroundColor: G }}>
            Нэвтрэх
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: BG }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ backgroundColor: '#E8F0EB' }}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: G }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: TEXT }}>Шинэ нууц үг тохируулах</h1>
            <p className="text-sm" style={{ color: MUTED }}>6-аас дээш тэмдэгттэй нууц үг оруулна уу</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: TEXT }}>Шинэ нууц үг</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: TEXT }}>Нууц үг давтах</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••" className={inputCls} />
            </div>
            <button type="submit" disabled={busy}
              className="w-full text-white py-3 rounded-2xl font-semibold disabled:opacity-50 transition-opacity text-sm"
              style={{ backgroundColor: G }}>
              {busy ? 'Хадгалж байна...' : 'Нууц үг шинэчлэх'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
