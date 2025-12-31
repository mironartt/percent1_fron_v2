import React, { useState, useMemo } from 'react';

interface HeroProps {
  onStart?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart }) => {
  const [days, setDays] = useState(30);

  const multiplier = useMemo(() => Math.pow(1.01, days).toFixed(2), [days]);
  
  const effectDescription = useMemo(() => {
    if (days <= 30) return "Ты начнешь управлять днем, а не плыть по течению: меньше хаоса, больше точности.";
    if (days <= 90) return "Система становится привычкой. Уходит тревога, появляется четкий план и ясность действий.";
    if (days <= 180) return "Качественный сдвиг: ясность ума, устойчивость к стрессу, рост дохода и ощущение полного контроля.";
    return "Трансформация завершена. Твоя эффективность в 38 раз выше, чем в первый день.";
  }, [days]);

  return (
    <section className="relative pt-40 pb-20 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand-50 via-slate-50 to-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        
        <div className="inline-block px-4 py-1.5 bg-brand-100 text-brand-700 rounded-full text-xs font-bold uppercase tracking-wider mb-8 border border-brand-200">
          Личный AI наставник
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] text-slate-900">
          Системный рост в жизни <br />
          <span className="text-gradient text-6xl md:text-8xl">через простые действия</span>
        </h1>
        
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Система, которая делает развитие предсказуемым. <br className="hidden md:block"/>
          Стань сильнее в 38 раз за один год.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-24">
          <button 
            onClick={onStart} 
            className="w-full md:w-auto bg-brand-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition duration-300 shadow-2xl shadow-brand-300"
          >
            Сделать +1% уже сегодня
          </button>
          <div className="flex items-center gap-3 text-slate-400 text-sm font-medium">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white overflow-hidden">
                   <img src={`https://picsum.photos/seed/${i + 45}/100/100`} alt="User" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <span>2,847+ человек уже растут</span>
          </div>
        </div>

        {/* Интерактивный калькулятор */}
        <div id="method" className="max-w-xl mx-auto bg-white rounded-[32px] p-8 md:p-12 shadow-2xl shadow-slate-200/40 border border-slate-100 text-left">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h3 className="font-black text-3xl mb-2 text-slate-900">Эффект 1%</h3>
                    <p className="text-slate-400 font-medium">Сложные проценты в жизни</p>
                </div>
                <div className="text-6xl font-black text-brand-500 tracking-tighter">x{multiplier}</div>
            </div>
            
            <div className="mb-10">
              <input 
                  type="range" 
                  min="1" 
                  max="365"
                  step="1"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value))}
                  className="modern-range"
              />
              <div className="flex justify-between mt-5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>{days} дней усилий</span>
                  <span>Результат</span>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-lg font-medium text-slate-800 italic leading-relaxed">
                   "{effectDescription}"
                </p>
            </div>
        </div>

      </div>
    </section>
  );
};