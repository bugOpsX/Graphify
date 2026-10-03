import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RotateCcw, TrendingUp, Zap, HelpCircle, Maximize2 } from 'lucide-react';

interface TimeComplexityGraphProps {
  vertexCount?: number;
  edgeCount?: number;
  algorithm?: 'ALL' | 'KRUSKAL' | 'PRIM';
  onExpand?: () => void;
  height?: number;
  interactive?: boolean;
}

export const TimeComplexityGraph: React.FC<TimeComplexityGraphProps> = ({
  vertexCount = 6,
  edgeCount = 9,
  algorithm = 'ALL',
  onExpand,
  height = 220,
  interactive = true,
}) => {
  const [animProgress, setAnimProgress] = useState<number>(0);
  const [hoveredE, setHoveredE] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Safe positive counts
  const V = Math.max(2, vertexCount);
  const currentE = Math.max(1, edgeCount);

  // Determine domain max (at least 40, or rounded above current edge count)
  const maxE = useMemo(() => {
    return Math.max(40, Math.ceil((currentE * 1.6) / 10) * 10);
  }, [currentE]);

  // Dimensions
  const svgWidth = 580;
  const svgHeight = height;
  const padLeft = 48;
  const padRight = 24;
  const padTop = 22;
  const padBottom = 32;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  // Complexity functions
  // Kruskal: O(E log2 E)
  const calcKruskalOps = (e: number) => {
    return e * Math.log2(Math.max(2, e));
  };

  // Prim (Binary Heap): O(E log2 V)
  const calcPrimOps = (e: number) => {
    return e * Math.log2(Math.max(2, V));
  };

  // Prim (Fibonacci Heap): O(E + V log2 V)
  const calcPrimFibOps = (e: number) => {
    return e + V * Math.log2(Math.max(2, V));
  };

  // Max Y value across domain
  const maxY = useMemo(() => {
    const kMax = calcKruskalOps(maxE);
    const pMax = calcPrimOps(maxE);
    const pfMax = calcPrimFibOps(maxE);
    return Math.ceil((Math.max(kMax, pMax, pfMax) * 1.15) / 20) * 20;
  }, [maxE, V]);

  // Coordinate transforms
  const scaleX = (e: number) => padLeft + (e / maxE) * plotW;
  const scaleY = (yVal: number) => padTop + plotH - (yVal / maxY) * plotH;

  // Run formation animation on mount / reset
  const startFormationAnimation = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setAnimProgress(0);
    const startTime = performance.now();
    const duration = 1350; // 1.35 seconds progressive formation

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Cubic ease out
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimProgress(eased);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    startFormationAnimation();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Compute curve points based on animation progress
  const visibleMaxE = Math.max(2, Math.round(animProgress * maxE));

  const kruskalPoints = useMemo(() => {
    const pts: { x: number; y: number; e: number }[] = [];
    for (let e = 1; e <= visibleMaxE; e += 1) {
      const ops = calcKruskalOps(e);
      pts.push({ x: scaleX(e), y: scaleY(ops), e });
    }
    return pts;
  }, [visibleMaxE, maxE, maxY, plotW, plotH]);

  const primPoints = useMemo(() => {
    const pts: { x: number; y: number; e: number }[] = [];
    for (let e = 1; e <= visibleMaxE; e += 1) {
      const ops = calcPrimOps(e);
      pts.push({ x: scaleX(e), y: scaleY(ops), e });
    }
    return pts;
  }, [visibleMaxE, maxE, maxY, V, plotW, plotH]);

  const primFibPoints = useMemo(() => {
    const pts: { x: number; y: number; e: number }[] = [];
    for (let e = 1; e <= visibleMaxE; e += 1) {
      const ops = calcPrimFibOps(e);
      pts.push({ x: scaleX(e), y: scaleY(ops), e });
    }
    return pts;
  }, [visibleMaxE, maxE, maxY, V, plotW, plotH]);

  // Convert array of points to SVG path string
  const toPathD = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    return pts.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  };

  // X-axis ticks (e.g. 0, 10, 20, 30, ...)
  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = maxE <= 50 ? 10 : 20;
    for (let e = 0; e <= maxE; e += step) {
      ticks.push(e);
    }
    return ticks;
  }, [maxE]);

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const count = 4;
    const step = Math.round(maxY / count);
    for (let i = 0; i <= count; i++) {
      ticks.push(i * step);
    }
    return ticks;
  }, [maxY]);

  // Current operating points
  const currentKruskalOps = calcKruskalOps(currentE);
  const currentPrimOps = calcPrimOps(currentE);
  const currentX = scaleX(currentE);
  const currentKruskalY = scaleY(currentKruskalOps);
  const currentPrimY = scaleY(currentPrimOps);
  const isCurrentPointVisible = animProgress >= currentE / maxE;

  // Handle interactive mouse moves
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactive || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const normX = (mouseX / rect.width) * svgWidth;

    if (normX >= padLeft && normX <= padLeft + plotW) {
      const eVal = Math.round(((normX - padLeft) / plotW) * maxE);
      setHoveredE(Math.max(1, Math.min(maxE, eVal)));
      setIsHovering(true);
    } else {
      setIsHovering(false);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setHoveredE(null);
  };

  const activeInspectE = isHovering && hoveredE !== null ? hoveredE : currentE;
  const inspectKruskalOps = calcKruskalOps(activeInspectE);
  const inspectPrimOps = calcPrimOps(activeInspectE);

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-primary, #111317)',
        border: '1px solid var(--border-subtle, #2c2f3c)',
        borderRadius: 'var(--radius-lg, 10px)',
        padding: '0.65rem 0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        boxShadow: 'var(--shadow-card, 0 4px 20px rgba(0,0,0,0.2))',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.45rem',
          borderBottom: '1px solid var(--border-subtle, #2c2f3c)',
          paddingBottom: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <TrendingUp size={16} color="var(--color-primary, #3b82f6)" />
          <div>
            <h4
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--text-primary, #f8fafc)',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {algorithm === 'KRUSKAL'
                ? "Kruskal Complexity Curve — O(E log E)"
                : algorithm === 'PRIM'
                ? "Prim Complexity Curve — O(E log V)"
                : 'Time Complexity — XY Asymptotic Plane'}
            </h4>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted, #64748b)' }}>
              {algorithm === 'KRUSKAL'
                ? `Theoretical operation growth vs edge density |E| (|V| = ${V})`
                : algorithm === 'PRIM'
                ? `Binary heap operation growth vs edge density |E| (|V| = ${V})`
                : `Dynamic growth curves plotted as a function of |E| (|V| = ${V})`}
            </div>
          </div>
        </div>

        {/* Legend Pills & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {(algorithm === 'ALL' || algorithm === 'KRUSKAL') && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.65rem',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                color: '#3b82f6',
                background: 'rgba(59, 130, 246, 0.12)',
                padding: '2px 7px',
                borderRadius: '4px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <span style={{ width: '8px', height: '2.5px', background: '#3b82f6', borderRadius: '1px' }} />
              Kruskal: O(E log E)
            </span>
          )}

          {(algorithm === 'ALL' || algorithm === 'PRIM') && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.65rem',
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '2px 7px',
                borderRadius: '4px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <span style={{ width: '8px', height: '2.5px', background: '#10b981', borderRadius: '1px' }} />
              Prim (Binary Heap): O(E log V)
            </span>
          )}

          {algorithm === 'ALL' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.65rem',
                fontWeight: 500,
                fontFamily: 'var(--font-mono)',
                color: '#f59e0b',
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
              title="Theoretical optimal with Fibonacci Heap: O(E + V log V)"
            >
              <span style={{ width: '8px', height: '1.5px', background: '#f59e0b', borderTop: '1px dashed #f59e0b' }} />
              Prim (Fibonacci)
            </span>
          )}

          {/* Re-animate button */}
          <button
            onClick={startFormationAnimation}
            title="Re-animate graph curve formation"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'var(--bg-card-subtle, #1b1d25)',
              border: '1px solid var(--border-subtle, #2c2f3c)',
              color: 'var(--text-secondary, #a0a4b0)',
              padding: '2px 7px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.65rem',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
          >
            <RotateCcw size={11} /> Re-animate
          </button>

          {/* Optional Expand to Fullscreen Workbench button */}
          {onExpand && (
            <button
              onClick={onExpand}
              title="Open full Asymptotic Complexity Analysis workbench"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'var(--color-primary-subtle, rgba(59, 130, 246, 0.15))',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                color: 'var(--color-primary, #3b82f6)',
                padding: '2px 7px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.65rem',
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
            >
              <Maximize2 size={11} /> Full Workbench
            </button>
          )}
        </div>
      </div>

      {/* SVG Canvas Coordinate Viewport */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          backgroundColor: 'var(--canvas-bg, #111317)',
          borderRadius: '6px',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle, #2c2f3c)',
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block', cursor: interactive ? 'crosshair' : 'default' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Neon Glow Filters */}
            <filter id="tc-neon-blue" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="tc-neon-green" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Subtle Gradient Fills for Area Under Curves */}
            <linearGradient id="kruskal-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="prim-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* ================= 1. COORDINATE GRID & TICKS ================= */}
          {/* Horizontal Grid lines & Y-axis labels */}
          {yTicks.map((yVal) => {
            const yPos = scaleY(yVal);
            return (
              <g key={`y-${yVal}`}>
                <line
                  x1={padLeft}
                  y1={yPos}
                  x2={padLeft + plotW}
                  y2={yPos}
                  stroke="var(--border-subtle, #2c2f3c)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  strokeOpacity="0.7"
                />
                <text
                  x={padLeft - 6}
                  y={yPos + 3.5}
                  textAnchor="end"
                  fill="var(--text-muted, #64748b)"
                  fontSize="8.5"
                  fontFamily="var(--font-mono)"
                >
                  {yVal}
                </text>
              </g>
            );
          })}

          {/* Vertical Grid lines & X-axis labels */}
          {xTicks.map((xVal) => {
            const xPos = scaleX(xVal);
            return (
              <g key={`x-${xVal}`}>
                <line
                  x1={xPos}
                  y1={padTop}
                  x2={xPos}
                  y2={padTop + plotH}
                  stroke="var(--border-subtle, #2c2f3c)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  strokeOpacity="0.7"
                />
                <text
                  x={xPos}
                  y={padTop + plotH + 11}
                  textAnchor="middle"
                  fill="var(--text-muted, #64748b)"
                  fontSize="8.5"
                  fontFamily="var(--font-mono)"
                >
                  {xVal}
                </text>
              </g>
            );
          })}

          {/* Solid Axes */}
          {/* Y Axis */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={padTop + plotH}
            stroke="var(--border-light, #334155)"
            strokeWidth="1.5"
          />
          {/* X Axis */}
          <line
            x1={padLeft}
            y1={padTop + plotH}
            x2={padLeft + plotW}
            y2={padTop + plotH}
            stroke="var(--border-light, #334155)"
            strokeWidth="1.5"
          />

          {/* Axis Titles */}
          {/* Y-Axis Label */}
          <text
            x={12}
            y={padTop + plotH / 2}
            transform={`rotate(-90, 12, ${padTop + plotH / 2})`}
            textAnchor="middle"
            fill="var(--text-secondary, #94a3b8)"
            fontSize="8.5"
            fontWeight="600"
            fontFamily="var(--font-mono)"
          >
            Theoretical Ops T(E, V) &rarr;
          </text>

          {/* X-Axis Label */}
          <text
            x={padLeft + plotW / 2}
            y={padTop + plotH + 24}
            textAnchor="middle"
            fill="var(--text-secondary, #94a3b8)"
            fontSize="8.5"
            fontWeight="600"
            fontFamily="var(--font-mono)"
          >
            Input Edge Count |E| &rarr;
          </text>

          {/* ================= 2. LIVE FORMING CURVES ================= */}
          {/* Prim (Fibonacci Heap) Optional Dashed Reference Curve */}
          {algorithm === 'ALL' && primFibPoints.length > 1 && (
            <path
              d={toPathD(primFibPoints)}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              opacity="0.8"
            />
          )}

          {/* Prim (Binary Heap) Curve */}
          {(algorithm === 'ALL' || algorithm === 'PRIM') && primPoints.length > 1 && (
            <g>
              {/* Gradient Area under curve */}
              <path
                d={`${toPathD(primPoints)} L ${scaleX(visibleMaxE)} ${padTop + plotH} L ${scaleX(1)} ${padTop + plotH} Z`}
                fill="url(#prim-area-grad)"
              />
              {/* Diffuse Neon Glow */}
              <path
                d={toPathD(primPoints)}
                fill="none"
                stroke="#10b981"
                strokeWidth="7"
                opacity="0.25"
                filter="url(#tc-neon-green)"
                strokeLinecap="round"
              />
              {/* Core Neon Curve */}
              <path
                d={toPathD(primPoints)}
                fill="none"
                stroke="#10b981"
                strokeWidth={algorithm === 'PRIM' ? '3.5' : '2.5'}
                strokeLinecap="round"
              />
              {/* Dynamic Label at Leading Edge */}
              {animProgress > 0.4 && primPoints.length > 0 && (
                <text
                  x={primPoints[primPoints.length - 1].x - 6}
                  y={primPoints[primPoints.length - 1].y - 8}
                  textAnchor="end"
                  fill="#10b981"
                  fontSize="9.5"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  O(E log V)
                </text>
              )}
            </g>
          )}

          {/* Kruskal's Curve */}
          {(algorithm === 'ALL' || algorithm === 'KRUSKAL') && kruskalPoints.length > 1 && (
            <g>
              {/* Gradient Area under curve */}
              <path
                d={`${toPathD(kruskalPoints)} L ${scaleX(visibleMaxE)} ${padTop + plotH} L ${scaleX(1)} ${padTop + plotH} Z`}
                fill="url(#kruskal-area-grad)"
              />
              {/* Diffuse Neon Glow */}
              <path
                d={toPathD(kruskalPoints)}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="7"
                opacity="0.28"
                filter="url(#tc-neon-blue)"
                strokeLinecap="round"
              />
              {/* Core Neon Curve */}
              <path
                d={toPathD(kruskalPoints)}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={algorithm === 'KRUSKAL' ? '3.5' : '2.5'}
                strokeLinecap="round"
              />
              {/* Dynamic Label at Leading Edge */}
              {animProgress > 0.4 && kruskalPoints.length > 0 && (
                <text
                  x={kruskalPoints[kruskalPoints.length - 1].x - 6}
                  y={kruskalPoints[kruskalPoints.length - 1].y - 8}
                  textAnchor="end"
                  fill="#3b82f6"
                  fontSize="9.5"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  O(E log E)
                </text>
              )}
            </g>
          )}

          {/* ================= 3. CURRENT ACTIVE GRAPH OPERATING POINT ================= */}
          {isCurrentPointVisible && (
            <g>
              {/* Vertical dotted tracer line */}
              <line
                x1={currentX}
                y1={padTop + plotH}
                x2={currentX}
                y2={Math.min(currentKruskalY, currentPrimY) - 14}
                stroke="var(--color-primary, #3b82f6)"
                strokeWidth="1.25"
                strokeDasharray="2 3"
                opacity="0.75"
              />

              {/* Marker on Kruskal Curve */}
              {(algorithm === 'ALL' || algorithm === 'KRUSKAL') && (
                <g>
                  {/* Outer Pulsing Beacon Halo */}
                  <circle
                    cx={currentX}
                    cy={currentKruskalY}
                    r="8"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    opacity="0.75"
                  >
                    <animate attributeName="r" values="5;11;5" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  {/* Core Point */}
                  <circle cx={currentX} cy={currentKruskalY} r="4.5" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                </g>
              )}

              {/* Marker on Prim Curve */}
              {(algorithm === 'ALL' || algorithm === 'PRIM') && (
                <g>
                  {/* Outer Pulsing Beacon Halo */}
                  <circle
                    cx={currentX}
                    cy={currentPrimY}
                    r="8"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    opacity="0.75"
                  >
                    <animate attributeName="r" values="5;11;5" dur="2s" begin="0.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2s" begin="0.5s" repeatCount="indefinite" />
                  </circle>
                  {/* Core Point */}
                  <circle cx={currentX} cy={currentPrimY} r="4.5" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                </g>
              )}

              {/* Badge for Current Graph Topology */}
              {!isHovering && (
                <g
                  transform={`translate(${Math.min(currentX + 8, padLeft + plotW - 126)}, ${Math.max(padTop + 8, Math.min(currentKruskalY, currentPrimY) - 22)})`}
                >
                  <rect
                    x="0"
                    y="0"
                    width="122"
                    height="18"
                    rx="4"
                    fill="var(--bg-secondary, #16181f)"
                    stroke="var(--color-primary, #3b82f6)"
                    strokeWidth="1"
                    filter="drop-shadow(0 2px 5px rgba(0,0,0,0.3))"
                  />
                  <text
                    x="61"
                    y="12.5"
                    textAnchor="middle"
                    fill="var(--text-primary, #f5f5f7)"
                    fontSize="8.5"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                  >
                    Current Graph: |E|={currentE}, |V|={V}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* ================= 4. INTERACTIVE HOVER CROSSHAIR ================= */}
          {isHovering && hoveredE !== null && (
            <g>
              <line
                x1={scaleX(hoveredE)}
                y1={padTop}
                x2={scaleX(hoveredE)}
                y2={padTop + plotH}
                stroke="#60a5fa"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              {(algorithm === 'ALL' || algorithm === 'KRUSKAL') && (
                <circle
                  cx={scaleX(hoveredE)}
                  cy={scaleY(calcKruskalOps(hoveredE))}
                  r="4.5"
                  fill="#ffffff"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
              )}
              {(algorithm === 'ALL' || algorithm === 'PRIM') && (
                <circle
                  cx={scaleX(hoveredE)}
                  cy={scaleY(calcPrimOps(hoveredE))}
                  r="4.5"
                  fill="#ffffff"
                  stroke="#10b981"
                  strokeWidth="2"
                />
              )}
            </g>
          )}
        </svg>

        {/* Live Hover / Active Inspection Tooltip Strip */}
        <div
          style={{
            position: 'absolute',
            top: '6px',
            right: '8px',
            backgroundColor: 'var(--bg-card, rgba(22, 24, 31, 0.95))',
            backdropFilter: 'blur(6px)',
            border: '1px solid var(--border-subtle, #2c2f3c)',
            borderRadius: '5px',
            padding: '3px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ color: 'var(--text-secondary, #94a3b8)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={10} color="#f59e0b" />
            <span>
              |E| = <strong style={{ color: 'var(--text-primary, #f8fafc)' }}>{activeInspectE}</strong>:
            </span>
          </div>

          {(algorithm === 'ALL' || algorithm === 'KRUSKAL') && (
            <span style={{ color: '#60a5fa' }}>
              Kruskal: <strong>{inspectKruskalOps.toFixed(1)} ops</strong>
            </span>
          )}

          {(algorithm === 'ALL' || algorithm === 'PRIM') && (
            <span style={{ color: '#34d399' }}>
              Prim: <strong>{inspectPrimOps.toFixed(1)} ops</strong>
            </span>
          )}

          {algorithm === 'ALL' && (
            <span
              style={{
                color: inspectKruskalOps < inspectPrimOps ? '#60a5fa' : '#34d399',
                fontWeight: 700,
                fontSize: '0.65rem',
                padding: '1px 5px',
                borderRadius: '3px',
                background: inspectKruskalOps < inspectPrimOps ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)',
              }}
            >
              {inspectKruskalOps < inspectPrimOps ? 'Kruskal Faster' : 'Prim Faster'}
            </span>
          )}
        </div>
      </div>

      {/* Analytical Footnote */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.4rem',
          fontSize: '0.65rem',
          color: 'var(--text-muted, #64748b)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <HelpCircle size={11} />
          <span>Hover to inspect theoretical operations at any density. Notice where curves intersect!</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)' }}>
          Active Topology: <strong>|V| = {V}</strong> vertices, <strong>|E| = {currentE}</strong> edges
        </div>
      </div>
    </div>
  );
};
