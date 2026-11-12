import React from 'react';
import { AppView } from '../../types/dsa';
import {
  BookOpen,
  GitBranch,
  Link2,
  Layers,
  ArrowRightLeft,
  Hash,
  GitFork,
  ListOrdered,
  Share2,
  BarChart3,
  GitCompare,
  MapPin,
} from 'lucide-react';
import { sound } from '../common/SoundEffects';

interface FooterProps {
  onNavigate: (view: AppView) => void;
  onOpenComplexity: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenComplexity }) => {
  const handleNav = (view: AppView) => {
    sound.playClick();
    onNavigate(view);
  };

  return (
    <footer className="bg-white border-t border-slate-200 mt-16 py-10 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <svg
                width="18"
                height="18"
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
              <span className="text-sm tracking-tight text-slate-900">
                <span className="font-semibold">DSA</span>{' '}
                <span className="font-normal text-slate-500">Visualizer</span>
              </span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed">
              Interactive workspace for data structures, algorithm step traces, head-to-head sorting
              benchmarks, and campus graph pathfinding.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 uppercase tracking-wider mb-3 text-[11px]">
              Data Structures
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNav('linked-list')}
                  className="hover:text-brand-600 transition-colors flex items-center gap-1.5"
                >
                  <Link2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Linked List</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('stack')}
                  className="hover:text-brand-600 transition-colors flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5 text-brand-500" />
                  <span>Stack & Queue</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('bst')}
                  className="hover:text-brand-600 transition-colors flex items-center gap-1.5"
                >
                  <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Binary Search Tree</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('hash-table')}
                  className="hover:text-brand-600 transition-colors flex items-center gap-1.5"
                >
                  <Hash className="w-3.5 h-3.5 text-amber-500" />
                  <span>Hash Table</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('heap')}
                  className="hover:text-brand-600 transition-colors flex items-center gap-1.5"
                >
                  <GitFork className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Binary Heap</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('priority-queue')}
                  className="hover:text-brand-600 transition-colors flex items-center gap-1.5"
                >
                  <ListOrdered className="w-3.5 h-3.5 text-rose-500" />
                  <span>Priority Queue</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('graph')}
                  className="hover:text-brand-600 transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-brand-500" />
                  <span>Graphs</span>
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 uppercase tracking-wider mb-3 text-[11px]">
              Modules & Reference
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNav('algorithms')}
                  className="hover:text-brand-600 transition-colors flex items-center gap-1.5"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-brand-600" />
                  <span>Algorithm Lab</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('compare')}
                  className="hover:text-brand-600 transition-colors flex items-center gap-1.5"
                >
                  <GitCompare className="w-3.5 h-3.5 text-brand-600" />
                  <span>Algorithm Compare</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('campus')}
                  className="hover:text-brand-600 transition-colors flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Campus Route Optimizer</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('queue')}
                  className="hover:text-brand-600 transition-colors flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Circular Queue</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenComplexity();
                  }}
                  className="hover:text-brand-600 transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                  <span>Big-O Cheat Sheet</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>© {new Date().getFullYear()} DSA Visualizer</div>
          <div>React + TypeScript</div>
        </div>
      </div>
    </footer>
  );
};
