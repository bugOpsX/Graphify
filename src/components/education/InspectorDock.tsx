import React, { useState } from 'react';
import type { Graph, ExecutionTrace, AlgorithmStep } from '../../core/types';
import { StepExplanationView } from './StepExplanationView';
import { DataStructuresView } from './DataStructuresView';
import { MetricComparisonTable } from '../comparison/MetricComparisonTable';
import { BookOpen, Cpu, BarChart2 } from 'lucide-react';

interface InspectorDockProps {
  graph: Graph;
  kruskalTrace: ExecutionTrace;
  primTrace: ExecutionTrace;
  kruskalStep: AlgorithmStep;
  primStep: AlgorithmStep;
  kruskalStepIndex: number;
  primStepIndex: number;
}

export const InspectorDock: React.FC<InspectorDockProps> = ({
  graph,
  kruskalTrace,
  primTrace,
  kruskalStep,
  primStep,
  kruskalStepIndex,
  primStepIndex,
}) => {
  const [activeTab, setActiveTab] = useState<'EXPLANATION' | 'DATA_STRUCTURES' | 'METRICS'>('EXPLANATION');

  return (
    <div className="stitch-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Dock Tab Selector Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.35rem 0.8rem',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-primary)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            className={`btn ${activeTab === 'EXPLANATION' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('EXPLANATION')}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
          >
            <BookOpen size={13} /> Step Explanation (What & Why)
          </button>

          <button
            className={`btn ${activeTab === 'DATA_STRUCTURES' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('DATA_STRUCTURES')}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
          >
            <Cpu size={13} /> Data Structures State (DSU & Queue)
          </button>

          <button
            className={`btn ${activeTab === 'METRICS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('METRICS')}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
          >
            <BarChart2 size={13} /> Metrics & Comparison
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
            Kruskal: {kruskalStep.type} | Prim: {primStep.type}
          </span>
        </div>
      </div>

      {/* Tab Content Container */}
      <div style={{ flex: 1, padding: '0.6rem 0.8rem', overflowY: 'auto' }}>
        {activeTab === 'EXPLANATION' && (
          <StepExplanationView
            graph={graph}
            kruskalTrace={kruskalTrace}
            primTrace={primTrace}
            kruskalStep={kruskalStep}
            primStep={primStep}
            kruskalStepIndex={kruskalStepIndex}
            primStepIndex={primStepIndex}
          />
        )}

        {activeTab === 'DATA_STRUCTURES' && (
          <DataStructuresView
            graph={graph}
            kruskalStep={kruskalStep}
            primStep={primStep}
          />
        )}

        {activeTab === 'METRICS' && (
          <MetricComparisonTable kruskalTrace={kruskalTrace} primTrace={primTrace} />
        )}
      </div>
    </div>
  );
};
