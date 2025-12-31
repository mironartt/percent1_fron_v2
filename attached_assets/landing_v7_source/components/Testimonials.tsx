import React from 'react';
import { Feather, BookOpen, TrendingUp, PenTool, Quote } from 'lucide-react';

const people = [
  {
    name: "Бенджамин Франклин",
    role: "Политик, учёный, изобретатель",
    quote: "Маленькие удары валят большие дубы",
    description: "Создал систему 13 добродетелей: каждую неделю фокусировался на одном качестве, вёл дневник самоанализа.",
    icon: Feather,
  },
  {
    name: "Джеймс Клир",
    role: "Автор «Atomic Habits»",
    quote: "Привычки — это сложные проценты самосовершенствования",
    description: "Популяризировал концепцию 1%: если каждый день улучшаться на 1%, за год станешь лучше в 37 раз.",
    icon: BookOpen,
  },
  {
    name: "Уоррен Баффетт",
    role: "Инвестор, миллиардер",
    quote: "Я просто сижу в офисе и читаю целый день",
    description: "Правило 5 часов: ежедневно инвестирует минимум час в обучение и рефлексию. 80% рабочего времени — чтение.",
    icon: TrendingUp,
  },
  {
    name: "Леонардо да Винчи",
    role: "Художник, учёный, изобретатель",
    quote: "Препятствия не могут сокрушить меня",
    description: "Вёл легендарные записные книжки: 7000+ страниц наблюдений, идей и планов. Ежедневная практика.",
    icon: PenTool,
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Проверено временем</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Величайшие умы истории использовали системный подход к развитию задолго до нас
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {people.map((person, idx) => (
            <div key={idx} className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row gap-6 items-start group">
              {/* Icon Circle */}
              <div className="shrink-0">
                <div className="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-200 group-hover:scale-110 transition-transform duration-300">
                  <person.icon className="w-8 h-8 text-white stroke-[1.5]" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-1">{person.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{person.role}</p>
                
                <div className="flex gap-3 mb-4">
                  <Quote className="w-5 h-5 text-brand-400 fill-brand-100 shrink-0 transform scale-x-[-1]" />
                  <p className="text-slate-800 font-medium italic leading-relaxed">
                    «{person.quote}»
                  </p>
                </div>
                
                <p className="text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                  {person.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};