import { useState, useMemo, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { SVGCanvas } from './components/graph/SVGCanvas';
import { MasterToolbar } from './components/controls/MasterToolbar';
import { GraphEditorToolbar } from './components/controls/GraphEditorToolbar';
import { InspectorDock } from './components/education/InspectorDock';
import { GuideModal } from './components/education/GuideModal';
import { EdgeWeightModal } from './components/controls/EdgeWeightModal';
import { StageResizeHandle } from './components/layout/StageResizeHandle';
import { useGraphState } from './visualization/useGraphState';
import { usePlayback } from './visualization/usePlayback';
import { runKruskal, runPrim } from './algorithms';
import type { Edge } from './core/types';
import './styles/global.css';

export function App() {
  const [viewMode, setViewMode] = useState<'SIDE_BY_SIDE' | 'SINGLE_KRUSKAL' | 'SINGLE_PRIM'>('SIDE_BY_SIDE');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [editingEdge, setEditingEdge] = useState<Edge | null>(null);
  const [startVertexId, setStartVertexId] = useState<string | undefined>(undefined);

  // Dynamic canvas vs inspector dock sliding split state
  const [dockHeight, setDockHeight] = useState<number>(260);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);

  const graphState = useGraphState('preset-standard');
  const {
    graph,
    mode,
    selectedVertexId,
    setSelectedVertexId,
    addVertex,
    addEdge,
    moveVertex,
    updateEdgeWeight,
    deleteEdge,
  } = graphState;

  // Real-time pure algorithm trace generation
  const kruskalTrace = useMemo(() => runKruskal(graph), [graph]);
  const primTrace = useMemo(() => runPrim(graph, { startVertexId }), [graph, startVertexId]);

  // Playback control hooks for Kruskal and Prim
  const kruskalPlayback = usePlayback(kruskalTrace);
  const primPlayback = usePlayback(primTrace);

  const maxTotalSteps = Math.max(kruskalTrace.steps.length, primTrace.steps.length);

  // Keyboard shortcut handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keybindings if user is inside an input modal
      if (editingEdge || isGuideOpen) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (kruskalPlayback.isPlaying || primPlayback.isPlaying) {
          kruskalPlayback.pause();
          primPlayback.pause();
        } else {
          kruskalPlayback.play();
          primPlayback.play();
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        kruskalPlayback.stepForward();
        primPlayback.stepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        kruskalPlayback.stepBackward();
        primPlayback.stepBackward();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        kruskalPlayback.reset();
        primPlayback.reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingEdge, isGuideOpen, kruskalPlayback, primPlayback]);

  // Canvas Interactions
  const handleCanvasClick = (x: number, y: number) => {
    if (mode === 'ADD_VERTEX') {
      addVertex(x, y);
    }
  };

  const handleVertexClick = (vertexId: string) => {
    if (mode === 'ADD_EDGE') {
      if (selectedVertexId === null) {
        // Select Node 1
        setSelectedVertexId(vertexId);
      } else if (selectedVertexId !== vertexId) {
        // Connect Node 1 to Node 2
        addEdge(selectedVertexId, vertexId, 5); // Default weight 5
        setSelectedVertexId(null);
      } else {
        // Clicked same node twice -> toggle deselect
        setSelectedVertexId(null);
      }
    } else {
      setSelectedVertexId(vertexId);
    }
  };

  const handleEdgeClick = (edgeId: string) => {
    const edge = graph.edges.find((e) => e.id === edgeId);
    if (edge) {
      setEditingEdge(edge);
    }
  };

  const kruskalStep = kruskalTrace.steps[kruskalPlayback.currentStepIndex] || kruskalTrace.steps[0];
  const primStep = primTrace.steps[primPlayback.currentStepIndex] || primTrace.steps[0];

  const currentDockHeight = isDockCollapsed ? 38 : dockHeight;

  return (
    <div className="studio-dashboard">
      {/* 1. Header Navigation Bar */}
      <Header viewMode={viewMode} setViewMode={setViewMode} onOpenInfo={() => setIsGuideOpen(true)} />

      {/* 2. Graph Editor Control Bar */}
      <GraphEditorToolbar
        graphState={graphState}
        startVertexId={startVertexId}
        onStartVertexChange={(vId) => setStartVertexId(vId)}
      />

      {/* 3. Main Side-by-Side Visualizer Stage */}
      {viewMode === 'SIDE_BY_SIDE' && (
        <div className="studio-stage">
          <SVGCanvas
            graph={graph}
            currentStep={kruskalStep}
            mode={mode}
            selectedVertexId={selectedVertexId}
            title="Kruskal's Algorithm"
            badge="Edge-Centric DSU"
            onCanvasClick={handleCanvasClick}
            onVertexClick={handleVertexClick}
            onVertexMove={moveVertex}
            onEdgeClick={handleEdgeClick}
          />
          <SVGCanvas
            graph={graph}
            currentStep={primStep}
            mode={mode}
            selectedVertexId={selectedVertexId}
            title="Prim's Algorithm"
            badge="Vertex-Centric Cut"
            onCanvasClick={handleCanvasClick}
            onVertexClick={handleVertexClick}
            onVertexMove={moveVertex}
            onEdgeClick={handleEdgeClick}
          />
        </div>
      )}

      {viewMode === 'SINGLE_KRUSKAL' && (
        <div className="studio-stage-single">
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
            onEdgeClick={handleEdgeClick}
          />
        </div>
      )}

      {viewMode === 'SINGLE_PRIM' && (
        <div className="studio-stage-single">
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
            onEdgeClick={handleEdgeClick}
          />
        </div>
      )}

      {/* 4. Interactive Vertical Splitter / Slider Handle Bar */}
      <StageResizeHandle
        dockHeight={dockHeight}
        onDockHeightChange={(newHeight) => {
          setDockHeight(newHeight);
          if (isDockCollapsed) setIsDockCollapsed(false);
        }}
        isCollapsed={isDockCollapsed}
        onToggleCollapse={() => setIsDockCollapsed(!isDockCollapsed)}
      />

      {/* 5. Unified Master Synchronized Control Bar */}
      <MasterToolbar
        kruskalPlayback={kruskalPlayback}
        primPlayback={primPlayback}
        totalSteps={maxTotalSteps}
      />

      {/* 6. Dynamic Resizable Bottom Inspector Dock */}
      <div className="studio-dock" style={{ height: `${currentDockHeight}px`, flexShrink: 0 }}>
        <InspectorDock
          graph={graph}
          kruskalTrace={kruskalTrace}
          primTrace={primTrace}
          kruskalStep={kruskalStep}
          primStep={primStep}
          kruskalStepIndex={kruskalPlayback.currentStepIndex}
          primStepIndex={primPlayback.currentStepIndex}
        />
      </div>

      {/* Modals */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <EdgeWeightModal
        edge={editingEdge}
        onClose={() => setEditingEdge(null)}
        onUpdateWeight={updateEdgeWeight}
        onDeleteEdge={deleteEdge}
      />
    </div>
  );
}

export default App;
