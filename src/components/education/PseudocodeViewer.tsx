import React from 'react';

interface PseudocodeViewerProps {
  algorithm: 'KRUSKAL' | 'PRIM';
  activeLine: number;
}

const KRUSKAL_PSEUDOCODE = [
  { line: 1, text: '1. Sort all edges in non-decreasing order of weight' },
  { line: 2, text: '2. Initialize Disjoint Set Union (DSU) for V vertices' },
  { line: 3, text: '3. Pick smallest edge (u, v) from sorted edge list' },
  { line: 4, text: '4. IF find(u) != find(v) THEN accept edge & union(u, v)' },
  { line: 5, text: '5. ELSE reject edge (forms cycle)' },
  { line: 6, text: '6. Repeat until MST has |V|-1 edges' },
];

const PRIM_PSEUDOCODE = [
  { line: 1, text: '1. Select arbitrary start vertex v0 & mark visited' },
  { line: 2, text: '2. Insert incident edges of v0 into Min-Priority Queue' },
  { line: 3, text: '3. Pop edge (u, v) with min weight from Priority Queue' },
  { line: 4, text: '4. IF v is unvisited THEN accept edge & mark v visited' },
  { line: 5, text: '5. ELSE reject edge (v already in tree)' },
  { line: 6, text: '6. Repeat until all vertices visited or Queue empty' },
];

export const PseudocodeViewer: React.FC<PseudocodeViewerProps> = ({ algorithm, activeLine }) => {
  const codeLines = algorithm === 'KRUSKAL' ? KRUSKAL_PSEUDOCODE : PRIM_PSEUDOCODE;

  return (
    <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.4rem' }}>
        {algorithm === 'KRUSKAL' ? "Kruskal's Pseudocode" : "Prim's Pseudocode"}
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {codeLines.map((item) => {
          const isActive = item.line === activeLine;
          return (
            <div
              key={item.line}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s ease',
              }}
            >
              {item.text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
