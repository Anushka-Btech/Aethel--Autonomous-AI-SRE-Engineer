import { motion } from "framer-motion";
import { useState } from "react";
import type { GraphEdge, GraphNode } from "@/lib/sre/scenario";

const kindStyle: Record<GraphNode["kind"], { fill: string; ring: string; tag: string }> = {
  cause: { fill: "var(--info)", ring: "var(--info)", tag: "CAUSE" },
  effect: { fill: "var(--warn)", ring: "var(--warn)", tag: "EFFECT" },
  symptom: { fill: "var(--accent)", ring: "var(--accent)", tag: "SYMPTOM" },
  impact: { fill: "var(--crit)", ring: "var(--crit)", tag: "IMPACT" },
};

export function RootCauseGraph({
  nodes,
  edges,
  allNodes,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  allNodes: GraphNode[];
}) {
  const [hover, setHover] = useState<string | null>(null);
  const byId = Object.fromEntries(allNodes.map((n) => [n.id, n]));
  const node = hover ? byId[hover] : null;

  return (
    <div className="relative h-[300px] w-full overflow-hidden rounded-xl grid-bg">
      <svg viewBox="0 0 800 280" className="absolute inset-0 h-full w-full">
        <defs>
          <marker
            id="arr"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M0,0 L10,5 L0,10 z"
              fill="color-mix(in oklab, var(--foreground) 60%, transparent)"
            />
          </marker>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {edges.map((e, i) => {
          const a = byId[e.from],
            b = byId[e.to];
          if (!a || !b) return null;
          return (
            <motion.line
              key={`${e.from}-${e.to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="color-mix(in oklab, var(--foreground) 35%, transparent)"
              strokeWidth={1.5}
              markerEnd="url(#arr)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
            />
          );
        })}
        {nodes.map((n) => {
          const s = kindStyle[n.kind];
          const isHover = hover === n.id;
          return (
            <motion.g
              key={n.id}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              onMouseEnter={() => setHover(n.id)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={n.x}
                cy={n.y}
                r={isHover ? 26 : 22}
                fill={s.fill}
                opacity={0.18}
                filter="url(#glow)"
              />
              <circle cx={n.x} cy={n.y} r={14} fill={s.fill} stroke={s.ring} strokeWidth={1.5} />
              <text
                x={n.x}
                y={n.y + 36}
                textAnchor="middle"
                className="mono"
                fill="currentColor"
                fontSize="10.5"
                opacity={0.95}
              >
                {n.label.split("\n").map((ln, i) => (
                  <tspan key={i} x={n.x} dy={i === 0 ? 0 : 12}>
                    {ln}
                  </tspan>
                ))}
              </text>
            </motion.g>
          );
        })}
      </svg>
      {node && (
        <div className="absolute bottom-3 left-3 right-3 glass rounded-lg p-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="mono uppercase tracking-wider opacity-70">
              {kindStyle[node.kind].tag}
            </span>
            <span className="font-semibold">{node.label.replace("\n", " · ")}</span>
          </div>
          <div className="mt-1 mono text-[11px] opacity-80">
            evidence: {node.evidence.join(" · ")}
          </div>
        </div>
      )}
    </div>
  );
}
