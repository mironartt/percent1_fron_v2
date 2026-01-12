import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProblemSolution } from './components/ProblemSolution';
import { MathSection } from './components/MathSection';
import { Features } from './components/Features';
import { AIMentor } from './components/AIMentor';
import { FinalCTA } from './components/FinalCTA';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { Footer } from './components/Footer';
import { OnboardingStep1 } from './components/OnboardingStep1';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'onboarding'>('landing');

  if (currentView === 'onboarding') {
    return <OnboardingStep1 onBack={() => setCurrentView('landing')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-200 selection:text-brand-900">
      <Header onStart={() => setCurrentView('onboarding')} />
      <main>
        <Hero onStart={() => setCurrentView('onboarding')} />
        <ProblemSolution />
        <MathSection />
        <Features />
        <AIMentor />
        <FinalCTA />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}

export default App;