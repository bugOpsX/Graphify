import React, { useState } from 'react';
import { PlusCircle, Link, Shuffle, Trash2, RefreshCw, Layers, Move, PlayCircle } from 'lucide-react';
import type { GraphStateControls } from '../../visualization/useGraphState';
import { PRESET_GRAPHS } from '../../core/presets';

interface GraphEditorToolbarProps {
  graphState: GraphStateControls;
  startVertexId?: string;
  onStartVertexChange: (vertexId: string) => void;
}

export const GraphEditorToolbar: React.FC<GraphEditorToolbarProps> = ({
  graphState,
  startVertexId,
  onStartVertexChange,
}) => {
  const {
    graph,
    mode,
    setMode,
    loadPreset,
    generateRandom,
    clearGraph,
    resetGraph,
    validation,
  } = graphState;

  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-standard');

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedPresetId(id);
    loadPreset(id);
  };

  const currentStartId = startVertexId && graph.vertices.some((v) => v.id === startVertexId)
    ? startVertexId
    : graph.vertices[0]?.id || '';

  return (
    <div className="stitch-panel" style={{
      padding: '0.4rem 0.8rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '0.6rem',
      backgroundColor: 'var(--bg-secondary)',
    }}>
      {/* Editor Interaction Modes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Mode:</span>

        <button
          className={`btn ${mode === 'SELECT' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('SELECT')}
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
        >
          <Move size={13} /> Select & Move
        </button>

        <button
          className={`btn ${mode === 'ADD_VERTEX' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('ADD_VERTEX')}
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
        >
          <PlusCircle size={13} /> Add Node
        </button>

        <button
          className={`btn ${mode === 'ADD_EDGE' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMode('ADD_EDGE')}
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
        >
          <Link size={13} /> Add Edge
        </button>

        {/* Start Node Selector for Prim's Algorithm */}
        {graph.vertices.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.4rem', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '0.6rem' }}>
            <PlayCircle size={13} color="var(--color-primary)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Prim Start Node:</span>
            <select
              value={currentStartId}
              onChange={(e) => onStartVertexChange(e.target.value)}
              style={{
                padding: '0.25rem 0.45rem',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {graph.vertices.map((v) => (
                <option key={v.id} value={v.id}>
                  Vertex {v.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Preset Library & Generators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Layers size={13} color="var(--color-primary)" />
          <select
            value={selectedPresetId}
            onChange={handlePresetChange}
            style={{
              padding: '0.25rem 0.55rem',
              fontSize: '0.75rem',
            }}
          >
            {PRESET_GRAPHS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => generateRandom(6)}
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
          title="Generate Random Connected Graph"
        >
          <Shuffle size={13} /> Random Graph
        </button>

        <button
          className="btn btn-secondary"
          onClick={resetGraph}
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
          title="Reset Graph Layout"
        >
          <RefreshCw size={13} /> Reset
        </button>

        <button
          className="btn btn-danger"
          onClick={clearGraph}
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
          title="Clear All Nodes and Edges"
        >
          <Trash2 size={13} /> Clear
        </button>
      </div>

      {/* Validation Warning Badge */}
      {validation.warnings.length > 0 && (
        <span className="badge badge-warning" style={{ fontSize: '0.6875rem' }}>
          {validation.warnings[0]}
        </span>
      )}
    </div>
  );
};
