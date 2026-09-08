import React, { useRef, useState, useCallback } from 'react';
import type { Graph, Vertex, AlgorithmStep } from '../../core/types';
import { getStepVisualStates } from '../../visualization/stepInterpreter';

interface SVGCanvasProps {
  graph: Graph;
  currentStep?: AlgorithmStep | null;
  mode?: 'SELECT' | 'ADD_VERTEX' | 'ADD_EDGE';
  selectedVertexId?: string | null;
  title?: string;
  badge?: string;
  readOnly?: boolean;
  onCanvasClick?: (x: number, y: number) => void;
  onVertexClick?: (vertexId: string, e: React.MouseEvent) => void;
  onVertexMove?: (vertexId: string, x: number, y: number) => void;
  onEdgeClick?: (edgeId: string, e: React.MouseEvent) => void;
  onVertexDelete?: (vertexId: string) => void;
}

export const SVGCanvas: React.FC<SVGCanvasProps> = ({
  graph,
  currentStep = null,
  mode = 'SELECT',
  selectedVertexId = null,
  title,
  badge,
  readOnly = false,
  onCanvasClick,
  onVertexClick,
  onVertexMove,
  onEdgeClick,
  onVertexDelete,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingVertexId, setDraggingVertexId] = useState<string | null>(null);

  const visualStates = getStepVisualStates(currentStep);

  // Precision SVG Screen CTM coordinate translation matrix mapping
  const getCanvasCoords = useCallback((e: React.MouseEvent<SVGSVGElement>): { x: number; y: number } => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    
    try {
      const point = svg.createSVGPoint();
      point.x = e.clientX;
      point.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (ctm) {
        const svgPoint = point.matrixTransform(ctm.inverse());
        return {
          x: Math.round(svgPoint.x),
          y: Math.round(svgPoint.y),
        };
      }
    } catch {
      // Fallback matrix mapping via bounding rect
    }

    const rect = svg.getBoundingClientRect();
    const scaleX = 700 / (rect.width || 1);
    const scaleY = 450 / (rect.height || 1);
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  }, []);

  const handleMouseDownNode = (vertexId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    if (e.button === 0 && mode === 'SELECT') {
      setDraggingVertexId(vertexId);
    }
  };

  const handleNodeClick = (vertexId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    if (onVertexClick) {
      onVertexClick(vertexId, e);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingVertexId && onVertexMove && !readOnly && mode === 'SELECT') {
      const coords = getCanvasCoords(e);
      const clampedX = Math.max(25, Math.min(coords.x, 675));
      const clampedY = Math.max(25, Math.min(coords.y, 425));
      onVertexMove(draggingVertexId, clampedX, clampedY);
    }
  };

  const handleMouseUp = () => {
    setDraggingVertexId(null);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly) return;
    // Ensure clicks on node elements or edges do not trigger background canvas click
    if (e.target !== e.currentTarget) {
      const targetTag = (e.target as HTMLElement).tagName.toLowerCase();
      if (targetTag === 'circle' || targetTag === 'text' || targetTag === 'line' || targetTag === 'path' || targetTag === 'g') {
        return;
      }
    }
    const coords = getCanvasCoords(e);
    if (onCanvasClick) {
      onCanvasClick(coords.x, coords.y);
    }
  };

  const vertexMap = new Map<string, Vertex>(graph.vertices.map((v) => [v.id, v]));
  const selectedVertex = selectedVertexId ? vertexMap.get(selectedVertexId) : null;

  return (
    <div className="mst-canvas-container" style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%', minHeight: 0, minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Title & Badge */}
      {(title || badge) && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '14px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none',
        }}>
          {badge && (
            <span className="badge badge-primary">
              {badge}
            </span>
          )}
          {title && <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>}
        </div>
      )}

      {/* Mode Helper Floating Toast Banner */}
      {mode === 'ADD_EDGE' && !readOnly && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 12,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #06b6d4',
          borderRadius: 'var(--radius-md)',
          padding: '0.35rem 0.8rem',
          fontSize: '0.75rem',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}>
          <span style={{ color: '#06b6d4', fontWeight: 700 }}>Add Edge:</span>
          {selectedVertex ? (
            <span>Node <strong>{selectedVertex.label}</strong> selected. Click second node to connect.</span>
          ) : (
            <span>Click first node to select source.</span>
          )}
        </div>
      )}

      {mode === 'ADD_VERTEX' && !readOnly && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 12,
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid var(--color-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '0.35rem 0.8rem',
          fontSize: '0.75rem',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          pointerEvents: 'none',
        }}>
          <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Add Node:</span> Click anywhere on grid canvas to place node.
        </div>
      )}

      {/* Selected Node Action Toast Banner */}
      {mode === 'SELECT' && selectedVertex && !readOnly && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 12,
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.35rem 0.85rem',
          fontSize: '0.75rem',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
        }}>
          <span>Node <strong>{selectedVertex.label}</strong> selected</span>
          <span style={{ color: 'var(--text-muted)' }}>&bull;</span>
          <span style={{ color: 'var(--text-secondary)' }}>Drag to move</span>
          {onVertexDelete && (
            <>
              <span style={{ color: 'var(--text-muted)' }}>&bull;</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onVertexDelete(selectedVertex.id);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  cursor: 'pointer',
                }}
                title="Remove vertex from canvas (Backspace)"
              >
                <span>Delete</span>
                <kbd style={{ fontSize: '0.65rem', padding: '1px 4px', background: 'rgba(239,68,68,0.2)', borderRadius: '3px' }}>⌫ Backspace</kbd>
              </button>
            </>
          )}
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox="0 0 700 450"
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height: '100%',
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          backgroundColor: 'var(--canvas-bg)',
          cursor: mode === 'ADD_VERTEX' && !readOnly ? 'crosshair' : mode === 'ADD_EDGE' ? 'pointer' : 'default',
          userSelect: 'none',
          display: 'block',
        }}
        onClick={handleSvgClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Previous Clean Vector Grid Pattern (Dynamic stroke visible in both Light & Dark modes) */}
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="var(--canvas-grid-stroke)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="var(--canvas-bg)" />
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Render Graph Edges */}
        {graph.edges.map((edge) => {
          const source = vertexMap.get(edge.source);
          const target = vertexMap.get(edge.target);
          if (!source || !target) return null;

          const edgeState = visualStates.getEdgeState(edge.id);

          let strokeColor = 'var(--edge-default)';
          let strokeWidth = 2;
          let strokeDasharray = 'none';
          let animatedClass = '';

          if (edgeState === 'CONSIDERING') {
            strokeColor = 'var(--edge-considering)';
            strokeWidth = 3.5;
            animatedClass = 'edge-considering-animated';
          } else if (edgeState === 'ACCEPTED') {
            strokeColor = 'var(--edge-accepted)';
            strokeWidth = 4;
          } else if (edgeState === 'REJECTED') {
            strokeColor = 'var(--edge-rejected)';
            strokeWidth = 2.5;
            strokeDasharray = '4 4';
          }

          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;

          return (
            <g key={edge.id} style={{ cursor: readOnly ? 'default' : 'pointer' }}>
              {/* Touch hit area line for accurate clicks */}
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="transparent"
                strokeWidth="16"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEdgeClick) onEdgeClick(edge.id, e);
                }}
              />

              {/* Edge Line */}
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                className={animatedClass}
                style={{ transition: 'stroke 150ms ease, stroke-width 150ms ease' }}
              />

              {/* Edge Weight Badge */}
              <g
                transform={`translate(${midX}, ${midY})`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onEdgeClick) onEdgeClick(edge.id, e);
                }}
              >
                <rect
                  x="-12"
                  y="-10"
                  width="24"
                  height="20"
                  rx="4"
                  fill="var(--bg-secondary)"
                  stroke={edgeState !== 'DEFAULT' ? strokeColor : 'var(--border-subtle)'}
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="3"
                  textAnchor="middle"
                  fill={edgeState !== 'DEFAULT' ? strokeColor : 'var(--text-primary)'}
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                >
                  {edge.weight}
                </text>
              </g>
            </g>
          );
        })}

        {/* Render Graph Vertices */}
        {graph.vertices.map((vertex) => {
          const isSelected = selectedVertexId === vertex.id;
          const isDragging = draggingVertexId === vertex.id;
          const vertexState = visualStates.getVertexState(vertex.id);
          const groupColor = visualStates.getVertexGroupColor(vertex.id);

          let fillColor = 'var(--node-bg-default)';
          let strokeColor = groupColor || 'var(--node-border-default)';
          let strokeWidth = 2.5;
          let radius = 18;
          let textColor = 'var(--node-text)';

          if (vertexState === 'VISITED') {
            fillColor = 'var(--node-bg-visited)';
            strokeColor = groupColor || 'var(--node-border-visited)';
            strokeWidth = 3;
            textColor = 'var(--node-visited-text)';
          }

          if (isSelected) {
            strokeColor = '#06b6d4'; // Cyan highlight for selected node in Add Edge / Edit mode
            strokeWidth = 4;
            radius = 20;
          }

          return (
            <g
              key={vertex.id}
              transform={`translate(${vertex.x}, ${vertex.y})`}
              onMouseDown={(e) => handleMouseDownNode(vertex.id, e)}
              onClick={(e) => handleNodeClick(vertex.id, e)}
              style={{ cursor: readOnly ? 'grab' : isDragging ? 'grabbing' : mode === 'ADD_EDGE' ? 'crosshair' : 'pointer' }}
            >
              {/* Invisible large touch/click target (32px radius) for ultra-forgiving click accuracy */}
              <circle
                r={32}
                fill="transparent"
              />

              {/* Outer selection ring */}
              {isSelected && (
                <circle
                  r={radius + 5}
                  fill="none"
                  stroke="#06b6d4"
                  strokeOpacity="0.9"
                  strokeWidth="3"
                  strokeDasharray="3 3"
                />
              )}

              {/* Node Circle */}
              <circle
                r={radius}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                style={{
                  transition: 'all 120ms ease',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))',
                }}
              />

              {/* Node Label Text */}
              <text
                x="0"
                y="4.5"
                textAnchor="middle"
                fill={textColor}
                fontSize="12"
                fontWeight="700"
                fontFamily="var(--font-sans)"
                pointerEvents="none"
              >
                {vertex.label}
              </text>

              {/* Minimal Quick Delete Button on Selected Node */}
              {isSelected && !readOnly && onVertexDelete && (
                <g
                  transform={`translate(${radius - 3}, ${-radius + 3})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onVertexDelete(vertex.id);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <title>Delete vertex {vertex.label} (Backspace)</title>
                  <circle
                    r={8}
                    fill="#ef4444"
                    stroke="var(--bg-card)"
                    strokeWidth={1.5}
                  />
                  <path
                    d="M -2.5 -2.5 L 2.5 2.5 M 2.5 -2.5 L -2.5 2.5"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
