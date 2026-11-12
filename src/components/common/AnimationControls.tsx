import React, { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Gauge } from 'lucide-react';
import { OperationExplanation } from '../../types/dsa';
import { sound } from './SoundEffects';

interface AnimationControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: number;
  operationStatus?: OperationExplanation['status'];
  onPlayToggle: () => void;
  onReplay: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onResetAnimation: () => void;
  onSpeedChange: (speed: number) => void;
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  operationStatus,
  onPlayToggle,
  onReplay,
  onNextStep,
  onPrevStep,
  onResetAnimation,
  onSpeedChange,
}) => {
  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= totalSteps) {
      onPlayToggle();
      if (operationStatus === 'error' || operationStatus === 'warning') {
        sound.playError();
      } else if (operationStatus === 'success') {
        sound.playSuccess();
      }
      return;
    }

    const intervalTime = Math.max(300, 1200 / speed);
    const timer = setTimeout(() => {
      onNextStep();
    }, intervalTime);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, totalSteps, speed, operationStatus, onNextStep, onPlayToggle]);

  const speedOptions = [0.5, 1, 1.5, 2];
  const isAtEnd = currentStep >= totalSteps && totalSteps > 1;
  const canPlay = totalSteps > 1;

  const handlePrimaryPlayClick = () => {
    sound.playClick();
    if (!isPlaying && isAtEnd) {
      onReplay();
    } else {
      onPlayToggle();
    }
  };

  const handleNext = () => {
    sound.playStep();
    onNextStep();
  };

  const handlePrev = () => {
    sound.playClick();
    onPrevStep();
  };

  const handleReset = () => {
    sound.playClick();
    onResetAnimation();
  };

  const progressPercent = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm">
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1.5">
          <span>Playback</span>
          <span className="font-mono bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md border border-brand-200 font-semibold">
            Step {currentStep} / {Math.max(1, totalSteps)}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-brand-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleReset}
            disabled={currentStep <= 1 && !isPlaying}
            title="Reset to step 1"
            className="p-2 sm:px-3 sm:py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors flex items-center gap-1 text-xs font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handlePrev}
            disabled={currentStep <= 1 || isPlaying}
            title="Previous step"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrimaryPlayClick}
            disabled={!canPlay}
            title={isPlaying ? 'Pause' : isAtEnd ? 'Replay animation' : 'Play animation'}
            className={`px-4 py-2 rounded-lg font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-sm disabled:opacity-40 ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>{isAtEnd ? 'Replay' : 'Play'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={currentStep >= totalSteps || isPlaying}
            title="Next step"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          <Gauge className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <span className="text-[11px] font-medium text-slate-500 mr-1 hidden sm:inline">Speed:</span>
          {speedOptions.map((s) => (
            <button
              key={s}
              onClick={() => {
                sound.playClick();
                onSpeedChange(s);
              }}
              className={`px-2 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                speed === s
                  ? 'bg-white text-brand-700 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
