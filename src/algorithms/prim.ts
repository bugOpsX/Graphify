import type { Graph, ExecutionTrace, AlgorithmStep, Edge, AlgorithmOptions } from '../core/types';
import { validateGraph, getAdjacencyList, checkConnectivity } from '../core/graphUtils';
import { PriorityQueue } from './priorityQueue';

/**
 * Runs Prim's algorithm on a graph and outputs an immutable ExecutionTrace.
 */
export function runPrim(graph: Graph, options?: AlgorithmOptions): ExecutionTrace {
  validateGraph(graph);

  const steps: AlgorithmStep[] = [];
  const edgeMap = new Map<string, Edge>(graph.edges.map((e) => [e.id, e]));

  let acceptedEdgeIds: string[] = [];
  let rejectedEdgeIds: string[] = [];
  const visitedVertexIds = new Set<string>();
  let currentWeight = 0;
  let edgesConsideredCount = 0;
  let edgesAcceptedCount = 0;
  let edgesRejectedCount = 0;

  const isGraphConnected = checkConnectivity(graph);
  const pq = new PriorityQueue();

  // Step 0: INIT
  steps.push({
    stepIndex: 0,
    type: 'INIT',
    acceptedEdgeIds: [],
    rejectedEdgeIds: [],
    visitedVertexIds: [],
    priorityQueueState: pq.getSnapshot(),
    currentWeight: 0,
    explanation: `Initial State: Graph has ${graph.vertices.length} vertices and ${graph.edges.length} edges. Min-Priority Queue initialized.`,
    pseudocodeLine: 1,
  });

  if (graph.vertices.length === 0) {
    return {
      algorithm: 'PRIM',
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

  // Determine starting vertex
  let startVertexId = options?.startVertexId;
  if (!startVertexId || !graph.vertices.some((v) => v.id === startVertexId)) {
    startVertexId = graph.vertices[0].id;
  }

  const startVertexLabel = getVertexLabel(startVertexId, graph);

  // Mark start vertex as visited
  visitedVertexIds.add(startVertexId);

  const adj = getAdjacencyList(graph);

  // Push outgoing edges from start vertex into PQ
  const initialNeighbors = adj.get(startVertexId) || [];
  for (const n of initialNeighbors) {
    pq.push({
      edgeId: n.edge.id,
      weight: n.edge.weight,
      source: startVertexId,
      target: n.targetId,
    });
  }

  steps.push({
    stepIndex: steps.length,
    type: 'UPDATE_STRUCTURE',
    acceptedEdgeIds: [],
    rejectedEdgeIds: [],
    visitedVertexIds: Array.from(visitedVertexIds),
    priorityQueueState: pq.getSnapshot(),
    currentWeight: 0,
    explanation: `Selected start vertex '${startVertexLabel}'. Added ${initialNeighbors.length} incident edges to Priority Queue.`,
    pseudocodeLine: 2,
  });

  while (!pq.isEmpty() && visitedVertexIds.size < graph.vertices.length) {
    const minItem = pq.pop()!;
    const edge = edgeMap.get(minItem.edgeId);
    if (!edge) continue;

    edgesConsideredCount++;

    // Step: Consider Edge
    steps.push({
      stepIndex: steps.length,
      type: 'CONSIDER_EDGE',
      activeEdgeId: edge.id,
      acceptedEdgeIds: [...acceptedEdgeIds],
      rejectedEdgeIds: [...rejectedEdgeIds],
      visitedVertexIds: Array.from(visitedVertexIds),
      priorityQueueState: pq.getSnapshot(),
      currentWeight,
      explanation: `Popped smallest edge (${getVertexLabel(minItem.source, graph)}-${getVertexLabel(minItem.target, graph)}) with weight ${edge.weight} from Priority Queue.`,
      pseudocodeLine: 3,
    });

    const isSourceVisited = visitedVertexIds.has(minItem.source);
    const isTargetVisited = visitedVertexIds.has(minItem.target);

    if (isSourceVisited && isTargetVisited) {
      // Reject Edge (Both endpoints already in MST)
      rejectedEdgeIds.push(edge.id);
      edgesRejectedCount++;

      steps.push({
        stepIndex: steps.length,
        type: 'REJECT_EDGE',
        activeEdgeId: edge.id,
        acceptedEdgeIds: [...acceptedEdgeIds],
        rejectedEdgeIds: [...rejectedEdgeIds],
        visitedVertexIds: Array.from(visitedVertexIds),
        priorityQueueState: pq.getSnapshot(),
        currentWeight,
        explanation: `REJECTED: Both vertices '${getVertexLabel(minItem.source, graph)}' and '${getVertexLabel(minItem.target, graph)}' are already in the growing MST tree.`,
        pseudocodeLine: 5,
      });
    } else {
      // Accept Edge
      const newVertexId = isSourceVisited ? minItem.target : minItem.source;
      visitedVertexIds.add(newVertexId);
      acceptedEdgeIds.push(edge.id);
      currentWeight += edge.weight;
      edgesAcceptedCount++;

      // Push new outgoing edges of newVertexId into Priority Queue
      const newNeighbors = adj.get(newVertexId) || [];
      for (const n of newNeighbors) {
        if (!visitedVertexIds.has(n.targetId)) {
          pq.push({
            edgeId: n.edge.id,
            weight: n.edge.weight,
            source: newVertexId,
            target: n.targetId,
          });
        }
      }

      steps.push({
        stepIndex: steps.length,
        type: 'ACCEPT_EDGE',
        activeEdgeId: edge.id,
        acceptedEdgeIds: [...acceptedEdgeIds],
        rejectedEdgeIds: [...rejectedEdgeIds],
        visitedVertexIds: Array.from(visitedVertexIds),
        priorityQueueState: pq.getSnapshot(),
        currentWeight,
        explanation: `ACCEPTED: Added vertex '${getVertexLabel(newVertexId, graph)}' to MST. Inserted its unvisited incident edges into Priority Queue.`,
        pseudocodeLine: 4,
      });
    }
  }

  if (!isGraphConnected && graph.vertices.length > 1) {
    steps.push({
      stepIndex: steps.length,
      type: 'WARNING_DISCONNECTED',
      acceptedEdgeIds: [...acceptedEdgeIds],
      rejectedEdgeIds: [...rejectedEdgeIds],
      visitedVertexIds: Array.from(visitedVertexIds),
      priorityQueueState: pq.getSnapshot(),
      currentWeight,
      explanation: `Warning: Cannot reach remaining disconnected components. Graph is disconnected! Formed Minimum Spanning Forest (MSF).`,
      pseudocodeLine: 6,
    });
  }

  const mstEdges = acceptedEdgeIds.map((id) => edgeMap.get(id)!);

  steps.push({
    stepIndex: steps.length,
    type: 'COMPLETE',
    acceptedEdgeIds: [...acceptedEdgeIds],
    rejectedEdgeIds: [...rejectedEdgeIds],
    visitedVertexIds: Array.from(visitedVertexIds),
    priorityQueueState: pq.getSnapshot(),
    currentWeight,
    explanation: isGraphConnected
      ? `Prim's Algorithm Complete! Minimum Spanning Tree (MST) formed with total weight ${currentWeight}.`
      : `Prim's Algorithm Complete! Minimum Spanning Forest (MSF) formed with total weight ${currentWeight}.`,
    pseudocodeLine: 6,
  });

  return {
    algorithm: 'PRIM',
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
