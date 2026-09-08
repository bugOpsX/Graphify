import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGraphState } from '../../visualization/useGraphState';
import { runKruskal, runPrim } from '../../algorithms';

describe('Vertex Deletion & Graph State Management', () => {
  it('should remove vertex and all connected incident edges', () => {
    const { result } = renderHook(() => useGraphState('preset-cycle'));
    
    // preset-cycle has 5 vertices (A, B, C, D, E) and 7 edges
    const initialVertexCount = result.current.graph.vertices.length;
    const initialEdgeCount = result.current.graph.edges.length;
    expect(initialVertexCount).toBe(5);
    expect(initialEdgeCount).toBe(7);

    const vertexToDelete = result.current.graph.vertices[0];
    
    act(() => {
      result.current.setSelectedVertexId(vertexToDelete.id);
    });
    expect(result.current.selectedVertexId).toBe(vertexToDelete.id);

    act(() => {
      result.current.deleteVertex(vertexToDelete.id);
    });

    // Vertex count should decrement by 1
    expect(result.current.graph.vertices.length).toBe(initialVertexCount - 1);
    expect(result.current.graph.vertices.some((v) => v.id === vertexToDelete.id)).toBe(false);

    // Any edge connected to vertexToDelete must be removed
    const remainingEdges = result.current.graph.edges;
    expect(remainingEdges.some((e) => e.source === vertexToDelete.id || e.target === vertexToDelete.id)).toBe(false);

    // Selected vertex state should be cleared
    expect(result.current.selectedVertexId).toBeNull();
  });

  it('should run Kruskal and Prim smoothly after removing vertices', () => {
    const { result } = renderHook(() => useGraphState('preset-standard'));
    const initialVertexCount = result.current.graph.vertices.length;

    // Delete node 1
    const v1 = result.current.graph.vertices[0];
    act(() => {
      result.current.deleteVertex(v1.id);
    });
    expect(result.current.graph.vertices.length).toBe(initialVertexCount - 1);

    // Run algorithms on modified graph
    const kruskalTrace = runKruskal(result.current.graph);
    const primTrace = runPrim(result.current.graph);

    expect(kruskalTrace.steps.length).toBeGreaterThan(0);
    expect(primTrace.steps.length).toBeGreaterThan(0);
  });

  it('should handle deleting all vertices down to empty graph without crash', () => {
    const { result } = renderHook(() => useGraphState('preset-cycle'));

    const vIds = result.current.graph.vertices.map((v) => v.id);
    vIds.forEach((id) => {
      act(() => {
        result.current.deleteVertex(id);
      });
    });

    expect(result.current.graph.vertices.length).toBe(0);
    expect(result.current.graph.edges.length).toBe(0);

    // Kruskal and Prim handle empty graphs gracefully
    const kruskalTrace = runKruskal(result.current.graph);
    const primTrace = runPrim(result.current.graph);

    expect(kruskalTrace.result.mstEdges).toEqual([]);
    expect(primTrace.result.mstEdges).toEqual([]);
  });
});
