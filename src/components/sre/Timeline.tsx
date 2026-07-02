import { motion, AnimatePresence } from "framer-motion";
import type { TimelineEvent } from "@/lib/sre/scenario";
import {
  AlertTriangle,
  GitCommit,
  Activity,
  Boxes,
  Bug,
  Database,
  Bell,
  Sparkles,
} from "lucide-react";

const ICON = {
  deploy: GitCommit,
  metric: Activity,
  k8s: Boxes,
  log: Bug,
  trace: Activity,
  db: Database,
  alert: Bell,
  ai: Sparkles,
} as const;

const SEV_COLOR = {
  info: "var(--info)",
  warn: "var(--warn)",
  crit: "var(--crit)",
} as const;

export function Timeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="relative">
      <div className="absolute left-[18px] top-0 bottom-0 w-px bg-border" />
      <AnimatePresence initial={false}>
        {events.map((e, i) => {
          const Icon = ICON[e.source] ?? AlertTriangle;
          const color = SEV_COLOR[e.severity];
          return (
            <motion.div
              key={`${e.at}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
              className="relative pl-12 pb-4"
            >
              <span
                className="absolute left-2 top-1 grid h-7 w-7 place-items-center rounded-full"
                style={{ background: `color-mix(in oklab, ${color} 22%, transparent)`, color }}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="flex items-baseline gap-2">
                <span className="mono text-[11px] opacity-70">{e.at}</span>
                <span className="text-sm font-semibold">{e.title}</span>
              </div>
              <p className="mt-0.5 text-xs opacity-80">{e.detail}</p>
              {e.evidence && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {e.evidence.map((ev) => (
                    <span
                      key={ev}
                      className="mono rounded bg-muted px-1.5 py-0.5 text-[10px] opacity-80"
                    >
                      {ev}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      {events.length === 0 && (
        <div className="ml-12 text-xs opacity-60">All systems nominal. Awaiting signal…</div>
      )}
    </div>
  );
}
