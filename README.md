<div align="center">

# 🌿 Graphify

**An interactive visualizer & laboratory for Minimum Spanning Tree (MST) algorithms.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-FCC72B?style=flat-square&logo=vitest&logoColor=black)](https://vitest.dev/)
[![Oxlint](https://img.shields.io/badge/Linter-Oxlint-EC5990?style=flat-square&logo=oxc&logoColor=white)](https://oxc.rs/)
[![CI](https://github.com/bugOpsX/Graphify/actions/workflows/ci.yml/badge.svg)](https://github.com/bugOpsX/Graphify/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

Explore, build, and benchmark **Kruskal's** and **Prim's** algorithms side-by-side in real time with synchronized execution, internal data structure inspection, and interactive graph editing.

[Features](#-key-features) • [Algorithm Comparison](#-kruskal-vs-prim-comparison) • [Interactive Controls](#-interactive-controls--shortcuts) • [Presets](#-curated-presets) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure)

</div>

---

## 📖 Overview

**Graphify** is an educational laboratory designed for students, educators, and engineers studying graph theory and the Design & Analysis of Algorithms (DAA). Rather than observing static pseudocode, Graphify allows you to interactively manipulate graph topologies, step through execution traces, inspect live internal data structures (Disjoint Set Union & Binary Min-Heaps), and compare performance metrics side-by-side.

---

## ✨ Key Features

### 🔄 Side-by-Side & Focused Algorithm Execution
- **Synchronized Dual View**: Step through Kruskal's and Prim's algorithms simultaneously on the identical graph topology to compare edge decision ordering in real time.
- **Dedicated Single Views**: Switch directly into focused single-algorithm stages for Kruskal or Prim.

### 🎨 Fully Interactive Graph Studio
- **Dynamic Node Positioning**: Drag and drop vertices across the SVG canvas with real-time connection recalculation.
- **Add & Connect Nodes**: Switch between `Pointer`, `Add Vertex`, and `Add Edge` modes with simple point-and-click interactions.
- **Edge Weight Editor**: Click any edge to modify its weight (supports positive, zero, and negative integer weights) or delete it.
- **Customizable Start Node**: Choose any arbitrary starting vertex for Prim's algorithm cut expansion.

### 🔍 Live Data Structures & Inspector Dock
- **What & Why Step Explanations**: Plain-English rationale for every algorithmic step (`CONSIDER_EDGE`, `ACCEPT_EDGE`, `REJECT_EDGE` with cycle detection explanations).
- **Synchronized Pseudocode**: Line-by-line pseudocode highlighting reflecting current execution position.
- **Disjoint Set Union (DSU) Inspector**: Live inspection of Kruskal's disjoint sets, parent pointers, and path-compressed forest components.
- **Priority Queue / Min-Heap Inspector**: Real-time snapshot of Prim's candidate cut edges, sorted by minimum weight.
- **Dynamic Resizable Dock**: Slide, expand, or collapse the bottom inspector pane as needed.

### ⏱️ Flexible Playback Engine
- **Full Timeline Scrubbing**: Jump to any step along the algorithm trace using an intuitive slider.
- **Variable Playback Speed**: Control automatic execution rate from 0.5x up to 3x.
- **Keyboard Navigation**: Fast step-by-step stepping, pause, and reset via keyboard shortcuts.

### 📊 Real-Time Metrics & Complexity Comparison
- Track edges considered, edges accepted, and edges rejected.
- Live tally of accumulated MST weight.
- Immediate detection of disconnected components and Minimum Spanning Forests (MSF).

---

## ⚖️ Kruskal vs. Prim Comparison

| Dimension | Kruskal's Algorithm | Prim's Algorithm |
| :--- | :--- | :--- |
| **Strategy** | **Edge-Centric Greedy** (Global sorting) | **Vertex-Centric Cut** (Local expansion) |
| **Growth Pattern** | Grows multiple forest components that merge | Grows a single continuous tree from a root node |
| **Core Data Structure** | **Disjoint Set Union (DSU)** with Path Compression & Rank | **Binary Min-Heap / Priority Queue** |
| **Cycle Detection** | Find operations identify if vertices share a common root | Queue tracks cut edges; visited set prevents cycles |
| **Time Complexity** | $\mathcal{O}(E \log E)$ or $\mathcal{O}(E \log V)$ | $\mathcal{O}(E \log V)$ with Binary Heap |
| **Space Complexity** | $\mathcal{O}(V + E)$ | $\mathcal{O}(V + E)$ |
| **Optimal Graph Density**| **Sparse Graphs** ($E \ll V^2$) | **Dense Graphs** ($E \approx V^2$) |

---

## 🗂️ Curated Presets

Graphify includes built-in topologies to explore specific algorithmic behaviors:

1. **Standard Educational (6 Vertices)**: Classic textbook graph demonstrating alternating edge choices between Kruskal and Prim.
2. **Dense Complete Graph ($K_5$)**: Fully connected topology demonstrating Prim's efficiency on dense networks.
3. **Ring Cycle with Shortcuts**: Circular graph with cross-cutting chords designed to highlight cycle rejection in Kruskal's DSU.
4. **Disconnected Forest (2 Components)**: Non-contiguous components demonstrating graceful fallback to Minimum Spanning Forest (MSF) with visual alerts.

---

## 🎮 Interactive Controls & Shortcuts

### Canvas Toolbar Modes
- **Pointer Mode (`V`)**: Drag and reposition existing vertices on the canvas.
- **Add Vertex (`+ Vertex`)**: Click anywhere on the canvas to place a new vertex.
- **Add Edge (`+ Edge`)**: Click a source vertex, then click a target vertex to connect them with a default weight.
- **Edit Edge**: Click any edge line or label to open the weight adjustment modal.

### Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| <kbd>Space</kbd> | Play / Pause playback |
| <kbd>→</kbd> (Right Arrow) | Step forward one step |
| <kbd>←</kbd> (Left Arrow) | Step backward one step |
| <kbd>R</kbd> | Reset playback to initial state |

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linter**: [Oxlint](https://oxc.rs/)
- **Test Runner**: [Vitest](https://vitest.dev/) with [Testing Library](https://testing-library.com/) & [JSDOM](https://github.com/jsdom/jsdom)
- **Styling**: Vanilla CSS with modern Glassmorphism, CSS Custom Properties, and responsive flex/grid layouts.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (`v18` or higher recommended)
- npm, pnpm, or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/bugOpsX/Graphify.git
   cd Graphify
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server with Hot Module Replacement (HMR) |
| `npm run build` | Compiles TypeScript and builds production distribution into `dist/` |
| `npm run preview` | Locally previews the production build |
| `npm run lint` | Runs [Oxlint](https://oxc.rs/) across TypeScript and React source files |
| `npm run test` | Runs the test suite via [Vitest](https://vitest.dev/) |
| `npm run test:watch` | Runs Vitest in interactive watch mode |

---

## 📂 Project Structure

```text
Graphify/
├── public/                     # Static assets (favicons, SVG icons)
├── src/
│   ├── algorithms/             # Pure functional algorithm implementations
│   │   ├── disjointSet.ts      # DSU with path compression & union by rank
│   │   ├── kruskal.ts          # Kruskal's MST algorithm trace generator
│   │   ├── prim.ts             # Prim's MST algorithm trace generator
│   │   ├── priorityQueue.ts    # Binary Min-Heap Priority Queue
│   │   └── index.ts            # Public algorithm exports
│   ├── components/
│   │   ├── comparison/         # Metric comparison tables
│   │   ├── controls/           # Master timeline, toolbars, edge modal
│   │   ├── education/          # Step explanation, DSU & queue inspector, guide
│   │   ├── graph/              # Interactive SVG Canvas & nodes/edges renderer
│   │   └── layout/             # Header, resizable dock slider
│   ├── core/
│   │   ├── graphUtils.ts       # Graph validation & connectivity checks (BFS/DFS)
│   │   ├── presets.ts          # Pre-built educational graph topologies
│   │   └── types.ts            # Domain TypeScript types & interfaces
│   ├── styles/                 # Global styling, tokens, and CSS variables
│   ├── tests/                  # Vitest unit test suite
│   │   └── unit/
│   │       ├── algorithms.test.ts  # Kruskal & Prim edge case test suites
│   │       └── foundation.test.ts  # DSU & Priority Queue data structure tests
│   ├── visualization/          # State hooks (useGraphState, usePlayback)
│   ├── App.tsx                 # Main application layout and orchestrator
│   └── main.tsx                # React root entry point
├── package.json                # Project dependencies & scripts
├── tsconfig.json               # TypeScript project configurations
├── vite.config.ts              # Vite bundler configuration
└── README.md                   # Project documentation
```

---

## 🤝 Contributing

Contributions, feature suggestions, and bug reports are warmly welcomed!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "feat: add amazing feature"`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
