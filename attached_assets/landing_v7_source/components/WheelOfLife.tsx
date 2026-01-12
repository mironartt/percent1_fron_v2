import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const data = [
  { subject: 'Здоровье', A: 65, fullMark: 100 },
  { subject: 'Финансы', A: 40, fullMark: 100 },
  { subject: 'Карьера', A: 90, fullMark: 100 },
  { subject: 'Семья', A: 50, fullMark: 100 },
  { subject: 'Рост', A: 85, fullMark: 100 },
  { subject: 'Отдых', A: 30, fullMark: 100 },
];

export const WheelOfLife: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 h-full flex flex-col items-center justify-center">
      <h4 className="text-lg font-bold text-slate-900 mb-4">Текущий баланс</h4>
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="My Balance"
              dataKey="A"
              stroke="#6366f1"
              strokeWidth={3}
              fill="#818cf8"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
        <p className="text-sm text-slate-600">
          <span className="text-brand-600 font-bold">Анализ:</span> Фокус на карьере, риск выгорания. Рекомендуется подтянуть "Здоровье" и "Отдых".
        </p>
      </div>
    </div>
  );
};