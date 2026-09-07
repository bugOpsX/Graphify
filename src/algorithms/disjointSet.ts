/**
 * Disjoint Set Union (DSU) / Union-Find Data Structure
 * Includes Path Compression and Union by Rank for O(alpha(V)) operational complexity.
 */
export class DisjointSet {
  private parent: Map<string, string>;
  private rank: Map<string, number>;

  constructor(elements: string[]) {
    this.parent = new Map();
    this.rank = new Map();
    for (const elem of elements) {
      this.parent.set(elem, elem);
      this.rank.set(elem, 0);
    }
  }

  /**
   * Find the representative (root) of the set containing element 'x'.
   * Applies Path Compression.
   */
  find(x: string): string {
    if (!this.parent.has(x)) {
      throw new Error(`Element '${x}' not found in DisjointSet.`);
    }
    if (this.parent.get(x) !== x) {
      const root = this.find(this.parent.get(x)!);
      this.parent.set(x, root);
    }
    return this.parent.get(x)!;
  }

  /**
   * Union the sets containing element 'x' and element 'y'.
   * Uses Union by Rank. Returns true if merged, false if already in same set.
   */
  union(x: string, y: string): boolean {
    const rootX = this.find(x);
    const rootY = this.find(y);

    if (rootX === rootY) {
      return false; // Already in the same connected component (would form cycle)
    }

    const rankX = this.rank.get(rootX) || 0;
    const rankY = this.rank.get(rootY) || 0;

    if (rankX < rankY) {
      this.parent.set(rootX, rootY);
    } else if (rankX > rankY) {
      this.parent.set(rootY, rootX);
    } else {
      this.parent.set(rootY, rootX);
      this.rank.set(rootX, rankX + 1);
    }

    return true;
  }

  /**
   * Check if 'x' and 'y' belong to the same set.
   */
  connected(x: string, y: string): boolean {
    return this.find(x) === this.find(y);
  }

  /**
   * Get current state snapshot of parent pointers for visualization.
   */
  getSnapshot(): Record<string, string> {
    const snapshot: Record<string, string> = {};
    for (const key of this.parent.keys()) {
      snapshot[key] = this.find(key);
    }
    return snapshot;
  }
}
