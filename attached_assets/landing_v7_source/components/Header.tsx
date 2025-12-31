import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onStart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onStart }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onStart) onStart();
    setMobileMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-200 py-3' : 'py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-brand-200">
                1%
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">OnePercent</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 font-semibold text-sm text-slate-600 items-center">
            <a href="#how-it-works" className="hover:text-brand-600 transition">Как это работает</a>
            <a href="#pricing" className="hover:text-brand-600 transition">Тарифы</a>
        </nav>

        <div className="hidden md:flex items-center gap-6">
             <a href="#" className="font-bold text-slate-600 hover:text-brand-600 transition text-sm">
                Войти
             </a>
             <button onClick={handleStart} className="bg-brand-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-brand-700 transition shadow-lg shadow-brand-200 text-base transform hover:-translate-y-0.5">
                Начать
             </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
             {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-4 shadow-xl flex flex-col gap-4 animate-in slide-in-from-top-2">
           <a href="#how-it-works" className="text-base font-semibold text-slate-700 py-2" onClick={() => setMobileMenuOpen(false)}>Как это работает</a>
           <a href="#pricing" className="text-base font-semibold text-slate-700 py-2" onClick={() => setMobileMenuOpen(false)}>Тарифы</a>
           <div className="h-px bg-slate-100 my-2" />
           <div className="flex flex-col gap-3">
             <a href="#" className="text-center font-bold text-slate-600 py-2">Войти</a>
             <button onClick={handleStart} className="w-full bg-brand-600 text-center text-white py-3.5 rounded-xl font-bold shadow-lg shadow-brand-200 text-base">Начать</button>
           </div>
        </div>
      )}
    </header>
  );
};