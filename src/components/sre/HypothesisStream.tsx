import { AnimatePresence, motion } from "framer-motion";
import { Brain } from "lucide-react";
import { CountUp } from "./CountUp";

type Step = { t: number; label: string; conf: number };

export function HypothesisStream({ trail, confidence }: { trail: Step[]; confidence: number }) {
  const pct = Math.round(confidence * 100);
  return (
    <div className="glass hover-lift rounded-xl p-4">
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4" style={{ color: "var(--accent)" }} />
        <div>
          <div className="text-sm font-semibold">Aethel is thinking</div>
          <div className="mono text-[10px] uppercase tracking-wider opacity-60">
            hypothesis confidence · live
          </div>
        </div>
        <div className="ml-auto text-right">
          <div
            className="text-xl font-bold tabular-nums"
            style={{
              color: pct > 90 ? "var(--ok)" : pct > 60 ? "var(--info)" : "var(--warn)",
              transition: "color 400ms ease",
            }}
          >
            <CountUp value={pct} duration={0.6} />%
          </div>
          <div className="mono text-[10px] opacity-60">
            {pct >= 92 ? "confirmed" : pct >= 60 ? "high" : pct >= 30 ? "building" : "exploring"}
          </div>
        </div>
      </div>

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted/60">
        <motion.div
          className="h-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
          style={{
            background: `linear-gradient(90deg, var(--info), ${pct > 90 ? "var(--ok)" : "var(--accent)"})`,
          }}
        />
      </div>

      <ul className="mt-3 max-h-[140px] space-y-1 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {trail.map((s) => (
            <motion.li
              key={s.t}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="mono flex items-center gap-2 text-[11px]"
            >
              <span className="opacity-50">›</span>
              <span className="flex-1 opacity-90">{s.label}</span>
              <span className="opacity-60">{Math.round(s.conf * 100)}%</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
