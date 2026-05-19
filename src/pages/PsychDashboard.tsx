import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Client } from '../types';
import { formatDate } from '../utils/scoring';
import { generateAccessCode } from '../utils/storage';

const G = '#4A7A56';
const DG = '#2D5A37';
const BG = '#EDE9E1';
const TEXT = '#1C2B1A';
const MUTED = '#6B7B69';
const inputCls = 'w-full px-4 py-2.5 border border-stone-200 rounded-xl outline-none text-sm transition-colors focus:border-[#4A7A56]';

export default function PsychDashboard() {
  const { psychologist, clients, navigate, addClient, deleteClient, logoutPsychologist, changePassword, isAdmin } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [cpForm, setCpForm] = useState({ current: '', next: '', confirm: '' });
  const [cpError, setCpError] = useState('');
  const [cpSuccess, setCpSuccess] = useState(false);
  const [cpBusy, setCpBusy] = useState(false);
  const [previewCode, setPreviewCode] = useState('');
  const [formData, setFormData] = useState({ name: '', age: '', gender: 'female' as Client['gender'], email: '', phone: '', notes: '' });
  const [formError, setFormError] = useState('');

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setCpError('');
    if (cpForm.next.length < 6) { setCpError('Шинэ нууц үг дор хаяж 6 тэмдэгт байх ёстой.'); return; }
    if (cpForm.next !== cpForm.confirm) { setCpError('Шинэ нууц үг таарахгүй байна.'); return; }
    setCpBusy(true);
    const ok = await changePassword(cpForm.current, cpForm.next);
    setCpBusy(false);
    if (ok) { setCpSuccess(true); setCpForm({ current: '', next: '', confirm: '' }); }
    else setCpError('Одоогийн нууц үг буруу байна.');
  }

  function closeChangePassword() {
    setShowChangePassword(false);
    setCpError('');
    setCpSuccess(false);
    setCpForm({ current: '', next: '', confirm: '' });
  }

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.accessCode.includes(search.toUpperCase())
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!formData.name || !formData.age) { setFormError('Нэр болон нас заавал бөглөнө.'); return; }
    const err = await addClient({
      name: formData.name, age: parseInt(formData.age), gender: formData.gender,
      email: formData.email, phone: formData.phone, notes: formData.notes, accessCode: previewCode,
    });
    if (err) { setFormError('Алдаа гарлаа: ' + err); return; }
    setShowAddForm(false);
    setFormData({ name: '', age: '', gender: 'female', email: '', phone: '', notes: '' });
  }

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="bg-white border-b border-stone-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: G }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <span className="font-bold" style={{ color: TEXT }}>MindSpring Mongolia</span>
              <p className="text-xs" style={{ color: MUTED }}>{psychologist?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button onClick={() => navigate('admin-panel')}
                className="text-sm flex items-center gap-1 font-medium transition-colors hover:opacity-70"
                style={{ color: G }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
            <button onClick={() => setShowChangePassword(true)}
              className="text-sm flex items-center gap-1 transition-colors hover:opacity-70"
              style={{ color: MUTED }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span className="hidden sm:inline">Нууц үг солих</span>
            </button>
            <button onClick={logoutPsychologist}
              className="text-sm flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Гарах
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { value: clients.length, label: 'Нийт үйлчлүүлэгч', color: G },
            { value: clients.filter((c) => c.completedTests.length > 0).length, label: 'Тест бөглөсөн', color: '#059669' },
            { value: clients.filter((c) => c.assignedTests.length > 0 && c.completedTests.length < c.assignedTests.length).length, label: 'Хүлээгдэж буй', color: '#D97706' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-sm mt-1" style={{ color: MUTED }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold" style={{ color: TEXT }}>Үйлчлүүлэгчид</h2>
          <button
            onClick={() => { setPreviewCode(generateAccessCode()); setShowAddForm(true); }}
            className="text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: G }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Үйлчлүүлэгч нэмэх
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: MUTED }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" placeholder="Нэр эсвэл код хайх..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl outline-none text-sm bg-white"
          />
        </div>

        {/* Client list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-stone-200">
            <svg className="w-12 h-12 text-stone-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p style={{ color: MUTED }}>
              {clients.length === 0 ? 'Үйлчлүүлэгч байхгүй байна. Нэмэхийн тулд дээрх товчийг дарна уу.' : 'Хайлтад тохирох үйлчлүүлэгч олдсонгүй.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((client) => (
              <div key={client.id} className="bg-white rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg"
                      style={{ backgroundColor: G }}>
                      {client.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: TEXT }}>{client.name}</h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs" style={{ color: MUTED }}>
                          {client.age} нас · {client.gender === 'male' ? 'Эрэгтэй' : client.gender === 'female' ? 'Эмэгтэй' : 'Бусад'}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: '#E8F0EB', color: DG }}>
                          {client.accessCode}
                        </span>
                        {client.assignedTests.length > 0 && (
                          <span className="text-xs" style={{ color: G }}>
                            {client.completedTests.length}/{client.assignedTests.length} тест
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('psych-client-detail', { selectedClientId: client.id })}
                      className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors hover:opacity-80"
                      style={{ color: G }}
                    >
                      Дэлгэрэнгүй
                    </button>
                    <button
                      onClick={() => { if (confirm(`"${client.name}" үйлчлүүлэгчийг устгах уу?`)) deleteClient(client.id); }}
                      className="text-sm text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Устгах
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add client modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold" style={{ color: TEXT }}>Үйлчлүүлэгч нэмэх</h2>
                <button onClick={() => setShowAddForm(false)} className="text-stone-400 hover:text-stone-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">{formError}</div>
              )}

              <form onSubmit={handleAdd} className="space-y-4">
                {/* Access code preview */}
                <div className="rounded-xl p-4 flex items-center justify-between" style={{ backgroundColor: '#E8F0EB' }}>
                  <div>
                    <p className="text-xs mb-1" style={{ color: MUTED }}>Нэвтрэх код (автомат)</p>
                    <span className="font-mono text-2xl font-bold tracking-widest" style={{ color: G }}>{previewCode}</span>
                  </div>
                  <button type="button" onClick={() => setPreviewCode(generateAccessCode())}
                    className="text-xs flex items-center gap-1 hover:opacity-70 transition-opacity" style={{ color: G }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Шинэчлэх
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: TEXT }}>Нэр *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Үйлчлүүлэгчийн нэр" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: TEXT }}>Нас *</label>
                    <input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="25" min="5" max="120" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: TEXT }}>Хүйс</label>
                    <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value as Client['gender'] })}
                      className={inputCls}>
                      <option value="female">Эмэгтэй</option>
                      <option value="male">Эрэгтэй</option>
                      <option value="other">Бусад</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: TEXT }}>Имэйл</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: TEXT }}>Утас</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+976 9900 0000" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: TEXT }}>Тэмдэглэл</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Клиникийн тэмдэглэл..." rows={3} className={inputCls + ' resize-none'} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors"
                    style={{ color: TEXT }}>
                    Цуцлах
                  </button>
                  <button type="submit"
                    className="flex-1 text-white py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ backgroundColor: G }}>
                    Нэмэх
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Change password modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold" style={{ color: TEXT }}>Нууц үг солих</h2>
                <button onClick={closeChangePassword} className="text-stone-400 hover:text-stone-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {cpSuccess ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#D1E4D8' }}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: G }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-medium mb-4" style={{ color: TEXT }}>Нууц үг амжилттай солигдлоо!</p>
                  <button onClick={closeChangePassword}
                    className="w-full text-white py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
                    style={{ backgroundColor: G }}>
                    Хаах
                  </button>
                </div>
              ) : (
                <>
                  {cpError && <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">{cpError}</div>}
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {[
                      { label: 'Одоогийн нууц үг', val: cpForm.current, key: 'current' },
                      { label: 'Шинэ нууц үг', val: cpForm.next, key: 'next' },
                      { label: 'Шинэ нууц үг давтах', val: cpForm.confirm, key: 'confirm' },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-sm font-medium mb-1" style={{ color: TEXT }}>{f.label}</label>
                        <input type="password" value={f.val}
                          onChange={(e) => setCpForm({ ...cpForm, [f.key]: e.target.value })}
                          placeholder="••••••••" className={inputCls} />
                      </div>
                    ))}
                    <div className="flex gap-3 pt-1">
                      <button type="button" onClick={closeChangePassword}
                        className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors"
                        style={{ color: TEXT }}>
                        Цуцлах
                      </button>
                      <button type="submit" disabled={cpBusy}
                        className="flex-1 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50 transition-opacity hover:opacity-90"
                        style={{ backgroundColor: G }}>
                        {cpBusy ? 'Хадгалж байна...' : 'Солих'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
