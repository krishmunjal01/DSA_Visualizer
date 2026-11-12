import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { AppView, DSAType } from '../../types/dsa';
import {
  Link2,
  Layers,
  ArrowRightLeft,
  GitBranch,
  Hash,
  GitFork,
  ListOrdered,
  Share2,
  BarChart3,
  GitCompare,
  MapPin,
  Table,
  Home,
  Volume2,
  VolumeX,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { sound } from '../common/SoundEffects';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenComplexity: () => void;
}

const DS_MENU_ITEMS: { id: DSAType; label: string; icon: React.ReactNode }[] = [
  { id: 'linked-list', label: 'Linked List', icon: <Link2 className="w-4 h-4 text-emerald-600" /> },
  { id: 'stack', label: 'Stack', icon: <Layers className="w-4 h-4 text-brand-600" /> },
  { id: 'queue', label: 'Queue', icon: <ArrowRightLeft className="w-4 h-4 text-cyan-600" /> },
  { id: 'bst', label: 'Binary Search Tree', icon: <GitBranch className="w-4 h-4 text-indigo-600" /> },
  { id: 'hash-table', label: 'Hash Table', icon: <Hash className="w-4 h-4 text-amber-600" /> },
  { id: 'heap', label: 'Binary Heap', icon: <GitFork className="w-4 h-4 text-emerald-600" /> },
  { id: 'priority-queue', label: 'Priority Queue', icon: <ListOrdered className="w-4 h-4 text-rose-600" /> },
  { id: 'graph', label: 'Graphs', icon: <Share2 className="w-4 h-4 text-brand-600" /> },
];

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenComplexity }) => {
  const [isMuted, setIsMuted] = useState(sound.isMuted());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dsDropdownOpen, setDsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  const isDSActive = DS_MENU_ITEMS.some((item) => item.id === currentView);

  const primaryItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'algorithms', label: 'Algorithm Lab', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'compare', label: 'Compare', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'campus', label: 'Campus Map', icon: <MapPin className="w-4 h-4" /> },
  ];

  const handleNavClick = (view: AppView) => {
    sound.playClick();
    onNavigate(view);
    setMobileMenuOpen(false);
    setDsDropdownOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-shadow duration-200 border-b ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md border-slate-200/90 shadow-sm'
          : 'bg-white/95 backdrop-blur-md border-slate-200'
      }`}
    >
      <motion.div
        style={{ scaleX }}
        className="h-[2px] bg-brand-600 origin-left absolute top-0 left-0 right-0 z-50"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <motion.button
            type="button"
            whileHover={{ opacity: 0.8 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-brand-600 shrink-0"
              aria-hidden="true"
            >
              <rect
                x="3.5"
                y="3.5"
                width="6.5"
                height="6.5"
                rx="1.75"
                stroke="currentColor"
                strokeWidth="1.9"
              />
              <rect
                x="14"
                y="14"
                width="6.5"
                height="6.5"
                rx="1.75"
                stroke="currentColor"
                strokeWidth="1.9"
              />
              <path
                d="M10 6.75H15.25C16.3546 6.75 17.25 7.64543 17.25 8.75V14"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[15px] tracking-tight text-slate-900">
              <span className="font-semibold">DSA</span>{' '}
              <span className="font-normal text-slate-500">Visualizer</span>
            </span>
          </motion.button>

          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentView === 'home'
                  ? 'text-brand-700 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {currentView === 'home' && (
                <motion.span
                  layoutId="activeNavPill"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  className="absolute inset-0 bg-brand-50 border border-brand-200 rounded-xl shadow-sm"
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </span>
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDsDropdownOpen((prev) => !prev)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isDSActive ? 'text-brand-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isDSActive && (
                  <motion.span
                    layoutId="activeNavPill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 bg-brand-50 border border-brand-200 rounded-xl shadow-sm"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Data Structures</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </span>
              </button>

              <AnimatePresence>
                {dsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.14 }}
                    className="absolute left-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50"
                  >
                    {DS_MENU_ITEMS.map((item) => {
                      const active = currentView === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors ${
                            active
                              ? 'bg-brand-50 text-brand-700 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {primaryItems.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    active ? 'text-brand-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="activeNavPill"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute inset-0 bg-brand-50 border border-brand-200 rounded-xl shadow-sm"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                sound.playClick();
                onOpenComplexity();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
            >
              <Table className="w-3.5 h-3.5 text-brand-600" />
              <span className="hidden sm:inline">Big-O Reference</span>
              <span className="sm:hidden">Big-O</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={toggleSound}
              title={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/80"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-brand-600" />
              )}
            </motion.button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden border-t border-slate-100"
            >
              <div className="py-3 space-y-1">
                {[
                  { id: 'home' as AppView, label: 'Home', icon: <Home className="w-4 h-4" /> },
                  ...DS_MENU_ITEMS,
                  ...primaryItems,
                ].map((item) => {
                  const active = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-brand-50 text-brand-700 border border-brand-200'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
