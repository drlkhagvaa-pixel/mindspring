import { useApp } from '../contexts/AppContext';

const G = '#4A7A56';
const BG = '#EDE9E1';
const TEXT = '#1C2B1A';
const MUTED = '#6B7B69';

export default function PsychPending() {
  const { psychologist, logoutPsychologist, navigate } = useApp();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: BG }}>
      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 max-w-md w-full text-center">

        {/* Animated waiting icon */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: '#E8F0EB' }}>
          <svg className="w-10 h-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: G }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ color: TEXT }}>Хүлээгдэж байна</h1>
        <p className="text-sm mb-1" style={{ color: MUTED }}>
          Сайн байна уу, <strong>{psychologist?.name}</strong>!
        </p>
        <p className="text-sm mb-6" style={{ color: MUTED }}>
          Таны{' '}
          <strong>{psychologist?.subscriptionPlan === 'monthly' ? '1 сарын' : psychologist?.subscriptionPlan === 'yearly' ? '1 жилийн' : ''}</strong>{' '}
          захиалгын хүсэлт хүлээн авагдлаа. Төлбөр шалгагдаж идэвхжүүлэгдэх хүртэл 24 цаг хүртэл зарцуулагдаж болно.
        </p>

        {/* Plan info */}
        {psychologist?.subscriptionPlan && (
          <div className="rounded-xl p-4 mb-6 text-left" style={{ backgroundColor: '#E8F0EB' }}>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: MUTED }}>Захиалгын хугацаа</span>
              <span className="text-sm font-bold" style={{ color: G }}>
                {psychologist.subscriptionPlan === 'monthly' ? '1 сар — 20,000₮' : '1 жил — 100,000₮'}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm" style={{ color: MUTED }}>Төлөв</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                Хүлээгдэж байна
              </span>
            </div>
          </div>
        )}

        {!psychologist?.subscriptionPlan && (
          <button
            onClick={() => navigate('psych-subscription')}
            className="w-full text-white py-3 rounded-2xl font-semibold text-sm mb-4 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: G }}
          >
            Захиалга сонгох
          </button>
        )}

        <p className="text-xs mb-6" style={{ color: MUTED }}>
          Асуух зүйл байвал: <strong>dr.lkhagvaa@gmail.com</strong>
        </p>

        <button onClick={logoutPsychologist} className="text-sm hover:underline" style={{ color: MUTED }}>
          Гарах
        </button>
      </div>
    </div>
  );
}
