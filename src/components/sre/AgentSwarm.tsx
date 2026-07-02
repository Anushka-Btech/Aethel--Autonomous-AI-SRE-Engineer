import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import type { AgentSpec } from "@/lib/sre/scenario";

type State = AgentSpec & { status: "queued" | "working" | "done"; visibleFindings: string[] };

export function AgentSwarm({ agents }: { agents: State[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
      {agents.map((a, i) => (
        <motion.div
          key={a.id}
          layout
          initial={{ opacity: 0, x: -6 }}
          className="glass hover-lift relative rounded-lg p-3"
          animate={{
            opacity: 1,
            x: 0,
            borderColor:
              a.status === "working"
                ? "color-mix(in oklab, var(--info) 60%, transparent)"
                : a.status === "done"
                  ? "color-mix(in oklab, var(--ok) 40%, transparent)"
                  : "var(--color-border)",
            boxShadow:
              a.status === "working"
                ? "0 0 28px -12px color-mix(in oklab, var(--info) 80%, transparent)"
                : "0 0 0 0 transparent",
          }}
          transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {a.status === "working" && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-lg"
              style={{
                background:
                  "radial-gradient(120% 80% at 0% 0%, color-mix(in oklab, var(--info) 10%, transparent), transparent 60%)",
              }}
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <div className="flex items-start gap-2">
            <span className="mt-0.5">
              {a.status === "queued" && <Circle className="h-4 w-4 opacity-40" />}
              {a.status === "working" && (
                <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--info)" }} />
              )}
              {a.status === "done" && (
                <motion.span
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  className="inline-flex"
                >
                  <CheckCircle2 className="h-4 w-4" style={{ color: "var(--ok)" }} />
                </motion.span>
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">{a.name}</div>
                <StatusPill status={a.status} />
              </div>
              <div className="text-[11px] opacity-70">{a.role}</div>
              {a.visibleFindings.length > 0 && (
                <ul className="mt-1.5 space-y-0.5">
                  {a.visibleFindings.map((f, fi) => (
                    <motion.li
                      key={f}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: fi * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="mono text-[11px] opacity-90"
                    >
                      › {f}
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function StatusPill({ status }: { status: "queued" | "working" | "done" }) {
  const color =
    status === "done"
      ? "var(--ok)"
      : status === "working"
        ? "var(--info)"
        : "var(--muted-foreground)";
  return (
    <span
      className="mono inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-wider"
      style={{
        color,
        background: `color-mix(in oklab, ${color} 14%, transparent)`,
        transition: "color 240ms ease, background 240ms ease",
      }}
    >
      {status === "working" && (
        <span
          className="soft-pulse inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: color, color }}
        />
      )}
      {status}
    </span>
  );
}
