import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

export function PredictiveAlert({
  headline,
  eta,
  confidence,
  phase,
}: {
  headline: string;
  eta: number | null;
  confidence: number;
  phase: string;
}) {
  if (phase === "idle" || eta == null) return null;
  const color = confidence > 0.9 ? "var(--crit)" : confidence > 0.7 ? "var(--warn)" : "var(--info)";
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-xl border bg-background/60 px-4 py-2"
      style={{
        borderColor: `color-mix(in oklab, ${color} 50%, transparent)`,
        boxShadow: `0 0 32px -12px ${color}`,
      }}
    >
      <span
        className="grid h-8 w-8 place-items-center rounded-md"
        style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
      >
        <TrendingUp className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <div className="mono text-[10px] uppercase tracking-wider opacity-70" style={{ color }}>
          predictive sre · {confidence > 0.9 ? "imminent" : "early warning"}
        </div>
        <div className="text-sm font-semibold">{headline}</div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold" style={{ color }}>
          {Math.round(confidence * 100)}%
        </div>
        <div className="mono text-[10px] opacity-60">confidence</div>
      </div>
    </motion.div>
  );
}
