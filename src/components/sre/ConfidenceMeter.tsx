import { motion } from "framer-motion";

export function ConfidenceMeter({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = value < 0.4 ? "var(--warn)" : value < 0.75 ? "var(--info)" : "var(--ok)";
  const C = 2 * Math.PI * 36;
  return (
    <div className="glass flex items-center gap-3 rounded-lg p-3">
      <svg viewBox="0 0 88 88" className="h-16 w-16">
        <circle
          cx="44"
          cy="44"
          r="36"
          stroke="color-mix(in oklab, white 10%, transparent)"
          strokeWidth="6"
          fill="none"
        />
        <motion.circle
          cx="44"
          cy="44"
          r="36"
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
          strokeDasharray={C}
          animate={{ strokeDashoffset: C * (1 - value) }}
          transition={{ duration: 0.6 }}
        />
        <text x="44" y="50" textAnchor="middle" fontSize="18" className="mono" fill="currentColor">
          {pct}
        </text>
      </svg>
      <div>
        <div className="mono text-[10px] uppercase tracking-wider opacity-70">
          Root-cause confidence
        </div>
        <div className="text-sm font-semibold" style={{ color }}>
          {value < 0.4
            ? "Forming hypothesis…"
            : value < 0.75
              ? "Hypothesis strong"
              : "High confidence"}
        </div>
        <div className="mono text-[11px] opacity-70">
          alternates: pg-failover 0.04 · stripe 0.04
        </div>
      </div>
    </div>
  );
}
