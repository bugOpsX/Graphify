import React from 'react';
import type { AlgorithmStep, ExecutionTrace } from '../../core/types';
import { HelpCircle, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ExplanationPanelProps {
  trace: ExecutionTrace | null;
  currentStepIndex: number;
}

export const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ trace, currentStepIndex }) => {
  if (!trace || trace.steps.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No execution trace available. Create or load a graph to start visualization.
      </div>
    );
  }

  const step: AlgorithmStep = trace.steps[currentStepIndex] || trace.steps[0];
  const isKruskal = trace.algorithm === 'KRUSKAL';

  let stepBadgeColor = 'var(--accent-indigo)';
  let StepIcon = HelpCircle;

  if (step.type === 'ACCEPT_EDGE') {
    stepBadgeColor = 'var(--accent-emerald)';
    StepIcon = CheckCircle2;
  } else if (step.type === 'REJECT_EDGE') {
    stepBadgeColor = 'var(--accent-rose)';
    StepIcon = XCircle;
  } else if (step.type === 'CONSIDER_EDGE') {
    stepBadgeColor = 'var(--accent-amber)';
    StepIcon = HelpCircle;
  } else if (step.type === 'WARNING_DISCONNECTED') {
    stepBadgeColor = 'var(--accent-amber)';
    StepIcon = AlertTriangle;
  } else if (step.type === 'COMPLETE') {
    stepBadgeColor = 'var(--accent-cyan)';
    StepIcon = ShieldCheck;
  }

  return (
    <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StepIcon size={18} color={stepBadgeColor} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {isKruskal ? "Kruskal's Step Explanation" : "Prim's Step Explanation"}
          </h3>
        </div>
        <span style={{
          background: 'rgba(255, 255, 255, 0.06)',
          border: `1px solid ${stepBadgeColor}`,
          color: stepBadgeColor,
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
        }}>
          {step.type}
        </span>
      </div>

      {/* Step Explanation Text */}
      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
        {step.explanation}
      </p>

      {/* Real-time Data Structure Snapshot State */}
      <div style={{ background: 'rgba(10, 13, 20, 0.6)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', fontSize: '0.78rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
          {isKruskal ? 'Disjoint Set Union (DSU) Roots' : 'Min-Priority Queue Contents'}
        </div>

        {isKruskal ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontFamily: 'var(--font-mono)' }}>
            {step.disjointSetState && Object.entries(step.disjointSetState).map(([vId, rootId]) => (
              <span key={vId} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                {vId}: root({rootId})
              </span>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontFamily: 'var(--font-mono)' }}>
            {step.priorityQueueState && step.priorityQueueState.length > 0 ? (
              step.priorityQueueState.map((item, idx) => (
                <span key={idx} style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  ({item.source}-{item.target}: {item.weight})
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Queue empty</span>
            )}
          </div>
        )}
      </div>

      {/* Metrics Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', paddingTop: '0.2rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          Current Tree Weight: <strong style={{ color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>{step.currentWeight}</strong>
        </span>
        <span style={{ color: 'var(--text-secondary)' }}>
          Accepted Edges: <strong style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{step.acceptedEdgeIds.length}</strong>
        </span>
      </div>
    </div>
  );
};
