import React from 'react';
import type { Graph, AlgorithmStep } from '../../core/types';
import { Terminal, Layers } from 'lucide-react';

interface DataStructuresViewProps {
  graph: Graph;
  kruskalStep: AlgorithmStep;
  primStep: AlgorithmStep;
  algorithm?: 'ALL' | 'KRUSKAL' | 'PRIM';
}

export const DataStructuresView: React.FC<DataStructuresViewProps> = ({
  graph,
  kruskalStep,
  primStep,
  algorithm = 'ALL',
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

  const renderKruskalDSU = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%' }}>
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
                borderRadius: 'var(--radius-sm)',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
              }}
            >
              <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>Set {index + 1} (Root {rootLabel}):</span>
              <div style={{ display: 'flex', gap: '3px' }}>
                {members.map((m) => (
                  <span
                    key={m}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      backgroundColor: m === rootLabel ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.08)',
                      color: m === rootLabel ? '#ffffff' : 'var(--text-primary)',
                      padding: '0 5px',
                      borderRadius: '3px',
                      fontSize: '0.71875rem',
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sorted Edge Inspection Queue */}
      <div className="stitch-panel" style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Sorted Edges Evaluation Queue
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
            Total Edges: <strong>{sortedEdges.length}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {sortedEdges.map((e) => {
            const uLabel = vertexMap.get(e.source) || e.source;
            const vLabel = vertexMap.get(e.target) || e.target;
            const isAccepted = kruskalStep.acceptedEdgeIds.includes(e.id);
            const isRejected = kruskalStep.rejectedEdgeIds.includes(e.id);
            const isActive = kruskalStep.activeEdgeId === e.id;

            let statusBadge = (
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Pending (Wait)</span>
            );
            let rowBg = 'transparent';
            let rowBorder = 'rgba(255, 255, 255, 0.03)';

            if (isActive) {
              rowBg = 'rgba(59, 130, 246, 0.12)';
              rowBorder = 'var(--color-primary)';
              statusBadge = (
                <span style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.6875rem' }}>
                  Evaluating Now
                </span>
              );
            } else if (isAccepted) {
              rowBg = 'rgba(16, 185, 129, 0.08)';
              rowBorder = 'var(--color-success)';
              statusBadge = (
                <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '0.6875rem' }}>
                  ✓ In MST
                </span>
              );
            } else if (isRejected) {
              rowBg = 'rgba(239, 68, 68, 0.06)';
              rowBorder = 'rgba(239, 68, 68, 0.3)';
              statusBadge = (
                <span style={{ color: 'var(--color-error)', fontSize: '0.6875rem' }}>
                  ✗ Cycle Rejected
                </span>
              );
            }

            return (
              <div
                key={e.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: rowBg,
                  border: `1px solid ${rowBorder}`,
                  fontSize: '0.71875rem',
                  fontFamily: 'var(--font-mono)',
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
  );

  const renderPrimDSU = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%' }}>
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
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', fontWeight: 700, display: 'block', marginBottom: '4px' }}>
              UNVISITED FRONTIER ({unvisitedVertices.length})
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {unvisitedVertices.map((v) => (
                <span
                  key={v.id}
                  style={{
                    fontSize: '0.71875rem',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-muted)',
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

      {/* Min-Priority Queue Active Candidate Cut Edges */}
      <div className="stitch-panel" style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Cut Candidate Edges in Min-Priority Queue
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
            Queue Size: <strong>{primStep.priorityQueueState ? primStep.priorityQueueState.length : 0}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {primStep.priorityQueueState && primStep.priorityQueueState.length > 0 ? (
            primStep.priorityQueueState.map((pqItem, idx) => {
              const uLabel = vertexMap.get(pqItem.source) || pqItem.source;
              const vLabel = vertexMap.get(pqItem.target) || pqItem.target;
              const isTop = idx === 0;

              return (
                <div
                  key={`${pqItem.source}-${pqItem.target}-${idx}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isTop ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    border: isTop ? '1px solid var(--color-success)' : '1px solid var(--border-subtle)',
                    fontSize: '0.71875rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <span style={{ fontWeight: 700, color: isTop ? 'var(--color-success)' : 'var(--text-primary)' }}>
                      #{idx + 1} {uLabel} – {vLabel}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Weight: <strong>{pqItem.weight}</strong>
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
  );

  if (algorithm === 'KRUSKAL') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        {renderKruskalDSU()}
      </div>
    );
  }

  if (algorithm === 'PRIM') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        {renderPrimDSU()}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', height: '100%' }}>
      {renderKruskalDSU()}
      {renderPrimDSU()}
    </div>
  );
};
