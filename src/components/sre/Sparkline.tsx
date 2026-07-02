import { motion } from "framer-motion";
import { CountUp } from "./CountUp";

export function Sparkline({
  data,
  color = "var(--info)",
  height = 40,
  suffix = "",
  label,
  value,
  precision = 0,
}: {
  data: number[];
  color?: string;
  height?: number;
  suffix?: string;
  label: string;
  value: number;
  precision?: number;
}) {
  const w = 220,
    h = height;
  const min = Math.min(...data),
    max = Math.max(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return `${x},${y}`;
    })
    .join(" ");
  const safeId = label.replace(/[^a-z0-9]/gi, "-");
  const fmt = (n: number) =>
    precision === 0 ? Math.round(n).toLocaleString() : n.toFixed(precision);
  return (
    <div className="glass hover-lift rounded-lg p-3">
      <div className="flex items-baseline justify-between">
        <div className="mono text-[10px] uppercase tracking-wider opacity-70">{label}</div>
        <div className="mono text-sm font-semibold tabular-nums" style={{ color }}>
          <CountUp value={value} format={fmt} duration={0.4} />
          {suffix}
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 h-10 w-full">
        <defs>
          <linearGradient id={`g-${safeId}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.45" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.polyline
          points={`0,${h} ${pts} ${w},${h}`}
          fill={`url(#g-${safeId})`}
          stroke="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <motion.polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ transition: "stroke 600ms ease" }}
        />
      </svg>
    </div>
  );
}
