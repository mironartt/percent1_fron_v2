import React from 'react';
import { Compass, Target, LayoutDashboard, ArrowDown } from 'lucide-react';

export const ProblemSolution: React.FC = () => {
  const cards = [
    {
      text: "Если хочешь двигаться вперед, но не понимаешь — куда",
      icon: Compass,
      color: "bg-blue-100 text-blue-600",
      borderColor: "border-blue-100"
    },
    {
      text: "Когда целей много, а ясности мало",
      icon: Target,
      color: "bg-orange-100 text-orange-600",
      borderColor: "border-orange-100"
    },
    {
      text: "Навести порядок в целях, задачах и деньгах",
      icon: LayoutDashboard,
      color: "bg-purple-100 text-purple-600",
      borderColor: "border-purple-100"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-white relative z-20 -mt-8 md:-mt-16 rounded-t-[2.5rem] md:rounded-t-[4rem] shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                Знакомые ситуации?
            </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <div 
              key={idx} 
              className={`p-6 md:p-8 rounded-3xl bg-white border ${card.borderColor} shadow-lg shadow-slate-200/40 hover:-translate-y-1 transition-transform duration-300 flex flex-col items-center text-center md:items-start md:text-left group`}
            >
              <div className={`w-14 h-14 rounded-2xl ${card.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className="w-7 h-7" strokeWidth={2} />
              </div>
              
              <p className="text-lg font-bold text-slate-800 leading-snug">
                {card.text}
              </p>
            </div>
          ))}
        </div>

        {/* Connector to next section */}
        <div className="flex justify-center mt-12 opacity-30">
            <ArrowDown className="w-6 h-6 animate-bounce text-slate-400" />
        </div>

      </div>
    </section>
  );
};