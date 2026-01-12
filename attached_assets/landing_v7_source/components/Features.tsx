import React from 'react';
import { Activity, Target, Calendar, CheckSquare, Trophy, Sparkles, Gamepad2, Plane, Film, Pizza, Repeat, Palette, DollarSign, Users, Check, MoreHorizontal, Battery, TrendingUp } from 'lucide-react';
import { WheelOfLife } from './WheelOfLife';

const steps = [
  {
    id: 1,
    title: "Умная диагностика",
    subtitle: "Шаг 1. Точка А",
    description: "Система не дает абстрактных советов. Сначала ИИ анализирует ваше текущее состояние через «Колесо жизни», чтобы найти одну сферу, улучшение которой даст максимальный эффект на всё остальное.",
    icon: Activity,
    color: "bg-blue-100 text-blue-600",
    gradient: "from-blue-500/20 to-cyan-500/20"
  },
  {
    id: 2,
    title: "AI Постановка целей",
    subtitle: "Шаг 2. Ясность",
    description: "Ментор превращает размытые желания («Хочу быть богатым/спортивным») в четкие метрики. ИИ формулирует цель по SMART, которую реально достичь с вашим текущим графиком.",
    icon: Target,
    color: "bg-purple-100 text-purple-600",
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    id: 3,
    title: "Декомпозиция",
    subtitle: "Шаг 3. План действий",
    description: "Большая цель пугает. Система разбивает её на микро-атомы. Вы получаете интерактивную карту действий от сегодняшнего дня до финального результата.",
    icon: CheckSquare,
    color: "bg-green-100 text-green-600",
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  {
    id: 4,
    title: "Фокус дня",
    subtitle: "Шаг 4. Дисциплина",
    description: "Утром вы получаете ровно одну главную задачу. Больше не нужно думать «за что взяться». Просто сделайте +1% сегодня, и система пересчитает маршрут.",
    icon: Calendar,
    color: "bg-amber-100 text-amber-600",
    gradient: "from-amber-500/20 to-orange-500/20"
  },
  {
    id: 5,
    title: "Система привычек",
    subtitle: "Шаг 5. Ритм",
    description: "От хаотичных попыток к системе. AI подбирает привычки под ваши цели, напоминает о выполнении и показывает реальный прогресс на наглядных дашбордах.",
    icon: Repeat,
    color: "bg-indigo-100 text-indigo-600",
    gradient: "from-indigo-500/20 to-violet-500/20"
  },
  {
    id: 6,
    title: "Геймификация и XP",
    subtitle: "Шаг 6. Мотивация",
    description: "Ваш мозг любит награды. За выполнение задач вы получаете XP (опыт) и уровни. Обменивайте заработанный опыт на реальные награды: отдых, покупки или развлечения.",
    icon: Trophy,
    color: "bg-pink-100 text-pink-600",
    gradient: "from-pink-500/20 to-rose-500/20"
  }
];

export const Features: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50 overflow-hidden" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold uppercase tracking-wider mb-6 shadow-sm text-brand-600">
            <Sparkles className="w-3 h-3" />
            <span>Как это работает</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
            От хаоса к порядку <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">за 6 простых шагов</span>
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Мы убрали всё лишнее. Оставили только научный подход, дофаминовую подпитку и четкие алгоритмы.
          </p>
        </div>

        <div className="space-y-32">
          {steps.map((step, index) => (
            <div key={step.id} className={`flex flex-col gap-12 items-center ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
              
              {/* Text Section */}
              <div className="flex-1 space-y-8">
                <div className="inline-block px-4 py-1.5 rounded-lg bg-slate-100 text-slate-500 font-bold text-sm">
                  {step.subtitle}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900">
                  {step.title}
                </h3>
                
                {step.id === 6 ? (
                   <div className="space-y-6">
                     <p className="text-lg text-slate-600 leading-relaxed font-medium">
                       XP = валюта для твоих желаний. Ты сам выбираешь награды и цену в XP.
                     </p>
                     <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                       <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-brand-500 to-purple-500"></div>
                       <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-lg">
                          Как работает система наград:
                       </h4>
                       <div className="text-base text-slate-600 leading-relaxed space-y-3 relative z-10">
                         <div className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">1</span>
                            <p>В начале месяца составь список желаний</p>
                         </div>
                         <div className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">2</span>
                            <p>Назначь цену в XP (1 XP ≈ 10₽)</p>
                         </div>
                         <div className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">3</span>
                            <p>Выполняй привычки, копи XP</p>
                         </div>
                         <div className="pl-9 pt-1">
                            <p className="font-bold text-brand-600 bg-brand-50 inline-block px-3 py-1 rounded-lg">Достиг цели — порадуй себя без вины</p>
                         </div>
                       </div>
                     </div>
                   </div>
                ) : (
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                )}

                <div className="flex items-center gap-4 pt-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${step.color}`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                    OnePercent System
                  </div>
                </div>
              </div>

              {/* Visual Section */}
              <div className="flex-1 w-full">
                <div className={`relative rounded-3xl p-1 bg-gradient-to-br ${step.gradient} ring-1 ring-slate-900/5 shadow-2xl`}>
                  <div className="bg-white/80 backdrop-blur-sm rounded-[20px] overflow-hidden border border-white/50 min-h-[400px] md:min-h-[500px] flex flex-col">
                    
                    {/* Mock Browser Header */}
                    <div className="h-10 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                        <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                      </div>
                      <div className="ml-4 bg-white px-3 py-1 rounded text-[10px] text-slate-400 font-medium border border-slate-100 shadow-sm flex-1 text-center">
                        OnePercent AI
                      </div>
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 p-6 md:p-8 flex items-center justify-center bg-slate-50/50 relative overflow-hidden">
                      {/* Decorative background blob */}
                      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br ${step.gradient} opacity-20 blur-3xl pointer-events-none`}></div>

                      <div className="relative w-full z-10 flex justify-center">
                      
                      {/* Content Switcher */}
                      {step.id === 1 && (
                        <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 w-full max-w-md">
                            <div className="h-[300px]">
                                <WheelOfLife />
                            </div>
                        </div>
                      )}

                      {step.id === 2 && (
                         <div className="space-y-4 max-w-md w-full">
                            <div className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                    <TrendingUp className="w-5 h-5 text-orange-600"/>
                                </div>
                                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-600">
                                    <p>Диагностика: Доход 100к ₽, накопления 0 ₽. Финансы — зона риска.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start flex-row-reverse animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border-2 border-white">
                                     <img src="https://picsum.photos/seed/user/100/100" alt="Me" />
                                </div>
                                <div className="bg-brand-600 p-4 rounded-2xl rounded-tr-none shadow-md text-sm text-white">
                                    <p>Хочу накопить 300 000 ₽, но деньги "утекают" к концу месяца.</p>
                                </div>
                            </div>
                             <div className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
                                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                                    <Target className="w-5 h-5 text-brand-600"/>
                                </div>
                                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-lg border border-brand-100 text-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                                    <p className="font-bold text-slate-900 mb-1">Цель сформирована:</p>
                                    <p className="text-slate-600">"Откладывать 20% (20 000 ₽) в день зарплаты. Накопить 300к за 15 месяцев."</p>
                                </div>
                            </div>
                         </div>
                      )}

                      {step.id === 3 && (
                        <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                <span className="font-bold text-slate-700">План: Финансовая дисциплина</span>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Активен</span>
                            </div>
                            <div className="p-4 space-y-6">
                                <div className="relative pl-6 border-l-2 border-slate-200">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-brand-600 rounded-full border-4 border-white shadow-sm"></div>
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Неделя 1: Аудит</p>
                                    <p className="text-sm font-medium text-slate-800">Установить трекер расходов. Записать каждую трату, даже кофе.</p>
                                </div>
                                <div className="relative pl-6 border-l-2 border-slate-200">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-slate-300 rounded-full border-4 border-white"></div>
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Неделя 2: Оптимизация</p>
                                    <p className="text-sm font-medium text-slate-800">Найти "дыры" (подписки, такси). Сократить расходы на 5000 ₽.</p>
                                </div>
                                <div className="relative pl-6 border-l-2 border-slate-200">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 bg-slate-300 rounded-full border-4 border-white"></div>
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Неделя 3-4: Автоматизация</p>
                                    <p className="text-sm font-medium text-slate-800">Настроить автоплатеж 20 000 ₽ на накопительный счет в день ЗП.</p>
                                </div>
                            </div>
                        </div>
                      )}

                      {step.id === 4 && (
                         <div className="max-w-sm w-full">
                            <div className="text-center mb-6">
                                <div className="inline-block px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold mb-2">Сегодня</div>
                                <div className="text-3xl font-black text-slate-800">08:00 AM</div>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-2xl shadow-brand-500/20 border border-brand-100 transform hover:scale-105 transition duration-300 cursor-pointer relative group">
                                <div className="absolute top-4 right-4 w-6 h-6 rounded-full border-2 border-brand-200 flex items-center justify-center group-hover:bg-brand-500 group-hover:border-brand-500 transition-colors">
                                    <CheckSquare className="w-3 h-3 text-white opacity-0 group-hover:opacity-100" />
                                </div>
                                <p className="text-xs text-brand-500 font-bold uppercase tracking-wider mb-2">Главный фокус</p>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">Медленный бег</h4>
                                <p className="text-slate-500 text-sm mb-4">Зона 2 пульса, 30 минут. Не ускоряться.</p>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded">+150 XP</span>
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded">Здоровье</span>
                                </div>
                            </div>
                         </div>
                      )}

                      {step.id === 5 && (
                        <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                           {/* Widget Header */}
                           <div className="bg-slate-50/80 backdrop-blur-sm p-4 border-b border-slate-100 flex justify-between items-center">
                               <div className="flex items-center gap-2.5">
                                   <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                      <Repeat className="w-4 h-4" />
                                   </div>
                                   <span className="font-bold text-slate-700 text-sm">Трекер привычек</span>
                               </div>
                               <div className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 text-[10px] font-bold text-slate-500 shadow-sm flex items-center gap-1.5">
                                   <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                   Сегодня
                               </div>
                           </div>
                           
                           {/* Habits List */}
                           <div className="p-4 space-y-3 bg-white">
                               {/* Habit Item 1 */}
                               <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex flex-col gap-3 group hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all duration-300">
                                   <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                                               <Palette size={16} />
                                           </div>
                                           <span className="font-bold text-slate-700 text-sm">Хобби</span>
                                       </div>
                                       <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap">+20 XP</span>
                                   </div>
                                   {/* Days */}
                                   <div className="flex justify-between items-center pt-1">
                                       <div className="flex gap-1">
                                           {['П','В','С','Ч','П','С','В'].map((d,i) => {
                                              let active = false;
                                              let current = false;
                                              if (i === 1 || i === 3 || i === 5) active = true;
                                              if (i === 5) current = true;
                                              return (
                                               <div key={i} className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                                                   active ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200' : 'bg-white text-slate-300'
                                               } ${current ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}>
                                                   {d}
                                               </div>
                                              )
                                           })}
                                       </div>
                                       <button className="text-slate-300 hover:text-indigo-500 transition-colors">
                                            <MoreHorizontal size={16} />
                                       </button>
                                   </div>
                               </div>

                               {/* Habit Item 2 - Done */}
                               <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex flex-col gap-3 group hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all duration-300">
                                   <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                               <Check size={16} strokeWidth={3} />
                                           </div>
                                           <span className="font-bold text-slate-500 text-sm line-through decoration-slate-300">Финансы</span>
                                       </div>
                                       <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap opacity-50">+15 XP</span>
                                   </div>
                                   <div className="flex justify-between items-center pt-1 opacity-60">
                                       <div className="flex gap-1">
                                           {['П','В','С','Ч','П','С','В'].map((d,i) => {
                                              let active = false;
                                              if (i === 1 || i === 2 || i === 4 || i === 5) active = true;
                                              return (
                                               <div key={i} className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                                                   active ? 'bg-emerald-500 text-white' : 'bg-white text-slate-300'
                                               } ${i === 5 ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}`}>
                                                   {d}
                                               </div>
                                              )
                                           })}
                                       </div>
                                   </div>
                               </div>

                               {/* Habit Item 3 */}
                               <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex flex-col gap-3 group hover:bg-white hover:shadow-md hover:border-indigo-100 transition-all duration-300">
                                   <div className="flex items-center justify-between">
                                       <div className="flex items-center gap-3">
                                           <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 shrink-0">
                                               <Users size={16} />
                                           </div>
                                           <span className="font-bold text-slate-700 text-sm">Ужин с семьёй</span>
                                       </div>
                                       <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap">+20 XP</span>
                                   </div>
                                   <div className="flex justify-between items-center pt-1">
                                       <div className="flex gap-1">
                                           {['П','В','С','Ч','П','С','В'].map((d,i) => {
                                              let active = false;
                                              if (i < 5) active = true;
                                              return (
                                               <div key={i} className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                                                   active ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200' : 'bg-white text-slate-300'
                                               } ${i === 5 ? 'ring-2 ring-indigo-500 ring-offset-1 text-indigo-600 bg-transparent border border-indigo-200' : ''}`}>
                                                   {d}
                                               </div>
                                              )
                                           })}
                                       </div>
                                   </div>
                               </div>
                           </div>
                        </div>
                      )}

                      {step.id === 6 && (
                         <div className="w-full max-w-sm mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-200 flex flex-col transform hover:-translate-y-1 transition-transform duration-300">
                            {/* Notification Strip */}
                            <div className="bg-emerald-50 px-4 py-2 text-center border-b border-emerald-100">
                              <p className="text-[10px] md:text-xs font-bold text-emerald-700 flex items-center justify-center gap-2">
                                <Sparkles className="w-3 h-3" />
                                Прошло 3 месяца. 2450 XP заработано.
                              </p>
                            </div>

                            <div className="p-5 flex flex-col gap-5 bg-slate-50/50">
                                
                                {/* Balance Card */}
                                <div className="bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl p-6 text-center text-white shadow-xl shadow-brand-500/20 relative overflow-hidden shrink-0 group">
                                    <div className="relative z-10">
                                       <p className="text-brand-100 text-xs font-medium uppercase tracking-wider mb-1 opacity-80 group-hover:opacity-100 transition">Твой баланс</p>
                                       <h3 className="text-5xl font-black tracking-tight group-hover:scale-105 transition-transform duration-300">2450 <span className="text-3xl">XP</span></h3>
                                    </div>
                                    {/* Decor */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none group-hover:translate-x-8 transition-transform duration-500"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black opacity-20 rounded-full blur-2xl translate-y-10 -translate-x-10 pointer-events-none"></div>
                                </div>

                                {/* AI Message */}
                                <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-brand-100 shadow-sm flex gap-3 shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center shrink-0 border border-brand-100">
                                        <img src="https://api.dicebear.com/7.x/bottts/svg?seed=OnePercent" className="w-5 h-5" alt="AI"/>
                                    </div>
                                    <div className="text-xs text-slate-600 leading-snug">
                                        <p><span className="font-bold text-slate-900">AI Ментор:</span> Максим, хватает на новую игру! Это не противоречит цели "Спорт". Отдых важен.</p>
                                    </div>
                                </div>

                                {/* Rewards List */}
                                <div className="space-y-3">
                                   
                                   {/* Item 1: Received */}
                                   <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between opacity-50 grayscale transition hover:grayscale-0 hover:opacity-100">
                                      <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                                            <Film className="w-5 h-5" />
                                         </div>
                                         <div>
                                            <p className="text-xs font-bold text-slate-900">Вечер кино</p>
                                            <p className="text-[10px] text-slate-400 font-medium">500 XP</p>
                                         </div>
                                      </div>
                                      <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-lg">Получено</span>
                                   </div>

                                   {/* Item 2: Available (Highlighted) */}
                                   <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center justify-between relative overflow-hidden group cursor-pointer hover:shadow-md transition">
                                       <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500"></div>
                                       <div className="flex items-center gap-3 pl-2">
                                         <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition">
                                            <Gamepad2 className="w-5 h-5" />
                                         </div>
                                         <div>
                                            <p className="text-sm font-bold text-slate-900">Новая игра</p>
                                            <p className="text-xs text-emerald-600 font-bold">1500 XP</p>
                                         </div>
                                      </div>
                                      <button className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-lg shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition">
                                         Доступно!
                                      </button>
                                   </div>

                                   {/* Item 3: Progress */}
                                   <div className="bg-white p-3 rounded-xl border border-slate-100">
                                      <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-3">
                                             <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                                <Plane className="w-5 h-5" />
                                             </div>
                                             <div>
                                                <p className="text-xs font-bold text-slate-900">Поездка</p>
                                                <p className="text-[10px] text-slate-400 font-medium">5000 XP</p>
                                             </div>
                                          </div>
                                          <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">49%</span>
                                      </div>
                                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                         <div className="h-full bg-brand-500 w-[49%]"></div>
                                      </div>
                                   </div>
                                </div>

                            </div>
                         </div>
                      )}

                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};