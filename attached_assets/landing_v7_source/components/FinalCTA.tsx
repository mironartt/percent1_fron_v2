import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

export const FinalCTA: React.FC = () => {
  const items = [
    "Увидел свои проблемные зоны",
    "Получил персональные цели от AI",
    "План на месяц разбит по дням",
    "Система привычек с геймификацией",
    "Награды за прогресс",
    "AI поддержка 24/7 в Telegram"
  ];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-brand-600 to-purple-700 relative overflow-hidden text-white">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-brand-500 rounded-full mix-blend-overlay filter blur-[128px] opacity-30 animate-pulse"></div>
         <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500 rounded-full mix-blend-overlay filter blur-[128px] opacity-30"></div>
         {/* Noise texture overlay for premium feel */}
         <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <h2 className="text-3xl md:text-5xl font-black text-center mb-12 md:mb-16 leading-tight drop-shadow-sm">
          Ты прошёл путь <br className="md:hidden"/> от диагностики до результата
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
          {items.map((item, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 md:p-6 flex items-center gap-4 hover:bg-white/20 transition duration-300 shadow-lg shadow-brand-900/10 group">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 ring-1 ring-white/30">
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
              <span className="font-medium text-lg leading-snug tracking-tight text-white/95">{item}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-8">
            <a 
                href="https://t.me/onepercent_bot" 
                className="w-full md:w-auto bg-white text-brand-700 px-8 py-5 rounded-2xl font-black text-lg md:text-xl hover:scale-105 hover:shadow-2xl hover:shadow-white/20 transition duration-300 flex items-center justify-center gap-3 group"
            >
                Начать бесплатно — диагностика за 2 минуты
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>

            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-sm font-medium text-brand-100/90">
                <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Без банковской карты</span>
                </div>
                 <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Отменить можно в 1 клик</span>
                </div>
            </div>

             <div className="mt-4 bg-brand-800/30 backdrop-blur-md border border-white/10 rounded-full pl-4 pr-6 py-2 flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <span className="animate-pulse">🔥</span>
                <span><span className="font-bold text-white">2 847</span> человек уже растут на 1% каждый день</span>
            </div>
        </div>

      </div>
    </section>
  );
};