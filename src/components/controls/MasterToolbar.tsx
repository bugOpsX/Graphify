import React from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, FastForward } from 'lucide-react';
import type { PlaybackControls } from '../../visualization/usePlayback';

interface MasterToolbarProps {
  kruskalPlayback: PlaybackControls;
  primPlayback: PlaybackControls;
  totalSteps: number;
  currentAlgorithm?: 'ALL' | 'KRUSKAL' | 'PRIM';
}

export const MasterToolbar: React.FC<MasterToolbarProps> = ({
  kruskalPlayback,
  primPlayback,
  totalSteps,
  currentAlgorithm = 'ALL',
}) => {
  const isPlaying =
    currentAlgorithm === 'KRUSKAL'
      ? kruskalPlayback.isPlaying
      : currentAlgorithm === 'PRIM'
      ? primPlayback.isPlaying
      : (kruskalPlayback.isPlaying || primPlayback.isPlaying);

  const currentStep =
    currentAlgorithm === 'KRUSKAL'
      ? kruskalPlayback.currentStepIndex
      : currentAlgorithm === 'PRIM'
      ? primPlayback.currentStepIndex
      : Math.max(kruskalPlayback.currentStepIndex, primPlayback.currentStepIndex);

  const currentSpeed =
    currentAlgorithm === 'PRIM' ? primPlayback.speed : kruskalPlayback.speed;

  const handleTogglePlay = () => {
    if (currentAlgorithm === 'KRUSKAL') {
      if (kruskalPlayback.isPlaying) kruskalPlayback.pause();
      else kruskalPlayback.play();
    } else if (currentAlgorithm === 'PRIM') {
      if (primPlayback.isPlaying) primPlayback.pause();
      else primPlayback.play();
    } else {
      if (isPlaying) {
        kruskalPlayback.pause();
        primPlayback.pause();
      } else {
        kruskalPlayback.play();
        primPlayback.play();
      }
    }
  };

  const handleReset = () => {
    if (currentAlgorithm === 'KRUSKAL') {
      kruskalPlayback.reset();
    } else if (currentAlgorithm === 'PRIM') {
      primPlayback.reset();
    } else {
      kruskalPlayback.reset();
      primPlayback.reset();
    }
  };

  const handleStepForward = () => {
    if (currentAlgorithm === 'KRUSKAL') {
      kruskalPlayback.stepForward();
    } else if (currentAlgorithm === 'PRIM') {
      primPlayback.stepForward();
    } else {
      kruskalPlayback.stepForward();
      primPlayback.stepForward();
    }
  };

  const handleStepBackward = () => {
    if (currentAlgorithm === 'KRUSKAL') {
      kruskalPlayback.stepBackward();
    } else if (currentAlgorithm === 'PRIM') {
      primPlayback.stepBackward();
    } else {
      kruskalPlayback.stepBackward();
      primPlayback.stepBackward();
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stepIdx = parseInt(e.target.value, 10);
    if (currentAlgorithm === 'KRUSKAL') {
      kruskalPlayback.goToStep(stepIdx);
    } else if (currentAlgorithm === 'PRIM') {
      primPlayback.goToStep(stepIdx);
    } else {
      kruskalPlayback.goToStep(stepIdx);
      primPlayback.goToStep(stepIdx);
    }
  };

  const handleSpeedChange = (speed: number) => {
    if (currentAlgorithm === 'KRUSKAL') {
      kruskalPlayback.setSpeed(speed);
    } else if (currentAlgorithm === 'PRIM') {
      primPlayback.setSpeed(speed);
    } else {
      kruskalPlayback.setSpeed(speed);
      primPlayback.setSpeed(speed);
    }
  };

  return (
    <div
      className="stitch-panel"
      style={{
        padding: '0.4rem 0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.6rem',
        backgroundColor: 'var(--bg-secondary)',
        flexShrink: 0,
      }}
    >
      {/* Primary Playback Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <button
          className="btn btn-secondary"
          onClick={handleReset}
          title="Reset Execution (R)"
          style={{ padding: '0.32rem 0.55rem' }}
        >
          <RotateCcw size={13} />
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleStepBackward}
          disabled={currentStep <= 0}
          title="Step Back (&larr;)"
          style={{ padding: '0.32rem 0.55rem' }}
        >
          <SkipBack size={13} />
        </button>

        <button
          className="btn btn-primary"
          onClick={handleTogglePlay}
          style={{ minWidth: '85px', padding: '0.32rem 0.75rem', fontSize: '0.75rem' }}
        >
          {isPlaying ? (
            <>
              <Pause size={13} /> Pause
            </>
          ) : (
            <>
              <Play size={13} /> Play
            </>
          )}
        </button>

        <button
          className="btn btn-secondary"
          onClick={handleStepForward}
          disabled={currentStep >= totalSteps - 1}
          title="Step Forward (&rarr;)"
          style={{ padding: '0.32rem 0.55rem' }}
        >
          <SkipForward size={13} />
        </button>
      </div>

      {/* Synchronized Step Scrub Slider */}
      <div style={{ flex: 1, minWidth: '160px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span
          style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
          }}
        >
          Step {currentStep + 1} / {totalSteps}
        </span>
        <input
          type="range"
          min={0}
          max={totalSteps > 0 ? totalSteps - 1 : 0}
          value={currentStep}
          onChange={handleScrub}
          style={{ flex: 1, cursor: 'pointer', accentColor: 'var(--color-primary)' }}
        />
      </div>

      {/* Speed Controls & Hotkey Hints */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <FastForward size={13} color="var(--text-muted)" />
          {[0.5, 1, 2, 4].map((speed) => (
            <button
              key={speed}
              className={`btn ${currentSpeed === speed ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleSpeedChange(speed)}
              style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}
            >
              {speed}x
            </button>
          ))}
        </div>

        <div
          style={{
            borderLeft: '1px solid var(--border-subtle)',
            paddingLeft: '0.5rem',
            fontSize: '0.65rem',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span
            style={{
              backgroundColor: 'var(--bg-primary)',
              padding: '1px 3px',
              borderRadius: '3px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            Space
          </span>{' '}
          Play |{' '}
          <span
            style={{
              backgroundColor: 'var(--bg-primary)',
              padding: '1px 3px',
              borderRadius: '3px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            &rarr;
          </span>{' '}
          Step
        </div>
      </div>
    </div>
  );
};
