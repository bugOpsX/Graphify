import type { Vertex, Edge, Graph } from './types';

export interface AdjNeighbor {
  edge: Edge;
  targetId: string;
}

export interface GraphValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Creates a new Vertex with position coordinates.
 */
export function createVertex(id: string, label: string, x: number, y: number): Vertex {
  return { id, label, x, y };
}

/**
 * Creates a weighted undirected Edge connecting two vertices.
 */
export function createEdge(id: string, source: string, target: string, weight: number): Edge {
  return { id, source, target, weight };
}

/**
 * Builds an adjacency list mapping each vertex ID to its incident edges and neighbor targets.
 */
export function getAdjacencyList(graph: Graph): Map<string, AdjNeighbor[]> {
  const adj = new Map<string, AdjNeighbor[]>();

  for (const v of graph.vertices) {
    adj.set(v.id, []);
  }

  for (const edge of graph.edges) {
    adj.get(edge.source)?.push({ edge, targetId: edge.target });
    adj.get(edge.target)?.push({ edge, targetId: edge.source });
  }

  return adj;
}

/**
 * Validates basic graph invariants (ensuring edges point to existing vertices).
 */
export function validateGraph(graph: Graph): GraphValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const vertexIdSet = new Set(graph.vertices.map((v) => v.id));

  for (const edge of graph.edges) {
    if (!vertexIdSet.has(edge.source)) {
      errors.push(`Edge '${edge.id}' refers to non-existent source vertex '${edge.source}'`);
    }
    if (!vertexIdSet.has(edge.target)) {
      errors.push(`Edge '${edge.id}' refers to non-existent target vertex '${edge.target}'`);
    }
  }

  if (graph.vertices.length > 1 && !checkConnectivity(graph)) {
    warnings.push('Graph is disconnected. Execution will form a Minimum Spanning Forest (MSF).');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Explicit BFS traversal to verify if all vertices in the graph are connected.
 */
export function checkConnectivity(graph: Graph): boolean {
  if (graph.vertices.length <= 1) return true;

  const adj = getAdjacencyList(graph);
  const startVertexId = graph.vertices[0].id;
  const visited = new Set<string>([startVertexId]);
  const queue: string[] = [startVertexId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adj.get(current) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.targetId)) {
        visited.add(neighbor.targetId);
        queue.push(neighbor.targetId);
      }
    }
  }

  return visited.size === graph.vertices.length;
}

/**
 * Generates a random connected graph with N vertices.
 */
export function generateRandomGraph(nodeCount: number = 6): Graph {
  const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const count = Math.min(nodeCount, labels.length);
  const vertices: Vertex[] = [];
  const edges: Edge[] = [];

  const width = 640;
  const height = 380;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2.6;

  for (let i = 0; i < count; i++) {
    const angle = (i * 2 * Math.PI) / count;
    vertices.push({
      id: `v${i}`,
      label: labels[i],
      x: Math.round(cx + radius * Math.cos(angle)),
      y: Math.round(cy + radius * Math.sin(angle)),
    });
  }

  let edgeCounter = 1;
  for (let i = 0; i < count - 1; i++) {
    const weight = Math.floor(Math.random() * 9) + 1;
    edges.push({
      id: `e${edgeCounter++}`,
      source: `v${i}`,
      target: `v${i + 1}`,
      weight,
    });
  }

  for (let i = 0; i < count; i++) {
    for (let j = i + 2; j < count; j++) {
      if (i === 0 && j === count - 1) continue;
      if (Math.random() > 0.5) {
        const weight = Math.floor(Math.random() * 12) + 1;
        edges.push({
          id: `e${edgeCounter++}`,
          source: `v${i}`,
          target: `v${j}`,
          weight,
        });
      }
    }
  }

  return { vertices, edges };
}
