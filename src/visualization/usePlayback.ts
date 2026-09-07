import { useState, useEffect, useRef, useCallback } from 'react';
import type { ExecutionTrace } from '../core/types';

export interface PlaybackControls {
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
  totalSteps: number;
  isComplete: boolean;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  goToStep: (stepIndex: number) => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
}

export function usePlayback(trace: ExecutionTrace | null): PlaybackControls {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);

  const totalSteps = trace ? trace.steps.length : 0;
  const isComplete = totalSteps > 0 && currentStepIndex === totalSteps - 1;

  const timerRef = useRef<number | null>(null);

  // Reset step index when a new trace is provided
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [trace]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stepForward = useCallback(() => {
    if (!trace || totalSteps === 0) return;
    setCurrentStepIndex((prev) => {
      if (prev < totalSteps - 1) {
        return prev + 1;
      }
      pause();
      return prev;
    });
  }, [trace, totalSteps, pause]);

  const stepBackward = useCallback(() => {
    if (!trace || totalSteps === 0) return;
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, [trace, totalSteps]);

  const goToStep = useCallback(
    (index: number) => {
      if (!trace || totalSteps === 0) return;
      const clampedIndex = Math.max(0, Math.min(index, totalSteps - 1));
      setCurrentStepIndex(clampedIndex);
      if (clampedIndex === totalSteps - 1) {
        pause();
      }
    },
    [trace, totalSteps, pause]
  );

  const play = useCallback(() => {
    if (!trace || totalSteps === 0) return;
    if (currentStepIndex >= totalSteps - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  }, [trace, totalSteps, currentStepIndex]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, pause, play]);

  const reset = useCallback(() => {
    pause();
    setCurrentStepIndex(0);
  }, [pause]);

  // Timer loop for automatic step progression
  useEffect(() => {
    if (!isPlaying || !trace || totalSteps === 0) {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const intervalMs = Math.max(100, Math.round(1200 / speed));

    timerRef.current = window.setInterval(() => {
      setCurrentStepIndex((prevIndex) => {
        if (prevIndex >= totalSteps - 1) {
          pause();
          return prevIndex;
        }
        return prevIndex + 1;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, speed, trace, totalSteps, pause]);

  return {
    currentStepIndex,
    isPlaying,
    speed,
    totalSteps,
    isComplete,
    play,
    pause,
    togglePlay,
    stepForward,
    stepBackward,
    goToStep,
    reset,
    setSpeed,
  };
}
