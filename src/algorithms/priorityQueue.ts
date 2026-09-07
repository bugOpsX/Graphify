import type { PriorityQueueItem } from '../core/types';

/**
 * Binary Min-Heap Priority Queue implementation for Prim's algorithm.
 */
export class PriorityQueue {
  private heap: PriorityQueueItem[] = [];

  constructor(items: PriorityQueueItem[] = []) {
    for (const item of items) {
      this.push(item);
    }
  }

  get size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  push(item: PriorityQueueItem): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): PriorityQueueItem | undefined {
    if (this.isEmpty()) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.sinkDown(0);
    }
    return top;
  }

  peek(): PriorityQueueItem | undefined {
    return this.heap[0];
  }

  /**
   * Returns an array snapshot of queue items for UI visualization.
   */
  getSnapshot(): PriorityQueueItem[] {
    return [...this.heap].sort((a, b) => a.weight - b.weight);
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].weight >= this.heap[parentIndex].weight) break;

      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < length && this.heap[leftChild].weight < this.heap[smallest].weight) {
        smallest = leftChild;
      }
      if (rightChild < length && this.heap[rightChild].weight < this.heap[smallest].weight) {
        smallest = rightChild;
      }
      if (smallest === index) break;

      this.swap(index, smallest);
      index = smallest;
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}
