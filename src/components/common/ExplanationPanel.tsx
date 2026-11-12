import React from 'react';
import { motion } from 'framer-motion';
import { OperationExplanation, AnimationStep } from '../../types/dsa';
import {
  Code2,
  Clock,
  HardDrive,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

interface ExplanationPanelProps {
  explanation: OperationExplanation | null;
  currentStepData?: AnimationStep | null;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({
  explanation,
  currentStepData,
}) => {
  if (!explanation) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
        <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-700">No Operation Performed Yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Run an operation from the panel (Insert, Push, Search, etc.) to inspect its execution
          steps, pseudocode trace, and Big-O complexity.
        </p>
      </div>
    );
  }

  const {
    operationName,
    displayName,
    whatHappens,
    pseudocode,
    complexity,
    resultMessage,
    status,
  } = explanation;

  const statusConfig = {
    idle: {
      badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: <Info className="w-4 h-4 text-slate-500" />,
    },
    success: {
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    },
    warning: {
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
    },
    error: {
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: <XCircle className="w-4 h-4 text-rose-600" />,
    },
  }[status];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-brand-100 text-brand-800 border border-brand-200">
              {operationName}
            </span>
            <span className="text-xs font-medium text-slate-500">{displayName}</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Execution Trace & Complexity
          </h3>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium ${statusConfig.badgeBg}`}
        >
          {statusConfig.icon}
          <span>{resultMessage}</span>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              <Info className="w-3.5 h-3.5 text-brand-600" />
              Overview
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{whatHappens}</p>
          </div>

          <div className="bg-brand-50/50 rounded-xl p-4 border border-brand-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-900 uppercase tracking-wider">
                <ChevronRight className="w-3.5 h-3.5 text-brand-600" />
                Current Step
              </div>
              {currentStepData && (
                <span className="text-[11px] font-mono font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-md">
                  Step {currentStepData.stepNumber} of {currentStepData.totalSteps}
                </span>
              )}
            </div>

            {currentStepData ? (
              <motion.div
                key={`${operationName}-${currentStepData.stepNumber}`}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-1.5"
              >
                <div className="text-sm font-bold text-slate-900">{currentStepData.title}</div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-3 border-l-2 border-brand-300">
                  {currentStepData.description}
                </p>
              </motion.div>
            ) : (
              <p className="text-xs text-slate-500">Run an operation to see step-by-step execution.</p>
            )}
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              Time & Space Complexity
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 text-center">
                <div className="text-[10px] uppercase font-semibold text-slate-500">Best Case</div>
                <div className="text-sm sm:text-base font-mono font-bold text-emerald-600 mt-0.5">
                  {complexity.timeBest}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 text-center">
                <div className="text-[10px] uppercase font-semibold text-slate-500">Average Case</div>
                <div className="text-sm sm:text-base font-mono font-bold text-brand-600 mt-0.5">
                  {complexity.timeAverage}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 text-center">
                <div className="text-[10px] uppercase font-semibold text-slate-500">Worst Case</div>
                <div className="text-sm sm:text-base font-mono font-bold text-rose-600 mt-0.5">
                  {complexity.timeWorst}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 text-center">
                <div className="text-[10px] uppercase font-semibold text-slate-500 flex items-center justify-center gap-1">
                  <HardDrive className="w-2.5 h-2.5" /> Aux Space
                </div>
                <div className="text-sm sm:text-base font-mono font-bold text-slate-800 mt-0.5">
                  {complexity.auxiliarySpace}
                </div>
              </div>
            </div>

            {complexity.notes && (
              <p className="text-[11px] text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                <span className="font-semibold text-slate-700">Note: </span>
                {complexity.notes}
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-slate-900 rounded-xl p-3.5 sm:p-4 text-white shadow-inner h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Code2 className="w-3.5 h-3.5 text-brand-400" />
                  Pseudocode
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  Line Trace
                </span>
              </div>

              <div className="font-mono text-xs space-y-1 overflow-x-auto py-1">
                {pseudocode.map((line, idx) => {
                  const isActive = currentStepData?.activeLineIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 px-2 py-1 rounded transition-colors ${
                        isActive
                          ? 'bg-brand-600/30 text-brand-100 border-l-2 border-brand-400 font-semibold'
                          : 'text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <span className="select-none text-slate-600 text-[10px] w-4 text-right pt-0.5">
                        {idx + 1}
                      </span>
                      <pre className="font-mono whitespace-pre-wrap flex-1">{line}</pre>
                      {isActive && (
                        <span className="select-none text-[10px] text-brand-200 font-sans uppercase tracking-wider bg-brand-900/70 px-1.5 rounded">
                          active
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Active line tracks current step</span>
              <span className="font-mono text-[10px] text-slate-400">{complexity.auxiliarySpace}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
