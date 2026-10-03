import React from 'react';
import type { Graph, ExecutionTrace } from '../../core/types';
import { TimeComplexityGraph } from './TimeComplexityGraph';
import { Zap, Maximize2 } from 'lucide-react';

interface ComplexityCardTabProps {
  graph: Graph;
  algorithm: 'KRUSKAL' | 'PRIM';
  kruskalTrace: ExecutionTrace | null;
  primTrace: ExecutionTrace | null;
  onOpenModal?: () => void;
}

export const ComplexityCardTab: React.FC<ComplexityCardTabProps> = ({
  graph,
  algorithm,
  kruskalTrace,
  primTrace,
  onOpenModal,
}) => {
  const V = Math.max(2, graph.vertices.length);
  const E = Math.max(1, graph.edges.length);

  // Theoretical operations
  const kruskalOps = E * Math.log2(Math.max(2, E));
  const primOps = E * Math.log2(Math.max(2, V));
  const maxPossibleEdges = Math.max(1, (V * (V - 1)) / 2);
  const densityPercent = ((E / maxPossibleEdges) * 100).toFixed(0);

  const isKruskal = algorithm === 'KRUSKAL';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', height: '100%', overflowY: 'auto' }}>
      {/* Top Banner: Algorithm Highlights & Workbench trigger */}
      <div
        className="stitch-panel"
        style={{
          padding: '0.5rem 0.8rem',
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={15} color={isKruskal ? 'var(--color-primary)' : 'var(--edge-accepted)'} />
          <div>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isKruskal ? "Kruskal's Asymptotic Complexity: O(E log E)" : "Prim's Asymptotic Complexity: O(E log V)"}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
              Density: {densityPercent}% ({E} of {maxPossibleEdges} edges)
              {isKruskal && kruskalTrace?.result && ` • MST Weight: ${kruskalTrace.result.totalWeight}`}
              {!isKruskal && primTrace?.result && ` • MST Weight: ${primTrace.result.totalWeight}`}
            </span>
          </div>
        </div>

        {onOpenModal && (
          <button
            onClick={onOpenModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'var(--color-primary-subtle)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              color: 'var(--color-primary)',
              padding: '2px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
            title="Open comprehensive Asymptotic Complexity Workbench modal"
          >
            <Maximize2 size={11} /> Open Full Workbench
          </button>
        )}
      </div>

      {/* Live Asymptotic XY Time Complexity Graph */}
      <TimeComplexityGraph
        vertexCount={V}
        edgeCount={E}
        algorithm={algorithm}
        onExpand={onOpenModal}
        height={210}
      />

      {/* Quick Asymptotic Insights Pill Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.5rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '0.45rem 0.65rem',
            fontSize: '0.71875rem',
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Current Operations
          </div>
          <div style={{ color: isKruskal ? 'var(--color-primary)' : 'var(--color-success)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {(isKruskal ? kruskalOps : primOps).toFixed(1)} theoretical ops
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '0.45rem 0.65rem',
            fontSize: '0.71875rem',
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Dominant Factor
          </div>
          <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {isKruskal ? 'Sorting E edges: E·log₂(E)' : 'Heap updates on cut: E·log₂(V)'}
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '0.45rem 0.65rem',
            fontSize: '0.71875rem',
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase' }}>
            Best Applied On
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            {isKruskal ? 'Sparse graphs & road networks' : 'Dense mesh & complete topologies'}
          </div>
        </div>
      </div>
    </div>
  );
};
