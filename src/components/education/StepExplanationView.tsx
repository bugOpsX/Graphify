import React from 'react';
import type { Graph, ExecutionTrace, AlgorithmStep } from '../../core/types';
import { PseudocodeViewer } from './PseudocodeViewer';
import { CheckCircle2, XCircle, Eye, ShieldCheck, Activity, CornerDownRight } from 'lucide-react';

interface StepExplanationViewProps {
  graph: Graph;
  kruskalTrace: ExecutionTrace;
  primTrace: ExecutionTrace;
  kruskalStep: AlgorithmStep;
  primStep: AlgorithmStep;
  kruskalStepIndex: number;
  primStepIndex: number;
  algorithm?: 'ALL' | 'KRUSKAL' | 'PRIM';
}

export const StepExplanationView: React.FC<StepExplanationViewProps> = ({
  graph,
  kruskalTrace,
  primTrace,
  kruskalStep,
  primStep,
  kruskalStepIndex,
  primStepIndex,
  algorithm = 'ALL',
}) => {
  const vertexMap = new Map(graph.vertices.map((v) => [v.id, v.label]));
  const edgeMap = new Map(graph.edges.map((e) => [e.id, e]));

  const getEdgeDetails = (edgeId?: string) => {
    if (!edgeId) return null;
    const edge = edgeMap.get(edgeId);
    if (!edge) return null;
    const uLabel = vertexMap.get(edge.source) || edge.source;
    const vLabel = vertexMap.get(edge.target) || edge.target;
    return {
      id: edge.id,
      label: `${uLabel} – ${vLabel}`,
      sourceLabel: uLabel,
      targetLabel: vLabel,
      weight: edge.weight,
    };
  };

  // Helper to construct dynamic Action, Why, Decision, Result, Next for Kruskal
  const renderKruskalCard = () => {
    const totalV = graph.vertices.length;
    const targetEdgesCount = Math.max(0, totalV - 1);
    const activeEdge = getEdgeDetails(kruskalStep.activeEdgeId);
    const nextStep = kruskalTrace.steps[kruskalStepIndex + 1];
    const nextEdge = getEdgeDetails(nextStep?.activeEdgeId);

    const acceptedEdges = kruskalStep.acceptedEdgeIds
      .map((id) => getEdgeDetails(id))
      .filter((e): e is NonNullable<ReturnType<typeof getEdgeDetails>> => e !== null);

    // Derive DSU root component lookup
    let sourceComp = '';
    let targetComp = '';
    if (activeEdge && kruskalStep.disjointSetState) {
      const edgeObj = edgeMap.get(activeEdge.id);
      if (edgeObj) {
        const rootU = kruskalStep.disjointSetState[edgeObj.source] || edgeObj.source;
        const rootV = kruskalStep.disjointSetState[edgeObj.target] || edgeObj.target;
        sourceComp = vertexMap.get(rootU) || rootU;
        targetComp = vertexMap.get(rootV) || rootV;
      }
    }

    let actionText = '';
    let whyText = '';
    let decisionBadge = { label: 'CONSIDER', color: 'var(--color-warning)', icon: Eye, bg: 'rgba(245, 158, 11, 0.12)' };
    let decisionReason = '';

    if (kruskalStep.type === 'INIT') {
      actionText = `Initialized Kruskal's algorithm on ${totalV} vertices and ${graph.edges.length} edges.`;
      whyText = 'Edges are sorted in non-decreasing order of weight. Disjoint Set Union (DSU) is initialized with each vertex in its own independent component.';
      decisionBadge = { label: 'INITIALIZED', color: 'var(--color-primary)', icon: Activity, bg: 'rgba(99, 102, 241, 0.12)' };
      decisionReason = 'Ready to evaluate sorted edge queue.';
    } else if (kruskalStep.type === 'CONSIDER_EDGE') {
      actionText = `Considering edge ${activeEdge?.label || ''} with weight ${activeEdge?.weight ?? ''}.`;
      whyText = activeEdge
        ? `Evaluating endpoints ${activeEdge.sourceLabel} and ${activeEdge.targetLabel} via DSU FIND operations.`
        : 'Selecting next smallest edge from sorted candidate queue.';
      decisionBadge = { label: 'CONSIDER EDGE', color: 'var(--color-warning)', icon: Eye, bg: 'rgba(245, 158, 11, 0.12)' };
      decisionReason = 'Checking cycle condition (find(u) ≠ find(v)).';
    } else if (kruskalStep.type === 'ACCEPT_EDGE') {
      actionText = `Accepted edge ${activeEdge?.label || ''} (weight ${activeEdge?.weight ?? ''}).`;
      whyText = activeEdge
        ? `${activeEdge.sourceLabel} (Component ${sourceComp}) and ${activeEdge.targetLabel} (Component ${targetComp}) belong to different connected components. Adding this edge connects two trees without creating a cycle.`
        : 'Edge connects distinct components.';
      decisionBadge = { label: '✓ ACCEPT EDGE', color: 'var(--color-success)', icon: CheckCircle2, bg: 'rgba(16, 185, 129, 0.15)' };
      decisionReason = `No cycle created. Merged Component ${sourceComp} and Component ${targetComp}.`;
    } else if (kruskalStep.type === 'REJECT_EDGE') {
      actionText = `Rejected edge ${activeEdge?.label || ''} (weight ${activeEdge?.weight ?? ''}).`;
      whyText = activeEdge
        ? `${activeEdge.sourceLabel} and ${activeEdge.targetLabel} already belong to the same component (Root: ${sourceComp}). Adding edge ${activeEdge.label} would create a closed cycle.`
        : 'Endpoints already connected.';
      decisionBadge = { label: '✕ REJECT EDGE', color: 'var(--color-danger)', icon: XCircle, bg: 'rgba(244, 63, 94, 0.15)' };
      decisionReason = `Endpoints ${activeEdge?.sourceLabel} & ${activeEdge?.targetLabel} are already in Component ${sourceComp} (forms cycle).`;
    } else if (kruskalStep.type === 'COMPLETE') {
      actionText = `Kruskal's algorithm execution complete!`;
      whyText = `All reachable vertices have been unified into a single Minimum Spanning Tree with ${kruskalStep.acceptedEdgeIds.length} edges.`;
      decisionBadge = { label: '🏆 MST COMPLETE', color: '#06b6d4', icon: ShieldCheck, bg: 'rgba(6, 182, 212, 0.15)' };
      decisionReason = `Constructed valid MST of total weight ${kruskalStep.currentWeight}.`;
    }

    let nextText = 'Algorithm execution complete.';
    if (nextStep) {
      if (nextEdge) {
        nextText = `Consider edge ${nextEdge.label} with weight ${nextEdge.weight}.`;
      } else if (nextStep.type === 'COMPLETE') {
        nextText = 'Finalize MST structure.';
      } else {
        nextText = `Step ${kruskalStepIndex + 2}: ${nextStep.explanation}`;
      }
    }

    const DecisionIcon = decisionBadge.icon;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%' }}>
        {/* Step Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.02em' }}>
            KRUSKAL — STEP {kruskalStepIndex + 1} / {kruskalTrace.steps.length}
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: decisionBadge.color,
              backgroundColor: decisionBadge.bg,
              border: `1px solid ${decisionBadge.color}`,
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <DecisionIcon size={12} /> {decisionBadge.label}
          </span>
        </div>

        {/* Action & Why Box */}
        <div className="stitch-panel" style={{ padding: '0.6rem 0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', backgroundColor: 'var(--bg-primary)' }}>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Action
            </div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {actionText}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Reason (Why?)
            </div>
            <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {whyText}
            </div>
          </div>
        </div>

        {/* Decision Card */}
        <div
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: decisionBadge.bg,
            border: `1px solid ${decisionBadge.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DecisionIcon size={18} color={decisionBadge.color} />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: decisionBadge.color }}>
                {decisionBadge.label}
                {activeEdge ? ` : ${activeEdge.label} (Weight ${activeEdge.weight})` : ''}
              </div>
              <div style={{ fontSize: '0.71875rem', color: 'var(--text-primary)' }}>
                {decisionReason}
              </div>
            </div>
          </div>
        </div>

        {/* Current MST State Snapshot */}
        <div className="stitch-panel" style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Current MST State
            </span>
            <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
              <span>Edges: <strong style={{ color: '#ffffff' }}>{acceptedEdges.length} / {targetEdgesCount}</strong></span>
              <span>Total Weight: <strong style={{ color: 'var(--color-success)' }}>{kruskalStep.currentWeight}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {acceptedEdges.length > 0 ? (
              acceptedEdges.map((e) => (
                <span
                  key={e.id}
                  style={{
                    fontSize: '0.6875rem',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid var(--color-success)',
                    color: 'var(--color-success)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {e.label} ({e.weight})
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No edges accepted yet.</span>
            )}
          </div>
        </div>

        {/* Next Step Banner */}
        <div style={{ fontSize: '0.71875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <CornerDownRight size={13} color="var(--color-primary)" />
          <span><strong>Next:</strong> {nextText}</span>
        </div>

        {/* Pseudocode */}
        <PseudocodeViewer algorithm="KRUSKAL" activeLine={kruskalStep.pseudocodeLine} />
      </div>
    );
  };

  // Helper to construct dynamic Action, Why, Decision, Result, Next for Prim
  const renderPrimCard = () => {
    const totalV = graph.vertices.length;
    const targetEdgesCount = Math.max(0, totalV - 1);
    const activeEdge = getEdgeDetails(primStep.activeEdgeId);
    const nextStep = primTrace.steps[primStepIndex + 1];
    const nextEdge = getEdgeDetails(nextStep?.activeEdgeId);

    const acceptedEdges = primStep.acceptedEdgeIds
      .map((id) => getEdgeDetails(id))
      .filter((e): e is NonNullable<ReturnType<typeof getEdgeDetails>> => e !== null);

    const visitedLabels = primStep.visitedVertexIds
      .map((id) => vertexMap.get(id) || id);

    let actionText = '';
    let whyText = '';
    let decisionBadge = { label: 'CONSIDER', color: 'var(--color-warning)', icon: Eye, bg: 'rgba(245, 158, 11, 0.12)' };
    let decisionReason = '';

    if (primStep.type === 'INIT') {
      const startVLabel = visitedLabels[0] || 'Start';
      actionText = `Initialized Prim's algorithm at start vertex ${startVLabel}.`;
      whyText = `Vertex ${startVLabel} added to MST cut. Incident edges inserted into Min-Priority Queue.`;
      decisionBadge = { label: 'START VERTEX', color: 'var(--color-primary)', icon: Activity, bg: 'rgba(99, 102, 241, 0.12)' };
      decisionReason = `Selected root vertex ${startVLabel}.`;
    } else if (primStep.type === 'CONSIDER_EDGE') {
      actionText = `Popped minimum edge ${activeEdge?.label || ''} (weight ${activeEdge?.weight ?? ''}) from Priority Queue.`;
      whyText = activeEdge
        ? `Checking if endpoint ${activeEdge.targetLabel} is unvisited (outside current MST cut).`
        : 'Inspecting candidate edge from Priority Queue.';
      decisionBadge = { label: 'CONSIDER EDGE', color: 'var(--color-warning)', icon: Eye, bg: 'rgba(245, 158, 11, 0.12)' };
      decisionReason = 'Verifying if destination vertex is outside tree cut.';
    } else if (primStep.type === 'ACCEPT_EDGE') {
      actionText = `Accepted edge ${activeEdge?.label || ''} (weight ${activeEdge?.weight ?? ''}).`;
      whyText = activeEdge
        ? `Vertex ${activeEdge.sourceLabel} is in MST while ${activeEdge.targetLabel} was unvisited. Added ${activeEdge.targetLabel} to tree cut & enqueued new incident edges.`
        : 'Minimum edge connecting tree to unvisited vertex.';
      decisionBadge = { label: '✓ ADD VERTEX', color: 'var(--color-success)', icon: CheckCircle2, bg: 'rgba(16, 185, 129, 0.15)' };
      decisionReason = `Cheapest valid frontier edge. Marked ${activeEdge?.targetLabel} as visited.`;
    } else if (primStep.type === 'REJECT_EDGE') {
      actionText = `Skipped edge ${activeEdge?.label || ''} (weight ${activeEdge?.weight ?? ''}).`;
      whyText = activeEdge
        ? `Both endpoints ${activeEdge.sourceLabel} and ${activeEdge.targetLabel} are already in the MST tree cut. Accepting this edge would create a cycle.`
        : 'Destination vertex already visited.';
      decisionBadge = { label: '✕ SKIP EDGE', color: 'var(--color-danger)', icon: XCircle, bg: 'rgba(244, 63, 94, 0.15)' };
      decisionReason = `Endpoints ${activeEdge?.sourceLabel} & ${activeEdge?.targetLabel} are already visited in MST.`;
    } else if (primStep.type === 'COMPLETE') {
      actionText = `Prim's algorithm execution complete!`;
      whyText = `All ${visitedLabels.length} reachable vertices have been connected into a single spanning tree.`;
      decisionBadge = { label: '🏆 MST COMPLETE', color: '#06b6d4', icon: ShieldCheck, bg: 'rgba(6, 182, 212, 0.15)' };
      decisionReason = `Constructed valid MST of total weight ${primStep.currentWeight}.`;
    }

    let nextText = 'Algorithm execution complete.';
    if (nextStep) {
      if (nextEdge) {
        nextText = `Evaluate candidate edge ${nextEdge.label} (weight ${nextEdge.weight}) from Priority Queue.`;
      } else if (nextStep.type === 'COMPLETE') {
        nextText = 'Finalize MST structure.';
      } else {
        nextText = `Step ${primStepIndex + 2}: ${nextStep.explanation}`;
      }
    }

    const DecisionIcon = decisionBadge.icon;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', height: '100%' }}>
        {/* Step Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '0.02em' }}>
            PRIM — STEP {primStepIndex + 1} / {primTrace.steps.length}
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: decisionBadge.color,
              backgroundColor: decisionBadge.bg,
              border: `1px solid ${decisionBadge.color}`,
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <DecisionIcon size={12} /> {decisionBadge.label}
          </span>
        </div>

        {/* Action & Why Box */}
        <div className="stitch-panel" style={{ padding: '0.6rem 0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', backgroundColor: 'var(--bg-primary)' }}>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Action
            </div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {actionText}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Reason (Why?)
            </div>
            <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {whyText}
            </div>
          </div>
        </div>

        {/* Decision Card */}
        <div
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: decisionBadge.bg,
            border: `1px solid ${decisionBadge.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DecisionIcon size={18} color={decisionBadge.color} />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: decisionBadge.color }}>
                {decisionBadge.label}
                {activeEdge ? ` : ${activeEdge.label} (Weight ${activeEdge.weight})` : ''}
              </div>
              <div style={{ fontSize: '0.71875rem', color: 'var(--text-primary)' }}>
                {decisionReason}
              </div>
            </div>
          </div>
        </div>

        {/* Current MST State Snapshot */}
        <div className="stitch-panel" style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Current MST State
            </span>
            <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
              <span>Vertices: <strong style={{ color: '#ffffff' }}>{visitedLabels.length} / {totalV}</strong></span>
              <span>Edges: <strong style={{ color: '#ffffff' }}>{acceptedEdges.length} / {targetEdgesCount}</strong></span>
              <span>Total Weight: <strong style={{ color: 'var(--color-success)' }}>{primStep.currentWeight}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {acceptedEdges.length > 0 ? (
              acceptedEdges.map((e) => (
                <span
                  key={e.id}
                  style={{
                    fontSize: '0.6875rem',
                    fontFamily: 'var(--font-mono)',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid var(--color-success)',
                    color: 'var(--color-success)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {e.label} ({e.weight})
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.71875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No edges accepted yet.</span>
            )}
          </div>
        </div>

        {/* Next Step Banner */}
        <div style={{ fontSize: '0.71875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.3rem 0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
          <CornerDownRight size={13} color="var(--color-primary)" />
          <span><strong>Next:</strong> {nextText}</span>
        </div>

        {/* Pseudocode */}
        <PseudocodeViewer algorithm="PRIM" activeLine={primStep.pseudocodeLine} />
      </div>
    );
  };

  if (algorithm === 'KRUSKAL') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        {renderKruskalCard()}
      </div>
    );
  }

  if (algorithm === 'PRIM') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
        {renderPrimCard()}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', height: '100%' }}>
      {renderKruskalCard()}
      {renderPrimCard()}
    </div>
  );
};
