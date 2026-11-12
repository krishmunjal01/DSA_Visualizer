import React, { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { DSAType } from './types/dsa';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ComplexityModal } from './components/layout/ComplexityModal';
import { HomeView } from './components/views/HomeView';
import { WorkspaceView } from './components/views/WorkspaceView';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | DSAType>('home');
  const [isComplexityModalOpen, setIsComplexityModalOpen] = useState(false);

  const navigateTo = (view: 'home' | DSAType) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-brand-100 selection:text-brand-900">
        <Navbar
          currentView={currentView}
          onNavigate={navigateTo}
          onOpenComplexity={() => setIsComplexityModalOpen(true)}
        />

        <main className="flex-1">
          <AnimatePresence mode="wait">
            {currentView === 'home' ? (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <HomeView
                  onSelectDS={navigateTo}
                  onOpenComplexity={() => setIsComplexityModalOpen(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <WorkspaceView
                  dsType={currentView}
                  onBackToHome={() => navigateTo('home')}
                  onOpenComplexity={() => setIsComplexityModalOpen(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <Footer
          onNavigate={navigateTo}
          onOpenComplexity={() => setIsComplexityModalOpen(true)}
        />

        <ComplexityModal
          isOpen={isComplexityModalOpen}
          onClose={() => setIsComplexityModalOpen(false)}
        />
      </div>
    </MotionConfig>
  );
};

export default App;
