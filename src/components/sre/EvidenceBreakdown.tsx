import { motion } from "framer-motion";
import { EVIDENCE_SOURCES } from "@/lib/sre/scenario";
import { CountUp } from "./CountUp";

export function EvidenceBreakdown({ overall }: { overall: number }) {
  return (
    <div className="glass hover-lift rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Evidence Breakdown</div>
          <div className="mono text-[10px] uppercase tracking-wider opacity-60">
            confidence per source · why aethel is sure
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold tabular-nums" style={{ color: "var(--ok)" }}>
            <CountUp value={Math.round(overall * 100)} duration={0.7} />%
          </div>
          <div className="mono text-[9px] uppercase opacity-60">overall</div>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5">
        {EVIDENCE_SOURCES.map((e, i) => (
          <li key={e.id}>
            <div className="flex items-center gap-2">
              <span className="mono w-32 shrink-0 text-[11px] opacity-80">{e.label}</span>
              <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted/60">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(e.confidence * 100)}%` }}
                  transition={{ delay: i * 0.06, duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, var(--info), ${e.confidence > 0.85 ? "var(--ok)" : "var(--accent)"})`,
                  }}
                />
              </div>
              <span className="mono w-10 text-right text-[10px] opacity-80">
                {Math.round(e.confidence * 100)}%
              </span>
              <span className="mono w-12 text-right text-[10px] opacity-50">{e.signals}↑</span>
            </div>
            <div className="mono ml-32 mt-0.5 pl-2 text-[10px] opacity-55">{e.note}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
