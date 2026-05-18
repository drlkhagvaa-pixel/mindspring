import { useApp } from '../contexts/AppContext';

export default function Home() {
  const { navigate } = useApp();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background image */}
      <img
        src="/home-bg.png"
        alt="MindSpring Mongolia"
        className="absolute inset-0 w-full h-full object-cover object-center select-none"
        draggable={false}
      />

      {/* Clickable overlay grid */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top spacer — logo + title area */}
        <div className="flex-[2]" />

        {/* Card row */}
        <div className="flex justify-center gap-6 px-[16%] flex-[3]">
          <button
            onClick={() => navigate('psych-login')}
            className="flex-1 rounded-3xl cursor-pointer transition-all hover:bg-black/5 active:bg-black/10"
            aria-label="Сэтгэл зүйчийн хэсэг — Нэвтрэх"
          />
          <button
            onClick={() => navigate('client-login')}
            className="flex-1 rounded-3xl cursor-pointer transition-all hover:bg-black/5 active:bg-black/10"
            aria-label="Үйлчлүүлэгчийн хэсэг — Нэвтрэх"
          />
        </div>

        {/* Bottom spacer — feature bar + wave */}
        <div className="flex-[2]" />
      </div>
    </div>
  );
}
