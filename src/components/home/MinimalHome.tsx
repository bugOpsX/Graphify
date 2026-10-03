import React, { useState } from 'react';
import {
  ArrowRight,
  Play,
  Sliders,
  Layers,
  Cpu,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Sparkles,
  GitCompare,
  Link as LinkIcon,
  Compass,
} from 'lucide-react';
import { FinanciluxHeroVisual } from './FinanciluxHeroVisual';

interface MinimalHomeProps {
  onOpenVisualizer: () => void;
  onOpenPresets: () => void;
  onScrollToSection: (sectionId: string) => void;
}

interface FAQItem {
  question: string;
  category: 'Basics' | 'Algorithms' | 'Theory' | 'Applications';
  answer: React.ReactNode;
}

export const MinimalHome: React.FC<MinimalHomeProps> = ({
  onOpenVisualizer,
  onOpenPresets,
  onScrollToSection,
}) => {
  const [openFaqQuestion, setOpenFaqQuestion] = useState<string | null>(
    'What is a Minimum Spanning Tree (MST)?'
  );
  const [activeFaqFilter, setActiveFaqFilter] = useState<
    'ALL' | 'Basics' | 'Algorithms' | 'Theory' | 'Applications'
  >('ALL');
  const [showAllFaqs, setShowAllFaqs] = useState<boolean>(false);

  const toggleFaq = (question: string) => {
    setOpenFaqQuestion((prev) => (prev === question ? null : question));
  };

  const handleFaqFilterChange = (
    cat: 'ALL' | 'Basics' | 'Algorithms' | 'Theory' | 'Applications'
  ) => {
    setActiveFaqFilter(cat);
    setShowAllFaqs(false);
  };

  const faqs: FAQItem[] = [
    {
      category: 'Basics',
      question: 'What is a Minimum Spanning Tree (MST)?',
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            Given a connected, undirected, weighted graph <code>G = (V, E)</code>, a <strong>Spanning Tree</strong> is an
            acyclic subgraph that connects all <code>|V|</code> vertices together using exactly <code>|V| - 1</code> edges.
          </p>
          <p style={{ marginBottom: '0.6rem' }}>
            A <strong>Minimum Spanning Tree (MST)</strong> is the spanning tree whose total sum of edge weights is minimal:
          </p>
          <div style={{ background: 'var(--fin-card-clay)', padding: '8px 14px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', marginBottom: '0.6rem' }}>
            weight(T) = Σ<sub>(u, v) ∈ T</sub> w(u, v) → Minimum
          </div>
          <p>
            If all edge weights in the graph are distinct, the graph is guaranteed to possess a <strong>unique</strong> Minimum Spanning Tree.
          </p>
        </div>
      ),
    },
    {
      category: 'Algorithms',
      question: "How does Kruskal's Algorithm work?",
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            <strong>Kruskal's algorithm</strong> is a global, edge-centric greedy algorithm designed by Joseph Kruskal in 1956.
          </p>
          <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <li><strong>Sort all edges</strong> in the graph in non-decreasing order of weight (<code>O(E log E)</code>).</li>
            <li><strong>Initialize Disjoint Set Union (DSU)</strong>: place each vertex into its own independent set.</li>
            <li><strong>Iterate through sorted edges</strong>: For each edge <code>(u, v)</code>, check whether <code>find(u) == find(v)</code>.</li>
            <li><strong>Accept or Reject</strong>: If <code>find(u) ≠ find(v)</code>, accept the edge and call <code>union(u, v)</code>. If they belong to the same component, reject the edge to prevent a cycle.</li>
            <li><strong>Termination</strong>: Stop when exactly <code>|V| - 1</code> edges have been accepted.</li>
          </ol>
          <p>
            Total Time Complexity: <strong><code>O(E log E)</code></strong> or equivalently <strong><code>O(E log V)</code></strong>.
          </p>
        </div>
      ),
    },
    {
      category: 'Algorithms',
      question: "How does Prim's Algorithm work?",
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            <strong>Prim's algorithm</strong> is a local, vertex-centric cut-growing algorithm designed by Vojtěch Jarník (1930) and rediscovered by Robert Prim (1957).
          </p>
          <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <li><strong>Pick an arbitrary root vertex <code>s</code></strong> and mark it as visited (placed in cut <code>S</code>).</li>
            <li><strong>Initialize a Binary Min-Heap (Priority Queue)</strong> with all incident edges of <code>s</code>.</li>
            <li><strong>Extract Min Edge</strong>: Pop the lowest-weight edge <code>(u, v)</code> from the queue where <code>u ∈ S</code> and <code>v ∉ S</code>.</li>
            <li><strong>Grow Tree</strong>: Add <code>(u, v)</code> to the MST, mark <code>v</code> as visited (move to <code>S</code>), and insert all edges from <code>v</code> into unvisited neighbors into the priority queue.</li>
            <li><strong>Repeat</strong> until all <code>|V|</code> vertices are visited.</li>
          </ol>
          <p>
            Total Time Complexity with Binary Min-Heap: <strong><code>O(E log V)</code></strong>. (Can reach <strong><code>O(E + V log V)</code></strong> with a Fibonacci Heap).
          </p>
        </div>
      ),
    },
    {
      category: 'Algorithms',
      question: "Kruskal's vs. Prim's: Key differences & When to choose which?",
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            While both compute an identical minimum spanning tree weight, their execution paradigms differ fundamentally:
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '0.8rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--fin-border)', background: 'var(--fin-card-clay)' }}>
                  <th style={{ padding: '8px 12px' }}>Feature</th>
                  <th style={{ padding: '8px 12px' }}>Kruskal's Algorithm</th>
                  <th style={{ padding: '8px 12px' }}>Prim's Algorithm</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--fin-border)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>Design Paradigm</td>
                  <td style={{ padding: '8px 12px' }}>Global Edge-Centric Greedy</td>
                  <td style={{ padding: '8px 12px' }}>Local Vertex-Centric Cut Growing</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--fin-border)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>Primary Data Structure</td>
                  <td style={{ padding: '8px 12px' }}>Disjoint Set Union (DSU / Union-Find)</td>
                  <td style={{ padding: '8px 12px' }}>Binary Min-Heap / Priority Queue</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--fin-border)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>Time Complexity</td>
                  <td style={{ padding: '8px 12px' }}><code>O(E log E)</code></td>
                  <td style={{ padding: '8px 12px' }}><code>O(E log V)</code></td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--fin-border)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>Optimal Graph Topology</td>
                  <td style={{ padding: '8px 12px' }}><strong>Sparse Graphs</strong> (<code>E ≪ V<sup>2</sup></code>)</td>
                  <td style={{ padding: '8px 12px' }}><strong>Dense Graphs</strong> (<code>E ≈ V<sup>2</sup></code>)</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>Intermediate State</td>
                  <td style={{ padding: '8px 12px' }}>Forest of merging subtrees</td>
                  <td style={{ padding: '8px 12px' }}>Single connected expanding tree</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Rule of Thumb:</strong> Choose Kruskal for sparse networks (e.g., roads, pipelines) because sorting few edges is fast and DSU operations run in near-constant time. Choose Prim for dense communication matrices where priority queue cut exploration avoids sorting excessive non-MST edges.
          </p>
        </div>
      ),
    },
    {
      category: 'Theory',
      question: 'What are the Cut Property and the Cycle Property?',
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            These two mathematical theorems establish the theoretical correctness of greedy MST algorithms:
          </p>
          <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <strong>The Cut Property (Prim's Foundation)</strong>: For any partition (cut) of the graph's vertices into two subsets
              <code>S</code> and <code>V \ S</code>, the edge with the minimal weight that crosses the cut is guaranteed to belong to at least one MST.
              Prim repeatedly applies this property to the cut <code>(Visited, Unvisited)</code>.
            </li>
            <li>
              <strong>The Cycle Property (Kruskal's Foundation)</strong>: For any simple cycle <code>C</code> in the graph, the edge with the
              strictly largest weight in <code>C</code> cannot belong to any MST. Kruskal avoids adding cycle-forming edges, effectively
              excluding the heaviest cycle edges.
            </li>
          </ul>
        </div>
      ),
    },
    {
      category: 'Theory',
      question: 'Can a graph have multiple different Minimum Spanning Trees?',
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            <strong>Yes.</strong> If multiple edges share the same weight, a graph can have multiple distinct spanning trees that each yield the identical minimum total cost.
          </p>
          <p>
            However, the <strong>total weight</strong> of the MST is always unique. Furthermore, if every edge in the graph has a strictly distinct weight, the MST is mathematically guaranteed to be unique.
          </p>
        </div>
      ),
    },
    {
      category: 'Theory',
      question: 'Do Kruskal and Prim work with negative edge weights or zero weights?',
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            <strong>Yes!</strong> Unlike shortest path algorithms such as Dijkstra's algorithm (which fails with negative cycles or negative edges without special handling), both Kruskal's and Prim's algorithms work <strong>correctly with negative edge weights</strong> and zero weights.
          </p>
          <p>
            This is because MST algorithms only rely on the <em>relative ordering</em> of edge weights (via the Cut and Cycle properties) and spanning connectivity, rather than path accumulation.
          </p>
        </div>
      ),
    },
    {
      category: 'Theory',
      question: 'What happens if the input graph is disconnected?',
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            If a graph contains multiple disconnected components, no single spanning tree can span all vertices.
          </p>
          <p>
            In this case, both algorithms naturally compute a <strong>Minimum Spanning Forest (MSF)</strong>—an optimal MST for each independent connected component. MST Lab automatically detects disconnected graphs and indicates the MSF status.
          </p>
        </div>
      ),
    },
    {
      category: 'Algorithms',
      question: 'How do Disjoint Set Union (DSU) and Path Compression work in Kruskal?',
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            The <strong>Disjoint Set Union (DSU)</strong> structure tracks partitions of vertices in near-constant amortized time:
          </p>
          <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <li><code>find(u)</code>: Traverses parent pointers to locate the representative root of vertex <code>u</code>'s set. With <strong>Path Compression</strong>, every node visited during <code>find</code> points directly to the root, flattening the tree.</li>
            <li><code>union(u, v)</code>: Merges the sets containing <code>u</code> and <code>v</code> by attaching the shallower tree under the deeper tree (<strong>Union by Rank</strong>).</li>
          </ul>
          <p>
            With both optimizations, operations execute in <code>O(α(V))</code> time, where <code>α</code> is the inverse Ackermann function (effectively ≤ 4 for all practical inputs).
          </p>
        </div>
      ),
    },
    {
      category: 'Applications',
      question: 'Where are Minimum Spanning Trees applied in the real world?',
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            MST algorithms are applied extensively across technology, engineering, and data science:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
            <div style={{ background: 'var(--fin-card-clay)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--fin-border)' }}>
              <strong>🌐 Fiber & Telecom Networks</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--fin-text-sub)' }}>Minimizing fiber-optic trenching length to connect regional data centers.</div>
            </div>
            <div style={{ background: 'var(--fin-card-clay)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--fin-border)' }}>
              <strong>⚡ Electrical Power Grids</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--fin-text-sub)' }}>Linking power generation plants and substations with minimal high-voltage wiring cost.</div>
            </div>
            <div style={{ background: 'var(--fin-card-clay)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--fin-border)' }}>
              <strong>🤖 Machine Learning Clustering</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--fin-text-sub)' }}>Single-linkage hierarchical clustering partitions clusters by severing heavy MST edges.</div>
            </div>
            <div style={{ background: 'var(--fin-card-clay)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--fin-border)' }}>
              <strong>🔌 VLSI Microchip Routing</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--fin-text-sub)' }}>Interconnecting semiconductor pins on silicon chips with minimal wire length and capacitance.</div>
            </div>
            <div style={{ background: 'var(--fin-card-clay)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--fin-border)' }}>
              <strong>📍 Metric TSP 2-Approximation</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--fin-text-sub)' }}>Doubling MST edges and creating an Eulerian tour yields a proven 2-approximation for TSP.</div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const filteredFaqs =
    activeFaqFilter === 'ALL'
      ? faqs
      : faqs.filter((f) => f.category === activeFaqFilter);

  const INITIAL_FAQ_COUNT = 4;
  const visibleFaqs = showAllFaqs ? filteredFaqs : filteredFaqs.slice(0, INITIAL_FAQ_COUNT);

  return (
    <main className="mst-home-page fin-theme-root">
      {/* Outer framing container replicating the editorial warm stone aesthetic */}
      <div className="fin-canvas-frame">
        {/* =========================================================================
            1. HERO SECTION: Direct Translation of Reference Image
            ========================================================================= */}
        <section className="fin-hero-section" id="hero">
          {/* Left Column: Eyebrow + 3-line Headline + Buttons */}
          <div className="fin-hero-left">
            {/* Technical Hairline Eyebrow Badge */}
            <div className="fin-hero-eyebrow">
              <span className="fin-axis-crosshair" aria-hidden="true">
                <span className="fin-axis-line" />
                <span className="fin-axis-target" />
              </span>
              <span>
                Explore interactive <strong>MST algorithms</strong>
              </span>
            </div>

            {/* Massive 3-Line Display Headline */}
            <h1 className="fin-hero-title">
              <span>Minimum</span>
              <span>Spanning</span>
              <span>Platform</span>
            </h1>

            {/* Action Buttons: Dark Pill + Outline Circle Play */}
            <div className="fin-hero-actions">
              <button className="fin-btn-dark-pill" onClick={onOpenVisualizer}>
                <span>Try for free</span>
              </button>

              <button
                className="fin-btn-outline-play"
                onClick={() => onScrollToSection('arena')}
              >
                <span className="fin-play-icon-circle">
                  <Play size={11} fill="currentColor" />
                </span>
                <span>See demo</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual Studio Card */}
          <div className="fin-hero-right">
            <FinanciluxHeroVisual onOpenStudio={onOpenVisualizer} />
          </div>
        </section>

        {/* =========================================================================
            2. BOTTOM 3-COLUMN FEATURE BAR (Directly from Reference Image)
            ========================================================================= */}
        <section className="fin-bottom-bar" id="bottom-bar">
          {/* Horizontal Hairline Dividing Rule */}
          <div className="fin-bottom-divider">
            <div className="fin-divider-line" />
          </div>

          <div className="fin-bottom-grid">
            {/* Column 1: The Floating Drawer Card */}
            <div className="fin-drawer-col">
              <div className="fin-drawer-card">
                {/* Upper Clay Section */}
                <div className="fin-drawer-top">
                  <div className="fin-drawer-stat">1 million +</div>
                  <div className="fin-drawer-desc">Real-time MST calculations executed</div>
                </div>

                {/* Lower White Drawer with Wave & Sparkle */}
                <div className="fin-drawer-bottom">
                  <div className="fin-drawer-icons">
                    <span className="fin-icon-sparkle">✦</span>
                    <span className="fin-icon-dots">••</span>
                  </div>
                  {/* Tree branching sine wave path */}
                  <svg
                    viewBox="0 0 120 20"
                    width="120"
                    height="20"
                    className="fin-drawer-wave-svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M 0 10 Q 15 2 30 10 T 60 10 T 90 10 T 120 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Column 2: Center Feature (Disjoint Set Union) */}
            <div className="fin-feature-col">
              <div className="fin-feature-icon-circle">
                <LinkIcon size={16} strokeWidth={2} />
              </div>
              <h3 className="fin-feature-title">Disjoint Set Union</h3>
              <p className="fin-feature-desc">
                Make your cycle analysis instant with path compression and union-by-rank partition trees.
              </p>
            </div>

            {/* Column 3: Right Feature (Binary Min-Heap) */}
            <div className="fin-feature-col">
              <div className="fin-feature-icon-circle">
                <Layers size={16} strokeWidth={2} />
              </div>
              <h3 className="fin-feature-title">Binary Min-Heap</h3>
              <p className="fin-feature-desc">
                Greedy cut-frontier priority queue extracting minimal weight edges at each step to expand the connected tree.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. HOW IT WORKS (3-Step Pipeline with Hairline Drafting Markers)
            ========================================================================= */}
        <section className="fin-section" id="workflow">
          <div className="fin-section-header">
            <div className="fin-section-eyebrow">
              <span className="fin-axis-crosshair" aria-hidden="true">
                <span className="fin-axis-line" />
                <span className="fin-axis-target" />
              </span>
              <span>PLATFORM WORKFLOW</span>
            </div>
            <h2 className="fin-section-title">How It Works</h2>
            <p className="fin-section-desc">
              Follow this 3-stage interactive pipeline to construct, scrub through, and analyze graph algorithms.
            </p>
          </div>

          <div className="fin-workflow-grid">
            <div className="fin-workflow-card">
              <div className="fin-workflow-num">01</div>
              <h3 className="fin-workflow-title">Construct Topology</h3>
              <p className="fin-workflow-desc">
                Place vertices, draw weighted edges, and drag nodes into position with intuitive canvas tools. Or instantly load textbook presets like Dense K5, Ring Cycles, and Disconnected Forests.
              </p>
              <div className="fin-workflow-chip">Select & Move • Add Vertex • Add Edge</div>
            </div>

            <div className="fin-workflow-card">
              <div className="fin-workflow-num">02</div>
              <h3 className="fin-workflow-title">Step Through Algorithms</h3>
              <p className="fin-workflow-desc">
                Execute Kruskal and Prim with interactive playback controls. Scrub through synchronized steps, jump forward or back, and control speed multipliers (0.5x, 1x, 2x, 4x) or use keyboard shortcuts.
              </p>
              <div className="fin-workflow-chip">Synchronized Scrubber • Step Hotkeys</div>
            </div>

            <div className="fin-workflow-card">
              <div className="fin-workflow-num">03</div>
              <h3 className="fin-workflow-title">Inspect Data Structures</h3>
              <p className="fin-workflow-desc">
                Examine live internal states: observe Kruskal's Disjoint Set Union (DSU) parent pointers and path compression, inspect Prim's Min-Priority Queue candidate cut edges, and track pseudocode.
              </p>
              <div className="fin-workflow-chip">DSU Sets • Binary Min-Heap • Metric Table</div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. KEY CAPABILITIES (Clean Circular Outline Icons)
            ========================================================================= */}
        <section className="fin-section" id="features">
          <div className="fin-section-header">
            <div className="fin-section-eyebrow">
              <span className="fin-axis-crosshair" aria-hidden="true">
                <span className="fin-axis-line" />
                <span className="fin-axis-target" />
              </span>
              <span>CORE CAPABILITIES</span>
            </div>
            <h2 className="fin-section-title">Built for Algorithmic Mastery</h2>
            <p className="fin-section-desc">
              Everything you need to deeply understand minimum spanning trees, verified data structure transitions, and theoretical complexity bounds.
            </p>
          </div>

          <div className="fin-capabilities-grid">
            <div className="fin-cap-card">
              <div className="fin-cap-icon">
                <GitCompare size={18} strokeWidth={2} />
              </div>
              <h4>Side-by-Side Dual Tracing</h4>
              <p>Run Kruskal and Prim simultaneously on the exact same graph to witness how their search orders and intermediate components differ.</p>
            </div>

            <div className="fin-cap-card">
              <div className="fin-cap-icon">
                <Sparkles size={18} strokeWidth={2} />
              </div>
              <h4>Visual Cycle Detection</h4>
              <p>Watch Kruskal evaluate edge endpoints through DSU find operations, triggering glowing red warnings whenever a cycle is prevented.</p>
            </div>

            <div className="fin-cap-card">
              <div className="fin-cap-icon">
                <Layers size={18} strokeWidth={2} />
              </div>
              <h4>Min-Cut Frontier Expansion</h4>
              <p>Observe Prim partition the graph into Visited (S) and Unvisited (V\S) sets, extracting the minimum crossing cut edge on every iteration.</p>
            </div>

            <div className="fin-cap-card">
              <div className="fin-cap-icon">
                <Sliders size={18} strokeWidth={2} />
              </div>
              <h4>Interactive Weight Editing</h4>
              <p>Click any edge or label on the canvas to change weights dynamically and observe instant recalculation across both algorithms.</p>
            </div>

            <div className="fin-cap-card">
              <div className="fin-cap-icon">
                <Compass size={18} strokeWidth={2} />
              </div>
              <h4>Arbitrary Prim Root Selection</h4>
              <p>Select any vertex as the initial starting seed for Prim's algorithm to inspect how cut frontiers propagate from different origins.</p>
            </div>

            <div className="fin-cap-card">
              <div className="fin-cap-icon">
                <Cpu size={18} strokeWidth={2} />
              </div>
              <h4>Zero-Dependency SVG Engine</h4>
              <p>High-performance vector rendering built in pure TypeScript and React, guaranteeing pixel-crisp zooming and ultra-responsive scrubbers.</p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. ABOUT SECTION
            ========================================================================= */}
        <section className="fin-section" id="about">
          <div className="fin-section-header">
            <div className="fin-section-eyebrow">
              <span className="fin-axis-crosshair" aria-hidden="true">
                <span className="fin-axis-line" />
                <span className="fin-axis-target" />
              </span>
              <span>ABOUT THE PLATFORM</span>
            </div>
            <h2 className="fin-section-title">About Graphify</h2>
            <p className="fin-section-desc">
              An open educational initiative dedicated to demystifying greedy graph algorithms and Minimum Spanning Trees.
            </p>
          </div>

          <div className="fin-about-card">
            <div className="fin-about-grid">
              <div>
                <div className="fin-about-row-title">
                  <Info size={18} />
                  <h4>Interactive Pedagogy</h4>
                </div>
                <p>
                  Traditional textbooks teach MST algorithms through static formulas and tables. Graphify brings algorithms to life by rendering exact mathematical states, cycle rejections, and priority queue evaluations in real time.
                </p>
              </div>

              <div>
                <div className="fin-about-row-title">
                  <CheckCircle2 size={18} />
                  <h4>Comparative Dual Traces</h4>
                </div>
                <p>
                  Compare Kruskal's global edge sorting strategy side by side with Prim's expanding vertex cut. See firsthand why sparse graphs benefit Kruskal and dense graphs favor Prim.
                </p>
              </div>
            </div>

            <div className="fin-about-footer">
              <span className="fin-tech-pill">
                Pure TypeScript • React • Vector SVG Engine • MIT License
              </span>
              <button className="fin-btn-dark-pill small" onClick={onOpenVisualizer}>
                <span>Launch Studio</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. KNOWLEDGE BASE (FAQs)
            ========================================================================= */}
        <section className="fin-section" id="faqs">
          <div className="fin-faq-header-split">
            <div>
              <div className="fin-section-eyebrow">
                <span className="fin-axis-crosshair" aria-hidden="true">
                  <span className="fin-axis-line" />
                  <span className="fin-axis-target" />
                </span>
                <span>KNOWLEDGE BASE</span>
              </div>
              <h2 className="fin-section-title">Frequently Asked Questions</h2>
            </div>

            <div className="fin-faq-pills">
              {(['ALL', 'Basics', 'Algorithms', 'Theory', 'Applications'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleFaqFilterChange(cat)}
                  className={`fin-faq-pill ${activeFaqFilter === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="fin-faq-list">
            {visibleFaqs.map((faq) => {
              const isOpen = openFaqQuestion === faq.question;
              return (
                <div key={faq.question} className={`fin-faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    className="fin-faq-question-btn"
                    onClick={() => toggleFaq(faq.question)}
                    aria-expanded={isOpen}
                  >
                    <div className="fin-faq-q-left">
                      <span className="fin-faq-cat-badge">{faq.category}</span>
                      <span>{faq.question}</span>
                    </div>
                    <ChevronDown size={18} className={`fin-faq-chevron ${isOpen ? 'open' : ''}`} />
                  </button>

                  {isOpen && <div className="fin-faq-answer">{faq.answer}</div>}
                </div>
              );
            })}
          </div>

          {filteredFaqs.length > INITIAL_FAQ_COUNT && (
            <div className="fin-faq-more-wrap">
              <button
                className="fin-faq-more-btn"
                onClick={() => setShowAllFaqs((prev) => !prev)}
                aria-expanded={showAllFaqs}
              >
                <span>
                  {showAllFaqs
                    ? 'Show fewer questions'
                    : `See more questions (${filteredFaqs.length - INITIAL_FAQ_COUNT} more)`}
                </span>
                {showAllFaqs ? (
                  <ChevronUp size={16} className="fin-faq-more-icon" />
                ) : (
                  <ChevronDown size={16} className="fin-faq-more-icon" />
                )}
              </button>
            </div>
          )}

          {/* Bottom Heroic CTA Box */}
          <div className="fin-cta-banner">
            <div className="fin-cta-left">
              <h4>Ready to explore algorithms in action?</h4>
              <p>
                Open the interactive visualizer studio to drag nodes, test edge weights, and step through Kruskal and Prim.
              </p>
            </div>

            <div className="fin-cta-right">
              <button className="fin-btn-dark-pill" onClick={onOpenVisualizer}>
                <span>Open Visualizer Studio</span>
                <ArrowRight size={14} />
              </button>
              <button className="fin-btn-outline" onClick={onOpenPresets}>
                <span>Browse All Presets</span>
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            9. CLEAN EDITORIAL FOOTER (With Preserved bugOpsX & KTanzeela Credits)
            ========================================================================= */}
        <footer className="fin-home-footer">
          <div className="fin-footer-left">
            <span className="fin-footer-brand">Graphify</span>
            <span className="fin-footer-tagline">• Minimum Spanning Tree Interactive Platform</span>
          </div>

          <div className="fin-footer-links">
            <button className="fin-footer-link" onClick={() => onScrollToSection('hero')}>
              Home
            </button>
            <button className="fin-footer-link" onClick={onOpenVisualizer}>
              Visualizer
            </button>
            <button className="fin-footer-link" onClick={() => onScrollToSection('workflow')}>
              How It Works
            </button>
            <button className="fin-footer-link" onClick={() => onScrollToSection('about')}>
              Features
            </button>
            <button className="fin-footer-link" onClick={() => onScrollToSection('faqs')}>
              FAQs
            </button>
            <a
              href="https://github.com/bugOpsX/Graphify"
              target="_blank"
              rel="noopener noreferrer"
              className="fin-footer-link"
            >
              <span>GitHub</span>
              <ExternalLink size={11} />
            </a>
          </div>

          {/* Preserved user credit */}
          <div className="home-footer-credit">
            Built by{' '}
            <a href="https://github.com/bugOpsX" target="_blank" rel="noopener noreferrer">
              bugOpsX
            </a>
            {' & '}
            <a href="https://github.com/KTanzeelaMohammadi" target="_blank" rel="noopener noreferrer">
              KTanzeela
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
};