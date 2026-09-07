import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Zap } from 'lucide-react';
import type { PlaybackControls } from '../../visualization/usePlayback';

interface PlaybackToolbarProps {
  playback: PlaybackControls;
  algorithmName?: string;
}

export const PlaybackToolbar: React.FC<PlaybackToolbarProps> = ({ playback, algorithmName }) => {
  const {
    currentStepIndex,
    isPlaying,
    speed,
    totalSteps,
    togglePlay,
    stepForward,
    stepBackward,
    goToStep,
    reset,
    setSpeed,
  } = playback;

  const progressPercent = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="glass-card" style={{ padding: '0.8rem 1.2rem', marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.8rem' }}>
        {/* Playback Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            className="btn btn-secondary"
            onClick={reset}
            disabled={totalSteps === 0}
            title="Restart Execution (R)"
            style={{ padding: '0.4rem 0.6rem' }}
          >
            <RotateCcw size={16} />
          </button>

          <button
            className="btn btn-secondary"
            onClick={stepBackward}
            disabled={currentStepIndex === 0 || isPlaying}
            title="Previous Step (Left Arrow)"
            style={{ padding: '0.4rem 0.6rem' }}
          >
            <SkipBack size={16} />
          </button>

          <button
            className={`btn ${isPlaying ? 'btn-accent' : 'btn-primary'}`}
            onClick={togglePlay}
            disabled={totalSteps === 0}
            title="Play / Pause (Space)"
            style={{ padding: '0.4rem 1.2rem', fontWeight: 600 }}
          >
            {isPlaying ? (
              <>
                <Pause size={16} /> Pause
              </>
            ) : (
              <>
                <Play size={16} /> Play
              </>
            )}
          </button>

          <button
            className="btn btn-secondary"
            onClick={stepForward}
            disabled={currentStepIndex >= totalSteps - 1 || isPlaying}
            title="Next Step (Right Arrow)"
            style={{ padding: '0.4rem 0.6rem' }}
          >
            <SkipForward size={16} />
          </button>
        </div>

        {/* Step Counter Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{algorithmName ? `${algorithmName} Step:` : 'Step:'}</span>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>
            {totalSteps > 0 ? currentStepIndex + 1 : 0}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/ {totalSteps}</span>
        </div>

        {/* Speed Multiplier Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Zap size={15} color="var(--accent-amber)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Speed:</span>
          {[0.5, 1.0, 2.0, 4.0].map((s) => (
            <button
              key={s}
              className={`btn ${speed === s ? 'btn-active' : 'btn-secondary'}`}
              onClick={() => setSpeed(s)}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', minWidth: '36px', justifyContent: 'center' }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Timeline Scrubber Bar */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '4px' }}>
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={currentStepIndex}
          onChange={(e) => goToStep(Number(e.target.value))}
          disabled={totalSteps <= 1}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: 'var(--radius-full)',
            background: `linear-gradient(to right, var(--accent-cyan) 0%, var(--accent-indigo) ${progressPercent}%, rgba(255, 255, 255, 0.1) ${progressPercent}%, rgba(255, 255, 255, 0.1) 100%)`,
            outline: 'none',
            cursor: totalSteps > 1 ? 'pointer' : 'default',
            WebkitAppearance: 'none',
          }}
        />
      </div>
    </div>
  );
};
