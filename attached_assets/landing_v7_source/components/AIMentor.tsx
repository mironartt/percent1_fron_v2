import React from 'react';
import { Mic, Map, Zap, MessageCircle } from 'lucide-react';

export const AIMentor: React.FC = () => {
  return (
    <section className="py-24 bg-white overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-brand-50/50 rounded-full blur-3xl -z-10 pointer-events-none opacity-60"></div>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Banner Problem/Solution */}
        <div className="flex justify-center mb-16 md:mb-20">
            <div className="bg-emerald-50/80 backdrop-blur-sm border border-emerald-100 rounded-full px-6 py-3 text-center shadow-sm">
                <p className="text-sm md:text-base text-emerald-800">
                    <span className="font-bold bg-emerald-200/50 px-2 py-0.5 rounded-md mr-1">Проблема:</span> 68% бросают после 3 месяцев. 
                    <span className="mx-2 text-emerald-300">|</span>
                    <span className="font-bold bg-emerald-200/50 px-2 py-0.5 rounded-md mr-1">Решение:</span> AI Ментор поддерживает каждый день.
                </p>
            </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column: Text Content */}
            <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-100 rounded-full text-xs font-bold uppercase tracking-wider mb-6 text-brand-600">
                    <MessageCircle className="w-3 h-3" />
                    <span>Всегда рядом</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-[1.1]">
                    Персональный коуч <br/> на связи 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600 ml-3">24/7</span>
                </h2>
                
                <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
                    AI анализирует твои цели, рефлексии и паттерны. Задаёт правильные вопросы, чтобы ты сам нашёл ответы, когда мотивация на нуле.
                </p>

                {/* Role Transformation Timeline */}
                <div className="relative pl-4 mb-12 space-y-8">
                    {/* Vertical Line */}
                    <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-brand-200 via-brand-100 to-transparent"></div>

                    {/* Step 1 */}
                    <div className="relative flex gap-5 items-start group">
                        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center shrink-0 z-10 group-hover:border-brand-200 group-hover:scale-105 transition-all duration-300">
                            <Mic className="w-6 h-6 text-slate-400 group-hover:text-brand-600 transition-colors" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-lg">Интервьюер</h4>
                            <p className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-1">Первая неделя</p>
                            <p className="text-slate-500 text-sm leading-relaxed">Задает глубокие вопросы, собирает контекст вашей жизни и определяет истинные ценности.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative flex gap-5 items-start group">
                         <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center shrink-0 z-10 group-hover:border-brand-200 group-hover:scale-105 transition-all duration-300">
                            <Map className="w-6 h-6 text-slate-400 group-hover:text-brand-600 transition-colors" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-lg">Стратег</h4>
                            <p className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-1">Первый месяц</p>
                            <p className="text-slate-500 text-sm leading-relaxed">Помогает оцифровать цели, составить реалистичный план и найти время в календаре.</p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative flex gap-5 items-start group">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 shadow-lg shadow-brand-500/30 flex items-center justify-center shrink-0 z-10 transform scale-105">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-lg">Коуч 1%</h4>
                            <p className="text-xs font-bold text-brand-500 uppercase tracking-wider mb-1">2+ месяц</p>
                            <p className="text-slate-500 text-sm leading-relaxed">Поддерживает дисциплину, анализирует срывы и помогает вернуться в строй без чувства вины.</p>
                        </div>
                    </div>
                </div>

                {/* Quote Block */}
                <div className="hidden lg:flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-4xl leading-none text-brand-300 font-serif opacity-50">"</div>
                    <div>
                        <p className="text-slate-700 italic mb-3 font-medium text-base leading-relaxed">
                            AI ментор — главная причина, почему я не бросил. Он не давит, а реально помогает разобраться в себе и мягко возвращает фокус, когда опускаются руки.
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-300 overflow-hidden">
                                <img src="https://picsum.photos/seed/sergey/100/100" alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                            <p className="font-bold text-slate-900 text-sm">Сергей, e-commerce</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Phone Mockup */}
            <div className="order-1 lg:order-2 flex flex-col items-center relative perspective-1000">
                {/* Floating Animation Wrapper */}
                <div className="relative animate-[float_6s_ease-in-out_infinite]">
                    {/* Shadow underneath */}
                    <div className="absolute -bottom-10 left-10 right-10 h-8 bg-black/20 blur-xl rounded-[100%]"></div>
                    
                    <div className="relative w-[320px] md:w-[340px] h-[660px] bg-slate-900 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(50,50,93,0.25),0_30px_60px_-30px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.1)] border-[10px] border-slate-900 overflow-hidden ring-1 ring-white/10">
                        
                        {/* Glare Effect */}
                        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none z-30"></div>

                        {/* Phone Status Bar */}
                        <div className="absolute top-0 w-full h-7 bg-slate-900 z-20 flex justify-center items-end pb-1">
                             <div className="w-20 h-4 bg-black rounded-full"></div>
                        </div>

                        {/* App Header */}
                        <div className="bg-[#517da2] p-4 pt-10 text-white flex items-center gap-3 shadow-md relative z-10">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-0.5 ring-2 ring-white/20">
                                 <img src="https://api.dicebear.com/7.x/bottts/svg?seed=OnePercent" alt="AI" className="w-full h-full rounded-full bg-slate-100" />
                            </div>
                            <div>
                                <h4 className="font-bold text-base leading-tight">AI Ментор 1%</h4>
                                <p className="text-xs text-blue-100 opacity-90">bot</p>
                            </div>
                        </div>

                        {/* Chat Area - CONTENT PRESERVED EXACTLY AS REQUESTED */}
                        <div className="bg-[#8e9eab] bg-gradient-to-br from-[#eef2f3] to-[#8e9eab] h-full overflow-y-auto p-3 space-y-4 pb-20 font-sans text-sm relative">
                            {/* Chat Background Pattern */}
                            <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                            
                            {/* Message 1 */}
                            <div className="bg-white p-3.5 rounded-2xl rounded-tl-sm shadow-sm max-w-[95%] text-slate-800 relative z-10 leading-snug">
                                <p className="mb-2.5">Доброе утро, Максим! <br/> Сегодня — вторник.</p>
                                <p className="font-bold mb-1.5 text-brand-900">Задачи на сегодня:</p>
                                <ul className="space-y-1.5 mb-3">
                                    <li className="flex items-start gap-2">
                                        <span className="mt-0.5 shrink-0">🎨</span>
                                        <span>Первая проба хобби [→ Хобби 2ч в неделю]</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-500 mt-0.5 shrink-0">❤</span>
                                        <span>Вечер с семьёй [→ Вечер с семьёй 3х в неделю]</span>
                                    </li>
                                </ul>
                                
                                <p className="font-bold mb-1.5 mt-3 text-brand-900">Привычки:</p>
                                <ul className="space-y-1.5 text-slate-600 text-xs">
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-brand-500 rounded-full"></div> Хобби 2ч/неделю</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-brand-500 rounded-full"></div> Финансовый обзор</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-brand-500 rounded-full"></div> Ужин с семьёй</li>
                                </ul>

                                <p className="mt-3 pt-3 border-t border-slate-100 text-slate-600 italic">
                                    Обрати внимание: у тебя есть просроченная задача «Выбрать хобби на неделю» — возможно, стоит начать с неё.
                                </p>

                                <div className="text-[10px] text-slate-400 text-right mt-1.5 font-medium">08:00</div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Mobile Quote (Visible only on small screens) */}
                <div className="lg:hidden mt-12 text-center max-w-sm">
                    <p className="text-slate-600 italic mb-4 font-medium">
                        "AI ментор — главная причина, почему я не бросил. Он не давит, а реально помогает разобраться в себе."
                    </p>
                    <p className="font-bold text-slate-900 text-sm">
                        — Сергей, e-commerce
                    </p>
                </div>
            </div>
        </div>
      </div>
      
      {/* Custom Keyframes for Float Animation if not in global css */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </section>
  );
};