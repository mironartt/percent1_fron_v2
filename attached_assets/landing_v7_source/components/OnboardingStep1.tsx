import React, { useState } from 'react';
import { Target, Compass, LayoutDashboard, Activity, BrainCircuit, FileText, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';

interface OnboardingStep1Props {
  onBack?: () => void;
}

export const OnboardingStep1: React.FC<OnboardingStep1Props> = ({ onBack }) => {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const problems = [
    {
      text: "Когда целей много, а ясности мало",
      icon: Target,
      color: "bg-orange-100 text-orange-600"
    },
    {
      text: "Хочешь двигаться вперед, но не понимаешь — куда",
      icon: Compass,
      color: "bg-blue-100 text-blue-600"
    },
    {
      text: "Навести порядок в целях, задачах и деньгах",
      icon: LayoutDashboard,
      color: "bg-purple-100 text-purple-600"
    }
  ];

  const steps = [
    { title: "Короткая диагностика", icon: Activity },
    { title: "Анализ привычек и целей", icon: BrainCircuit },
    { title: "Персональный план", icon: FileText },
  ];

  const timeOptions = [
    { label: "15 мин/день", value: "15" },
    { label: "30 мин/день", value: "30" },
    { label: "1 час/день", value: "60" },
    { label: "По возможности", value: "flex" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-10">
      {/* Navbar Minimal */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
             <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">1%</div>
             <span className="font-bold text-slate-900">OnePercent</span>
           </div>
           
           {/* Progress Bar */}
           <div className="flex items-center gap-2">
             <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full w-[15%] bg-brand-600 rounded-full"></div>
             </div>
             <span className="text-xs font-medium text-slate-400">Шаг 1 из 5</span>
           </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section: What is it? */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">
            Система управления <br/> жизнью и доходом
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed">
            OnePercent — это цифровой ментор, который помогает разобраться в текущей ситуации, выявить поведенческие паттерны и предложить реалистичный план улучшений.
          </p>
        </div>

        {/* Problem Identification */}
        <div className="grid gap-4 mb-12">
          {problems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-slate-700">{item.text}</span>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-14">
          <h3 className="text-lg font-bold text-center mb-6">Как это работает</h3>
          <div className="flex justify-between items-start relative">
             {/* Connector Line */}
             <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 -z-10"></div>
             
             {steps.map((step, idx) => (
               <div key={idx} className="flex flex-col items-center gap-3 text-center w-1/3 px-1">
                 <div className="w-10 h-10 bg-white border-2 border-brand-100 rounded-full flex items-center justify-center text-brand-600 shadow-sm z-10">
                   <step.icon className="w-5 h-5" />
                 </div>
                 <span className="text-xs md:text-sm font-bold text-slate-600 leading-tight">{step.title}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Time / Pace Selection - Redesigned */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8 relative overflow-hidden mb-8">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-purple-500"></div>
           
           <div className="mb-6">
             <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
               <Clock className="w-5 h-5 text-brand-500" />
               Подстроимся под ваш ритм жизни
             </h2>
             <p className="text-slate-500 text-sm">
               Мы будем предлагать задачи и рекомендации, исходя из этого времени.
             </p>
           </div>

           <div className="grid grid-cols-2 gap-3 mb-6">
             {timeOptions.map((opt) => (
               <button
                 key={opt.value}
                 onClick={() => setSelectedTime(opt.value)}
                 className={`py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                   selectedTime === opt.value
                     ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                     : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-brand-200 hover:bg-white'
                 }`}
               >
                 {opt.label}
                 {selectedTime === opt.value && <CheckCircle2 className="w-4 h-4" />}
               </button>
             ))}
           </div>

           <div className="text-center">
             <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
               Можно изменить в любой момент
             </p>
           </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <Button 
            size="lg" 
            className="w-full md:w-auto min-w-[280px] py-4 text-lg shadow-xl shadow-brand-500/20 animate-pulse hover:animate-none"
            onClick={() => alert('Переход к следующему шагу...')}
          >
            Начать диагностику
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Займет 3–5 минут
          </span>
        </div>

      </div>
    </div>
  );
};