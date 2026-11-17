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

export type RandomGraphTopology =
  | 'random'
  | 'sparse'
  | 'dense'
  | 'grid'
  | 'clusters'
  | 'scale_free'
  | 'bipartite'
  | 'large_network'
  | 'ring_cycle';

export interface RandomGraphOptions {
  nodeCount?: number;
  topology?: RandomGraphTopology;
  minWeight?: number;
  maxWeight?: number;
}

/**
 * Helper to generate clear alphabetical vertex labels (A..Z, A1..Z1).
 */
function getVertexLabel(index: number): string {
  if (index < 26) {
    return String.fromCharCode(65 + index);
  }
  const prefix = String.fromCharCode(65 + Math.floor(index / 26) - 1);
  const suffix = String.fromCharCode(65 + (index % 26));
  return `${prefix}${suffix}`;
}

/**
 * Edge key utility to avoid multi-edges and self-loops.
 */
function makeEdgeKey(u: string, v: string): string {
  return u < v ? `${u}__${v}` : `${v}__${u}`;
}

/**
 * Builds a guaranteed connected spanning tree among the given vertex IDs.
 */
function buildConnectedSpanningTree(
  vertices: Vertex[],
  edgeCounter: { count: number },
  edgeKeySet: Set<string>,
  minWeight: number = 1,
  maxWeight: number = 25,
  proximityBiased: boolean = true
): Edge[] {
  const edges: Edge[] = [];
  if (vertices.length <= 1) return edges;

  const connected = [vertices[0].id];
  const remaining = new Set(vertices.slice(1).map((v) => v.id));
  const vertexMap = new Map<string, Vertex>(vertices.map((v) => [v.id, v]));

  while (remaining.size > 0) {
    let bestU = '';
    let bestV = '';

    if (proximityBiased) {
      let minDistance = Infinity;
      // Find the geometrically closest pair (u in remaining, v in connected)
      for (const uId of remaining) {
        const u = vertexMap.get(uId)!;
        for (const vId of connected) {
          const v = vertexMap.get(vId)!;
          const dist = Math.hypot(u.x - v.x, u.y - v.y) + (Math.random() * 40 - 20);
          if (dist < minDistance) {
            minDistance = dist;
            bestU = uId;
            bestV = vId;
          }
        }
      }
    } else {
      const remArr = Array.from(remaining);
      bestU = remArr[Math.floor(Math.random() * remArr.length)];
      bestV = connected[Math.floor(Math.random() * connected.length)];
    }

    const key = makeEdgeKey(bestU, bestV);
    if (!edgeKeySet.has(key)) {
      edgeKeySet.add(key);
      const weight = Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight;
      edges.push({
        id: `e${edgeCounter.count++}`,
        source: bestV,
        target: bestU,
        weight,
      });
    }

    remaining.delete(bestU);
    connected.push(bestU);
  }

  return edges;
}

/**
 * Generates a 2D Grid / Lattice Mesh graph (e.g. 4x3 or 4x4).
 */
function generateGridTopology(nodeCount: number = 12, minWeight = 1, maxWeight = 25): Graph {
  const count = Math.max(6, Math.min(nodeCount, 24));
  const cols = count >= 16 ? 4 : count >= 12 ? 4 : count >= 8 ? 4 : 3;
  const rows = Math.ceil(count / cols);

  const vertices: Vertex[] = [];
  const edges: Edge[] = [];
  const edgeKeySet = new Set<string>();
  const edgeCounter = { count: 1 };

  const left = 110;
  const right = 590;
  const top = 80;
  const bottom = 360;

  const colStep = cols > 1 ? (right - left) / (cols - 1) : 0;
  const rowStep = rows > 1 ? (bottom - top) / (rows - 1) : 0;

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    vertices.push({
      id: `v${i}`,
      label: getVertexLabel(i),
      x: Math.round(left + col * colStep),
      y: Math.round(top + row * rowStep),
    });
  }

  // Connect adjacent grid cells horizontally and vertically
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx >= count) continue;
      const uId = `v${idx}`;

      // Horizontal edge to right neighbor
      if (c + 1 < cols && (idx + 1) < count) {
        const vId = `v${idx + 1}`;
        const key = makeEdgeKey(uId, vId);
        if (!edgeKeySet.has(key)) {
          edgeKeySet.add(key);
          edges.push({
            id: `e${edgeCounter.count++}`,
            source: uId,
            target: vId,
            weight: Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight,
          });
        }
      }

      // Vertical edge to bottom neighbor
      if (r + 1 < rows && (idx + cols) < count) {
        const vId = `v${idx + cols}`;
        const key = makeEdgeKey(uId, vId);
        if (!edgeKeySet.has(key)) {
          edgeKeySet.add(key);
          edges.push({
            id: `e${edgeCounter.count++}`,
            source: uId,
            target: vId,
            weight: Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight,
          });
        }
      }

      // Optional occasional diagonal shortcut (25% chance)
      if (c + 1 < cols && r + 1 < rows && (idx + cols + 1) < count && Math.random() < 0.25) {
        const vId = `v${idx + cols + 1}`;
        const key = makeEdgeKey(uId, vId);
        if (!edgeKeySet.has(key)) {
          edgeKeySet.add(key);
          edges.push({
            id: `e${edgeCounter.count++}`,
            source: uId,
            target: vId,
            weight: Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight,
          });
        }
      }
    }
  }

  // Ensure fully connected in case of orphan nodes
  if (!checkConnectivity({ vertices, edges })) {
    const stEdges = buildConnectedSpanningTree(vertices, edgeCounter, edgeKeySet, minWeight, maxWeight, true);
    edges.push(...stEdges);
  }

  return { vertices, edges, isDirected: false };
}

/**
 * Generates a Community Cluster graph (2 distinct clusters with a bridging edge).
 */
function generateClustersTopology(nodeCount: number = 12, minWeight = 1, maxWeight = 25): Graph {
  const count = Math.max(8, Math.min(nodeCount, 20));
  const k1 = Math.floor(count / 2);
  const k2 = count - k1;

  const vertices: Vertex[] = [];
  const edges: Edge[] = [];
  const edgeKeySet = new Set<string>();
  const edgeCounter = { count: 1 };

  // Cluster 1 (Left Island)
  const cx1 = 210;
  const cy1 = 225;
  const r1 = 100;
  for (let i = 0; i < k1; i++) {
    const angle = (i * 2 * Math.PI) / k1 - Math.PI / 2;
    vertices.push({
      id: `v${i}`,
      label: getVertexLabel(i),
      x: Math.round(cx1 + r1 * Math.cos(angle) + (Math.random() * 16 - 8)),
      y: Math.round(cy1 + r1 * Math.sin(angle) + (Math.random() * 16 - 8)),
    });
  }

  // Cluster 2 (Right Island)
  const cx2 = 490;
  const cy2 = 225;
  const r2 = 100;
  for (let i = 0; i < k2; i++) {
    const idx = k1 + i;
    const angle = (i * 2 * Math.PI) / k2 - Math.PI / 2;
    vertices.push({
      id: `v${idx}`,
      label: getVertexLabel(idx),
      x: Math.round(cx2 + r2 * Math.cos(angle) + (Math.random() * 16 - 8)),
      y: Math.round(cy2 + r2 * Math.sin(angle) + (Math.random() * 16 - 8)),
    });
  }

  // Internal edges in Cluster 1
  const internalMax = Math.max(minWeight + 5, Math.floor(maxWeight * 0.5));
  for (let i = 0; i < k1; i++) {
    for (let j = i + 1; j < k1; j++) {
      if (j === i + 1 || (i === 0 && j === k1 - 1) || Math.random() < 0.45) {
        const key = makeEdgeKey(`v${i}`, `v${j}`);
        if (!edgeKeySet.has(key)) {
          edgeKeySet.add(key);
          edges.push({
            id: `e${edgeCounter.count++}`,
            source: `v${i}`,
            target: `v${j}`,
            weight: Math.floor(Math.random() * (internalMax - minWeight + 1)) + minWeight,
          });
        }
      }
    }
  }

  // Internal edges in Cluster 2
  for (let i = 0; i < k2; i++) {
    for (let j = i + 1; j < k2; j++) {
      const idxA = k1 + i;
      const idxB = k1 + j;
      if (j === i + 1 || (i === 0 && j === k2 - 1) || Math.random() < 0.45) {
        const key = makeEdgeKey(`v${idxA}`, `v${idxB}`);
        if (!edgeKeySet.has(key)) {
          edgeKeySet.add(key);
          edges.push({
            id: `e${edgeCounter.count++}`,
            source: `v${idxA}`,
            target: `v${idxB}`,
            weight: Math.floor(Math.random() * (internalMax - minWeight + 1)) + minWeight,
          });
        }
      }
    }
  }

  // Inter-cluster bridge edges with distinct prominent weights
  // Find east-most node in C1 and west-most node in C2
  let eastMostC1 = 0;
  let maxXC1 = -Infinity;
  for (let i = 0; i < k1; i++) {
    if (vertices[i].x > maxXC1) {
      maxXC1 = vertices[i].x;
      eastMostC1 = i;
    }
  }

  let westMostC2 = k1;
  let minXC2 = Infinity;
  for (let i = k1; i < count; i++) {
    if (vertices[i].x < minXC2) {
      minXC2 = vertices[i].x;
      westMostC2 = i;
    }
  }

  // Primary bridge (higher weight than internal edges)
  const bridge1Weight = Math.max(internalMax + 2, Math.round(maxWeight * 0.75));
  const bridge1Key = makeEdgeKey(`v${eastMostC1}`, `v${westMostC2}`);
  edgeKeySet.add(bridge1Key);
  edges.push({
    id: `e${edgeCounter.count++}`,
    source: `v${eastMostC1}`,
    target: `v${westMostC2}`,
    weight: bridge1Weight,
  });

  // Secondary bridge (highest weight)
  const altC1 = (eastMostC1 + 1) % k1;
  const altC2 = k1 + ((westMostC2 - k1 + 1) % k2);
  const bridge2Key = makeEdgeKey(`v${altC1}`, `v${altC2}`);
  if (!edgeKeySet.has(bridge2Key)) {
    edgeKeySet.add(bridge2Key);
    edges.push({
      id: `e${edgeCounter.count++}`,
      source: `v${altC1}`,
      target: `v${altC2}`,
      weight: Math.max(bridge1Weight + 4, maxWeight),
    });
  }

  return { vertices, edges, isDirected: false };
}

/**
 * Generates a Scale-Free / Hub & Spoke graph.
 */
function generateScaleFreeTopology(nodeCount: number = 10, minWeight = 1, maxWeight = 25): Graph {
  const count = Math.max(6, Math.min(nodeCount, 18));
  const vertices: Vertex[] = [];
  const edges: Edge[] = [];
  const edgeKeySet = new Set<string>();
  const edgeCounter = { count: 1 };

  // Hub 1 and Hub 2
  vertices.push({ id: 'v0', label: 'A', x: 260, y: 225 });
  vertices.push({ id: 'v1', label: 'B', x: 440, y: 225 });

  // Connect the two hubs
  const hubEdgeKey = makeEdgeKey('v0', 'v1');
  edgeKeySet.add(hubEdgeKey);
  edges.push({
    id: `e${edgeCounter.count++}`,
    source: 'v0',
    target: 'v1',
    weight: Math.floor(Math.random() * 8) + 2,
  });

  const remainingCount = count - 2;
  const halfRemaining = Math.ceil(remainingCount / 2);

  // Satellites for Hub 1 (arc on the left)
  for (let i = 0; i < halfRemaining; i++) {
    const idx = 2 + i;
    const angle = Math.PI / 2 + (i / Math.max(1, halfRemaining - 1)) * Math.PI;
    const r = 130 + (Math.random() * 20 - 10);
    vertices.push({
      id: `v${idx}`,
      label: getVertexLabel(idx),
      x: Math.round(260 + r * Math.cos(angle)),
      y: Math.round(225 + r * Math.sin(angle)),
    });

    // Spoke edge to Hub 1
    const spokeKey = makeEdgeKey('v0', `v${idx}`);
    edgeKeySet.add(spokeKey);
    edges.push({
      id: `e${edgeCounter.count++}`,
      source: 'v0',
      target: `v${idx}`,
      weight: Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight,
    });

    // Peripheral edge to previous satellite
    if (i > 0) {
      const ringKey = makeEdgeKey(`v${idx - 1}`, `v${idx}`);
      edgeKeySet.add(ringKey);
      edges.push({
        id: `e${edgeCounter.count++}`,
        source: `v${idx - 1}`,
        target: `v${idx}`,
        weight: Math.floor(Math.random() * 12) + 3,
      });
    }
  }

  // Satellites for Hub 2 (arc on the right)
  const hub2SatellitesCount = remainingCount - halfRemaining;
  for (let i = 0; i < hub2SatellitesCount; i++) {
    const idx = 2 + halfRemaining + i;
    const angle = -Math.PI / 2 + (i / Math.max(1, hub2SatellitesCount - 1)) * Math.PI;
    const r = 130 + (Math.random() * 20 - 10);
    vertices.push({
      id: `v${idx}`,
      label: getVertexLabel(idx),
      x: Math.round(440 + r * Math.cos(angle)),
      y: Math.round(225 + r * Math.sin(angle)),
    });

    // Spoke edge to Hub 2
    const spokeKey = makeEdgeKey('v1', `v${idx}`);
    edgeKeySet.add(spokeKey);
    edges.push({
      id: `e${edgeCounter.count++}`,
      source: 'v1',
      target: `v${idx}`,
      weight: Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight,
    });

    // Peripheral edge to previous satellite
    if (i > 0) {
      const ringKey = makeEdgeKey(`v${idx - 1}`, `v${idx}`);
      edgeKeySet.add(ringKey);
      edges.push({
        id: `e${edgeCounter.count++}`,
        source: `v${idx - 1}`,
        target: `v${idx}`,
        weight: Math.floor(Math.random() * 12) + 3,
      });
    }
  }

  // Cross edge between satellite of Hub 1 and satellite of Hub 2
  if (count >= 5) {
    const sat1 = 'v2';
    const sat2 = `v${2 + halfRemaining}`;
    const crossKey = makeEdgeKey(sat1, sat2);
    if (!edgeKeySet.has(crossKey)) {
      edgeKeySet.add(crossKey);
      edges.push({
        id: `e${edgeCounter.count++}`,
        source: sat1,
        target: sat2,
        weight: Math.floor(Math.random() * 15) + 8,
      });
    }
  }

  return { vertices, edges, isDirected: false };
}

/**
 * Generates a Bipartite Graph (two disjoint sets with cross edges).
 */
function generateBipartiteTopology(nodeCount: number = 10, minWeight = 1, maxWeight = 25): Graph {
  const count = Math.max(6, Math.min(nodeCount, 16));
  const nA = Math.floor(count / 2);
  const nB = count - nA;

  const vertices: Vertex[] = [];
  const edges: Edge[] = [];
  const edgeKeySet = new Set<string>();
  const edgeCounter = { count: 1 };

  const top = 75;
  const bottom = 375;

  // Set A (Left column)
  const stepA = nA > 1 ? (bottom - top) / (nA - 1) : 0;
  for (let i = 0; i < nA; i++) {
    vertices.push({
      id: `v${i}`,
      label: getVertexLabel(i),
      x: 180,
      y: Math.round(top + i * stepA),
    });
  }

  // Set B (Right column)
  const stepB = nB > 1 ? (bottom - top) / (nB - 1) : 0;
  for (let i = 0; i < nB; i++) {
    const idx = nA + i;
    vertices.push({
      id: `v${idx}`,
      label: getVertexLabel(idx),
      x: 520,
      y: Math.round(top + i * stepB),
    });
  }

  // Ensure every node in Set A connects to at least 1 in Set B
  for (let i = 0; i < nA; i++) {
    const targetIdx = nA + (i % nB);
    const key = makeEdgeKey(`v${i}`, `v${targetIdx}`);
    if (!edgeKeySet.has(key)) {
      edgeKeySet.add(key);
      edges.push({
        id: `e${edgeCounter.count++}`,
        source: `v${i}`,
        target: `v${targetIdx}`,
        weight: Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight,
      });
    }
  }

  // Ensure every node in Set B connects to at least 1 in Set A
  for (let j = 0; j < nB; j++) {
    const targetIdx = j % nA;
    const bIdx = nA + j;
    const key = makeEdgeKey(`v${targetIdx}`, `v${bIdx}`);
    if (!edgeKeySet.has(key)) {
      edgeKeySet.add(key);
      edges.push({
        id: `e${edgeCounter.count++}`,
        source: `v${targetIdx}`,
        target: `v${bIdx}`,
        weight: Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight,
      });
    }
  }

  // Add random cross edges strictly between Set A and Set B
  for (let i = 0; i < nA; i++) {
    for (let j = 0; j < nB; j++) {
      const bIdx = nA + j;
      const key = makeEdgeKey(`v${i}`, `v${bIdx}`);
      if (!edgeKeySet.has(key) && Math.random() < 0.35) {
        edgeKeySet.add(key);
        edges.push({
          id: `e${edgeCounter.count++}`,
          source: `v${i}`,
          target: `v${bIdx}`,
          weight: Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight,
        });
      }
    }
  }

  return { vertices, edges, isDirected: false };
}

/**
 * Generates a Large Complex Network (18-20 nodes, 30+ edges) ideal for full-screen analysis.
 */
function generateLargeNetworkTopology(nodeCount: number = 18, minWeight = 1, maxWeight = 40): Graph {
  const count = Math.max(14, Math.min(nodeCount, 24));
  const vertices: Vertex[] = [];
  const edges: Edge[] = [];
  const edgeKeySet = new Set<string>();
  const edgeCounter = { count: 1 };

  // 3 horizontal bands with staggered x positions to ensure great spacing
  const rows = 3;
  const nodesPerRow = Math.ceil(count / rows);

  const rowY = [85, 225, 365];

  for (let i = 0; i < count; i++) {
    const row = i % rows;
    const colInRow = Math.floor(i / rows);
    const xBase = 80 + colInRow * ((580 - 80) / Math.max(1, nodesPerRow - 1));
    const stagger = (row % 2 === 1) ? 25 : -20;
    const jitterX = Math.round(Math.random() * 24 - 12);
    const jitterY = Math.round(Math.random() * 20 - 10);

    vertices.push({
      id: `v${i}`,
      label: getVertexLabel(i),
      x: Math.max(55, Math.min(645, Math.round(xBase + stagger + jitterX))),
      y: Math.max(50, Math.min(400, Math.round(rowY[row] + jitterY))),
    });
  }

  // 1. Guaranteed connected proximity spanning tree
  const stEdges = buildConnectedSpanningTree(vertices, edgeCounter, edgeKeySet, minWeight, maxWeight, true);
  edges.push(...stEdges);

  // 2. Add extra local chords between vertices with distance < 200
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const u = vertices[i];
      const v = vertices[j];
      const dist = Math.hypot(u.x - v.x, u.y - v.y);
      const key = makeEdgeKey(u.id, v.id);

      if (!edgeKeySet.has(key) && dist < 190 && Math.random() < 0.42) {
        edgeKeySet.add(key);
        edges.push({
          id: `e${edgeCounter.count++}`,
          source: u.id,
          target: v.id,
          weight: Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight,
        });
      }
    }
  }

  return { vertices, edges, isDirected: false };
}

/**
 * Generates a Sparse Planar Web graph (low edge count, mostly tree-like).
 */
function generateSparseTopology(nodeCount: number = 8, minWeight = 1, maxWeight = 20): Graph {
  const count = Math.max(5, Math.min(nodeCount, 12));
  const vertices: Vertex[] = [];
  const edges: Edge[] = [];
  const edgeKeySet = new Set<string>();
  const edgeCounter = { count: 1 };

  const cx = 350;
  const cy = 225;
  const rx = 240;
  const ry = 145;

  for (let i = 0; i < count; i++) {
    const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
    vertices.push({
      id: `v${i}`,
      label: getVertexLabel(i),
      x: Math.round(cx + rx * Math.cos(angle) + (Math.random() * 20 - 10)),
      y: Math.round(cy + ry * Math.sin(angle) + (Math.random() * 20 - 10)),
    });
  }

  // Guaranteed spanning tree
  const stEdges = buildConnectedSpanningTree(vertices, edgeCounter, edgeKeySet, minWeight, maxWeight, false);
  edges.push(...stEdges);

  // Add 2-3 extra chords only
  const maxChords = Math.min(3, Math.floor(count / 2));
  let chordsAdded = 0;
  for (let i = 0; i < count && chordsAdded < maxChords; i++) {
    const nextIdx = (i + 2) % count;
    const key = makeEdgeKey(`v${i}`, `v${nextIdx}`);
    if (!edgeKeySet.has(key)) {
      edgeKeySet.add(key);
      edges.push({
        id: `e${edgeCounter.count++}`,
        source: `v${i}`,
        target: `v${nextIdx}`,
        weight: Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight,
      });
      chordsAdded++;
    }
  }

  return { vertices, edges, isDirected: false };
}

/**
 * Generates a Dense Complete / High-Density Clique graph.
 */
function generateDenseTopology(nodeCount: number = 7, minWeight = 1, maxWeight = 30): Graph {
  const count = Math.max(5, Math.min(nodeCount, 9));
  const vertices: Vertex[] = [];
  const edges: Edge[] = [];
  const edgeCounter = { count: 1 };

  const cx = 350;
  const cy = 225;
  const radius = 160;

  for (let i = 0; i < count; i++) {
    const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
    vertices.push({
      id: `v${i}`,
      label: getVertexLabel(i),
      x: Math.round(cx + radius * Math.cos(angle)),
      y: Math.round(cy + radius * Math.sin(angle)),
    });
  }

  // Connect almost every pair (85% probability or complete)
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      if (j === i + 1 || (i === 0 && j === count - 1) || Math.random() < 0.85) {
        edges.push({
          id: `e${edgeCounter.count++}`,
          source: `v${i}`,
          target: `v${j}`,
          weight: Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight,
        });
      }
    }
  }

  return { vertices, edges, isDirected: false };
}

/**
 * Generates a Circular Ring with Cross-Cutting Chords.
 */
function generateRingCycleTopology(nodeCount: number = 8, minWeight = 1, maxWeight = 20): Graph {
  const count = Math.max(6, Math.min(nodeCount, 12));
  const vertices: Vertex[] = [];
  const edges: Edge[] = [];
  const edgeKeySet = new Set<string>();
  const edgeCounter = { count: 1 };

  const cx = 350;
  const cy = 225;
  const radius = 150;

  for (let i = 0; i < count; i++) {
    const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
    vertices.push({
      id: `v${i}`,
      label: getVertexLabel(i),
      x: Math.round(cx + radius * Math.cos(angle)),
      y: Math.round(cy + radius * Math.sin(angle)),
    });
  }

  // Perimeter cycle
  for (let i = 0; i < count; i++) {
    const nextIdx = (i + 1) % count;
    const key = makeEdgeKey(`v${i}`, `v${nextIdx}`);
    edgeKeySet.add(key);
    edges.push({
      id: `e${edgeCounter.count++}`,
      source: `v${i}`,
      target: `v${nextIdx}`,
      weight: Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight,
    });
  }

  // Opposite chords through center
  const chords = Math.floor(count / 2);
  for (let i = 0; i < chords; i++) {
    const opp = (i + Math.floor(count / 2)) % count;
    const key = makeEdgeKey(`v${i}`, `v${opp}`);
    if (!edgeKeySet.has(key)) {
      edgeKeySet.add(key);
      edges.push({
        id: `e${edgeCounter.count++}`,
        source: `v${i}`,
        target: `v${opp}`,
        weight: Math.floor(Math.random() * (maxWeight - minWeight + 1)) + minWeight,
      });
    }
  }

  return { vertices, edges, isDirected: false };
}

/**
 * Generates a random connected graph with specified topology and options.
 * Backward compatible with generateRandomGraph(nodeCount).
 */
export function generateRandomGraph(
  nodeCountOrOptions?: number | RandomGraphOptions,
  topologyType?: RandomGraphTopology
): Graph {
  let count = 6;
  let topology: RandomGraphTopology = 'random';
  let minWeight = 1;
  let maxWeight = 25;

  if (typeof nodeCountOrOptions === 'number') {
    count = nodeCountOrOptions;
    if (topologyType) topology = topologyType;
  } else if (nodeCountOrOptions && typeof nodeCountOrOptions === 'object') {
    if (nodeCountOrOptions.nodeCount !== undefined) count = nodeCountOrOptions.nodeCount;
    if (nodeCountOrOptions.topology !== undefined) topology = nodeCountOrOptions.topology;
    if (nodeCountOrOptions.minWeight !== undefined) minWeight = nodeCountOrOptions.minWeight;
    if (nodeCountOrOptions.maxWeight !== undefined) maxWeight = nodeCountOrOptions.maxWeight;
  }

  // If topology is 'random', pick one of the distinctive topologies
  if (topology === 'random') {
    const availableTopologies: RandomGraphTopology[] = [
      'grid',
      'clusters',
      'scale_free',
      'bipartite',
      'sparse',
      'ring_cycle',
      'dense',
    ];
    topology = availableTopologies[Math.floor(Math.random() * availableTopologies.length)];
  }

  switch (topology) {
    case 'grid':
      return generateGridTopology(count || 12, minWeight, maxWeight);
    case 'clusters':
      return generateClustersTopology(count || 12, minWeight, maxWeight);
    case 'scale_free':
      return generateScaleFreeTopology(count || 10, minWeight, maxWeight);
    case 'bipartite':
      return generateBipartiteTopology(count || 10, minWeight, maxWeight);
    case 'large_network':
      return generateLargeNetworkTopology(count || 18, minWeight, maxWeight + 15);
    case 'sparse':
      return generateSparseTopology(count || 8, minWeight, maxWeight);
    case 'dense':
      return generateDenseTopology(count || 7, minWeight, maxWeight);
    case 'ring_cycle':
      return generateRingCycleTopology(count || 8, minWeight, maxWeight);
    default:
      return generateGridTopology(count || 8, minWeight, maxWeight);
  }
}

