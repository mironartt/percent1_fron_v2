import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0f1117] text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Top Section: Logo & Auth Links */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-900/20">
                1%
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">OnePercent</span>
          </div>

          {/* Auth Links */}
          <div className="flex gap-8 font-medium text-sm">
             <a href="#" className="text-slate-300 hover:text-white transition-colors">Войти</a>
             <a href="#" className="text-slate-300 hover:text-white transition-colors">Регистрация</a>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-800/50 w-full mb-12"></div>

        {/* Bottom Section: Legal & Copyright */}
        <div className="flex flex-col items-center text-center gap-8">
            
            {/* Legal Links */}
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-xs md:text-sm font-medium text-slate-500">
                <a href="#" className="hover:text-slate-300 transition-colors">Политика конфиденциальности</a>
                <a href="#" className="hover:text-slate-300 transition-colors">Пользовательское соглашение</a>
                <a href="#" className="hover:text-slate-300 transition-colors">Отказ от ответственности</a>
            </div>

            {/* Legal Info */}
            <div className="space-y-2 text-[10px] md:text-xs text-slate-600 font-medium">
                <p>ИП Косик Дмитрий Владимирович</p>
                <p className="opacity-70">ИНН: 711280092908 | ОГРНИП: 321774600674346</p>
            </div>

            {/* Copyright */}
             <div className="text-[10px] md:text-xs text-slate-600">
                &copy; 2025 OnePercent. Все права защищены.
            </div>
        </div>

      </div>
    </footer>
  );
};