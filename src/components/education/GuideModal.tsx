import React from 'react';
import { X, BookOpen, GitBranch, ShieldAlert } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(10, 13, 20, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <BookOpen size={22} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Educational Guide: Kruskal vs Prim MST
            </h2>
          </div>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.3rem 0.6rem' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
          <section>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-indigo)', marginBottom: '0.4rem' }}>
              What is a Minimum Spanning Tree (MST)?
            </h3>
            <p>
              A <strong>Spanning Tree</strong> of a connected, undirected graph is a subgraph that includes all vertices connected together with the minimum possible number of edges ($|V| - 1$), forming no cycles.
              A <strong>Minimum Spanning Tree (MST)</strong> is a spanning tree whose sum of edge weights is minimized.
            </p>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div className="glass-card-sm" style={{ padding: '1rem' }}>
              <h4 style={{ color: 'var(--accent-indigo)', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GitBranch size={16} /> Kruskal's Algorithm
              </h4>
              <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                <li><strong>Strategy:</strong> Global Edge-Centric Greedy.</li>
                <li><strong>Method:</strong> Sorts all edges globally by weight ascending and adds non-cycle edges using Disjoint Set Union (DSU).</li>
                <li><strong>Best For:</strong> Sparse graphs with fewer edges ($E \ll V^2$).</li>
                <li><strong>Complexity:</strong> $O(E \log E)$.</li>
              </ul>
            </div>

            <div className="glass-card-sm" style={{ padding: '1rem' }}>
              <h4 style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GitBranch size={16} /> Prim's Algorithm
              </h4>
              <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', color: 'var(--text-secondary)' }}>
                <li><strong>Strategy:</strong> Local Vertex-Centric Expansion.</li>
                <li><strong>Method:</strong> Grows a single connected tree from a starting vertex by selecting the minimum-weight cut edge via a Min-Priority Queue.</li>
                <li><strong>Best For:</strong> Dense graphs with many edges ($E \approx V^2$).</li>
                <li><strong>Complexity:</strong> $O(E \log V)$ with Binary Min-Heap.</li>
              </ul>
            </div>
          </div>

          <section>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-amber)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={16} /> Keyboard Shortcuts
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '6px 10px', borderRadius: '6px' }}>
                <strong style={{ color: 'var(--accent-cyan)' }}>Space</strong>: Play / Pause
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '6px 10px', borderRadius: '6px' }}>
                <strong style={{ color: 'var(--accent-cyan)' }}>Right Arrow</strong>: Next Step
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '6px 10px', borderRadius: '6px' }}>
                <strong style={{ color: 'var(--accent-cyan)' }}>Left Arrow</strong>: Previous Step
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '6px 10px', borderRadius: '6px' }}>
                <strong style={{ color: 'var(--accent-cyan)' }}>R</strong>: Reset Execution
              </div>
            </div>
          </section>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-glass)', paddingTop: '0.8rem' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Got it, start exploring!
          </button>
        </div>
      </div>
    </div>
  );
};
