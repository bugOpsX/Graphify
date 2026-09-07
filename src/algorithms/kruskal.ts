import type { Graph, ExecutionTrace, AlgorithmStep, Edge } from '../core/types';
import { validateGraph, checkConnectivity } from '../core/graphUtils';
import { DisjointSet } from './disjointSet';

/**
 * Runs Kruskal's algorithm on a graph and outputs an immutable ExecutionTrace.
 */
export function runKruskal(graph: Graph): ExecutionTrace {
  validateGraph(graph);

  const steps: AlgorithmStep[] = [];
  const vertexIds = graph.vertices.map((v) => v.id);
  const dsu = new DisjointSet(vertexIds);

  let acceptedEdgeIds: string[] = [];
  let rejectedEdgeIds: string[] = [];
  let currentWeight = 0;
  let edgesConsideredCount = 0;
  let edgesAcceptedCount = 0;
  let edgesRejectedCount = 0;

  // Explicit BFS/DFS connectivity check
  const isGraphConnected = checkConnectivity(graph);

  // Step 0: Initialization Step
  steps.push({
    stepIndex: 0,
    type: 'INIT',
    acceptedEdgeIds: [],
    rejectedEdgeIds: [],
    visitedVertexIds: [],
    disjointSetState: dsu.getSnapshot(),
    currentWeight: 0,
    explanation: `Initial State: Graph has ${graph.vertices.length} vertices and ${graph.edges.length} edges. Initialized Disjoint Set Union (DSU).`,
    pseudocodeLine: 1,
  });

  if (graph.vertices.length === 0) {
    return {
      algorithm: 'KRUSKAL',
      steps,
      result: {
        mstEdges: [],
        totalWeight: 0,
        isCompleteMST: true,
        totalSteps: 1,
        edgesConsideredCount: 0,
        edgesAcceptedCount: 0,
        edgesRejectedCount: 0,
      },
    };
  }

  // Sort edges by weight ascending. Consistent tie-breaking by edge ID.
  const sortedEdges = [...graph.edges].sort((a, b) => {
    if (a.weight !== b.weight) return a.weight - b.weight;
    return a.id.localeCompare(b.id);
  });

  steps.push({
    stepIndex: steps.length,
    type: 'UPDATE_STRUCTURE',
    acceptedEdgeIds: [],
    rejectedEdgeIds: [],
    visitedVertexIds: [],
    disjointSetState: dsu.getSnapshot(),
    currentWeight: 0,
    explanation: `Sorted ${sortedEdges.length} edges by weight ascending: [${sortedEdges.map((e) => `${e.source}-${e.target} (${e.weight})`).join(', ')}].`,
    pseudocodeLine: 1,
  });

  const edgeMap = new Map<string, Edge>(graph.edges.map((e) => [e.id, e]));

  for (const edge of sortedEdges) {
    edgesConsideredCount++;

    // Step: Consider Edge
    steps.push({
      stepIndex: steps.length,
      type: 'CONSIDER_EDGE',
      activeEdgeId: edge.id,
      acceptedEdgeIds: [...acceptedEdgeIds],
      rejectedEdgeIds: [...rejectedEdgeIds],
      visitedVertexIds: getVisitedVertexIds(acceptedEdgeIds, edgeMap),
      disjointSetState: dsu.getSnapshot(),
      currentWeight,
      explanation: `Considering smallest remaining edge (${getVertexLabel(edge.source, graph)}-${getVertexLabel(edge.target, graph)}) with weight ${edge.weight}.`,
      pseudocodeLine: 3,
    });

    const rootSource = dsu.find(edge.source);
    const rootTarget = dsu.find(edge.target);

    if (rootSource !== rootTarget) {
      // Accept Edge
      dsu.union(edge.source, edge.target);
      acceptedEdgeIds.push(edge.id);
      currentWeight += edge.weight;
      edgesAcceptedCount++;

      steps.push({
        stepIndex: steps.length,
        type: 'ACCEPT_EDGE',
        activeEdgeId: edge.id,
        acceptedEdgeIds: [...acceptedEdgeIds],
        rejectedEdgeIds: [...rejectedEdgeIds],
        visitedVertexIds: getVisitedVertexIds(acceptedEdgeIds, edgeMap),
        disjointSetState: dsu.getSnapshot(),
        currentWeight,
        explanation: `ACCEPTED: Endpoints (${getVertexLabel(edge.source, graph)} and ${getVertexLabel(edge.target, graph)}) belong to separate components. Merged sets via DSU.`,
        pseudocodeLine: 4,
      });

      // Stop early if MST reached V-1 edges (for connected graph)
      if (acceptedEdgeIds.length === graph.vertices.length - 1) {
        break;
      }
    } else {
      // Reject Edge (Cycle detected)
      rejectedEdgeIds.push(edge.id);
      edgesRejectedCount++;

      steps.push({
        stepIndex: steps.length,
        type: 'REJECT_EDGE',
        activeEdgeId: edge.id,
        acceptedEdgeIds: [...acceptedEdgeIds],
        rejectedEdgeIds: [...rejectedEdgeIds],
        visitedVertexIds: getVisitedVertexIds(acceptedEdgeIds, edgeMap),
        disjointSetState: dsu.getSnapshot(),
        currentWeight,
        explanation: `REJECTED: Endpoints (${getVertexLabel(edge.source, graph)} and ${getVertexLabel(edge.target, graph)}) already share root '${rootSource}'. Adding edge would create a cycle!`,
        pseudocodeLine: 5,
      });
    }
  }

  // Check if graph was disconnected (Minimum Spanning Forest formed)
  if (!isGraphConnected && graph.vertices.length > 1) {
    steps.push({
      stepIndex: steps.length,
      type: 'WARNING_DISCONNECTED',
      acceptedEdgeIds: [...acceptedEdgeIds],
      rejectedEdgeIds: [...rejectedEdgeIds],
      visitedVertexIds: vertexIds,
      disjointSetState: dsu.getSnapshot(),
      currentWeight,
      explanation: `Warning: The graph is disconnected. Formed a Minimum Spanning Forest (MSF) with ${acceptedEdgeIds.length} edges across separate components.`,
      pseudocodeLine: 6,
    });
  }

  const mstEdges = graph.edges.filter((e) => acceptedEdgeIds.includes(e.id));

  steps.push({
    stepIndex: steps.length,
    type: 'COMPLETE',
    acceptedEdgeIds: [...acceptedEdgeIds],
    rejectedEdgeIds: [...rejectedEdgeIds],
    visitedVertexIds: vertexIds,
    disjointSetState: dsu.getSnapshot(),
    currentWeight,
    explanation: isGraphConnected
      ? `Kruskal's Algorithm Complete! Minimum Spanning Tree (MST) formed with total weight ${currentWeight}.`
      : `Kruskal's Algorithm Complete! Minimum Spanning Forest (MSF) formed with total weight ${currentWeight}.`,
    pseudocodeLine: 6,
  });

  return {
    algorithm: 'KRUSKAL',
    steps,
    result: {
      mstEdges,
      totalWeight: currentWeight,
      isCompleteMST: isGraphConnected,
      totalSteps: steps.length,
      edgesConsideredCount,
      edgesAcceptedCount,
      edgesRejectedCount,
    },
  };
}

function getVertexLabel(id: string, graph: Graph): string {
  const v = graph.vertices.find((vertex) => vertex.id === id);
  return v ? v.label : id;
}

function getVisitedVertexIds(acceptedEdgeIds: string[], edgeMap: Map<string, Edge>): string[] {
  const set = new Set<string>();
  for (const id of acceptedEdgeIds) {
    const e = edgeMap.get(id);
    if (e) {
      set.add(e.source);
      set.add(e.target);
    }
  }
  return Array.from(set);
}
