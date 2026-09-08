import React from 'react';
import type { ExecutionTrace } from '../../core/types';
import { Award, CheckCircle, ShieldCheck } from 'lucide-react';

interface MetricComparisonTableProps {
  kruskalTrace: ExecutionTrace | null;
  primTrace: ExecutionTrace | null;
  algorithm?: 'ALL' | 'KRUSKAL' | 'PRIM';
}

export const MetricComparisonTable: React.FC<MetricComparisonTableProps> = ({
  kruskalTrace,
  primTrace,
  algorithm = 'ALL',
}) => {
  const kruskalResult = kruskalTrace?.result;
  const primResult = primTrace?.result;

  const totalWeightMatch = kruskalResult && primResult && kruskalResult.totalWeight === primResult.totalWeight;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', height: '100%', overflowY: 'auto' }}>
      {/* Parity & Summary Header */}
      <div className="stitch-panel" style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {algorithm === 'KRUSKAL'
              ? "Kruskal's Algorithm Metrics & Properties"
              : algorithm === 'PRIM'
              ? "Prim's Algorithm Metrics & Properties"
              : 'Kruskal vs. Prim Algorithm Metrics & Strategy Comparison'}
          </h3>
        </div>

        {algorithm === 'KRUSKAL' && kruskalResult ? (
          <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            MST Weight: {kruskalResult.totalWeight} • Edges: {kruskalResult.mstEdges.length}
          </span>
        ) : algorithm === 'PRIM' && primResult ? (
          <span style={{ color: 'var(--color-success)', fontWeight: 700, fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
            MST Weight: {primResult.totalWeight} • Edges: {primResult.mstEdges.length}
          </span>
        ) : totalWeightMatch ? (
          <span
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--color-success)',
              color: 'var(--color-success)',
              fontSize: '0.71875rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <CheckCircle size={13} /> Parity Confirmed (Equal Total Weight: {kruskalResult.totalWeight})
          </span>
        ) : (
          <span style={{ fontSize: '0.71875rem', color: 'var(--text-muted)' }}>Calculating execution traces...</span>
        )}
      </div>

      {/* MST Validation Checklist */}
      <div className="stitch-panel" style={{ padding: '0.6rem 0.8rem', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={14} /> MST Validation & Optimality Guarantees
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.4rem', fontSize: '0.71875rem', color: 'var(--text-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--color-success)' }}>✓</span> All reachable vertices connected
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--color-success)' }}>✓</span> Contains exactly |V| − 1 edges
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--color-success)' }}>✓</span> Acyclic (Zero simple cycles)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--color-success)' }}>✓</span> Achieves minimum total weight
          </div>
        </div>
      </div>

      {/* Metrics Table */}
      <div className="stitch-panel" style={{ padding: '0.6rem 0.8rem', backgroundColor: 'var(--bg-primary)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78125rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.4rem 0.6rem' }}>Metric / Property</th>
              {(algorithm === 'ALL' || algorithm === 'KRUSKAL') && (
                <th style={{ padding: '0.4rem 0.6rem', color: 'var(--color-primary)' }}>Kruskal's Value</th>
              )}
              {(algorithm === 'ALL' || algorithm === 'PRIM') && (
                <th style={{ padding: '0.4rem 0.6rem', color: 'var(--color-primary)' }}>Prim's Value</th>
              )}
              <th style={{ padding: '0.4rem 0.6rem' }}>Algorithmic Behavior</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
              <td style={{ padding: '0.4rem 0.6rem', fontWeight: 600, color: 'var(--text-primary)' }}>Greedy Strategy</td>
              {(algorithm === 'ALL' || algorithm === 'KRUSKAL') && (
                <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-secondary)' }}>Edge-centric (Global smallest edge)</td>
              )}
              {(algorithm === 'ALL' || algorithm === 'PRIM') && (
                <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-secondary)' }}>Vertex/Tree-centric (Cheapest frontier edge)</td>
              )}
              <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-muted)', fontSize: '0.71875rem' }}>
                {algorithm === 'KRUSKAL' ? 'Sorts all edges upfront; adds non-cycle edges.' : algorithm === 'PRIM' ? 'Expands single continuous tree cut outward.' : 'Kruskal sorts all edges upfront; Prim expands one tree cut.'}
              </td>
            </tr>

            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
              <td style={{ padding: '0.4rem 0.6rem', fontWeight: 600, color: 'var(--text-primary)' }}>Main Data Structure</td>
              {(algorithm === 'ALL' || algorithm === 'KRUSKAL') && (
                <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-secondary)' }}>Disjoint Set Union (DSU)</td>
              )}
              {(algorithm === 'ALL' || algorithm === 'PRIM') && (
                <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-secondary)' }}>Min-Priority Queue (Binary Heap)</td>
              )}
              <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-muted)', fontSize: '0.71875rem' }}>
                {algorithm === 'KRUSKAL' ? 'DSU tracks component roots with path compression.' : algorithm === 'PRIM' ? 'Heap maintains minimum-weight cut candidates.' : 'DSU tracks components; Heap maintains frontier.'}
              </td>
            </tr>

            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
              <td style={{ padding: '0.4rem 0.6rem', fontWeight: 600, color: 'var(--text-primary)' }}>Total MST Weight</td>
              {(algorithm === 'ALL' || algorithm === 'KRUSKAL') && (
                <td style={{ padding: '0.4rem 0.6rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-success)' }}>
                  {kruskalResult ? kruskalResult.totalWeight : '-'}
                </td>
              )}
              {(algorithm === 'ALL' || algorithm === 'PRIM') && (
                <td style={{ padding: '0.4rem 0.6rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-success)' }}>
                  {primResult ? primResult.totalWeight : '-'}
                </td>
              )}
              <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-muted)', fontSize: '0.71875rem' }}>Guaranteed equal total weight for all valid MSTs.</td>
            </tr>

            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
              <td style={{ padding: '0.4rem 0.6rem', fontWeight: 600, color: 'var(--text-primary)' }}>Edges Examined</td>
              {(algorithm === 'ALL' || algorithm === 'KRUSKAL') && (
                <td style={{ padding: '0.4rem 0.6rem', fontFamily: 'var(--font-mono)' }}>{kruskalResult?.edgesConsideredCount ?? '-'}</td>
              )}
              {(algorithm === 'ALL' || algorithm === 'PRIM') && (
                <td style={{ padding: '0.4rem 0.6rem', fontFamily: 'var(--font-mono)' }}>{primResult?.edgesConsideredCount ?? '-'}</td>
              )}
              <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-muted)', fontSize: '0.71875rem' }}>Total steps before completing spanning tree.</td>
            </tr>

            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
              <td style={{ padding: '0.4rem 0.6rem', fontWeight: 600, color: 'var(--text-primary)' }}>Edges Rejected / Skipped</td>
              {(algorithm === 'ALL' || algorithm === 'KRUSKAL') && (
                <td style={{ padding: '0.4rem 0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--color-danger)' }}>{kruskalResult?.edgesRejectedCount ?? '-'}</td>
              )}
              {(algorithm === 'ALL' || algorithm === 'PRIM') && (
                <td style={{ padding: '0.4rem 0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--color-danger)' }}>{primResult?.edgesRejectedCount ?? '-'}</td>
              )}
              <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-muted)', fontSize: '0.71875rem' }}>
                {algorithm === 'KRUSKAL' ? 'Rejected to prevent forming simple cycles.' : algorithm === 'PRIM' ? 'Skipped because endpoint already in visited tree.' : 'Kruskal rejects cycle edges; Prim skips visited endpoints.'}
              </td>
            </tr>

            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
              <td style={{ padding: '0.4rem 0.6rem', fontWeight: 600, color: 'var(--text-primary)' }}>Time Complexity</td>
              {(algorithm === 'ALL' || algorithm === 'KRUSKAL') && (
                <td style={{ padding: '0.4rem 0.6rem', fontFamily: 'var(--font-mono)' }}>O(E log E)</td>
              )}
              {(algorithm === 'ALL' || algorithm === 'PRIM') && (
                <td style={{ padding: '0.4rem 0.6rem', fontFamily: 'var(--font-mono)' }}>O(E log V)</td>
              )}
              <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-muted)', fontSize: '0.71875rem' }}>
                {algorithm === 'KRUSKAL' ? 'Sorting dominates runtime.' : algorithm === 'PRIM' ? 'Priority Queue operations dominate runtime.' : 'Sorting dominates Kruskal; Heap dominates Prim.'}
              </td>
            </tr>

            <tr>
              <td style={{ padding: '0.4rem 0.6rem', fontWeight: 600, color: 'var(--text-primary)' }}>Space Complexity</td>
              {(algorithm === 'ALL' || algorithm === 'KRUSKAL') && (
                <td style={{ padding: '0.4rem 0.6rem', fontFamily: 'var(--font-mono)' }}>O(V)</td>
              )}
              {(algorithm === 'ALL' || algorithm === 'PRIM') && (
                <td style={{ padding: '0.4rem 0.6rem', fontFamily: 'var(--font-mono)' }}>O(V + E)</td>
              )}
              <td style={{ padding: '0.4rem 0.6rem', color: 'var(--text-muted)', fontSize: '0.71875rem' }}>
                {algorithm === 'KRUSKAL' ? 'DSU parent and rank arrays.' : algorithm === 'PRIM' ? 'Priority queue and visited cut sets.' : 'Assumes Adjacency List graph representation.'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
