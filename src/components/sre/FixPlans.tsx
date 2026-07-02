import { motion } from "framer-motion";
import { CheckCircle2, Terminal } from "lucide-react";
import { FIX_PLANS } from "@/lib/sre/scenario";
import { CountUp } from "./CountUp";

export function FixPlans({ active }: { active: boolean }) {
  return (
    <div className="glass hover-lift rounded-xl p-4">
      <div className="flex items-center gap-2">
        <div>
          <div className="text-sm font-semibold">Autonomous Fix Simulation</div>
          <div className="mono text-[10px] uppercase tracking-wider opacity-60">
            3 candidates · replayed against digital twin
          </div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {FIX_PLANS.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: active ? 1 : 0.45, y: 0 }}
            transition={{ delay: i * 0.14, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2 }}
            className="relative rounded-lg border bg-card/40 p-3 hover-lift"
            style={{
              borderColor: p.recommended
                ? "color-mix(in oklab, var(--ok) 60%, transparent)"
                : "var(--color-border)",
              boxShadow: p.recommended ? "0 0 24px -10px var(--ok)" : undefined,
            }}
          >
            {p.recommended && (
              <span
                className="absolute -top-2 right-3 inline-flex items-center gap-1 rounded-full bg-ok px-2 py-0.5 mono text-[9px] uppercase tracking-wider"
                style={{ background: "var(--ok)", color: "var(--primary-foreground)" }}
              >
                <CheckCircle2 className="h-2.5 w-2.5" /> recommended
              </span>
            )}
            <div className="flex items-center justify-between">
              <span className="mono text-[10px] uppercase tracking-wider opacity-70">
                Plan {p.id}
              </span>
              <span className="mono text-[10px] opacity-70">success</span>
            </div>
            <div className="mt-0.5 flex items-baseline justify-between gap-2">
              <div className="text-sm font-semibold">{p.label}</div>
              <div
                className="text-lg font-bold tabular-nums"
                style={{
                  color:
                    p.successProb > 0.8
                      ? "var(--ok)"
                      : p.successProb > 0.5
                        ? "var(--warn)"
                        : "var(--crit)",
                }}
              >
                {active ? (
                  <>
                    <CountUp value={Math.round(p.successProb * 100)} duration={0.9} />%
                  </>
                ) : (
                  <>{Math.round(p.successProb * 100)}%</>
                )}
              </div>
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-1 mono text-[10px] opacity-80">
              <div>
                <span className="opacity-60">downtime:</span> {p.downtimeSec}s
              </div>
              <div>
                <span className="opacity-60">exposure:</span> $
                {p.revenueExposureUsd.toLocaleString()}
              </div>
              <div className="col-span-2">
                <span className="opacity-60">blast:</span> {p.blastRadius}
              </div>
            </div>
            <div className="mt-2 rounded-md bg-background/60 p-1.5">
              <div className="mono flex items-center gap-1 text-[10px] opacity-80">
                <Terminal className="h-3 w-3" /> {p.command}
              </div>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed opacity-75">{p.rationale}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
