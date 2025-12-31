import React from 'react';

export const MathSection: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6">Математика успеха</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
             Улучшая себя всего на 1% каждый день, к концу года вы станете в 37 раз эффективнее. 
             Это сила сложного процента, примененная к привычкам.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center justify-center">
          {/* Linear / Stagnation Card */}
          <div className="bento-card bg-slate-50 border-slate-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Линейное мышление</p>
            <div className="text-6xl font-mono font-bold text-slate-300 mb-4 tracking-tighter">
                1.00<span className="text-xl align-top text-slate-400">365</span>
            </div>
            <p className="text-3xl font-bold text-slate-400 mb-2">= 1.00</p>
            <p className="mt-6 text-sm font-medium text-slate-500">
                Делая одно и то же каждый день, вы остаетесь на том же месте. Отсутствие прогресса — это регресс.
            </p>
          </div>

          {/* Growth Card */}
          <div className="bento-card bg-brand-600 border-brand-500 text-white shadow-xl shadow-brand-500/20 transform md:scale-105">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-200 mb-4">Метод OnePercent</p>
            <div className="text-6xl font-mono font-bold text-white mb-4 tracking-tighter">
                1.01<span className="text-xl align-top text-brand-200">365</span>
            </div>
            <p className="text-3xl font-bold text-white mb-2">= 37.78</p>
            <p className="mt-6 text-sm font-medium text-brand-100">
                Маленькие ежедневные улучшения накапливаются, создавая лавину положительных изменений.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};