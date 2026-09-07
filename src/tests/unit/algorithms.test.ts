import { describe, it, expect } from 'vitest';
import { DisjointSet } from '../../algorithms/disjointSet';
import { PriorityQueue } from '../../algorithms/priorityQueue';
import { runKruskal } from '../../algorithms/kruskal';
import { runPrim } from '../../algorithms/prim';
import { PRESET_GRAPHS } from '../../core/presets';
import type { Graph } from '../../core/types';

describe('DisjointSet (Union-Find)', () => {
  it('should correctly initialize elements as their own root', () => {
    const dsu = new DisjointSet(['A', 'B', 'C']);
    expect(dsu.find('A')).toBe('A');
    expect(dsu.find('B')).toBe('B');
    expect(dsu.find('C')).toBe('C');
  });

  it('should merge sets and detect connectivity', () => {
    const dsu = new DisjointSet(['A', 'B', 'C', 'D']);
    expect(dsu.connected('A', 'B')).toBe(false);

    expect(dsu.union('A', 'B')).toBe(true);
    expect(dsu.connected('A', 'B')).toBe(true);

    expect(dsu.union('B', 'C')).toBe(true);
    expect(dsu.connected('A', 'C')).toBe(true);

    // Merging A and C again should return false (cycle)
    expect(dsu.union('A', 'C')).toBe(false);
  });
});

describe('PriorityQueue (Min-Heap)', () => {
  it('should pop items in ascending order of weight including negative values', () => {
    const pq = new PriorityQueue();
    pq.push({ edgeId: 'e1', weight: 10, source: 'A', target: 'B' });
    pq.push({ edgeId: 'e2', weight: -5, source: 'B', target: 'C' });
    pq.push({ edgeId: 'e3', weight: 0, source: 'C', target: 'A' });

    expect(pq.pop()?.weight).toBe(-5);
    expect(pq.pop()?.weight).toBe(0);
    expect(pq.pop()?.weight).toBe(10);
    expect(pq.isEmpty()).toBe(true);
  });
});

describe('Kruskal vs Prim Algorithmic Invariants & Parity', () => {
  const standardGraph = PRESET_GRAPHS[0].graph;

  it("should compute correct MST weight for standard graph with Kruskal's algorithm", () => {
    const trace = runKruskal(standardGraph);
    expect(trace.result.isCompleteMST).toBe(true);
    expect(trace.result.mstEdges.length).toBe(5);
    expect(trace.result.totalWeight).toBe(12);
  });

  it("should compute correct MST weight for standard graph with Prim's algorithm", () => {
    const trace = runPrim(standardGraph);
    expect(trace.result.isCompleteMST).toBe(true);
    expect(trace.result.mstEdges.length).toBe(5);
    expect(trace.result.totalWeight).toBe(12);
  });

  it('should produce identical total MST weight across all preset graphs', () => {
    for (const preset of PRESET_GRAPHS) {
      if (preset.id === 'preset-disconnected') continue;

      const kruskalTrace = runKruskal(preset.graph);
      const primTrace = runPrim(preset.graph);

      expect(kruskalTrace.result.totalWeight).toBe(primTrace.result.totalWeight);
      expect(kruskalTrace.result.isCompleteMST).toBe(true);
      expect(primTrace.result.isCompleteMST).toBe(true);
    }
  });

  it('should handle negative edge weights correctly', () => {
    const negativeWeightGraph: Graph = {
      vertices: [
        { id: 'v0', label: 'A', x: 100, y: 100 },
        { id: 'v1', label: 'B', x: 200, y: 100 },
        { id: 'v2', label: 'C', x: 150, y: 200 },
      ],
      edges: [
        { id: 'e1', source: 'v0', target: 'v1', weight: -10 },
        { id: 'e2', source: 'v1', target: 'v2', weight: -5 },
        { id: 'e3', source: 'v0', target: 'v2', weight: 4 },
      ],
    };

    const kruskalTrace = runKruskal(negativeWeightGraph);
    const primTrace = runPrim(negativeWeightGraph);

    expect(kruskalTrace.result.totalWeight).toBe(-15);
    expect(primTrace.result.totalWeight).toBe(-15);
    expect(kruskalTrace.result.mstEdges.length).toBe(2);
    expect(primTrace.result.mstEdges.length).toBe(2);
  });

  it('should handle disconnected graphs and return Minimum Spanning Forest (MSF)', () => {
    const disconnectedPreset = PRESET_GRAPHS.find((p) => p.id === 'preset-disconnected')!;
    const kruskalTrace = runKruskal(disconnectedPreset.graph);
    const primTrace = runPrim(disconnectedPreset.graph);

    expect(kruskalTrace.result.isCompleteMST).toBe(false);
    expect(primTrace.result.isCompleteMST).toBe(false);

    expect(kruskalTrace.steps.some((s) => s.type === 'WARNING_DISCONNECTED')).toBe(true);
    expect(primTrace.steps.some((s) => s.type === 'WARNING_DISCONNECTED')).toBe(true);
  });

  it('should produce identical MST weight regardless of Prim starting vertex', () => {
    const startVertices = ['v0', 'v1', 'v2', 'v3', 'v4', 'v5'];
    const weights = startVertices.map((vId) => {
      const trace = runPrim(standardGraph, { startVertexId: vId });
      return trace.result.totalWeight;
    });

    const firstWeight = weights[0];
    expect(weights.every((w) => w === firstWeight)).toBe(true);
  });

  it('should handle duplicate edge weights deterministically', () => {
    const duplicateGraph: Graph = {
      vertices: [
        { id: 'v0', label: 'A', x: 100, y: 100 },
        { id: 'v1', label: 'B', x: 200, y: 100 },
        { id: 'v2', label: 'C', x: 150, y: 200 },
      ],
      edges: [
        { id: 'e1', source: 'v0', target: 'v1', weight: 3 },
        { id: 'e2', source: 'v1', target: 'v2', weight: 3 },
        { id: 'e3', source: 'v0', target: 'v2', weight: 3 },
      ],
    };

    const kruskalTrace = runKruskal(duplicateGraph);
    const primTrace = runPrim(duplicateGraph);

    expect(kruskalTrace.result.totalWeight).toBe(6);
    expect(primTrace.result.totalWeight).toBe(6);
    expect(kruskalTrace.result.mstEdges.length).toBe(2);
    expect(primTrace.result.mstEdges.length).toBe(2);
  });

  it('should handle self-loops without including them in MST', () => {
    const selfLoopGraph: Graph = {
      vertices: [
        { id: 'v0', label: 'A', x: 100, y: 100 },
        { id: 'v1', label: 'B', x: 200, y: 100 },
      ],
      edges: [
        { id: 'e1', source: 'v0', target: 'v1', weight: 4 },
        { id: 'e2', source: 'v0', target: 'v0', weight: 1 }, // Self-loop
      ],
    };

    const kruskalTrace = runKruskal(selfLoopGraph);
    expect(kruskalTrace.result.totalWeight).toBe(4);
    expect(kruskalTrace.result.mstEdges.length).toBe(1);
    expect(kruskalTrace.result.mstEdges[0].id).toBe('e1');
  });

  it('should handle single vertex graph', () => {
    const singleNodeGraph: Graph = {
      vertices: [{ id: 'v0', label: 'Solo', x: 100, y: 100 }],
      edges: [],
    };

    const kruskalTrace = runKruskal(singleNodeGraph);
    const primTrace = runPrim(singleNodeGraph);

    expect(kruskalTrace.result.totalWeight).toBe(0);
    expect(primTrace.result.totalWeight).toBe(0);
    expect(kruskalTrace.result.mstEdges).toHaveLength(0);
  });
});
