/**
 * Core Domain Types for MST Lab
 * Phase 1 Foundation
 */

export interface Vertex {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface Edge {
  id: string;
  source: string; // Source Vertex ID
  target: string; // Target Vertex ID
  weight: number; // Supports negative, zero, and positive integer weights
}

export interface Graph {
  vertices: Vertex[];
  edges: Edge[];
  isDirected?: boolean;
}

export type StepType =
  | 'INIT'
  | 'CONSIDER_EDGE'
  | 'ACCEPT_EDGE'
  | 'REJECT_EDGE'
  | 'UPDATE_STRUCTURE'
  | 'COMPLETE'
  | 'WARNING_DISCONNECTED';

export interface PriorityQueueItem {
  edgeId: string;
  weight: number;
  source: string;
  target: string;
}

export interface AlgorithmStep {
  stepIndex: number;
  type: StepType;
  activeEdgeId?: string;
  acceptedEdgeIds: string[];
  rejectedEdgeIds: string[];
  visitedVertexIds: string[];
  disjointSetState?: Record<string, string>;
  priorityQueueState?: PriorityQueueItem[];
  currentWeight: number;
  explanation: string;
  pseudocodeLine: number;
}

export interface MSTResult {
  mstEdges: Edge[];
  totalWeight: number;
  isCompleteMST: boolean; // true = MST, false = MSF
  totalSteps: number;
  edgesConsideredCount: number;
  edgesAcceptedCount: number;
  edgesRejectedCount: number;
}

export interface ExecutionTrace {
  algorithm: 'KRUSKAL' | 'PRIM';
  steps: AlgorithmStep[];
  result: MSTResult;
}

export interface AlgorithmOptions {
  startVertexId?: string;
}
