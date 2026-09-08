import React from 'react';
import { X, Layers } from 'lucide-react';
import { PRESET_GRAPHS } from '../../core/presets';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (presetId: string) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="mst-modal-overlay" onClick={onClose}>
      <div
        className="mst-modal-card"
        style={{ maxWidth: '580px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mst-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--color-primary)" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Preset Educational Topologies
            </h3>
          </div>
          <button className="mst-btn-icon" onClick={onClose} aria-label="Close presets modal">
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
          Choose a curated textbook graph to explore specific algorithmic behaviors and edge cases:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {PRESET_GRAPHS.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                onSelectPreset(p.id);
                onClose();
              }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.875rem 1rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.background = 'var(--bg-card)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {p.name}
                </span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--color-primary)',
                    background: 'var(--color-primary-subtle)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 500,
                  }}
                >
                  {p.graph.vertices.length} Vertices • {p.graph.edges.length} Edges
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
