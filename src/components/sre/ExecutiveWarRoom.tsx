import { AnimatePresence, motion } from "framer-motion";
import { DollarSign, Users, Clock, ShieldCheck, AlertTriangle, Activity } from "lucide-react";
import { CountUp } from "./CountUp";

type Impact = {
  revenuePerMin: number;
  customers: number;
  cumulativeLoss: number;
  etaSec: number;
  sessions: number;
};

export function ExecutiveWarRoom({
  impact,
  confidence,
  action,
  phase,
}: {
  impact: Impact;
  confidence: number;
  action: string;
  phase: string;
}) {
  const recovered = phase === "verifying" || phase === "closed";
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-6">
      <Stat
        index={0}
        icon={<DollarSign className="h-3.5 w-3.5" />}
        label="revenue exposure"
        value={
          recovered ? (
            "$0"
          ) : (
            <>
              <span>$</span>
              <CountUp value={impact.revenuePerMin} />
            </>
          )
        }
        sub={recovered ? "recovered" : "per minute"}
        tone={recovered ? "ok" : impact.revenuePerMin > 0 ? "crit" : "muted"}
      />
      <Stat
        index={1}
        icon={<Users className="h-3.5 w-3.5" />}
        label="customers impacted"
        value={recovered ? "0" : <CountUp value={impact.customers} />}
        sub={
          <>
            <CountUp value={impact.sessions} duration={0.6} /> sessions
          </>
        }
        tone={recovered ? "ok" : impact.customers > 0 ? "warn" : "muted"}
      />
      <Stat
        index={2}
        icon={<Activity className="h-3.5 w-3.5" />}
        label="affected services"
        value={recovered ? "0" : "3"}
        sub="checkout · payments · cart"
        tone={recovered ? "ok" : impact.customers > 0 ? "warn" : "muted"}
      />
      <Stat
        index={3}
        icon={<Clock className="h-3.5 w-3.5" />}
        label="estimated recovery"
        value={recovered ? "—" : `${Math.floor(impact.etaSec / 60)}m ${impact.etaSec % 60}s`}
        sub="autonomous ETA"
        tone="info"
      />
      <Stat
        index={4}
        icon={<ShieldCheck className="h-3.5 w-3.5" />}
        label="ai confidence"
        value={
          <>
            <CountUp value={Math.round(confidence * 100)} duration={0.6} />%
          </>
        }
        sub={confidence > 0.9 ? "confirmed" : confidence > 0.5 ? "high" : "building"}
        tone={confidence > 0.9 ? "ok" : "info"}
      />
      <Stat
        index={5}
        icon={<AlertTriangle className="h-3.5 w-3.5" />}
        label="suggested action"
        value={action}
        sub={recovered ? "completed" : "queued for auto-exec"}
        tone={recovered ? "ok" : "warn"}
      />
      <AnimatePresence>
        {!recovered && impact.cumulativeLoss > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-2 md:col-span-6 mono text-[10px] opacity-60"
          >
            cumulative loss this incident: ~${impact.cumulativeLoss.toLocaleString()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  tone,
  index = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub: React.ReactNode;
  tone: "ok" | "warn" | "crit" | "info" | "muted";
  index?: number;
}) {
  const color =
    tone === "ok"
      ? "var(--ok)"
      : tone === "warn"
        ? "var(--warn)"
        : tone === "crit"
          ? "var(--crit)"
          : tone === "info"
            ? "var(--info)"
            : "var(--muted-foreground)";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="glass hover-lift rounded-lg p-2.5"
    >
      <div
        className="mono flex items-center gap-1 text-[9px] uppercase tracking-wider opacity-70"
        style={{ color }}
      >
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-lg font-bold leading-tight tabular-nums" style={{ color }}>
        {value}
      </div>
      <div className="mono text-[10px] opacity-60">{sub}</div>
    </motion.div>
  );
}
