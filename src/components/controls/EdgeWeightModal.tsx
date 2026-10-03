import React, { useState } from 'react';
import { X, Trash2, Check } from 'lucide-react';
import type { Edge } from '../../core/types';

interface EdgeWeightModalProps {
  edge: Edge | null;
  onClose: () => void;
  onUpdateWeight: (edgeId: string, weight: number) => void;
  onDeleteEdge: (edgeId: string) => void;
}

export const EdgeWeightModal: React.FC<EdgeWeightModalProps> = ({
  edge,
  onClose,
  onUpdateWeight,
  onDeleteEdge,
}) => {
  const [weightInput, setWeightInput] = useState<string>(edge ? String(edge.weight) : '');

  React.useEffect(() => {
    if (edge) {
      setWeightInput(String(edge.weight));
    }
  }, [edge]);

  if (!edge) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(weightInput, 10);
    if (!isNaN(val) && val >= 1) {
      onUpdateWeight(edge.id, val);
      onClose();
    }
  };

  const handleDelete = () => {
    onDeleteEdge(edge.id);
    onClose();
  };

  return (
    <div className="mst-modal-overlay" onClick={onClose}>
      <div
        className="mst-modal-card"
        style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Edit Edge Weight
          </h3>
          <button className="mst-btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Weight Value (Integer ≥ 1):</label>
            <input
              type="number"
              min="1"
              max="999"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              autoFocus
              style={{
                background: 'var(--bg-card-subtle)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.8rem',
                fontSize: '1rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={15} /> Delete Edge
            </button>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: 'var(--color-primary)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Check size={15} /> Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
