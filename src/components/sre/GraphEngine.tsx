import { useState } from "react";
import { motion } from "framer-motion";
import { Database, RefreshCw, Terminal } from "lucide-react";
import type { DataSource } from "@/lib/sre/useGraphEngine";

type Stats = {
  configured: boolean;
  connected: boolean;
  data: { nodes: number; relationships: number; labels: string[] } | null;
} | null;

export function GraphEngine({
  source,
  stats,
  onSeed,
  onRefresh,
  rootCauseCypher,
  serviceMapCypher,
  similarityCypher,
}: {
  source: DataSource;
  stats: Stats;
  onSeed: () => Promise<{ ok: boolean; error?: string }>;
  onRefresh: () => Promise<void>;
  rootCauseCypher: string | null;
  serviceMapCypher: string | null;
  similarityCypher: string | null;
}) {
  const [tab, setTab] = useState<"root-cause" | "service-map" | "similarity">("root-cause");
  const [seeding, setSeeding] = useState(false);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const isLive = source === "neo4j";
  const needsSeed = stats?.configured && stats.connected && (stats.data?.nodes ?? 0) === 0;

  const handleSeed = async () => {
    setSeeding(true);
    setSeedError(null);
    try {
      const res = await onSeed();
      if (!res.ok) setSeedError(res.error ?? "Seeding failed");
    } finally {
      setSeeding(false);
    }
  };

  const cypherByTab = {
    "root-cause": rootCauseCypher,
    "service-map": serviceMapCypher,
    similarity: similarityCypher,
  };

  return (
    <div className="glass hover-lift rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4" style={{ color: isLive ? "var(--ok)" : "var(--warn)" }} />
          <div>
            <div className="text-sm font-semibold">Graph Reasoning Engine</div>
            <div className="mono text-[10px] uppercase tracking-wider opacity-60">
              causal graph · service topology · similarity search — all Cypher, no hardcoded arrays
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="mono flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider"
            style={{
              background: `color-mix(in oklab, ${isLive ? "var(--ok)" : "var(--warn)"} 16%, transparent)`,
              color: isLive ? "var(--ok)" : "var(--warn)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: isLive ? "var(--ok)" : "var(--warn)" }}
            />
            {isLive
              ? "Neo4j · live"
              : stats?.configured
                ? "Neo4j configured · unseeded"
                : "offline demo mode"}
          </span>
          <button
            onClick={() => onRefresh()}
            className="rounded-md border border-border p-1.5 hover:bg-muted/60"
            title="Re-run queries"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="nodes" value={stats?.data?.nodes ?? "—"} />
        <Stat label="relationships" value={stats?.data?.relationships ?? "—"} />
        <Stat label="labels" value={stats?.data?.labels?.length ?? "—"} />
      </div>

      {needsSeed && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-border bg-background/40 p-2.5">
          <div className="text-xs opacity-80">
            Neo4j is connected but empty. Seed it with the incident knowledge graph to switch from
            offline demo data to live Cypher queries.
          </div>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {seeding ? "Seeding…" : "Seed graph"}
          </button>
        </div>
      )}
      {seedError && (
        <div className="mt-2 text-[11px]" style={{ color: "var(--crit)" }}>
          {seedError}
        </div>
      )}
      {!stats?.configured && (
        <div className="mt-3 text-[11px] opacity-70">
          No Neo4j credentials found. Copy <code className="mono">.env.example</code> to{" "}
          <code className="mono">.env</code>, run{" "}
          <code className="mono">docker compose up -d neo4j</code>, then{" "}
          <code className="mono">npm run db:seed</code> to go live.
        </div>
      )}

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 flex items-center gap-1.5 text-[11px] opacity-70 hover:opacity-100"
      >
        <Terminal className="h-3 w-3" />
        {expanded ? "Hide" : "Show"} the Cypher actually executed for this view
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-2 overflow-hidden"
        >
          <div className="flex gap-1">
            {(["root-cause", "service-map", "similarity"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`rounded-full border px-2 py-0.5 text-[10px] mono ${
                  tab === k
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-muted/40 hover:bg-muted"
                }`}
              >
                {k}
              </button>
            ))}
          </div>
          <pre className="mono mt-2 max-h-48 overflow-auto rounded-lg border border-border bg-background/60 p-2.5 text-[10.5px] leading-relaxed">
            {cypherByTab[tab] ??
              "-- offline demo mode: this view is served from static fallback data, not a live query.\n-- start Neo4j and run `npm run db:seed` to see the real query here."}
          </pre>
        </motion.div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-2 text-center">
      <div className="mono text-sm font-semibold tabular-nums">{value}</div>
      <div className="mono text-[9px] uppercase tracking-wider opacity-60">{label}</div>
    </div>
  );
}
