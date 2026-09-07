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
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(10, 13, 20, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '380px', padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Edit Edge Weight
          </h3>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.2rem 0.5rem' }}>
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
                background: 'rgba(18, 24, 36, 0.9)',
                color: '#fff',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.8rem',
                fontSize: '1rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-danger" onClick={handleDelete} style={{ fontSize: '0.8rem' }}>
              <Trash2 size={15} /> Delete Edge
            </button>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} style={{ fontSize: '0.8rem' }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
                <Check size={15} /> Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
