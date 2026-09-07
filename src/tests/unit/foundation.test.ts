import { describe, it, expect } from 'vitest';
import type { Graph } from '../../core/types';
import { createVertex, createEdge, validateGraph, checkConnectivity } from '../../core/graphUtils';

describe('Phase 1 Foundation Test Suite', () => {
  it('should correctly instantiate domain models', () => {
    const v1 = createVertex('v1', 'A', 100, 100);
    const v2 = createVertex('v2', 'B', 200, 200);
    const edge = createEdge('e1', 'v1', 'v2', 5);

    expect(v1.id).toBe('v1');
    expect(v2.label).toBe('B');
    expect(edge.weight).toBe(5);
  });

  it('should validate graph edge integrity', () => {
    const validGraph: Graph = {
      vertices: [createVertex('v1', 'A', 0, 0), createVertex('v2', 'B', 10, 10)],
      edges: [createEdge('e1', 'v1', 'v2', 3)],
    };

    const invalidGraph: Graph = {
      vertices: [createVertex('v1', 'A', 0, 0)],
      edges: [createEdge('e1', 'v1', 'non-existent', 3)],
    };

    expect(validateGraph(validGraph).isValid).toBe(true);
    expect(validateGraph(invalidGraph).isValid).toBe(false);
  });

  it('should accurately test graph connectivity via BFS', () => {
    const connectedGraph: Graph = {
      vertices: [createVertex('v1', 'A', 0, 0), createVertex('v2', 'B', 10, 10)],
      edges: [createEdge('e1', 'v1', 'v2', 3)],
    };

    const disconnectedGraph: Graph = {
      vertices: [createVertex('v1', 'A', 0, 0), createVertex('v2', 'B', 10, 10)],
      edges: [],
    };

    expect(checkConnectivity(connectedGraph)).toBe(true);
    expect(checkConnectivity(disconnectedGraph)).toBe(false);
  });
});
