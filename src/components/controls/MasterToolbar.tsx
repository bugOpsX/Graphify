import React from 'react';
import { Play, Pause, RotateCcw, SkipBack, SkipForward, FastForward } from 'lucide-react';
import type { PlaybackControls } from '../../visualization/usePlayback';

interface MasterToolbarProps {
  kruskalPlayback: PlaybackControls;
  primPlayback: PlaybackControls;
  totalSteps: number;
}

export const MasterToolbar: React.FC<MasterToolbarProps> = ({
  kruskalPlayback,
  primPlayback,
  totalSteps,
}) => {
  const isPlaying = kruskalPlayback.isPlaying || primPlayback.isPlaying;

  const handleTogglePlay = () => {
    if (isPlaying) {
      kruskalPlayback.pause();
      primPlayback.pause();
    } else {
      kruskalPlayback.play();
      primPlayback.play();
    }
  };

  const handleReset = () => {
    kruskalPlayback.reset();
    primPlayback.reset();
  };

  const handleStepForward = () => {
    kruskalPlayback.stepForward();
    primPlayback.stepForward();
  };

  const handleStepBackward = () => {
    kruskalPlayback.stepBackward();
    primPlayback.stepBackward();
  };

  const currentStep = Math.max(kruskalPlayback.currentStepIndex, primPlayback.currentStepIndex);

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const stepIdx = parseInt(e.target.value, 10);
    kruskalPlayback.goToStep(stepIdx);
    primPlayback.goToStep(stepIdx);
  };

  const handleSpeedChange = (speed: number) => {
    kruskalPlayback.setSpeed(speed);
    primPlayback.setSpeed(speed);
  };

  return (
    <div className="stitch-panel" style={{
      padding: '0.4rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      backgroundColor: 'var(--bg-secondary)',
    }}>
      {/* Primary Playback Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <button className="btn btn-secondary" onClick={handleReset} title="Reset Execution (R)" style={{ padding: '0.35rem 0.6rem' }}>
          <RotateCcw size={14} />
        </button>

        <button className="btn btn-secondary" onClick={handleStepBackward} disabled={currentStep <= 0} title="Step Back (&larr;)" style={{ padding: '0.35rem 0.6rem' }}>
          <SkipBack size={14} />
        </button>

        <button className="btn btn-primary" onClick={handleTogglePlay} style={{ minWidth: '90px', padding: '0.35rem 0.85rem' }}>
          {isPlaying ? (
            <>
              <Pause size={14} /> Pause
            </>
          ) : (
            <>
              <Play size={14} /> Play
            </>
          )}
        </button>

        <button className="btn btn-secondary" onClick={handleStepForward} disabled={currentStep >= totalSteps - 1} title="Step Forward (&rarr;)" style={{ padding: '0.35rem 0.6rem' }}>
          <SkipForward size={14} />
        </button>
      </div>

      {/* Synchronized Step Scrub Slider */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '500px' }}>
        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <FastForward size={14} color="var(--text-muted)" />
          {[0.5, 1, 2, 4].map((speed) => (
            <button
              key={speed}
              className={`btn ${kruskalPlayback.speed === speed ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handleSpeedChange(speed)}
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.45rem' }}
            >
              {speed}x
            </button>
          ))}
        </div>

        <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '0.6rem', fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span style={{ backgroundColor: 'var(--bg-primary)', padding: '1px 4px', borderRadius: '3px', border: '1px solid var(--border-subtle)' }}>Space</span> Play | <span style={{ backgroundColor: 'var(--bg-primary)', padding: '1px 4px', borderRadius: '3px', border: '1px solid var(--border-subtle)' }}>&rarr;</span> Step
        </div>
      </div>
    </div>
  );
};
