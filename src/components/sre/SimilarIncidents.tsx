import { History } from "lucide-react";
import { motion } from "framer-motion";
import type { SimilarIncidentHit } from "@/lib/sre/useGraphEngine";
import { CountUp } from "./CountUp";

export function SimilarIncidents({
  incidents,
  isLive,
}: {
  incidents: SimilarIncidentHit[];
  isLive?: boolean;
}) {
  return (
    <div className="glass hover-lift rounded-xl p-4">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4" style={{ color: "var(--accent)" }} />
        <div>
          <div className="text-sm font-semibold">Historical Incident Memory</div>
          <div className="mono text-[10px] uppercase tracking-wider opacity-60">
            {isLive
              ? "live Jaccard similarity · shared evidence nodes in Neo4j"
              : "similarity search · offline demo data"}
          </div>
        </div>
      </div>
      <ul className="mt-3 space-y-2">
        {incidents.map((s, idx) => {
          const pct = Math.round(s.similarity * 100);
          const color =
            pct > 80 ? "var(--ok)" : pct > 50 ? "var(--warn)" : "var(--muted-foreground)";
          return (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="hover-lift rounded-lg border border-border bg-background/40 p-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="mono text-[10px] opacity-70">{s.id}</span>
                <span className="text-xs font-semibold">{s.title}</span>
                <span className="mono ml-auto text-[10px] opacity-60">{s.date}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted/60">
                  <motion.div
                    className="h-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      delay: 0.1 + idx * 0.08,
                      duration: 0.9,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </div>
                <span className="mono text-[10px] tabular-nums" style={{ color }}>
                  <CountUp value={pct} duration={0.9} />% similar
                  {isLive ? ` (${s.sharedCount}/${s.totalTags} tags)` : ""}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {s.sharedSignals.map((t) => (
                  <span
                    key={t}
                    className="mono rounded bg-muted/60 px-1.5 py-0.5 text-[9px] opacity-80"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
