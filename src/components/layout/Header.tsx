import React from 'react';
import { GitBranch, Layers, Columns, Info, Home } from 'lucide-react';

interface HeaderProps {
  viewMode: 'SIDE_BY_SIDE' | 'SINGLE_KRUSKAL' | 'SINGLE_PRIM';
  setViewMode: (mode: 'SIDE_BY_SIDE' | 'SINGLE_KRUSKAL' | 'SINGLE_PRIM') => void;
  onOpenInfo: () => void;
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ viewMode, setViewMode, onOpenInfo, onNavigateHome }) => {
  return (
    <header className="stitch-panel" style={{ padding: '0.35rem 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
      <div
        onClick={onNavigateHome}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: onNavigateHome ? 'pointer' : 'default',
          userSelect: 'none',
        }}
        title={onNavigateHome ? "Back to Home & Workflow Guide" : undefined}
      >
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <GitBranch size={16} color="#fff" />
        </div>
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', margin: 0 }}>
          Graphify
        </h1>
        <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>Studio</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <div style={{ backgroundColor: 'var(--bg-primary)', padding: '2px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', gap: '2px' }}>
          <button
            className={`btn ${viewMode === 'SIDE_BY_SIDE' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('SIDE_BY_SIDE')}
            style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
          >
            <Columns size={13} /> Side-by-Side
          </button>

          <button
            className={`btn ${viewMode === 'SINGLE_KRUSKAL' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('SINGLE_KRUSKAL')}
            style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
          >
            <Layers size={13} /> Kruskal
          </button>

          <button
            className={`btn ${viewMode === 'SINGLE_PRIM' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('SINGLE_PRIM')}
            style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
          >
            <Layers size={13} /> Prim
          </button>
        </div>

        <button className="btn btn-secondary" onClick={onOpenInfo} title="Guide & Algorithm Complexity" style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}>
          <Info size={13} /> Guide
        </button>

        {onNavigateHome && (
          <button
            className="btn btn-secondary"
            onClick={onNavigateHome}
            title="Return to Home & Theory Overview"
            style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
          >
            <Home size={13} /> Home
          </button>
        )}
      </div>
    </header>
  );
};
