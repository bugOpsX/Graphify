import type { AlgorithmStep } from '../core/types';

export type EdgeVisualState = 'DEFAULT' | 'CONSIDERING' | 'ACCEPTED' | 'REJECTED';
export type VertexVisualState = 'DEFAULT' | 'VISITED' | 'ACTIVE';

export interface VisualStateMap {
  getEdgeState: (edgeId: string) => EdgeVisualState;
  getVertexState: (vertexId: string) => VertexVisualState;
  getVertexGroupColor: (vertexId: string) => string | undefined;
}

const PALETTE = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#14b8a6', // Teal
];

/**
 * Resolves visual states for edges and vertices given the current algorithm execution step.
 */
export function getStepVisualStates(step: AlgorithmStep | null): VisualStateMap {
  if (!step) {
    return {
      getEdgeState: () => 'DEFAULT',
      getVertexState: () => 'DEFAULT',
      getVertexGroupColor: () => undefined,
    };
  }

  const acceptedSet = new Set(step.acceptedEdgeIds);
  const rejectedSet = new Set(step.rejectedEdgeIds);
  const visitedSet = new Set(step.visitedVertexIds);

  // Group color map for Kruskal DSU visualization
  const groupColorMap = new Map<string, string>();
  if (step.disjointSetState) {
    const rootSet = Array.from(new Set(Object.values(step.disjointSetState)));
    for (const [vId, rootId] of Object.entries(step.disjointSetState)) {
      const rootIndex = rootSet.indexOf(rootId);
      const color = PALETTE[rootIndex % PALETTE.length];
      groupColorMap.set(vId, color);
    }
  }

  return {
    getEdgeState: (edgeId: string) => {
      if (step.activeEdgeId === edgeId) {
        if (step.type === 'ACCEPT_EDGE') return 'ACCEPTED';
        if (step.type === 'REJECT_EDGE') return 'REJECTED';
        return 'CONSIDERING';
      }
      if (acceptedSet.has(edgeId)) return 'ACCEPTED';
      if (rejectedSet.has(edgeId)) return 'REJECTED';
      return 'DEFAULT';
    },

    getVertexState: (vertexId: string) => {
      if (visitedSet.has(vertexId)) return 'VISITED';
      return 'DEFAULT';
    },

    getVertexGroupColor: (vertexId: string) => groupColorMap.get(vertexId),
  };
}
