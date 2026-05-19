import { useApp } from '../contexts/AppContext';

const G = '#4A7A56';
const TEXT = '#1C2B1A';
const MUTED = '#6B7B69';

export default function Home() {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <img
        src="/home-bg.png"
        alt="MindSpring Mongolia"
        className="absolute inset-0 w-full h-full object-cover object-center select-none"
        draggable={false}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 2a6.5 6.5 0 0 1 5.742 9.573A6.5 6.5 0 1 1 9.5 2z"/>
              <path d="M12 2v4M9.5 8.5l2 2M14.5 8.5l-2 2"/>
            </svg>
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 28, color: TEXT, letterSpacing: '-0.01em' }}>
              mindspring
            </span>
          </div>
          <p style={{ color: MUTED, fontSize: 13, letterSpacing: '0.04em' }}>сэтгэл зүй • ойлголт • өсөлт</p>
        </div>

        {/* Cards */}
        <div className="flex gap-5 w-full max-w-2xl">
          {/* Psychologist card */}
          <button
            onClick={() => navigate('psych-login')}
            className="flex-1 rounded-3xl overflow-hidden text-left transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.99]"
            style={{ background: '#fff', boxShadow: '0 4px 24px rgb(0 0 0 / 0.10)' }}
          >
            <div className="h-52 overflow-hidden">
              <img src="/chair-psych.jpg" alt="Сэтгэлзүйч" className="w-full h-full object-cover" />
            </div>
            <div className="p-5">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Сэтгэлзүйч</h2>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, marginBottom: 14 }}>
                Үйлчлүүлэгчдээ удирдах, стандартчилсан тестүүд хуваарилах
              </p>
              <span style={{ fontSize: 13, fontWeight: 600, color: G }}>Нэвтрэх →</span>
            </div>
          </button>

          {/* Client card */}
          <button
            onClick={() => navigate('client-login')}
            className="flex-1 rounded-3xl overflow-hidden text-left transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.99]"
            style={{ background: '#fff', boxShadow: '0 4px 24px rgb(0 0 0 / 0.10)' }}
          >
            <div className="h-52 overflow-hidden">
              <img src="/chair-client.jpg" alt="Үйлчлүүлэгч" className="w-full h-full object-cover" />
            </div>
            <div className="p-5">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 4 }}>Үйлчлүүлэгч</h2>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, marginBottom: 14 }}>
                Сэтгэлзүйчийн өгсөн 6 тэмдэгтийн кодоор тестээ авах
              </p>
              <span style={{ fontSize: 13, fontWeight: 600, color: G }}>Код оруулах →</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
