import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MousePointer,
  PlusCircle,
  Link,
  Shuffle,
  RotateCcw,
  Trash2,
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCw,
  TrendingUp,
  Maximize2,
  Minimize2,
  Layers,
} from 'lucide-react';
import { SVGCanvas } from '../graph/SVGCanvas';
import { PRESET_GRAPHS } from '../../core/presets';
import { StepExplanationView } from '../education/StepExplanationView';
import { DataStructuresView } from '../education/DataStructuresView';
import { MetricComparisonTable } from '../comparison/MetricComparisonTable';
import { ComplexityCardTab } from '../comparison/ComplexityCardTab';
import { VerticalSplitResizeHandle } from '../layout/VerticalSplitResizeHandle';
import { HorizontalSplitResizeHandle } from '../layout/HorizontalSplitResizeHandle';
import { MasterToolbar } from '../controls/MasterToolbar';
import { InspectorDock } from '../education/InspectorDock';
import { GraphAIChatbot } from '../ai/GraphAIChatbot';
import { AIChatToggleBtn } from '../ai/AIChatToggleBtn';
import type { GraphStateControls } from '../../visualization/useGraphState';
import type { ExecutionTrace } from '../../core/types';
import type { PlaybackControls } from '../../visualization/usePlayback';
import type { RandomGraphTopology } from '../../core/graphUtils';

interface TopologyItem {
  id: RandomGraphTopology;
  name: string;
  badge: string;
  desc: string;
  defaultNodes: number;
  icon: string;
}

const TOPOLOGY_OPTIONS: TopologyItem[] = [
  {
    id: 'random',
    name: 'Adaptive Random',
    badge: 'Surprise',
    desc: 'Randomized layout and density, guaranteed connected',
    defaultNodes: 8,
    icon: '🎲',
  },
  {
    id: 'large_network',
    name: 'Large Complex Network',
    badge: '18 Nodes',
    desc: '3-tier mesh with 30+ edges, ideal for full screen',
    defaultNodes: 18,
    icon: '🔬',
  },
  {
    id: 'grid',
    name: '2D Grid Lattice Mesh',
    badge: '12 Nodes',
    desc: 'Planar 4x3 matrix with horizontal & vertical connections',
    defaultNodes: 12,
    icon: '🔲',
  },
  {
    id: 'clusters',
    name: 'Community Clusters',
    badge: '12 Nodes',
    desc: 'Two dense clusters connected by a critical bridge edge',
    defaultNodes: 12,
    icon: '🪐',
  },
  {
    id: 'scale_free',
    name: 'Hub & Spoke Network',
    badge: '10 Nodes',
    desc: 'Central hubs with orbiting satellites and cross-spokes',
    defaultNodes: 10,
    icon: '🌟',
  },
  {
    id: 'bipartite',
    name: 'Bipartite Graph',
    badge: '10 Nodes',
    desc: 'Two disjoint vertex partitions with cross-cutting edges',
    defaultNodes: 10,
    icon: '↔️',
  },
  {
    id: 'dense',
    name: 'Dense Complete Clique',
    badge: '7 Nodes',
    desc: 'High edge density (~85%) showcasing Prim efficiency',
    defaultNodes: 7,
    icon: '⚡',
  },
  {
    id: 'sparse',
    name: 'Sparse Planar Web',
    badge: '8 Nodes',
    desc: 'Low edge density with tree backbone and few chords',
    defaultNodes: 8,
    icon: '🌐',
  },
  {
    id: 'ring_cycle',
    name: 'Ring Cycle & Chords',
    badge: '8 Nodes',
    desc: 'Perimeter cycle with cross-cutting diametric shortcuts',
    defaultNodes: 8,
    icon: '🔄',
  },
];

const PRESET_ICONS: Record<string, string> = {
  'preset-standard': '📐',
  'preset-dense': '💎',
  'preset-cycle': '🔄',
  'preset-disconnected': '🏝️',
};


interface MinimalStudioProps {
  graphState: GraphStateControls;
  kruskalTrace: ExecutionTrace;
  primTrace: ExecutionTrace;
  kruskalPlayback: PlaybackControls;
  primPlayback: PlaybackControls;
  startVertexId?: string;
  onStartVertexChange: (vertexId: string) => void;
  onEdgeClick: (edgeId: string) => void;
  viewMode: 'SIDE_BY_SIDE' | 'SINGLE_KRUSKAL' | 'SINGLE_PRIM';
  onViewModeChange?: (mode: 'SIDE_BY_SIDE' | 'SINGLE_KRUSKAL' | 'SINGLE_PRIM') => void;
}

export const MinimalStudio: React.FC<MinimalStudioProps> = ({
  graphState,
  kruskalTrace,
  primTrace,
  kruskalPlayback,
  primPlayback,
  startVertexId,
  onStartVertexChange,
  onEdgeClick,
  viewMode,
  onViewModeChange,
}) => {
  const {
    graph,
    mode,
    selectedVertexId,
    setMode,
    setSelectedVertexId,
    loadPreset,
    generateRandom,
    addVertex,
    deleteVertex,
    addEdge,
    moveVertex,
    resetGraph,
    clearGraph,
  } = graphState;

  const [isPresetsMenuOpen, setIsPresetsMenuOpen] = useState<boolean>(false);
  const [presetTab, setPresetTab] = useState<'presets' | 'random'>('presets');
  const [isCanvasFullscreen, setIsCanvasFullscreen] = useState<boolean>(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState<boolean>(false);
  const [splitWidth, setSplitWidth] = useState<number>(460);
  const [inspectorHeight, setInspectorHeight] = useState<number>(250);

  const presetsMenuRef = useRef<HTMLDivElement | null>(null);

  // Tab selections in side-by-side mode cards
  const [kruskalTab, setKruskalTab] = useState<'EXPLANATION' | 'DSU' | 'METRICS' | 'GRAPH'>('EXPLANATION');
  const [primTab, setPrimTab] = useState<'EXPLANATION' | 'QUEUE' | 'METRICS' | 'GRAPH'>('EXPLANATION');

  const speeds = [0.5, 1, 2, 4];

  // Current steps
  const kruskalStep = kruskalTrace.steps[kruskalPlayback.currentStepIndex] || kruskalTrace.steps[0];
  const primStep = primTrace.steps[primPlayback.currentStepIndex] || primTrace.steps[0];

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (presetsMenuRef.current && !presetsMenuRef.current.contains(e.target as Node)) {
        setIsPresetsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync with browser native fullscreen exit
  useEffect(() => {
    const handleBrowserFullscreenChange = () => {
      if (!document.fullscreenElement && isCanvasFullscreen) {
        setIsCanvasFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleBrowserFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleBrowserFullscreenChange);
  }, [isCanvasFullscreen]);

  const handleSelectTopology = (topo: RandomGraphTopology, count?: number) => {
    const defaultNodeCount = TOPOLOGY_OPTIONS.find((t) => t.id === topo)?.defaultNodes || 8;
    generateRandom(count || defaultNodeCount, topo);
    kruskalPlayback.reset();
    primPlayback.reset();
    setIsPresetsMenuOpen(false);
  };

  const handleToggleFullscreen = () => {
    setIsCanvasFullscreen((prev) => {
      const nextState = !prev;
      if (nextState) {
        try {
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } catch {
          // Handled gracefully
        }
      } else {
        try {
          if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
        } catch {
          // Handled gracefully
        }
      }
      return nextState;
    });
  };

  const handleCloseFullscreen = () => {
    setIsCanvasFullscreen(false);
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch {
      // Handled gracefully
    }
  };

  // Minimal and intuitive vertex deletion handler
  const handleDeleteVertex = useCallback((vertexId?: string | null) => {
    const targetId = vertexId || selectedVertexId;
    if (!targetId) return;

    // If removing the currently selected Prim start node, pick another remaining node
    if (startVertexId === targetId) {
      const remaining = graph.vertices.filter((v) => v.id !== targetId);
      onStartVertexChange(remaining.length > 0 ? remaining[0].id : '');
    }

    deleteVertex(targetId);
    setSelectedVertexId(null);
    kruskalPlayback.reset();
    primPlayback.reset();
  }, [selectedVertexId, startVertexId, graph.vertices, deleteVertex, setSelectedVertexId, onStartVertexChange, kruskalPlayback, primPlayback]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'Escape') {
        if (isCanvasFullscreen) {
          handleCloseFullscreen();
          return;
        }
        if (isAIChatOpen) {
          setIsAIChatOpen(false);
          return;
        }
        if (isPresetsMenuOpen) {
          setIsPresetsMenuOpen(false);
          return;
        }
      }

      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleToggleFullscreen();
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete' || e.code === 'Backspace' || e.code === 'Delete') {
        if (selectedVertexId) {
          e.preventDefault();
          handleDeleteVertex(selectedVertexId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCanvasFullscreen, isAIChatOpen, isPresetsMenuOpen, selectedVertexId, handleDeleteVertex]);

  const handleVertexClick = (vertexId: string) => {
    if (mode === 'ADD_EDGE') {
      if (selectedVertexId === null) {
        setSelectedVertexId(vertexId);
      } else if (selectedVertexId !== vertexId) {
        addEdge(selectedVertexId, vertexId, 5);
        setSelectedVertexId(null);
      } else {
        setSelectedVertexId(null);
      }
    } else {
      setSelectedVertexId(vertexId);
    }
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (mode === 'ADD_VERTEX') {
      addVertex(x, y);
    } else {
      setSelectedVertexId(null);
    }
  };

  const handleResetBoth = () => {
    resetGraph();
    kruskalPlayback.reset();
    primPlayback.reset();
  };

  const handleClearGraph = () => {
    clearGraph();
    onStartVertexChange('');
    setSelectedVertexId(null);
    kruskalPlayback.reset();
    primPlayback.reset();
  };

  return (
    <div className="mst-studio-layout">
      {/* Secondary Sub-toolbar */}
      <div className="mst-subtoolbar">
        {/* Left: Canvas Edit Modes */}
        <div className="mst-subtoolbar-left">
          <span className="mst-subtoolbar-label">Edit:</span>

          <button
            className={`mst-pill-btn ${mode === 'SELECT' ? 'active' : ''}`}
            onClick={() => setMode('SELECT')}
            title="Select and drag vertices"
          >
            <MousePointer size={13} />
            <span>Select & Move</span>
          </button>

          <button
            className={`mst-pill-btn ${mode === 'ADD_VERTEX' ? 'active' : ''}`}
            onClick={() => setMode('ADD_VERTEX')}
            title="Click on canvas to add a new vertex"
          >
            <PlusCircle size={13} />
            <span>Add Vertex</span>
          </button>

          <button
            className={`mst-pill-btn ${mode === 'ADD_EDGE' ? 'active' : ''}`}
            onClick={() => setMode('ADD_EDGE')}
            title="Click two vertices to connect with a weighted edge"
          >
            <Link size={13} />
            <span>Add Edge</span>
          </button>

          {/* Selected Vertex Quick Remove Pill */}
          {selectedVertexId && (
            <button
              className="mst-pill-btn danger-action"
              onClick={() => handleDeleteVertex(selectedVertexId)}
              title={`Remove Node ${graph.vertices.find((v) => v.id === selectedVertexId)?.label || ''} from canvas (Backspace)`}
            >
              <Trash2 size={13} />
              <span>
                Delete Node {graph.vertices.find((v) => v.id === selectedVertexId)?.label}
              </span>
              <kbd style={{ fontSize: '0.65rem', padding: '1px 5px', background: 'rgba(239, 68, 68, 0.25)', borderRadius: '3px', marginLeft: '2px' }}>⌫</kbd>
            </button>
          )}
        </div>

        {/* Right: Graph Presets & Mutation Actions */}
        <div className="mst-subtoolbar-right">
          {/* Graph AI Assistant Button */}
          <AIChatToggleBtn
            variant="SUBTOOLBAR"
            isOpen={isAIChatOpen}
            onToggle={() => setIsAIChatOpen((prev) => !prev)}
          />

          <div className="mst-subtoolbar-divider" />

          {/* Unified Preset & Topology Graph Selector */}
          <div style={{ position: 'relative' }} ref={presetsMenuRef}>
            <button
              className="mst-pill-btn"
              onClick={() => setIsPresetsMenuOpen((prev) => !prev)}
              title="Load textbook presets or generate random graph topologies"
              aria-expanded={isPresetsMenuOpen}
            >
              <Layers size={13} />
              <span>Preset Graphs</span>
              <ChevronDown size={12} />
            </button>

            {isPresetsMenuOpen && (
              <div className="mst-presets-menu">
                <div className="mst-presets-tabs-header">
                  <button
                    className={`mst-presets-tab-btn ${presetTab === 'presets' ? 'active' : ''}`}
                    onClick={() => setPresetTab('presets')}
                  >
                    <Layers size={12} />
                    <span>Textbook Presets</span>
                  </button>
                  <button
                    className={`mst-presets-tab-btn ${presetTab === 'random' ? 'active' : ''}`}
                    onClick={() => setPresetTab('random')}
                  >
                    <Shuffle size={12} />
                    <span>Random Topologies</span>
                  </button>
                </div>

                {presetTab === 'presets' ? (
                  <div className="mst-presets-list">
                    {PRESET_GRAPHS.map((p) => (
                      <button
                        key={p.id}
                        className="mst-random-item"
                        onClick={() => {
                          loadPreset(p.id);
                          setIsPresetsMenuOpen(false);
                          kruskalPlayback.reset();
                          primPlayback.reset();
                        }}
                      >
                        <span className="mst-random-item-icon">
                          {PRESET_ICONS[p.id] || '📐'}
                        </span>
                        <div className="mst-random-item-content">
                          <span className="mst-random-item-name">{p.name}</span>
                          <span className="mst-random-item-desc">{p.description}</span>
                        </div>
                        <span className="mst-random-item-badge">
                          {p.graph.vertices.length}V &bull; {p.graph.edges.length}E
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mst-presets-list">
                    {TOPOLOGY_OPTIONS.map((topo) => (
                      <button
                        key={topo.id}
                        className="mst-random-item"
                        onClick={() => handleSelectTopology(topo.id, topo.defaultNodes)}
                      >
                        <span className="mst-random-item-icon">{topo.icon}</span>
                        <div className="mst-random-item-content">
                          <span className="mst-random-item-name">{topo.name}</span>
                          <span className="mst-random-item-desc">{topo.desc}</span>
                        </div>
                        <span className="mst-random-item-badge">{topo.badge}</span>
                      </button>
                    ))}

                    <div className="mst-random-menu-footer">
                      <span className="mst-random-footer-label">Quick Sizes:</span>
                      <div className="mst-count-pills-group">
                        {[6, 8, 12, 16, 20].map((count) => (
                          <button
                            key={count}
                            className="mst-count-pill"
                            onClick={() => handleSelectTopology('random', count)}
                            title={`Generate ${count}-node random graph`}
                          >
                            {count}N
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            className="mst-pill-btn"
            onClick={handleResetBoth}
            title="Reset playback timeline and graph states"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            className="mst-pill-btn danger"
            onClick={handleClearGraph}
            title="Clear all graph nodes and edges"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Main Studio Work Area */}

      {/* 1. Side-by-Side Dual View (Matches bottom half of mockup image) */}
      {viewMode === 'SIDE_BY_SIDE' && (
        <div className="mst-dual-stage">
          {/* Kruskal Algorithm Card */}
          <div className="mst-algo-card">
            <div className="mst-algo-card-header">
              <div className="mst-algo-card-title-group">
                <span className="mst-algo-title">Kruskal's Algorithm</span>
                <span className="mst-algo-badge">Edge-Centric DSU</span>
                <span className="mst-weight-chip">MST: {kruskalStep.currentWeight}</span>
              </div>
              <button
                className="mst-card-fullscreen-btn"
                onClick={handleToggleFullscreen}
                title="Maximize canvas to full screen (F)"
              >
                <Maximize2 size={12} />
                <span>Full Screen</span>
              </button>
            </div>

            {/* Kruskal Canvas */}
            <div className="mst-algo-canvas-wrap">
              <SVGCanvas
                graph={graph}
                currentStep={kruskalStep}
                mode={mode}
                selectedVertexId={selectedVertexId}
                onCanvasClick={handleCanvasClick}
                onVertexClick={handleVertexClick}
                onVertexMove={moveVertex}
                onEdgeClick={onEdgeClick}
                onVertexDelete={handleDeleteVertex}
              />
            </div>

            {/* Draggable Slidebar between Canvas and Information Panel */}
            <HorizontalSplitResizeHandle
              inspectorHeight={inspectorHeight}
              onInspectorHeightChange={setInspectorHeight}
            />

            {/* In-Card Playback Toolbar */}
            <div className="mst-card-playback-bar">
              <div className="mst-playback-left">
                <button
                  className="mst-btn-icon"
                  onClick={kruskalPlayback.reset}
                  title="Restart (R)"
                  aria-label="Restart"
                >
                  <RotateCw size={14} />
                </button>
                <button
                  className="mst-btn-icon"
                  onClick={kruskalPlayback.stepBackward}
                  disabled={kruskalPlayback.currentStepIndex === 0}
                  title="Step Back (Left Arrow)"
                  aria-label="Previous step"
                >
                  <SkipBack size={14} />
                </button>
                <button
                  className="mst-btn-play-card"
                  onClick={kruskalPlayback.togglePlay}
                  title="Play / Pause (Space)"
                  aria-label={kruskalPlayback.isPlaying ? 'Pause' : 'Play'}
                >
                  {kruskalPlayback.isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  className="mst-btn-icon"
                  onClick={kruskalPlayback.stepForward}
                  disabled={kruskalPlayback.currentStepIndex >= kruskalTrace.steps.length - 1}
                  title="Step Forward (Right Arrow)"
                  aria-label="Next step"
                >
                  <SkipForward size={14} />
                </button>
              </div>

              {/* Scrubber & Step Tracker */}
              <div className="mst-playback-center">
                <span className="mst-step-counter">
                  Step {kruskalPlayback.currentStepIndex + 1} / {kruskalTrace.steps.length}
                </span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, kruskalTrace.steps.length - 1)}
                  value={kruskalPlayback.currentStepIndex}
                  onChange={(e) => kruskalPlayback.goToStep(Number(e.target.value))}
                  className="mst-scrubber-slider"
                  aria-label="Scrub through Kruskal execution steps"
                />
              </div>

              {/* Speed Multiplier */}
              <div className="mst-playback-right">
                <span className="mst-speed-label">Speed:</span>
                {speeds.map((s) => (
                  <button
                    key={s}
                    className={`mst-speed-btn ${kruskalPlayback.speed === s ? 'active' : ''}`}
                    onClick={() => kruskalPlayback.setSpeed(s)}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* In-Card Inspector Tabs */}
            <div className="mst-card-tabs-bar">
              <button
                className={`mst-card-tab ${kruskalTab === 'EXPLANATION' ? 'active' : ''}`}
                onClick={() => setKruskalTab('EXPLANATION')}
              >
                Step Explanation
              </button>
              <button
                className={`mst-card-tab ${kruskalTab === 'DSU' ? 'active' : ''}`}
                onClick={() => setKruskalTab('DSU')}
              >
                DSU State
              </button>
              <button
                className={`mst-card-tab ${kruskalTab === 'METRICS' ? 'active' : ''}`}
                onClick={() => setKruskalTab('METRICS')}
              >
                Metrics
              </button>
              <button
                className={`mst-card-tab ${kruskalTab === 'GRAPH' ? 'active' : ''}`}
                onClick={() => setKruskalTab('GRAPH')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <TrendingUp size={11} /> Complexity Graph
              </button>

              {/* Right: Height Slide Presets */}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginRight: '2px' }}>Height:</span>
                <button
                  className={`mst-height-pill ${inspectorHeight <= 180 ? 'active' : ''}`}
                  onClick={() => setInspectorHeight(160)}
                  title="Compact information view (160px)"
                >
                  Compact
                </button>
                <button
                  className={`mst-height-pill ${inspectorHeight > 180 && inspectorHeight <= 300 ? 'active' : ''}`}
                  onClick={() => setInspectorHeight(250)}
                  title="Normal information view (250px)"
                >
                  Normal
                </button>
                <button
                  className={`mst-height-pill ${inspectorHeight > 300 ? 'active' : ''}`}
                  onClick={() => setInspectorHeight(380)}
                  title="Expanded information view (380px)"
                >
                  Expanded
                </button>
              </div>
            </div>

            {/* In-Card Tab Body */}
            <div className="mst-card-inspector-content" style={{ height: `${inspectorHeight}px` }}>
              {kruskalTab === 'EXPLANATION' && (
                <StepExplanationView
                  graph={graph}
                  kruskalTrace={kruskalTrace}
                  primTrace={primTrace}
                  kruskalStep={kruskalStep}
                  primStep={primStep}
                  kruskalStepIndex={kruskalPlayback.currentStepIndex}
                  primStepIndex={primPlayback.currentStepIndex}
                  algorithm="KRUSKAL"
                />
              )}
              {kruskalTab === 'DSU' && (
                <DataStructuresView
                  graph={graph}
                  kruskalStep={kruskalStep}
                  primStep={primStep}
                  algorithm="KRUSKAL"
                />
              )}
              {kruskalTab === 'METRICS' && (
                <MetricComparisonTable
                  kruskalTrace={kruskalTrace}
                  primTrace={primTrace}
                  algorithm="KRUSKAL"
                />
              )}
              {kruskalTab === 'GRAPH' && (
                <ComplexityCardTab
                  graph={graph}
                  algorithm="KRUSKAL"
                  kruskalTrace={kruskalTrace}
                  primTrace={primTrace}
                />
              )}
            </div>
          </div>

          {/* Prim Algorithm Card */}
          <div className="mst-algo-card">
            <div className="mst-algo-card-header">
              <div className="mst-algo-card-title-group">
                <span className="mst-algo-title">Prim's Algorithm</span>
                <span className="mst-algo-badge">Vertex-Centric Cut</span>
                <span className="mst-weight-chip">MST: {primStep.currentWeight}</span>
                <span className="mst-algo-start-chip">
                  Start: {graph.vertices.find((v) => v.id === startVertexId)?.label || graph.vertices[0]?.label || 'A'}
                </span>
              </div>
              <button
                className="mst-card-fullscreen-btn"
                onClick={handleToggleFullscreen}
                title="Maximize canvas to full screen (F)"
              >
                <Maximize2 size={12} />
                <span>Full Screen</span>
              </button>
            </div>

            {/* Prim Canvas */}
            <div className="mst-algo-canvas-wrap">
              <SVGCanvas
                graph={graph}
                currentStep={primStep}
                mode={mode}
                selectedVertexId={selectedVertexId}
                onCanvasClick={handleCanvasClick}
                onVertexClick={handleVertexClick}
                onVertexMove={moveVertex}
                onEdgeClick={onEdgeClick}
                onVertexDelete={handleDeleteVertex}
              />
            </div>

            {/* Draggable Slidebar between Canvas and Information Panel */}
            <HorizontalSplitResizeHandle
              inspectorHeight={inspectorHeight}
              onInspectorHeightChange={setInspectorHeight}
            />

            {/* In-Card Playback Toolbar */}
            <div className="mst-card-playback-bar">
              <div className="mst-playback-left">
                <button
                  className="mst-btn-icon"
                  onClick={primPlayback.reset}
                  title="Restart (R)"
                  aria-label="Restart"
                >
                  <RotateCw size={14} />
                </button>
                <button
                  className="mst-btn-icon"
                  onClick={primPlayback.stepBackward}
                  disabled={primPlayback.currentStepIndex === 0}
                  title="Step Back (Left Arrow)"
                  aria-label="Previous step"
                >
                  <SkipBack size={14} />
                </button>
                <button
                  className="mst-btn-play-card"
                  onClick={primPlayback.togglePlay}
                  title="Play / Pause (Space)"
                  aria-label={primPlayback.isPlaying ? 'Pause' : 'Play'}
                >
                  {primPlayback.isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  className="mst-btn-icon"
                  onClick={primPlayback.stepForward}
                  disabled={primPlayback.currentStepIndex >= primTrace.steps.length - 1}
                  title="Step Forward (Right Arrow)"
                  aria-label="Next step"
                >
                  <SkipForward size={14} />
                </button>
              </div>

              {/* Scrubber & Step Tracker */}
              <div className="mst-playback-center">
                <span className="mst-step-counter">
                  Step {primPlayback.currentStepIndex + 1} / {primTrace.steps.length}
                </span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, primTrace.steps.length - 1)}
                  value={primPlayback.currentStepIndex}
                  onChange={(e) => primPlayback.goToStep(Number(e.target.value))}
                  className="mst-scrubber-slider"
                  aria-label="Scrub through Prim execution steps"
                />
              </div>

              {/* Speed Multiplier */}
              <div className="mst-playback-right">
                <span className="mst-speed-label">Speed:</span>
                {speeds.map((s) => (
                  <button
                    key={s}
                    className={`mst-speed-btn ${primPlayback.speed === s ? 'active' : ''}`}
                    onClick={() => primPlayback.setSpeed(s)}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* In-Card Inspector Tabs */}
            <div className="mst-card-tabs-bar">
              <button
                className={`mst-card-tab ${primTab === 'EXPLANATION' ? 'active' : ''}`}
                onClick={() => setPrimTab('EXPLANATION')}
              >
                Step Explanation
              </button>
              <button
                className={`mst-card-tab ${primTab === 'QUEUE' ? 'active' : ''}`}
                onClick={() => setPrimTab('QUEUE')}
              >
                Priority Queue
              </button>
              <button
                className={`mst-card-tab ${primTab === 'METRICS' ? 'active' : ''}`}
                onClick={() => setPrimTab('METRICS')}
              >
                Metrics
              </button>
              <button
                className={`mst-card-tab ${primTab === 'GRAPH' ? 'active' : ''}`}
                onClick={() => setPrimTab('GRAPH')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <TrendingUp size={11} /> Complexity Graph
              </button>

              {/* Right: Height Slide Presets */}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginRight: '2px' }}>Height:</span>
                <button
                  className={`mst-height-pill ${inspectorHeight <= 180 ? 'active' : ''}`}
                  onClick={() => setInspectorHeight(160)}
                  title="Compact information view (160px)"
                >
                  Compact
                </button>
                <button
                  className={`mst-height-pill ${inspectorHeight > 180 && inspectorHeight <= 300 ? 'active' : ''}`}
                  onClick={() => setInspectorHeight(250)}
                  title="Normal information view (250px)"
                >
                  Normal
                </button>
                <button
                  className={`mst-height-pill ${inspectorHeight > 300 ? 'active' : ''}`}
                  onClick={() => setInspectorHeight(380)}
                  title="Expanded information view (380px)"
                >
                  Expanded
                </button>
              </div>
            </div>

            {/* In-Card Tab Body */}
            <div className="mst-card-inspector-content" style={{ height: `${inspectorHeight}px` }}>
              {primTab === 'EXPLANATION' && (
                <StepExplanationView
                  graph={graph}
                  kruskalTrace={kruskalTrace}
                  primTrace={primTrace}
                  kruskalStep={kruskalStep}
                  primStep={primStep}
                  kruskalStepIndex={kruskalPlayback.currentStepIndex}
                  primStepIndex={primPlayback.currentStepIndex}
                  algorithm="PRIM"
                />
              )}
              {primTab === 'QUEUE' && (
                <DataStructuresView
                  graph={graph}
                  kruskalStep={kruskalStep}
                  primStep={primStep}
                  algorithm="PRIM"
                />
              )}
              {primTab === 'METRICS' && (
                <MetricComparisonTable
                  kruskalTrace={kruskalTrace}
                  primTrace={primTrace}
                  algorithm="PRIM"
                />
              )}
              {primTab === 'GRAPH' && (
                <ComplexityCardTab
                  graph={graph}
                  algorithm="PRIM"
                  kruskalTrace={kruskalTrace}
                  primTrace={primTrace}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Single Algorithm Split View (Canvas on Left, Controls & Info on Right) */}
      {(viewMode === 'SINGLE_KRUSKAL' || viewMode === 'SINGLE_PRIM') && (
        <div className="studio-split-layout">
          {/* Left Column: Full-Height Interactive Canvas */}
          <div className="studio-split-canvas" style={{ position: 'relative' }}>
            <button
              className="mst-card-fullscreen-btn"
              onClick={handleToggleFullscreen}
              style={{ position: 'absolute', top: '10px', right: '14px', zIndex: 10 }}
              title="Open canvas in full screen (F)"
            >
              <Maximize2 size={12} />
              <span>Full Screen</span>
            </button>

            {viewMode === 'SINGLE_KRUSKAL' ? (
              <SVGCanvas
                graph={graph}
                currentStep={kruskalStep}
                mode={mode}
                selectedVertexId={selectedVertexId}
                title="Kruskal's Algorithm View"
                badge="Edge-Centric DSU"
                onCanvasClick={handleCanvasClick}
                onVertexClick={handleVertexClick}
                onVertexMove={moveVertex}
                onEdgeClick={onEdgeClick}
                onVertexDelete={handleDeleteVertex}
              />
            ) : (
              <SVGCanvas
                graph={graph}
                currentStep={primStep}
                mode={mode}
                selectedVertexId={selectedVertexId}
                title="Prim's Algorithm View"
                badge="Vertex-Centric Min-Heap Cut"
                onCanvasClick={handleCanvasClick}
                onVertexClick={handleVertexClick}
                onVertexMove={moveVertex}
                onEdgeClick={onEdgeClick}
                onVertexDelete={handleDeleteVertex}
              />
            )}
          </div>

          {/* Draggable Horizontal Splitter Handle */}
          <VerticalSplitResizeHandle
            splitWidth={splitWidth}
            onSplitWidthChange={setSplitWidth}
            position="right"
          />

          {/* Right Column: Dedicated Playback Toolbar + Inspector Panel */}
          <div
            className="studio-split-panel"
            style={{ width: `${splitWidth}px`, flex: `0 0 ${splitWidth}px` }}
          >
            {/* Playback Controls Toolbar for the active algorithm */}
            <MasterToolbar
              kruskalPlayback={kruskalPlayback}
              primPlayback={primPlayback}
              totalSteps={
                viewMode === 'SINGLE_KRUSKAL'
                  ? kruskalTrace.steps.length
                  : primTrace.steps.length
              }
              currentAlgorithm={viewMode === 'SINGLE_KRUSKAL' ? 'KRUSKAL' : 'PRIM'}
            />

            {/* Individual Algorithm Inspector Panel */}
            <div className="studio-split-dock">
              <InspectorDock
                graph={graph}
                kruskalTrace={kruskalTrace}
                primTrace={primTrace}
                kruskalStep={kruskalStep}
                primStep={primStep}
                kruskalStepIndex={kruskalPlayback.currentStepIndex}
                primStepIndex={primPlayback.currentStepIndex}
                viewMode={viewMode}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Full Screen Canvas Workbench Overlay */}
      {isCanvasFullscreen && (
        <div
          className="mst-fullscreen-workbench"
          role="dialog"
          aria-modal="true"
          aria-label="Full Screen Canvas Workbench"
        >
          {/* Full Screen Top Navigation Bar */}
          <div className="mst-fullscreen-header">
            <div className="mst-fullscreen-header-left">
              <div className="mst-fullscreen-title-group">
                <Maximize2 size={16} color="var(--color-primary)" />
                <span className="mst-fullscreen-title">Full Screen Canvas</span>
                <span className="mst-fullscreen-stats">
                  {graph.vertices.length} Nodes &bull; {graph.edges.length} Edges
                </span>
              </div>
            </div>

            {/* Visualizer View Switcher right inside Fullscreen */}
            <div className="mst-fullscreen-switcher">
              <button
                className={`mst-pill-btn ${viewMode === 'SIDE_BY_SIDE' ? 'active' : ''}`}
                onClick={() => onViewModeChange?.('SIDE_BY_SIDE')}
                title="Side-by-side comparison visualizer"
              >
                <span>Side-by-Side</span>
              </button>
              <button
                className={`mst-pill-btn ${viewMode === 'SINGLE_KRUSKAL' ? 'active' : ''}`}
                onClick={() => onViewModeChange?.('SINGLE_KRUSKAL')}
                title="Individual Kruskal visualizer"
              >
                <span>Kruskal</span>
              </button>
              <button
                className={`mst-pill-btn ${viewMode === 'SINGLE_PRIM' ? 'active' : ''}`}
                onClick={() => onViewModeChange?.('SINGLE_PRIM')}
                title="Individual Prim visualizer"
              >
                <span>Prim</span>
              </button>
            </div>

            {/* Header Right: Edit Modes & Exit Fullscreen Button */}
            <div className="mst-fullscreen-header-right">
              {/* Quick Topology Generator inside Fullscreen */}
              <button
                className="mst-pill-btn"
                onClick={() => handleSelectTopology('random')}
                title="Generate new adaptive random graph"
              >
                <Shuffle size={13} />
                <span>Generate Graph</span>
              </button>

              {/* Close Full Screen Button */}
              <button
                className="mst-pill-btn mst-fullscreen-close-btn"
                onClick={handleCloseFullscreen}
                title="Close Full Screen Canvas and return to Studio (Esc)"
              >
                <Minimize2 size={13} />
                <span>Close Full Screen</span>
                <kbd className="mst-kbd-shortcut">Esc</kbd>
              </button>
            </div>
          </div>

          {/* Full Screen Canvas Content Body */}
          <div className="mst-fullscreen-canvas-body">
            {viewMode === 'SIDE_BY_SIDE' ? (
              <div className="mst-fullscreen-dual-grid">
                {/* Kruskal Maximized Card */}
                <div className="mst-fullscreen-algo-card">
                  <div className="mst-algo-card-header">
                    <div className="mst-algo-card-title-group">
                      <span className="mst-algo-title">Kruskal's Algorithm</span>
                      <span className="mst-algo-badge">Edge-Centric DSU</span>
                      <span className="mst-weight-chip">MST Weight: {kruskalStep.currentWeight}</span>
                    </div>
                  </div>
                  <div className="mst-fullscreen-svg-wrap">
                    <SVGCanvas
                      graph={graph}
                      currentStep={kruskalStep}
                      mode={mode}
                      selectedVertexId={selectedVertexId}
                      onCanvasClick={handleCanvasClick}
                      onVertexClick={handleVertexClick}
                      onVertexMove={moveVertex}
                      onEdgeClick={onEdgeClick}
                      onVertexDelete={handleDeleteVertex}
                    />
                  </div>
                </div>

                {/* Prim Maximized Card */}
                <div className="mst-fullscreen-algo-card">
                  <div className="mst-algo-card-header">
                    <div className="mst-algo-card-title-group">
                      <span className="mst-algo-title">Prim's Algorithm</span>
                      <span className="mst-algo-badge">Vertex-Centric Cut</span>
                      <span className="mst-weight-chip">MST Weight: {primStep.currentWeight}</span>
                      <span className="mst-algo-start-chip">
                        Start: {graph.vertices.find((v) => v.id === startVertexId)?.label || graph.vertices[0]?.label || 'A'}
                      </span>
                    </div>
                  </div>
                  <div className="mst-fullscreen-svg-wrap">
                    <SVGCanvas
                      graph={graph}
                      currentStep={primStep}
                      mode={mode}
                      selectedVertexId={selectedVertexId}
                      onCanvasClick={handleCanvasClick}
                      onVertexClick={handleVertexClick}
                      onVertexMove={moveVertex}
                      onEdgeClick={onEdgeClick}
                      onVertexDelete={handleDeleteVertex}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Single Full Screen Canvas (Kruskal or Prim) */
              <div className="mst-fullscreen-single-card">
                <div className="mst-algo-card-header">
                  <div className="mst-algo-card-title-group">
                    <span className="mst-algo-title">
                      {viewMode === 'SINGLE_KRUSKAL' ? "Kruskal's Algorithm Fullscreen" : "Prim's Algorithm Fullscreen"}
                    </span>
                    <span className="mst-algo-badge">
                      {viewMode === 'SINGLE_KRUSKAL' ? 'Edge-Centric DSU' : 'Vertex-Centric Cut'}
                    </span>
                    <span className="mst-weight-chip">
                      MST Weight: {viewMode === 'SINGLE_KRUSKAL' ? kruskalStep.currentWeight : primStep.currentWeight}
                    </span>
                    {viewMode === 'SINGLE_PRIM' && (
                      <span className="mst-algo-start-chip">
                        Start: {graph.vertices.find((v) => v.id === startVertexId)?.label || graph.vertices[0]?.label || 'A'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mst-fullscreen-svg-wrap">
                  <SVGCanvas
                    graph={graph}
                    currentStep={viewMode === 'SINGLE_KRUSKAL' ? kruskalStep : primStep}
                    mode={mode}
                    selectedVertexId={selectedVertexId}
                    onCanvasClick={handleCanvasClick}
                    onVertexClick={handleVertexClick}
                    onVertexMove={moveVertex}
                    onEdgeClick={onEdgeClick}
                    onVertexDelete={handleDeleteVertex}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Floating Bottom Playback HUD in Fullscreen */}
          <div className="mst-fullscreen-hud">
            <div className="mst-fullscreen-hud-inner">
              <div className="mst-playback-left">
                <button
                  className="mst-btn-icon"
                  onClick={() => {
                    kruskalPlayback.reset();
                    primPlayback.reset();
                  }}
                  title="Restart (R)"
                >
                  <RotateCw size={14} />
                </button>
                <button
                  className="mst-btn-icon"
                  onClick={() => {
                    if (viewMode === 'SINGLE_PRIM') primPlayback.stepBackward();
                    else kruskalPlayback.stepBackward();
                  }}
                  disabled={
                    viewMode === 'SINGLE_PRIM'
                      ? primPlayback.currentStepIndex === 0
                      : kruskalPlayback.currentStepIndex === 0
                  }
                  title="Step Back (Left Arrow)"
                >
                  <SkipBack size={14} />
                </button>
                <button
                  className="mst-btn-play-card"
                  onClick={() => {
                    if (viewMode === 'SIDE_BY_SIDE') {
                      if (kruskalPlayback.isPlaying || primPlayback.isPlaying) {
                        kruskalPlayback.pause();
                        primPlayback.pause();
                      } else {
                        kruskalPlayback.play();
                        primPlayback.play();
                      }
                    } else if (viewMode === 'SINGLE_PRIM') {
                      primPlayback.togglePlay();
                    } else {
                      kruskalPlayback.togglePlay();
                    }
                  }}
                  title="Play / Pause (Space)"
                >
                  {(viewMode === 'SINGLE_PRIM' ? primPlayback.isPlaying : kruskalPlayback.isPlaying) ? (
                    <Pause size={14} />
                  ) : (
                    <Play size={14} />
                  )}
                </button>
                <button
                  className="mst-btn-icon"
                  onClick={() => {
                    if (viewMode === 'SINGLE_PRIM') primPlayback.stepForward();
                    else kruskalPlayback.stepForward();
                  }}
                  disabled={
                    viewMode === 'SINGLE_PRIM'
                      ? primPlayback.currentStepIndex >= primTrace.steps.length - 1
                      : kruskalPlayback.currentStepIndex >= kruskalTrace.steps.length - 1
                  }
                  title="Step Forward (Right Arrow)"
                >
                  <SkipForward size={14} />
                </button>
              </div>

              {/* Scrubber slider */}
              <div className="mst-playback-center" style={{ flex: 1, minWidth: '180px' }}>
                <span className="mst-step-counter">
                  Step {((viewMode === 'SINGLE_PRIM' ? primPlayback.currentStepIndex : kruskalPlayback.currentStepIndex) + 1)} / {(viewMode === 'SINGLE_PRIM' ? primTrace.steps.length : kruskalTrace.steps.length)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, (viewMode === 'SINGLE_PRIM' ? primTrace.steps.length : kruskalTrace.steps.length) - 1)}
                  value={viewMode === 'SINGLE_PRIM' ? primPlayback.currentStepIndex : kruskalPlayback.currentStepIndex}
                  onChange={(e) => {
                    const step = Number(e.target.value);
                    if (viewMode === 'SIDE_BY_SIDE') {
                      kruskalPlayback.goToStep(step);
                      primPlayback.goToStep(step);
                    } else if (viewMode === 'SINGLE_PRIM') {
                      primPlayback.goToStep(step);
                    } else {
                      kruskalPlayback.goToStep(step);
                    }
                  }}
                  className="mst-scrubber-slider"
                />
              </div>

              {/* Explanation Text Pill */}
              <div className="mst-fullscreen-hud-explanation">
                <span className="mst-hud-explanation-text">
                  {viewMode === 'SINGLE_PRIM' ? primStep.explanation : kruskalStep.explanation}
                </span>
              </div>

              {/* Speeds */}
              <div className="mst-playback-right">
                {speeds.map((s) => (
                  <button
                    key={s}
                    className={`mst-speed-btn ${(viewMode === 'SINGLE_PRIM' ? primPlayback.speed : kruskalPlayback.speed) === s ? 'active' : ''}`}
                    onClick={() => {
                      kruskalPlayback.setSpeed(s);
                      primPlayback.setSpeed(s);
                    }}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graph-Aware AI Chatbot Assistant Drawer */}
      <GraphAIChatbot
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        graph={graph}
        kruskalTrace={kruskalTrace}
        primTrace={primTrace}
        kruskalStepIndex={kruskalPlayback.currentStepIndex}
        primStepIndex={primPlayback.currentStepIndex}
        viewMode={viewMode}
        startVertexId={startVertexId}
      />
    </div>
  );
};
