import { useState, useCallback } from 'react';
import type { Graph, Vertex, Edge } from '../core/types';
import { PRESET_GRAPHS } from '../core/presets';
import { generateRandomGraph, validateGraph, type GraphValidationResult } from '../core/graphUtils';

export interface GraphStateControls {
  graph: Graph;
  validation: GraphValidationResult;
  mode: 'SELECT' | 'ADD_VERTEX' | 'ADD_EDGE';
  selectedVertexId: string | null;
  setMode: (mode: 'SELECT' | 'ADD_VERTEX' | 'ADD_EDGE') => void;
  setSelectedVertexId: (id: string | null) => void;
  loadPreset: (presetId: string) => void;
  generateRandom: (vertexCount?: number) => void;
  addVertex: (x: number, y: number) => void;
  deleteVertex: (id: string) => void;
  addEdge: (sourceId: string, targetId: string, weight?: number) => void;
  deleteEdge: (id: string) => void;
  updateEdgeWeight: (id: string, weight: number) => void;
  moveVertex: (id: string, x: number, y: number) => void;
  clearGraph: () => void;
  resetGraph: () => void;
}

export function useGraphState(initialPresetId: string = 'preset-standard'): GraphStateControls {
  const defaultPreset = PRESET_GRAPHS.find((p) => p.id === initialPresetId) || PRESET_GRAPHS[0];
  const [graph, setGraph] = useState<Graph>(defaultPreset.graph);
  const [mode, setMode] = useState<'SELECT' | 'ADD_VERTEX' | 'ADD_EDGE'>('SELECT');
  const [selectedVertexId, setSelectedVertexId] = useState<string | null>(null);
  const [initialGraphSnapshot, setInitialGraphSnapshot] = useState<Graph>(defaultPreset.graph);

  const validation = validateGraph(graph);

  const loadPreset = useCallback((presetId: string) => {
    const preset = PRESET_GRAPHS.find((p) => p.id === presetId);
    if (preset) {
      setGraph(preset.graph);
      setInitialGraphSnapshot(preset.graph);
      setSelectedVertexId(null);
    }
  }, []);

  const generateRandom = useCallback((vertexCount: number = 6) => {
    const randomGraph = generateRandomGraph(vertexCount);
    setGraph(randomGraph);
    setInitialGraphSnapshot(randomGraph);
    setSelectedVertexId(null);
  }, []);

  const addVertex = useCallback((x: number, y: number) => {
    setGraph((prev) => {
      const nextIndex = prev.vertices.length;
      const label = String.fromCharCode(65 + (nextIndex % 26)) + (nextIndex >= 26 ? Math.floor(nextIndex / 26) : '');
      const newVertex: Vertex = {
        id: `v_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        label,
        x: Math.round(x),
        y: Math.round(y),
      };
      return {
        ...prev,
        vertices: [...prev.vertices, newVertex],
      };
    });
  }, []);

  const deleteVertex = useCallback((id: string) => {
    setGraph((prev) => ({
      ...prev,
      vertices: prev.vertices.filter((v) => v.id !== id),
      edges: prev.edges.filter((e) => e.source !== id && e.target !== id),
    }));
    setSelectedVertexId((curr) => (curr === id ? null : curr));
  }, []);

  const addEdge = useCallback((sourceId: string, targetId: string, weight: number = 1) => {
    if (sourceId === targetId) return; // Prevent self-loop in UI

    setGraph((prev) => {
      // Check if edge already exists
      const exists = prev.edges.some(
        (e) => (e.source === sourceId && e.target === targetId) || (e.source === targetId && e.target === sourceId)
      );
      if (exists) return prev;

      const newEdge: Edge = {
        id: `e_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        source: sourceId,
        target: targetId,
        weight: Math.max(1, weight),
      };
      return {
        ...prev,
        edges: [...prev.edges, newEdge],
      };
    });
  }, []);

  const deleteEdge = useCallback((id: string) => {
    setGraph((prev) => ({
      ...prev,
      edges: prev.edges.filter((e) => e.id !== id),
    }));
  }, []);

  const updateEdgeWeight = useCallback((id: string, weight: number) => {
    setGraph((prev) => ({
      ...prev,
      edges: prev.edges.map((e) => (e.id === id ? { ...e, weight: Math.max(1, Math.round(weight)) } : e)),
    }));
  }, []);

  const moveVertex = useCallback((id: string, x: number, y: number) => {
    setGraph((prev) => ({
      ...prev,
      vertices: prev.vertices.map((v) => (v.id === id ? { ...v, x: Math.round(x), y: Math.round(y) } : v)),
    }));
  }, []);

  const clearGraph = useCallback(() => {
    setGraph({ vertices: [], edges: [], isDirected: false });
    setSelectedVertexId(null);
  }, []);

  const resetGraph = useCallback(() => {
    setGraph(initialGraphSnapshot);
    setSelectedVertexId(null);
  }, [initialGraphSnapshot]);

  return {
    graph,
    validation,
    mode,
    selectedVertexId,
    setMode,
    setSelectedVertexId,
    loadPreset,
    generateRandom,
    addVertex,
    deleteVertex,
    addEdge,
    deleteEdge,
    updateEdgeWeight,
    moveVertex,
    clearGraph,
    resetGraph,
  };
}
