import { useState, useCallback } from 'react';
import { AnimationStep, OperationExplanation } from '../types/dsa';
import { sound } from '../components/common/SoundEffects';

export interface UseStepPlayerReturn<TState> {
  steps: AnimationStep<TState>[];
  currentStepIndex: number;
  currentStep: AnimationStep<TState> | null;
  isPlaying: boolean;
  speed: number;
  explanation: OperationExplanation | null;
  setSpeed: (speed: number) => void;
  setExplanation: (explanation: OperationExplanation | null) => void;
  startPlayback: (
    nextSteps: AnimationStep<TState>[],
    nextExplanation: OperationExplanation | null,
    autoPlay?: boolean
  ) => void;
  clearPlayback: (nextExplanation?: OperationExplanation | null) => void;
  handlePlayToggle: () => void;
  handleReplay: () => void;
  handleNextStep: () => void;
  handlePrevStep: () => void;
  handleResetAnimation: () => void;
}

export function useStepPlayer<TState = unknown>(
  initialSpeed = 1
): UseStepPlayerReturn<TState> {
  const [steps, setSteps] = useState<AnimationStep<TState>[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const [explanation, setExplanation] = useState<OperationExplanation | null>(null);

  const startPlayback = useCallback(
    (
      nextSteps: AnimationStep<TState>[],
      nextExplanation: OperationExplanation | null,
      autoPlay = true
    ) => {
      setSteps(nextSteps);
      setCurrentStepIndex(0);
      setExplanation(nextExplanation);
      if (nextSteps.length > 1) {
        setIsPlaying(autoPlay);
      } else {
        setIsPlaying(false);
        if (nextExplanation?.status === 'error' || nextExplanation?.status === 'warning') {
          sound.playError();
        } else if (nextExplanation?.status === 'success') {
          sound.playSuccess();
        }
      }
    },
    []
  );

  const clearPlayback = useCallback((nextExplanation: OperationExplanation | null = null) => {
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIndex(0);
    setExplanation(nextExplanation);
  }, []);

  const handlePlayToggle = useCallback(() => {
    if (steps.length === 0) return;
    if (!isPlaying && currentStepIndex >= steps.length - 1 && steps.length > 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((prev) => !prev);
  }, [isPlaying, steps.length, currentStepIndex]);

  const handleReplay = useCallback(() => {
    if (steps.length === 0) return;
    setCurrentStepIndex(0);
    if (steps.length > 1) {
      setIsPlaying(true);
    }
  }, [steps.length]);

  const handleNextStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev < steps.length - 1) return prev + 1;
      setIsPlaying(false);
      return prev;
    });
  }, [steps.length]);

  const handlePrevStep = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleResetAnimation = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  const currentStep = steps.length > 0 ? steps[currentStepIndex] ?? steps[steps.length - 1] : null;

  return {
    steps,
    currentStepIndex,
    currentStep,
    isPlaying,
    speed,
    explanation,
    setSpeed,
    setExplanation,
    startPlayback,
    clearPlayback,
    handlePlayToggle,
    handleReplay,
    handleNextStep,
    handlePrevStep,
    handleResetAnimation,
  };
}
