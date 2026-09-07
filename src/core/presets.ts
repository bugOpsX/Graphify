import type { Graph } from './types';

export interface PresetGraph {
  id: string;
  name: string;
  description: string;
  graph: Graph;
}

export const PRESET_GRAPHS: PresetGraph[] = [
  {
    id: 'preset-standard',
    name: 'Standard Educational (6 Vertices)',
    description: 'Classic textbook graph with 6 vertices and diverse edge weights, ideal for comparing Kruskal vs Prim.',
    graph: {
      vertices: [
        { id: 'v_0', label: 'A', x: 120, y: 120 },
        { id: 'v_1', label: 'B', x: 340, y: 80 },
        { id: 'v_2', label: 'C', x: 560, y: 120 },
        { id: 'v_3', label: 'D', x: 120, y: 320 },
        { id: 'v_4', label: 'E', x: 340, y: 360 },
        { id: 'v_5', label: 'F', x: 560, y: 320 },
      ],
      edges: [
        { id: 'e_1', source: 'v_0', target: 'v_1', weight: 4 },
        { id: 'e_2', source: 'v_0', target: 'v_3', weight: 2 },
        { id: 'e_3', source: 'v_1', target: 'v_2', weight: 6 },
        { id: 'e_4', source: 'v_1', target: 'v_4', weight: 3 },
        { id: 'e_5', source: 'v_1', target: 'v_3', weight: 1 },
        { id: 'e_6', source: 'v_2', target: 'v_5', weight: 2 },
        { id: 'e_7', source: 'v_3', target: 'v_4', weight: 5 },
        { id: 'e_8', source: 'v_4', target: 'v_5', weight: 7 },
        { id: 'e_9', source: 'v_2', target: 'v_4', weight: 4 },
      ],
      isDirected: false,
    },
  },
  {
    id: 'preset-dense',
    name: 'Dense Complete Graph (K5)',
    description: 'Fully connected graph where every pair of vertices has a weighted edge.',
    graph: {
      vertices: [
        { id: 'v_0', label: 'A', x: 340, y: 70 },
        { id: 'v_1', label: 'B', x: 550, y: 200 },
        { id: 'v_2', label: 'C', x: 460, y: 400 },
        { id: 'v_3', label: 'D', x: 220, y: 400 },
        { id: 'v_4', label: 'E', x: 130, y: 200 },
      ],
      edges: [
        { id: 'e_1', source: 'v_0', target: 'v_1', weight: 9 },
        { id: 'e_2', source: 'v_0', target: 'v_2', weight: 75 },
        { id: 'e_3', source: 'v_0', target: 'v_3', weight: 14 },
        { id: 'e_4', source: 'v_0', target: 'v_4', weight: 42 },
        { id: 'e_5', source: 'v_1', target: 'v_2', weight: 95 },
        { id: 'e_6', source: 'v_1', target: 'v_3', weight: 19 },
        { id: 'e_7', source: 'v_1', target: 'v_4', weight: 48 },
        { id: 'e_8', source: 'v_2', target: 'v_3', weight: 51 },
        { id: 'e_9', source: 'v_2', target: 'v_4', weight: 31 },
        { id: 'e_10', source: 'v_3', target: 'v_4', weight: 8 },
      ],
      isDirected: false,
    },
  },
  {
    id: 'preset-cycle',
    name: 'Ring Cycle with Shortcuts',
    description: 'Circular graph structure with cross-cutting shortcuts to highlight cycle detection in Kruskal.',
    graph: {
      vertices: [
        { id: 'v_0', label: 'A', x: 200, y: 100 },
        { id: 'v_1', label: 'B', x: 450, y: 100 },
        { id: 'v_2', label: 'C', x: 550, y: 300 },
        { id: 'v_3', label: 'D', x: 325, y: 420 },
        { id: 'v_4', label: 'E', x: 100, y: 300 },
      ],
      edges: [
        { id: 'e_1', source: 'v_0', target: 'v_1', weight: 3 },
        { id: 'e_2', source: 'v_1', target: 'v_2', weight: 8 },
        { id: 'e_3', source: 'v_2', target: 'v_3', weight: 2 },
        { id: 'e_4', source: 'v_3', target: 'v_4', weight: 5 },
        { id: 'e_5', source: 'v_4', target: 'v_0', weight: 7 },
        { id: 'e_6', source: 'v_0', target: 'v_3', weight: 4 },
        { id: 'e_7', source: 'v_1', target: 'v_4', weight: 6 },
      ],
      isDirected: false,
    },
  },
  {
    id: 'preset-disconnected',
    name: 'Disconnected Forest (2 Components)',
    description: 'Graph with two isolated components to demonstrate Minimum Spanning Forest (MSF) handling.',
    graph: {
      vertices: [
        // Component 1
        { id: 'v_0', label: 'A1', x: 120, y: 150 },
        { id: 'v_1', label: 'B1', x: 280, y: 120 },
        { id: 'v_2', label: 'C1', x: 200, y: 300 },
        // Component 2
        { id: 'v_3', label: 'X2', x: 480, y: 150 },
        { id: 'v_4', label: 'Y2', x: 640, y: 120 },
        { id: 'v_5', label: 'Z2', x: 560, y: 300 },
      ],
      edges: [
        // Edges in Component 1
        { id: 'e_1', source: 'v_0', target: 'v_1', weight: 3 },
        { id: 'e_2', source: 'v_1', target: 'v_2', weight: 5 },
        { id: 'e_3', source: 'v_2', target: 'v_0', weight: 4 },
        // Edges in Component 2
        { id: 'e_4', source: 'v_3', target: 'v_4', weight: 2 },
        { id: 'e_5', source: 'v_4', target: 'v_5', weight: 6 },
        { id: 'e_6', source: 'v_5', target: 'v_3', weight: 1 },
      ],
      isDirected: false,
    },
  },
];
