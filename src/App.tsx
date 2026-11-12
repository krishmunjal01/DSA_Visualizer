import React, { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { AppView } from './types/dsa';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ComplexityModal } from './components/layout/ComplexityModal';
import { HomeView } from './components/views/HomeView';
import { WorkspaceView } from './components/views/WorkspaceView';
import { AlgorithmLabView } from './components/views/AlgorithmLabView';
import { CampusOptimizerView } from './components/views/CampusOptimizerView';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isComplexityModalOpen, setIsComplexityModalOpen] = useState(false);

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getViewMotionKey = () => {
    if (currentView === 'home') return 'home';
    if (currentView === 'algorithms' || currentView === 'compare') return 'algo-lab';
    if (currentView === 'campus') return 'campus';
    return 'workspace';
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
        <Navbar
          currentView={currentView}
          onNavigate={navigateTo}
          onOpenComplexity={() => setIsComplexityModalOpen(true)}
        />

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={getViewMotionKey()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {currentView === 'home' ? (
                <HomeView
                  onSelectDS={navigateTo}
                  onOpenComplexity={() => setIsComplexityModalOpen(true)}
                />
              ) : currentView === 'algorithms' || currentView === 'compare' ? (
                <AlgorithmLabView
                  initialMode={currentView === 'compare' ? 'compare' : 'lab'}
                  onBackToHome={() => navigateTo('home')}
                />
              ) : currentView === 'campus' ? (
                <CampusOptimizerView onBackToHome={() => navigateTo('home')} />
              ) : (
                <WorkspaceView
                  dsType={currentView}
                  onBackToHome={() => navigateTo('home')}
                  onOpenComplexity={() => setIsComplexityModalOpen(true)}
                />
              )}
            </motion.div>
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
