import React, { useState } from 'react';
import { Check, Lightbulb } from 'lucide-react';
import { Button } from './ui/Button';

export const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<1 | 3 | 6 | 12>(1);

  const calculatePrice = (basePrice: number) => {
    if (basePrice === 0) return 0;
    let discount = 0;
    if (billingCycle === 3) discount = 0.1;
    if (billingCycle === 6) discount = 0.2;
    if (billingCycle === 12) discount = 0.3;
    return Math.round(basePrice * (1 - discount));
  };

  const periods = [
    { value: 1, label: '1 месяц', discount: null },
    { value: 3, label: '3 месяца', discount: '-10%' },
    { value: 6, label: '6 месяцев', discount: '-20%' },
    { value: 12, label: '12 месяцев', discount: '-30%', hit: true },
  ];

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden" id="pricing">
       {/* Background decorations */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
        </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Простая и честная стоимость</h2>
          <p className="text-lg text-slate-500">Без скрытых платежей. Отмена в любой момент.</p>
        </div>

        {/* Period Switcher */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-16">
            {periods.map((p) => (
                <button
                    key={p.value}
                    onClick={() => setBillingCycle(p.value as any)}
                    className={`relative px-5 py-3 md:px-6 rounded-2xl font-bold transition-all duration-300 border-2 text-sm md:text-base ${
                        billingCycle === p.value 
                        ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/30 transform scale-105' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-brand-200 hover:bg-slate-50'
                    }`}
                >
                    {p.label}
                    {p.discount && (
                        <span className={`absolute -top-2.5 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm transition-colors ${
                            billingCycle === p.value ? 'bg-white text-brand-600' : 'bg-emerald-500 text-white'
                        }`}>
                            {p.discount}
                        </span>
                    )}
                    {p.hit && (
                        <span className="absolute -top-6 -right-6 md:-right-8 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md transform rotate-12 shadow-sm">
                            ХИТ
                        </span>
                    )}
                </button>
            ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          
          {/* FREE PLAN */}
          <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative group">
            <h3 className="text-2xl font-black text-slate-900 mb-2">Бесплатный</h3>
            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-slate-900">0 ₽</span>
                <span className="text-sm font-medium text-slate-400">навсегда</span>
            </div>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                Базовый функционал для начала работы над собой.
            </p>

            <ul className="space-y-4 mb-8 flex-1">
                {[
                    'Колесо баланса (ССП)',
                    'Банк целей (до 4 целей)',
                    'Базовое планирование',
                    'Трекер привычек (до 3)',
                    'Дневник рефлексии',
                    'Достижения (до 5)',
                    'Напоминания в Telegram'
                ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-sm font-medium text-slate-600">{item}</span>
                    </li>
                ))}
            </ul>

            <Button variant="outline" className="w-full rounded-2xl py-4 border-2 hover:bg-brand-50">
                Начать бесплатно
            </Button>
          </div>

          {/* PRO PLAN */}
          <div className="bg-brand-600 rounded-[32px] p-8 border border-brand-500 shadow-2xl shadow-brand-500/30 flex flex-col h-full relative transform lg:-translate-y-4 z-10 text-white">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                Популярный выбор
            </div>
            
            <div className="text-center mb-6 mt-2">
                <h3 className="text-2xl font-black mb-1 opacity-90">Pro</h3>
                <div className="flex items-center justify-center gap-1">
                    <span className="text-5xl font-black">{calculatePrice(990)} ₽</span>
                    <span className="text-sm font-medium opacity-60">/ месяц</span>
                </div>
                {billingCycle > 1 && (
                    <div className="text-xs font-medium text-brand-200 mt-1 line-through decoration-brand-400">
                        {990} ₽ / месяц
                    </div>
                )}
            </div>

            <p className="text-sm text-brand-100 mb-8 text-center leading-relaxed opacity-90">
                Полный функционал с AI-помощником и голосовым чатом с ментором.
            </p>

            <ul className="space-y-4 mb-8 flex-1">
                {[
                    'Всё из Бесплатного плана',
                    'Безлимитные цели и привычки',
                    'AI ментор',
                    'AI планирование',
                    'AI помощь',
                    'Голосовой чат с ментором',
                    'Клуб 1%'
                ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium text-white">{item}</span>
                    </li>
                ))}
            </ul>

            <Button variant="secondary" className="w-full rounded-2xl py-4 font-bold text-brand-600 hover:text-brand-700 shadow-lg">
                7 дней бесплатно
            </Button>
          </div>

          {/* CLUB PLAN */}
          <div className="bg-slate-700 rounded-[32px] p-8 border border-slate-600 shadow-xl flex flex-col h-full relative text-slate-200">
             <h3 className="text-2xl font-black text-white mb-2">Клуб 1%</h3>
             <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-white">{calculatePrice(2990)} ₽</span>
                <span className="text-sm font-medium text-slate-400">/ месяц</span>
            </div>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
                Premium тариф с мастермайндами, челленджами и нетворкингом.
            </p>

            <ul className="space-y-4 mb-8 flex-1">
                {[
                    'Всё из Pro плана',
                    'Еженедельные мастермайнды',
                    'Групповые челленджи',
                    'Ранний доступ к новым функциям',
                    'Нетворкинг 2.0'
                ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-slate-400 shrink-0" />
                        <span className="text-sm font-medium text-slate-300">{item}</span>
                    </li>
                ))}
            </ul>

            <Button disabled className="w-full rounded-2xl py-4 bg-slate-600 text-slate-400 cursor-not-allowed hover:bg-slate-600 border-none">
                Скоро
            </Button>
          </div>

        </div>

        <div className="mt-16 flex items-center justify-center gap-3 text-slate-500 text-sm animate-in fade-in duration-700">
            <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-center">Начни бесплатно и переходи на Pro, когда почувствуешь, что готов к следующему уровню</p>
        </div>
      </div>
    </section>
  );
};