import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

interface FinanciluxHeroVisualProps {
  onOpenStudio?: () => void;
}

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  weight: number;
  midX: number;
  midY: number;
}

interface SimulationStep {
  edgeId?: string;
  action: 'CONSIDER' | 'ACCEPT' | 'REJECT' | 'COMPLETE' | 'INIT';
  description: string;
  acceptedEdges: string[];
  rejectedEdges: string[];
  activeEdge?: string;
  visitedNodes: string[];
  currentWeight: number;
}

export const FinanciluxHeroVisual: React.FC<FinanciluxHeroVisualProps> = ({
  onOpenStudio,
}) => {
  const [algo, setAlgo] = useState<'KRUSKAL' | 'PRIM'>('KRUSKAL');
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const nodes: Node[] = [
    { id: 'B', label: 'B', x: 155, y: 35 },
    { id: 'A', label: 'A', x: 55, y: 80 },
    { id: 'C', label: 'C', x: 255, y: 80 },
    { id: 'D', label: 'D', x: 55, y: 185 },
    { id: 'E', label: 'E', x: 155, y: 235 },
    { id: 'F', label: 'F', x: 255, y: 185 },
  ];

  const edges: Edge[] = [
    { id: 'e_bd', source: 'B', target: 'D', weight: 1, midX: 105, midY: 125 },
    { id: 'e_ad', source: 'A', target: 'D', weight: 2, midX: 45, midY: 132 },
    { id: 'e_cf', source: 'C', target: 'F', weight: 2, midX: 265, midY: 132 },
    { id: 'e_be', source: 'B', target: 'E', weight: 3, midX: 162, midY: 135 },
    { id: 'e_ab', source: 'A', target: 'B', weight: 4, midX: 100, midY: 52 },
    { id: 'e_ce', source: 'C', target: 'E', weight: 4, midX: 210, midY: 155 },
    { id: 'e_de', source: 'D', target: 'E', weight: 5, midX: 102, midY: 215 },
    { id: 'e_bc', source: 'B', target: 'C', weight: 6, midX: 210, midY: 52 },
    { id: 'e_ef', source: 'E', target: 'F', weight: 7, midX: 210, midY: 215 },
  ];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Kruskal Simulation Steps
  const kruskalSteps: SimulationStep[] = [
    {
      action: 'INIT',
      description: '9 edges sorted. 6 disjoint sets ready.',
      acceptedEdges: [],
      rejectedEdges: [],
      visitedNodes: [],
      currentWeight: 0,
    },
    {
      edgeId: 'e_bd',
      action: 'ACCEPT',
      activeEdge: 'e_bd',
      description: 'Accepted B-D (wt: 1): unifies {B} and {D}.',
      acceptedEdges: ['e_bd'],
      rejectedEdges: [],
      visitedNodes: ['B', 'D'],
      currentWeight: 1,
    },
    {
      edgeId: 'e_ad',
      action: 'ACCEPT',
      activeEdge: 'e_ad',
      description: 'Accepted A-D (wt: 2): joins {A} into {A, B, D}.',
      acceptedEdges: ['e_bd', 'e_ad'],
      rejectedEdges: [],
      visitedNodes: ['A', 'B', 'D'],
      currentWeight: 3,
    },
    {
      edgeId: 'e_cf',
      action: 'ACCEPT',
      activeEdge: 'e_cf',
      description: 'Accepted C-F (wt: 2): connects {C} and {F}.',
      acceptedEdges: ['e_bd', 'e_ad', 'e_cf'],
      rejectedEdges: [],
      visitedNodes: ['A', 'B', 'D', 'C', 'F'],
      currentWeight: 5,
    },
    {
      edgeId: 'e_be',
      action: 'ACCEPT',
      activeEdge: 'e_be',
      description: 'Accepted B-E (wt: 3): connects {E} into MST.',
      acceptedEdges: ['e_bd', 'e_ad', 'e_cf', 'e_be'],
      rejectedEdges: [],
      visitedNodes: ['A', 'B', 'D', 'C', 'F', 'E'],
      currentWeight: 8,
    },
    {
      edgeId: 'e_ab',
      action: 'REJECT',
      activeEdge: 'e_ab',
      description: 'Rejected A-B (wt: 4): cycle in {A, B, D, E}.',
      acceptedEdges: ['e_bd', 'e_ad', 'e_cf', 'e_be'],
      rejectedEdges: ['e_ab'],
      visitedNodes: ['A', 'B', 'D', 'C', 'F', 'E'],
      currentWeight: 8,
    },
    {
      edgeId: 'e_ce',
      action: 'ACCEPT',
      activeEdge: 'e_ce',
      description: 'Accepted C-E (wt: 4): unifies all components.',
      acceptedEdges: ['e_bd', 'e_ad', 'e_cf', 'e_be', 'e_ce'],
      rejectedEdges: ['e_ab'],
      visitedNodes: ['A', 'B', 'D', 'C', 'F', 'E'],
      currentWeight: 12,
    },
    {
      action: 'COMPLETE',
      description: 'MST Complete! 6 vertices, 5 edges, Weight = 12.',
      acceptedEdges: ['e_bd', 'e_ad', 'e_cf', 'e_be', 'e_ce'],
      rejectedEdges: ['e_ab'],
      visitedNodes: ['A', 'B', 'C', 'D', 'E', 'F'],
      currentWeight: 12,
    },
  ];

  // Prim Simulation Steps
  const primSteps: SimulationStep[] = [
    {
      action: 'INIT',
      description: 'Started at root A. Cut frontier initialized.',
      acceptedEdges: [],
      rejectedEdges: [],
      visitedNodes: ['A'],
      currentWeight: 0,
    },
    {
      edgeId: 'e_ad',
      action: 'ACCEPT',
      activeEdge: 'e_ad',
      description: 'Min cut edge A-D (wt: 2). Vertex D added.',
      acceptedEdges: ['e_ad'],
      rejectedEdges: [],
      visitedNodes: ['A', 'D'],
      currentWeight: 2,
    },
    {
      edgeId: 'e_bd',
      action: 'ACCEPT',
      activeEdge: 'e_bd',
      description: 'Min cut edge D-B (wt: 1). Vertex B joins cut.',
      acceptedEdges: ['e_ad', 'e_bd'],
      rejectedEdges: [],
      visitedNodes: ['A', 'D', 'B'],
      currentWeight: 3,
    },
    {
      edgeId: 'e_be',
      action: 'ACCEPT',
      activeEdge: 'e_be',
      description: 'Min cut edge B-E (wt: 3). Vertex E joins cut.',
      acceptedEdges: ['e_ad', 'e_bd', 'e_be'],
      rejectedEdges: [],
      visitedNodes: ['A', 'D', 'B', 'E'],
      currentWeight: 6,
    },
    {
      edgeId: 'e_ce',
      action: 'ACCEPT',
      activeEdge: 'e_ce',
      description: 'Min cut edge E-C (wt: 4). Vertex C joins cut.',
      acceptedEdges: ['e_ad', 'e_bd', 'e_be', 'e_ce'],
      rejectedEdges: [],
      visitedNodes: ['A', 'D', 'B', 'E', 'C'],
      currentWeight: 10,
    },
    {
      edgeId: 'e_cf',
      action: 'ACCEPT',
      activeEdge: 'e_cf',
      description: 'Min cut edge C-F (wt: 2). Vertex F joins cut.',
      acceptedEdges: ['e_ad', 'e_bd', 'e_be', 'e_ce', 'e_cf'],
      rejectedEdges: [],
      visitedNodes: ['A', 'D', 'B', 'E', 'C', 'F'],
      currentWeight: 12,
    },
    {
      action: 'COMPLETE',
      description: 'MST Complete! Greedy cut expansion finished.',
      acceptedEdges: ['e_ad', 'e_bd', 'e_be', 'e_ce', 'e_cf'],
      rejectedEdges: [],
      visitedNodes: ['A', 'D', 'B', 'E', 'C', 'F'],
      currentWeight: 12,
    },
  ];

  const activeSteps = algo === 'KRUSKAL' ? kruskalSteps : primSteps;
  const currentStep = activeSteps[Math.min(stepIndex, activeSteps.length - 1)];

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStepIndex((prev) => (prev >= activeSteps.length - 1 ? 0 : prev + 1));
      }, 1600);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, activeSteps.length]);

  const handleTogglePlay = () => setIsPlaying(!isPlaying);

  const handleNextStep = () => {
    setIsPlaying(false);
    setStepIndex((prev) => (prev + 1) % activeSteps.length);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStepIndex(0);
  };

  const handleSwitchAlgo = (newAlgo: 'KRUSKAL' | 'PRIM') => {
    setAlgo(newAlgo);
    setStepIndex(0);
  };

  const acceptedSet = new Set(currentStep.acceptedEdges);
  const rejectedSet = new Set(currentStep.rejectedEdges);
  const visitedSet = new Set(currentStep.visitedNodes);

  return (
    <div className="fin-hero-composition">
      {/* Primary Interactive Graph Studio Card */}
      <div className="fin-portrait-card">
        {/* Card Header Toolbar */}
        <div className="fin-card-toolbar">
          <div className="fin-toolbar-left">
            <div className="fin-window-dots" aria-hidden="true">
              <span className="fin-dot fin-dot-red" />
              <span className="fin-dot fin-dot-amber" />
              <span className="fin-dot fin-dot-green" />
            </div>
            <span className="fin-live-tag">
              <span className="fin-live-beacon" />
              <span>MST Simulator</span>
            </span>
          </div>

          <div className="fin-algo-switch" role="tablist">
            <button
              role="tab"
              aria-selected={algo === 'KRUSKAL'}
              className={`fin-algo-btn ${algo === 'KRUSKAL' ? 'active' : ''}`}
              onClick={() => handleSwitchAlgo('KRUSKAL')}
            >
              Kruskal
            </button>
            <button
              role="tab"
              aria-selected={algo === 'PRIM'}
              className={`fin-algo-btn ${algo === 'PRIM' ? 'active' : ''}`}
              onClick={() => handleSwitchAlgo('PRIM')}
            >
              Prim
            </button>
          </div>

          <div className="fin-controls-row">
            <button className="fin-icon-btn" onClick={handleReset} title="Reset simulation" aria-label="Reset simulation">
              <RotateCcw size={12} />
            </button>
            <button
              className="fin-icon-btn primary"
              onClick={handleTogglePlay}
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <button className="fin-icon-btn" onClick={handleNextStep} title="Next step" aria-label="Next step">
              <SkipForward size={12} />
            </button>
            <span className="fin-step-counter">
              {stepIndex + 1}/{activeSteps.length}
            </span>
          </div>
        </div>

        {/* SVG Interactive Canvas */}
        <div className="fin-card-canvas">
          <svg viewBox="0 0 310 270" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <pattern id="fin-grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="var(--fin-border-hairline, rgba(18, 18, 18, 0.06))"
                  strokeWidth="0.8"
                />
              </pattern>
            </defs>

            {/* Subtle Grid */}
            <rect width="100%" height="100%" fill="transparent" />
            <rect width="100%" height="100%" fill="url(#fin-grid-pattern)" />

            {/* Edges */}
            {edges.map((e) => {
              const s = nodeMap.get(e.source)!;
              const t = nodeMap.get(e.target)!;
              const isAccepted = acceptedSet.has(e.id);
              const isRejected = rejectedSet.has(e.id);
              const isActive = currentStep.activeEdge === e.id;
              const isHovered = hoveredEdgeId === e.id;

              let stroke = 'var(--fin-edge-default, #cfc9be)';
              let strokeWidth = 2;
              let strokeDasharray = undefined;

              if (isAccepted) {
                stroke = '#10b981';
                strokeWidth = 3.5;
              } else if (isRejected) {
                stroke = '#ef4444';
                strokeWidth = 2;
                strokeDasharray = '4 3';
              } else if (isActive) {
                stroke = '#3b82f6';
                strokeWidth = 3;
              } else if (isHovered) {
                stroke = '#60a5fa';
                strokeWidth = 2.5;
              }

              return (
                <g
                  key={e.id}
                  onMouseEnter={() => setHoveredEdgeId(e.id)}
                  onMouseLeave={() => setHoveredEdgeId(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="transparent" strokeWidth="16" />
                  <line
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    style={{ transition: 'stroke 0.25s ease, stroke-width 0.25s ease' }}
                  />
                  {/* Weight Badge */}
                  <rect
                    x={e.midX - 10}
                    y={e.midY - 9}
                    width="20"
                    height="18"
                    rx="4"
                    fill="var(--fin-card-white, #ffffff)"
                    stroke={
                      isAccepted
                        ? '#10b981'
                        : isRejected
                        ? '#ef4444'
                        : isActive
                        ? '#3b82f6'
                        : 'var(--fin-node-border, #b8b1a4)'
                    }
                    strokeWidth="1"
                  />
                  <text
                    x={e.midX}
                    y={e.midY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={
                      isAccepted
                        ? '#10b981'
                        : isRejected
                        ? '#ef4444'
                        : isActive
                        ? '#3b82f6'
                        : 'var(--fin-text-main, #121212)'
                    }
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="var(--font-mono, monospace)"
                  >
                    {e.weight}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((n) => {
              const isVisited = visitedSet.has(n.id);
              const isHovered = hoveredNodeId === n.id;

              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x}, ${n.y})`}
                  onMouseEnter={() => setHoveredNodeId(n.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {isVisited && (
                    <circle
                      r="19"
                      fill="none"
                      stroke={algo === 'KRUSKAL' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(16, 185, 129, 0.4)'}
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}
                  <circle
                    r="15"
                    fill={
                      isVisited
                        ? algo === 'KRUSKAL'
                          ? 'rgba(59, 130, 246, 0.15)'
                          : 'rgba(16, 185, 129, 0.15)'
                        : 'var(--fin-card-white, #ffffff)'
                    }
                    stroke={
                      isVisited
                        ? algo === 'KRUSKAL'
                          ? '#3b82f6'
                          : '#10b981'
                        : isHovered
                        ? '#3b82f6'
                        : 'var(--fin-node-border, #b8b1a4)'
                    }
                    strokeWidth={isVisited ? 2.5 : 1.75}
                    style={{ transition: 'all 0.2s ease' }}
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="var(--fin-text-main, #121212)"
                    fontSize="11"
                    fontWeight="800"
                    fontFamily="var(--font-sans, sans-serif)"
                  >
                    {n.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Card Footer Information Dock */}
        <div className="fin-card-footer">
          <div className="fin-card-status-bar">
            <span className="fin-step-action-tag" data-action={currentStep.action}>
              {currentStep.action === 'ACCEPT'
                ? 'ACCEPTED'
                : currentStep.action === 'REJECT'
                ? 'CYCLE REJECTED'
                : currentStep.action === 'COMPLETE'
                ? 'MST COMPLETE'
                : 'READY'}
            </span>
            <span className="fin-card-status-text">{currentStep.description}</span>
          </div>

          <div className="fin-card-metrics-row">
            <div className="fin-metric-chips-group">
              <span className="fin-metric-chip">
                <span className="fin-chip-label">Cost</span>
                <strong>{currentStep.currentWeight}</strong>
              </span>
              <span className="fin-metric-chip">
                <span className="fin-chip-label">Edges</span>
                <strong>{currentStep.acceptedEdges.length}/5</strong>
              </span>
              <span className="fin-metric-chip">
                <span className="fin-chip-label">Algo</span>
                <strong>{algo === 'KRUSKAL' ? 'O(E log E)' : 'O(E log V)'}</strong>
              </span>
            </div>

            {onOpenStudio && (
              <button
                className="fin-card-studio-link"
                onClick={onOpenStudio}
                title="Open in Visualizer Studio"
              >
                <span>Studio</span>
                <ExternalLink size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
