import React from 'react';
import {
  GitBranch,
  ArrowRight,
  Play,
  Cpu,
  Layers,
  Network,
  Sparkles,
  BookOpen,
  Zap,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { PRESET_GRAPHS } from '../../core/presets';
import '../../styles/home.css';

interface HomePageProps {
  onLaunchStudio: (presetId?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onLaunchStudio }) => {
  return (
    <div className="home-container">
      {/* Background Ambient Lighting */}
      <div className="home-ambient-glow glow-top-left" />
      <div className="home-ambient-glow glow-top-right" />
      <div className="home-ambient-glow glow-mid-left" />

      {/* Navigation Header */}
      <nav className="home-nav">
        <div className="home-nav-brand" onClick={() => onLaunchStudio()}>
          <div className="home-nav-logo">
            <GitBranch size={19} color="#ffffff" />
          </div>
          <span className="home-nav-title">Graphify</span>
          <span className="home-nav-badge">MST Lab</span>
        </div>

        <div className="home-nav-links">
          <a href="#workflow" className="home-nav-link">Workflow</a>
          <a href="#theory" className="home-nav-link">Kruskal vs Prim</a>
          <a href="#presets" className="home-nav-link">Presets</a>
          <a href="#shortcuts" className="home-nav-link">Shortcuts</a>
          <a
            href="https://github.com/bugOpsX/Graphify"
            target="_blank"
            rel="noopener noreferrer"
            className="home-nav-link"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            GitHub <ExternalLink size={12} />
          </a>
        </div>

        <button
          className="home-nav-cta"
          onClick={() => onLaunchStudio()}
          id="nav-launch-btn"
        >
          <span>Launch Studio</span>
          <ArrowRight size={15} />
        </button>
      </nav>

      {/* Hero Section */}
      <header className="home-hero">
        <div className="home-hero-pill">
          <Sparkles size={14} />
          <span>Interactive Algorithm Laboratory • DAA Visualizer</span>
        </div>

        <h1 className="home-hero-heading">
          Master Minimum Spanning Trees <br />
          Through <span className="home-hero-gradient-text">Real-Time Visual Exploration</span>
        </h1>

        <p className="home-hero-subheading">
          Step beyond static textbook pseudocode. Watch <strong>Kruskal's</strong> edge-centric greedy strategy
          and <strong>Prim's</strong> vertex cut-expansion compete side-by-side with synchronized state inspection,
          live Disjoint Set Union trees, and Binary Min-Heap Priority Queues.
        </p>

        <div className="home-hero-actions">
          <button
            className="btn-hero-primary"
            onClick={() => onLaunchStudio()}
            id="hero-launch-primary"
          >
            <Play size={18} fill="#ffffff" />
            <span>Open Visualizer Studio</span>
          </button>

          <a href="#presets" className="btn-hero-secondary">
            <Network size={18} />
            <span>Explore Presets</span>
          </a>

          <a href="#theory" className="btn-hero-secondary">
            <BookOpen size={18} />
            <span>Learn MST Theory</span>
          </a>
        </div>

        {/* Live Studio Visual Preview Card */}
        <div className="home-preview-wrapper">
          <div className="home-preview-chrome">
            <div className="home-preview-dots">
              <div className="home-preview-dot dot-red" />
              <div className="home-preview-dot dot-yellow" />
              <div className="home-preview-dot dot-green" />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
              graphify-studio // synchronized-execution-mode
            </span>
            <div style={{ width: '40px' }} />
          </div>

          <div className="home-preview-body">
            {/* Left Canvas Preview: Kruskal */}
            <div className="home-preview-canvas">
              <div className="home-preview-badge-row">
                <span className="home-badge-kruskal">Kruskal's Algorithm</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Global Edge Greedy</span>
              </div>
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#64748b', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', marginBottom: '0.8rem' }}>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>● Accepted: 5</span>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>✕ Rejected: 4</span>
                  <span style={{ color: '#60a5fa', fontWeight: 600 }}>◆ DSU Sets: 1</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                  Sorted Edge Weights: [1, 2, 2, 3, 4, 4, 5, 6, 7]
                </div>
              </div>
              <div className="home-preview-stats">
                <span>DSU Status: <strong>Merged (Root: v_0)</strong></span>
                <span>Cost: <strong style={{ color: '#34d399' }}>12</strong></span>
              </div>
            </div>

            {/* Right Canvas Preview: Prim */}
            <div className="home-preview-canvas">
              <div className="home-preview-badge-row">
                <span className="home-badge-prim">Prim's Algorithm</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Vertex Cut Property</span>
              </div>
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#64748b', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', marginBottom: '0.8rem' }}>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>● Visited: 6/6</span>
                  <span style={{ color: '#3b82f6', fontWeight: 600 }}>▲ Min-Heap: Active</span>
                  <span style={{ color: '#f59e0b', fontWeight: 600 }}>Start: A (v_0)</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                  Priority Queue: [e_5 (w:1), e_2 (w:2), e_4 (w:3)...]
                </div>
              </div>
              <div className="home-preview-stats">
                <span>Cut Property: <strong>Optimal Edge Selected</strong></span>
                <span>Cost: <strong style={{ color: '#34d399' }}>12</strong></span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3-Step Interactive Workflow */}
      <section className="home-section" id="workflow">
        <div className="home-section-header">
          <span className="home-section-tag">How It Works</span>
          <h2 className="home-section-title">A Seamless 3-Step Learning Engine</h2>
          <p className="home-section-desc">
            Graphify bridges high-level algorithmic concepts with interactive low-level state exploration.
          </p>
        </div>

        <div className="home-workflow-grid">
          {/* Step 1 */}
          <div className="home-workflow-card">
            <span className="home-workflow-number">01</span>
            <div className="home-workflow-icon-wrap icon-blue">
              <Sliders size={22} />
            </div>
            <h3>Design & Edit Topologies</h3>
            <p>
              Drop custom vertices, draw weighted edges, and drag nodes in real time. Edit edge weights
              (supporting positive, negative, and zero values) or instantly test textbook graph presets.
            </p>
            <span className="home-workflow-footer-badge">Interactive SVG Canvas</span>
          </div>

          {/* Step 2 */}
          <div className="home-workflow-card">
            <span className="home-workflow-number">02</span>
            <div className="home-workflow-icon-wrap icon-purple">
              <Layers size={22} />
            </div>
            <h3>Run Dual Synchronized Traces</h3>
            <p>
              Scrub through the synchronized timeline or use keyboard hotkeys. Compare Kruskal's global edge sorting
              against Prim's expanding frontier on the exact same graph layout simultaneously.
            </p>
            <span className="home-workflow-footer-badge">Side-by-Side Playback</span>
          </div>

          {/* Step 3 */}
          <div className="home-workflow-card">
            <span className="home-workflow-number">03</span>
            <div className="home-workflow-icon-wrap icon-emerald">
              <Cpu size={22} />
            </div>
            <h3>Inspect Internal Data Structures</h3>
            <p>
              Demystify the internal logic. Observe Disjoint Set Union (DSU) parent pointers and path compression in
              Kruskal, alongside Prim's live Binary Min-Heap Priority Queue and visited partitions.
            </p>
            <span className="home-workflow-footer-badge">Real-Time DSU & Heap State</span>
          </div>
        </div>
      </section>

      {/* MST Theory & Comparison Section */}
      <section className="home-section" id="theory">
        <div className="home-section-header">
          <span className="home-section-tag">Theory & Complexity</span>
          <h2 className="home-section-title">Kruskal's vs. Prim's Algorithm</h2>
          <p className="home-section-desc">
            Both algorithms are greedy paradigms solving the Minimum Spanning Tree problem, but they make choices
            from opposite perspectives.
          </p>
        </div>

        <div className="home-theory-table-wrapper">
          <table className="home-theory-table">
            <thead>
              <tr>
                <th>Feature / Dimension</th>
                <th>Kruskal's Algorithm</th>
                <th>Prim's Algorithm</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Core Strategy</strong></td>
                <td className="home-algo-highlight-kruskal">Edge-Centric Greedy (Global Sorting)</td>
                <td className="home-algo-highlight-prim">Vertex-Centric Cut (Local Expansion)</td>
              </tr>
              <tr>
                <td><strong>Growth Pattern</strong></td>
                <td>Grows multiple disconnected tree components that merge into one</td>
                <td>Grows a single continuous tree outward from an initial start vertex</td>
              </tr>
              <tr>
                <td><strong>Primary Data Structure</strong></td>
                <td><strong>Disjoint Set Union (DSU)</strong> with Path Compression & Rank</td>
                <td><strong>Binary Min-Heap / Priority Queue</strong> for cut edges</td>
              </tr>
              <tr>
                <td><strong>Cycle Avoidance Mechanism</strong></td>
                <td>Checks if endpoints share the same DSU root (<kbd>find(u) == find(v)</kbd>)</td>
                <td>Maintains a set of visited vertices; skips internal edges</td>
              </tr>
              <tr>
                <td><strong>Time Complexity</strong></td>
                <td><code>O(E log E)</code> or <code>O(E log V)</code></td>
                <td><code>O(E log V)</code> with Binary Min-Heap</td>
              </tr>
              <tr>
                <td><strong>Space Complexity</strong></td>
                <td><code>O(V + E)</code> (Edge array + DSU parent/rank tables)</td>
                <td><code>O(V + E)</code> (Adjacency list + Priority Queue + Visited set)</td>
              </tr>
              <tr>
                <td><strong>Optimal Graph Density</strong></td>
                <td><strong style={{ color: '#60a5fa' }}>Sparse Graphs</strong> (fewer edges, E ≪ V²)</td>
                <td><strong style={{ color: '#34d399' }}>Dense Graphs</strong> (many edges, E ≈ V²)</td>
              </tr>
              <tr>
                <td><strong>Real-World Applications</strong></td>
                <td>Telecom pipe-laying, LAN wiring, clustering in unsupervised ML</td>
                <td>Power grid cable distribution, IP routing protocols, circuit board routing</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Curated Presets Section */}
      <section className="home-section" id="presets">
        <div className="home-section-header">
          <span className="home-section-tag">Hands-On Presets</span>
          <h2 className="home-section-title">Curated Educational Topologies</h2>
          <p className="home-section-desc">
            Launch straight into specific graph structures designed to illustrate key edge cases and algorithmic nuances.
          </p>
        </div>

        <div className="home-presets-grid">
          {PRESET_GRAPHS.map((preset) => (
            <div key={preset.id} className="home-preset-card">
              <div className="home-preset-header">
                <h3 className="home-preset-name">{preset.name}</h3>
                <p className="home-preset-desc">{preset.description}</p>
              </div>

              <div>
                <div className="home-preset-meta" style={{ marginBottom: '0.8rem' }}>
                  <span>Vertices: {preset.graph.vertices.length}</span>
                  <span>•</span>
                  <span>Edges: {preset.graph.edges.length}</span>
                </div>

                <button
                  className="home-preset-btn"
                  onClick={() => onLaunchStudio(preset.id)}
                  style={{ width: '100%' }}
                >
                  <Zap size={14} />
                  <span>Launch this Topology</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Keyboard Shortcuts Section */}
      <section className="home-section" id="shortcuts" style={{ paddingBottom: '4rem' }}>
        <div className="home-section-header" style={{ marginBottom: '2rem' }}>
          <span className="home-section-tag">Quick Navigation</span>
          <h2 className="home-section-title">Keyboard Shortcuts</h2>
          <p className="home-section-desc">
            Control playback smoothly without taking your hands off the keyboard.
          </p>
        </div>

        <div className="home-shortcuts-card">
          <div className="home-shortcut-item">
            <span className="home-shortcut-kbd">Space</span>
            <span className="home-shortcut-label">Play / Pause Execution</span>
          </div>

          <div className="home-shortcut-item">
            <span className="home-shortcut-kbd">→</span>
            <span className="home-shortcut-label">Step Forward</span>
          </div>

          <div className="home-shortcut-item">
            <span className="home-shortcut-kbd">←</span>
            <span className="home-shortcut-label">Step Backward</span>
          </div>

          <div className="home-shortcut-item">
            <span className="home-shortcut-kbd">R</span>
            <span className="home-shortcut-label">Reset to Step 0</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-left">
          <div className="home-nav-logo" style={{ width: '28px', height: '28px' }}>
            <GitBranch size={16} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.9rem' }}>Graphify</div>
            <div className="home-footer-text">Minimum Spanning Tree Interactive Laboratory • DAA Visualizer</div>
          </div>
        </div>

        <div className="home-footer-links">
          <button
            onClick={() => onLaunchStudio()}
            style={{
              background: 'none',
              border: 'none',
              color: '#60a5fa',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            Launch Studio
          </button>
          <a
            href="https://github.com/bugOpsX/Graphify"
            target="_blank"
            rel="noopener noreferrer"
            className="home-footer-link"
          >
            GitHub Repository
          </a>
          <span className="home-footer-text">MIT License • 2026</span>
        </div>
      </footer>
    </div>
  );
};
