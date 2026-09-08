import React from 'react';

export const HeroGraphGraphic: React.FC = () => {
  // Coordinated positions matching the reference image layout
  const nodes = [
    { id: 'B', label: 'B', x: 220, y: 50 },
    { id: 'A', label: 'A', x: 80, y: 110 },
    { id: 'C', label: 'C', x: 360, y: 110 },
    { id: 'D', label: 'D', x: 80, y: 250 },
    { id: 'E', label: 'E', x: 220, y: 310 },
    { id: 'F', label: 'F', x: 360, y: 250 },
  ];

  const edges = [
    { source: 'A', target: 'B', weight: 4, midX: 140, midY: 72 },
    { source: 'B', target: 'C', weight: 6, midX: 300, midY: 72 },
    { source: 'A', target: 'D', weight: 2, midX: 70, midY: 180 },
    { source: 'B', target: 'D', weight: 1, midX: 145, midY: 175 },
    { source: 'B', target: 'E', weight: 3, midX: 228, midY: 175 },
    { source: 'C', target: 'E', weight: 4, midX: 295, midY: 205 },
    { source: 'C', target: 'F', weight: 2, midX: 370, midY: 180 },
    { source: 'D', target: 'E', weight: 5, midX: 145, midY: 288 },
    { source: 'E', target: 'F', weight: 7, midX: 295, midY: 288 },
  ];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="mst-hero-graph-card">
      <svg
        viewBox="0 0 440 360"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <defs>
          <pattern id="hero-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="var(--canvas-grid-stroke)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="var(--canvas-bg)" rx="8" />
        <rect width="100%" height="100%" fill="url(#hero-grid)" rx="8" />

        {/* Render Edges */}
        {edges.map((e, idx) => {
          const s = nodeMap.get(e.source)!;
          const t = nodeMap.get(e.target)!;
          return (
            <g key={idx}>
              <line
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke="var(--edge-default)"
                strokeWidth="1.75"
              />
              <rect
                x={e.midX - 10}
                y={e.midY - 9}
                width="20"
                height="18"
                rx="4"
                fill="var(--bg-card)"
              />
              <text
                x={e.midX}
                y={e.midY}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--text-secondary)"
                fontSize="12"
                fontWeight="500"
                fontFamily="var(--font-mono)"
              >
                {e.weight}
              </text>
            </g>
          );
        })}

        {/* Render Nodes */}
        {nodes.map((n) => (
          <g key={n.id} transform={`translate(${n.x}, ${n.y})`}>
            <circle
              r="17"
              fill="var(--node-bg-default)"
              stroke="var(--color-primary)"
              strokeWidth="2"
            />
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--text-primary)"
              fontSize="12"
              fontWeight="600"
              fontFamily="var(--font-sans)"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
