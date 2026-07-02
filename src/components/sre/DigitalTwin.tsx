import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Boxes, Loader2, Zap } from "lucide-react";
import { WHATIF_SCENARIOS } from "@/lib/sre/scenario";
import type { BlastRadiusResult, DataSource } from "@/lib/sre/useGraphEngine";

type LiveState = { loading: boolean; result: BlastRadiusResult | null; source: DataSource | null };

export function DigitalTwin({
  live,
  onRunScenario,
}: {
  live?: LiveState;
  onRunScenario?: (serviceId: string) => void;
}) {
  const [activeId, setActiveId] = useState<string>(WHATIF_SCENARIOS[0].id);
  const preset = WHATIF_SCENARIOS.find((s) => s.id === activeId)!;

  // Prefer a live graph-traversal result (from clicking a service on the map) over the canned presets.
  const active = live?.result
    ? {
        question: `What if ${live.result.affected[0]?.label ? "this service" : "this service"} fails?`,
        verdict: live.result.verdict,
        blastRadius: live.result.affected.map((a) => a.label),
        latencyDelta: live.result.latencyDelta,
        errorDelta: live.result.errorDelta,
        revenueLossPerMin: live.result.revenueLossPerMin,
        narrative: live.result.narrative,
      }
    : preset;

  const verdictColor =
    active.verdict === "safe"
      ? "var(--ok)"
      : active.verdict === "risky"
        ? "var(--warn)"
        : "var(--crit)";

  return (
    <div className="glass hover-lift rounded-xl p-4">
      <div className="flex items-center gap-2">
        <Boxes className="h-4 w-4" style={{ color: "var(--accent)" }} />
        <div>
          <div className="text-sm font-semibold">AI Digital Twin</div>
          <div className="mono text-[10px] uppercase tracking-wider opacity-60">
            {live?.source === "neo4j"
              ? "live graph traversal · Neo4j DEPENDS_ON path query"
              : "virtual production · run hypothetical scenarios"}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {WHATIF_SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setActiveId(s.id);
              onRunScenario?.(scenarioServiceId(s.id));
            }}
            className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
              !live?.result && activeId === s.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-muted/40 hover:bg-muted"
            }`}
          >
            <Zap className="mr-1 inline h-3 w-3" />
            {s.question}
          </button>
        ))}
        {live?.loading && (
          <span className="mono flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] opacity-70">
            <Loader2 className="h-3 w-3 animate-spin" /> querying graph…
          </span>
        )}
      </div>
      {!live?.result && !live?.loading && (
        <div className="mt-1.5 text-[10px] opacity-50">
          …or click any service in the map above for a live traversal.
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={live?.result ? `live-${live.result.serviceId}` : active.question}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-3 rounded-lg border border-border bg-background/40 p-3"
        >
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-sm font-semibold">
              {live?.result ? `What if ${live.result.serviceId} dies?` : active.question}
            </div>
            <span
              className="mono rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider"
              style={{
                background: `color-mix(in oklab, ${verdictColor} 18%, transparent)`,
                color: verdictColor,
              }}
            >
              {active.verdict}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
            <Cell
              label="blast radius"
              value={active.blastRadius.length ? active.blastRadius.join(" · ") : "none"}
            />
            <Cell label="latency Δ" value={active.latencyDelta} />
            <Cell label="error Δ" value={active.errorDelta} />
            <Cell
              label="revenue loss"
              value={`$${active.revenueLossPerMin.toLocaleString()}/min`}
              tone={
                active.revenueLossPerMin > 10000
                  ? "crit"
                  : active.revenueLossPerMin > 0
                    ? "warn"
                    : "ok"
              }
            />
          </div>
          <p className="mt-2 text-[11px] leading-relaxed opacity-80">{active.narrative}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Canned preset buttons map to real service ids so they can *also* trigger a live query when Neo4j is available.
function scenarioServiceId(id: string): string {
  if (id === "checkout-restart") return "checkout";
  if (id === "redis-dies") return "redis";
  if (id === "pg-failover") return "postgres";
  return id;
}

function Cell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "crit";
}) {
  const color =
    tone === "crit"
      ? "var(--crit)"
      : tone === "warn"
        ? "var(--warn)"
        : tone === "ok"
          ? "var(--ok)"
          : "var(--foreground)";
  return (
    <div>
      <div className="mono text-[9px] uppercase tracking-wider opacity-60">{label}</div>
      <div className="text-xs font-semibold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
