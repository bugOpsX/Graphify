import { useState, useMemo, useEffect } from 'react';
import { HomePage } from './components/home/HomePage';
import { Header } from './components/layout/Header';
import { SVGCanvas } from './components/graph/SVGCanvas';
import { MasterToolbar } from './components/controls/MasterToolbar';
import { GraphEditorToolbar } from './components/controls/GraphEditorToolbar';
import { InspectorDock } from './components/education/InspectorDock';
import { GuideModal } from './components/education/GuideModal';
import { EdgeWeightModal } from './components/controls/EdgeWeightModal';
import { StageResizeHandle } from './components/layout/StageResizeHandle';
import { VerticalSplitResizeHandle } from './components/layout/VerticalSplitResizeHandle';
import { useGraphState } from './visualization/useGraphState';
import { usePlayback } from './visualization/usePlayback';
import { runKruskal, runPrim } from './algorithms';
import type { Edge } from './core/types';
import './styles/global.css';

export function App() {
  const [currentView, setCurrentView] = useState<'HOME' | 'STUDIO'>(() => {
    return window.location.hash.startsWith('#studio') ? 'STUDIO' : 'HOME';
  });
  const [viewMode, setViewMode] = useState<'SIDE_BY_SIDE' | 'SINGLE_KRUSKAL' | 'SINGLE_PRIM'>('SIDE_BY_SIDE');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [editingEdge, setEditingEdge] = useState<Edge | null>(null);
  const [startVertexId, setStartVertexId] = useState<string | undefined>(undefined);

  // Dynamic canvas vs inspector dock sliding split state
  const [dockHeight, setDockHeight] = useState<number>(260);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  // Dynamic horizontal split state for individual algorithm view
  const [splitWidth, setSplitWidth] = useState<number>(490);

  const graphState = useGraphState('preset-standard');
  const {
    graph,
    mode,
    selectedVertexId,
    setSelectedVertexId,
    loadPreset,
    addVertex,
    addEdge,
    moveVertex,
    updateEdgeWeight,
    deleteEdge,
  } = graphState;

  // Sync view state with browser hash
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash.startsWith('#studio')) {
        setCurrentView('STUDIO');
      } else if (
        window.location.hash === '' ||
        window.location.hash === '#home' ||
        window.location.hash === '#/' ||
        window.location.hash.startsWith('#workflow') ||
        window.location.hash.startsWith('#theory') ||
        window.location.hash.startsWith('#presets') ||
        window.location.hash.startsWith('#shortcuts')
      ) {
        setCurrentView('HOME');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLaunchStudio = (presetId?: string) => {
    if (presetId) {
      loadPreset(presetId);
    }
    setCurrentView('STUDIO');
    window.location.hash = '#studio';
  };

  const handleNavigateHome = () => {
    setCurrentView('HOME');
    window.location.hash = '#home';
  };

  // Real-time pure algorithm trace generation
  const kruskalTrace = useMemo(() => runKruskal(graph), [graph]);
  const primTrace = useMemo(() => runPrim(graph, { startVertexId }), [graph, startVertexId]);

  // Playback control hooks for Kruskal and Prim
  const kruskalPlayback = usePlayback(kruskalTrace);
  const primPlayback = usePlayback(primTrace);

  const maxTotalSteps = Math.max(kruskalTrace.steps.length, primTrace.steps.length);

  // Keyboard shortcut handlers (active only inside Visualizer Studio)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keybindings if user is on Home page or inside an input modal
      if (currentView !== 'STUDIO' || editingEdge || isGuideOpen) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (viewMode === 'SINGLE_KRUSKAL') {
          if (kruskalPlayback.isPlaying) kruskalPlayback.pause();
          else kruskalPlayback.play();
        } else if (viewMode === 'SINGLE_PRIM') {
          if (primPlayback.isPlaying) primPlayback.pause();
          else primPlayback.play();
        } else {
          if (kruskalPlayback.isPlaying || primPlayback.isPlaying) {
            kruskalPlayback.pause();
            primPlayback.pause();
          } else {
            kruskalPlayback.play();
            primPlayback.play();
          }
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (viewMode === 'SINGLE_KRUSKAL') {
          kruskalPlayback.stepForward();
        } else if (viewMode === 'SINGLE_PRIM') {
          primPlayback.stepForward();
        } else {
          kruskalPlayback.stepForward();
          primPlayback.stepForward();
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (viewMode === 'SINGLE_KRUSKAL') {
          kruskalPlayback.stepBackward();
        } else if (viewMode === 'SINGLE_PRIM') {
          primPlayback.stepBackward();
        } else {
          kruskalPlayback.stepBackward();
          primPlayback.stepBackward();
        }
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        if (viewMode === 'SINGLE_KRUSKAL') {
          kruskalPlayback.reset();
        } else if (viewMode === 'SINGLE_PRIM') {
          primPlayback.reset();
        } else {
          kruskalPlayback.reset();
          primPlayback.reset();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, editingEdge, isGuideOpen, kruskalPlayback, primPlayback, viewMode]);

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

  if (currentView === 'HOME') {
    return <HomePage onLaunchStudio={handleLaunchStudio} />;
  }

  return (
    <div className="studio-dashboard">
      {/* 1. Header Navigation Bar */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenInfo={() => setIsGuideOpen(true)}
        onNavigateHome={handleNavigateHome}
      />

      {/* 2. Graph Editor Control Bar */}
      <GraphEditorToolbar
        graphState={graphState}
        startVertexId={startVertexId}
        onStartVertexChange={(vId) => setStartVertexId(vId)}
      />

      {/* 3. Main Side-by-Side Visualizer Stage */}
      {viewMode === 'SIDE_BY_SIDE' && (
        <>
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

          {/* Interactive Vertical Splitter / Slider Handle Bar */}
          <StageResizeHandle
            dockHeight={dockHeight}
            onDockHeightChange={(newHeight) => {
              setDockHeight(newHeight);
              if (isDockCollapsed) setIsDockCollapsed(false);
            }}
            isCollapsed={isDockCollapsed}
            onToggleCollapse={() => setIsDockCollapsed(!isDockCollapsed)}
          />

          {/* Unified Master Synchronized Control Bar */}
          <MasterToolbar
            kruskalPlayback={kruskalPlayback}
            primPlayback={primPlayback}
            totalSteps={maxTotalSteps}
            currentAlgorithm="ALL"
          />

          {/* Dynamic Resizable Bottom Inspector Dock */}
          <div className="studio-dock" style={{ height: `${currentDockHeight}px`, flexShrink: 0 }}>
            <InspectorDock
              graph={graph}
              kruskalTrace={kruskalTrace}
              primTrace={primTrace}
              kruskalStep={kruskalStep}
              primStep={primStep}
              kruskalStepIndex={kruskalPlayback.currentStepIndex}
              primStepIndex={primPlayback.currentStepIndex}
              viewMode="SIDE_BY_SIDE"
            />
          </div>
        </>
      )}

      {/* 4. Split-Screen Layout for Individual Algorithm Mode */}
      {(viewMode === 'SINGLE_KRUSKAL' || viewMode === 'SINGLE_PRIM') && (
        <div className="studio-split-layout">
          {/* Left Column: Individual Algorithm Graph Canvas */}
          <div className="studio-split-canvas">
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
                onEdgeClick={handleEdgeClick}
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
                onEdgeClick={handleEdgeClick}
              />
            )}
          </div>

          {/* Draggable Vertical Splitter Handle */}
          <VerticalSplitResizeHandle
            splitWidth={splitWidth}
            onSplitWidthChange={setSplitWidth}
            position="right"
          />

          {/* Right Column: Dedicated Playback Controls & Individual Algorithm Information */}
          <div
            className="studio-split-panel"
            style={{ width: `${splitWidth}px`, flex: `0 0 ${splitWidth}px` }}
          >
            {/* Playback Controls Bar dedicated to the individual algorithm */}
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
