import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  GitPullRequest,
  MessageSquare,
  Ticket,
  ShieldCheck,
} from "lucide-react";

type Item = {
  id: string;
  icon: React.ReactNode;
  label: string;
  ref: string;
  detail: string;
  delay: number;
};

const ITEMS: Item[] = [
  {
    id: "health",
    icon: <ShieldCheck className="h-4 w-4" />,
    label: "Production healthy",
    ref: "SLO green · 60s",
    detail: "p99 42ms · err 0.2% · RSS 184Mi · synthetic checkout pass",
    delay: 0.0,
  },
  {
    id: "postmortem",
    icon: <FileText className="h-4 w-4" />,
    label: "Postmortem generated",
    ref: "RCA-4271.md",
    detail: "Blameless RCA · 5 action items · owners assigned",
    delay: 0.25,
  },
  {
    id: "pr",
    icon: <GitPullRequest className="h-4 w-4" />,
    label: "Follow-up PR merged",
    ref: "PR #814",
    detail: "fix(cache): Caffeine maxSize=10k, expireAfterAccess=5m + load test",
    delay: 0.5,
  },
  {
    id: "issue",
    icon: <Ticket className="h-4 w-4" />,
    label: "GitHub issue opened",
    ref: "shop/checkout#1207",
    detail: "Add memory budget alert · regression load test in CI",
    delay: 0.75,
  },
  {
    id: "jira",
    icon: <Ticket className="h-4 w-4" />,
    label: "Jira ticket created",
    ref: "SRE-2841",
    detail: "Roll out OrderCache fix to inventory-svc & search-svc",
    delay: 1.0,
  },
  {
    id: "slack",
    icon: <MessageSquare className="h-4 w-4" />,
    label: "Slack summary sent",
    ref: "#inc-4271 · #eng",
    detail: "Auto-summary posted · PagerDuty resolved · stakeholders paged",
    delay: 1.25,
  },
];

export function PostIncidentAutomation({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="glass rounded-xl p-4"
        >
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-muted/60">
              <CheckCircle2 className="h-4 w-4" style={{ color: "var(--ok)" }} />
            </span>
            <div>
              <div className="text-sm font-semibold">Incident closed · autonomously resolved</div>
              <div className="mono text-[10px] uppercase tracking-wider opacity-60">
                post-incident automation · zero humans in the loop
              </div>
            </div>
            <div
              className="ml-auto mono text-[10px] uppercase tracking-wider"
              style={{ color: "var(--ok)" }}
            >
              ✓ all tasks complete
            </div>
          </div>

          <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {ITEMS.map((it) => (
              <motion.li
                key={it.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: it.delay, duration: 0.35, ease: "easeOut" }}
                className="relative flex items-start gap-3 overflow-hidden rounded-lg border border-border/60 bg-muted/20 p-2.5"
              >
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: it.delay + 0.15,
                    type: "spring",
                    stiffness: 260,
                    damping: 18,
                  }}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-md"
                  style={{
                    background: "color-mix(in oklab, var(--ok) 14%, transparent)",
                    color: "var(--ok)",
                  }}
                >
                  {it.icon}
                </motion.span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[12px] font-semibold">{it.label}</span>
                    <span className="mono ml-auto shrink-0 text-[10px] opacity-70">{it.ref}</span>
                  </div>
                  <div className="mono mt-0.5 truncate text-[10px] opacity-65">{it.detail}</div>
                </div>
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: it.delay + 0.35,
                    type: "spring",
                    stiffness: 320,
                    damping: 16,
                  }}
                  className="absolute right-2 top-2"
                  style={{ color: "var(--ok)" }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </motion.span>
              </motion.li>
            ))}
          </ul>

          <div className="mono mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] opacity-60">
            <span>MTTD 38s · MTTA 0s · MTTR 13.2s (target &lt; 5m)</span>
            <span>recovery verified · SLO restored · revenue exposure capped at $27.6k</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
