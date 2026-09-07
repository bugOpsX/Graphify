import React from 'react';
import type { Graph, AlgorithmStep } from '../../core/types';
import { Terminal, Layers } from 'lucide-react';

interface DataStructuresViewProps {
  graph: Graph;
  kruskalStep: AlgorithmStep;
  primStep: AlgorithmStep;
}

export const DataStructuresView: React.FC<DataStructuresViewProps> = ({
  graph,
  kruskalStep,
  primStep,
}) => {
  const vertexMap = new Map(graph.vertices.map((v) => [v.id, v.label]));

  // 1. Group Kruskal DSU vertices by Root ID
  const dsuComponents = new Map<string, string[]>();
  if (kruskalStep.disjointSetState) {
    Object.entries(kruskalStep.disjointSetState).forEach(([vId, rootId]) => {
      const vLabel = vertexMap.get(vId) || vId;
      const rootLabel = vertexMap.get(rootId) || rootId;
      if (!dsuComponents.has(rootLabel)) {
        dsuComponents.set(rootLabel, []);
      }
      dsuComponents.get(rootLabel)!.push(vLabel);
    });
  } else {
    // Default initial state: each vertex is its own component
    graph.vertices.forEach((v) => {
      dsuComponents.set(v.label, [v.label]);
    });
  }

  // 2. Kruskal sorted edges list
  const sortedEdges = [...graph.edges].sort((a, b) => a.weight - b.weight);

  // 3. Prim Visited & Unvisited sets
  const visitedSet = new Set(primStep.visitedVertexIds);
  const visitedVertices = graph.vertices.filter((v) => visitedSet.has(v.id));
  const unvisitedVertices = graph.vertices.filter((v) => !visitedSet.has(v.id));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', height: '100%' }}>
      {/* Kruskal Data Structure State */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Terminal size={14} /> KRUSKAL — DISJOINT SET UNION (DSU) & EDGE QUEUE
        </div>

        {/* DSU Connected Components */}
        <div className="stitch-panel" style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Connected Components (Disjoint Sets)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {Array.from(dsuComponents.entries()).map(([rootLabel, members], index) => (
              <div
                key={rootLabel}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.35rem 0.6rem',
                  fontSize: '0.75rem',
                }}
              >
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                  Component {index + 1} (Root: {rootLabel})
                </span>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                  {members.join(' — ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sorted Edge Candidate Queue */}
        <div className="stitch-panel" style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Sorted Edge Candidates Queue ({sortedEdges.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {sortedEdges.map((e) => {
              const uLabel = vertexMap.get(e.source) || e.source;
              const vLabel = vertexMap.get(e.target) || e.target;
              const isAccepted = kruskalStep.acceptedEdgeIds.includes(e.id);
              const isRejected = kruskalStep.rejectedEdgeIds.includes(e.id);
              const isActive = kruskalStep.activeEdgeId === e.id;

              let statusBadge = <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>Pending</span>;
              let rowBg = 'transparent';

              if (isActive) {
                statusBadge = <span style={{ color: 'var(--color-warning)', fontWeight: 700, fontSize: '0.6875rem' }}>Active</span>;
                rowBg = 'rgba(245, 158, 11, 0.12)';
              } else if (isAccepted) {
                statusBadge = <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.6875rem' }}>✓ Accepted</span>;
                rowBg = 'rgba(16, 185, 129, 0.08)';
              } else if (isRejected) {
                statusBadge = <span style={{ color: 'var(--color-danger)', fontWeight: 600, fontSize: '0.6875rem' }}>✕ Rejected</span>;
                rowBg = 'rgba(244, 63, 94, 0.08)';
              }

              return (
                <div
                  key={e.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: rowBg,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', width: '60px' }}>
                      {uLabel} – {vLabel}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Weight: <strong>{e.weight}</strong>
                    </span>
                  </div>
                  {statusBadge}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Prim Data Structure State */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Layers size={14} /> PRIM — VISITED CUT & MIN-PRIORITY QUEUE
        </div>

        {/* Visited vs Unvisited Vertices */}
        <div className="stitch-panel" style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            MST Vertices Cut Status
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--color-success)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                ✓ VISITED IN MST ({visitedVertices.length})
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {visitedVertices.map((v) => (
                  <span
                    key={v.id}
                    style={{
                      fontSize: '0.71875rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 600,
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--color-success)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-success)',
                    }}
                  >
                    {v.label}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
                ○ UNVISITED ({unvisitedVertices.length})
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {unvisitedVertices.map((v) => (
                  <span
                    key={v.id}
                    style={{
                      fontSize: '0.71875rem',
                      fontFamily: 'var(--font-mono)',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      color: 'var(--text-secondary)',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {v.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Min-Priority Queue Table */}
        <div className="stitch-panel" style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
            <span>Min-Priority Queue Frontier Candidates</span>
            <span style={{ color: 'var(--color-primary)' }}>
              {primStep.priorityQueueState ? primStep.priorityQueueState.length : 0} items
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {primStep.priorityQueueState && primStep.priorityQueueState.length > 0 ? (
              primStep.priorityQueueState.map((item, idx) => {
                const uLabel = vertexMap.get(item.source) || item.source;
                const vLabel = vertexMap.get(item.target) || item.target;
                const isTop = idx === 0;

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.3rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isTop ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: isTop ? '1px solid var(--color-success)' : '1px solid transparent',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <span style={{ fontWeight: 600, color: isTop ? 'var(--color-success)' : 'var(--text-primary)' }}>
                        {uLabel} – {vLabel}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Weight: <strong>{item.weight}</strong>
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
                        Dest: {vLabel}
                      </span>
                    </div>

                    {isTop && (
                      <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '0.6875rem' }}>
                        ← Next Candidate
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.4rem 0' }}>
                Priority Queue is empty or uninitialized.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
