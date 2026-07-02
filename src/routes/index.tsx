import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  GitBranch,
  Play,
  RotateCcw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useInvestigation } from "@/lib/sre/useInvestigation";
import { useGraphEngine, type BlastRadiusResult, type DataSource } from "@/lib/sre/useGraphEngine";
import { RootCauseGraph } from "@/components/sre/RootCauseGraph";
import { GraphEngine } from "@/components/sre/GraphEngine";
import { Timeline } from "@/components/sre/Timeline";
import { AgentSwarm } from "@/components/sre/AgentSwarm";
import { ServiceMap } from "@/components/sre/ServiceMap";
import { Sparkline } from "@/components/sre/Sparkline";
import { ChatPanel } from "@/components/sre/ChatPanel";
import { Postmortem } from "@/components/sre/Postmortem";
import { AutonomousPipeline } from "@/components/sre/AutonomousPipeline";
import { ExecutiveWarRoom } from "@/components/sre/ExecutiveWarRoom";
import { HypothesisStream } from "@/components/sre/HypothesisStream";
import { FixPlans } from "@/components/sre/FixPlans";
import { EvidenceBreakdown } from "@/components/sre/EvidenceBreakdown";
import { DigitalTwin } from "@/components/sre/DigitalTwin";
import { SimilarIncidents } from "@/components/sre/SimilarIncidents";
import { CodeReview } from "@/components/sre/CodeReview";
import { PullRequestCard } from "@/components/sre/PullRequestCard";
import { PredictiveAlert } from "@/components/sre/PredictiveAlert";
import { PostIncidentAutomation } from "@/components/sre/PostIncidentAutomation";
import { useCallback, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sentinel — Autonomous AI SRE Engineer" },
      {
        name: "description",
        content:
          "Sentinel is an autonomous AI Site Reliability Engineer. It investigates, simulates fixes, predicts impact, opens PRs, executes rollback and verifies recovery — end-to-end, with zero human in the loop.",
      },
      { property: "og:title", content: "Sentinel — Autonomous AI SRE Engineer" },
      {
        property: "og:description",
        content:
          "Watch an AI engineer run an entire production incident: investigate → simulate → predict → PR → rollback → verify → close.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const graph = useGraphEngine();
  const inv = useInvestigation({ nodes: graph.graphNodes, edges: graph.graphEdges });
  const {
    phase,
    t,
    tForViz,
    mitigated,
    confidence,
    visibleEvents,
    visibleNodes,
    visibleEdges,
    allNodes,
    agentStates,
    history,
    pipelineSteps,
    hypothesisTrail,
    impact,
    prediction,
    start,
    rollback,
    reset,
  } = inv;

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [blastRadius, setBlastRadius] = useState<{
    loading: boolean;
    result: BlastRadiusResult | null;
    source: DataSource | null;
  }>({ loading: false, result: null, source: null });

  const runBlastRadius = useCallback(
    async (serviceId: string) => {
      setSelectedService(serviceId);
      setBlastRadius({ loading: true, result: null, source: null });
      const res = await graph.blastRadius(serviceId);
      setBlastRadius({ loading: false, result: res?.data ?? null, source: res?.source ?? null });
    },
    [graph],
  );

  // Replay the entire incident from scene 1 — gives judges the cinematic re-run.
  const replay = useCallback(() => {
    reset();
    setSelectedService(null);
    setBlastRadius({ loading: false, result: null, source: null });
    // tiny defer so reset state flushes before we re-arm
    setTimeout(() => start(), 60);
  }, [reset, start]);

  const last = history;
  const mem = last.mem.at(-1) ?? 180;
  const lat = last.lat.at(-1) ?? 42;
  const err = last.err.at(-1) ?? 0.2;
  const qps = last.qps.at(-1) ?? 1240;

  const sysHealth: "ok" | "warn" | "crit" =
    phase === "idle" || mitigated ? "ok" : tForViz < 2 ? "warn" : "crit";

  return (
    <div className="min-h-screen text-foreground">
      <TopBar
        phase={phase}
        health={sysHealth}
        t={tForViz}
        onStart={start}
        onRollback={rollback}
        onReset={reset}
        onReplay={replay}
        mitigated={mitigated}
      />

      <main className="mx-auto max-w-[1500px] space-y-4 px-4 pb-12 pt-4">
        {/* HERO */}
        <IncidentHero phase={phase} mitigated={mitigated} confidence={confidence} />

        {/* GRAPH REASONING ENGINE — the technical differentiator */}
        <GraphEngine
          source={graph.source}
          stats={graph.stats}
          onSeed={graph.seed}
          onRefresh={graph.refresh}
          rootCauseCypher={graph.rootCauseCypher}
          serviceMapCypher={graph.serviceMapCypher}
          similarityCypher={graph.similarityCypher}
        />

        {/* AUTONOMOUS PIPELINE — the headline */}
        {phase !== "idle" && <AutonomousPipeline steps={pipelineSteps} />}

        {/* PREDICTIVE EARLY-WARNING BANNER */}
        {phase !== "idle" && !mitigated && (
          <PredictiveAlert
            headline={prediction.headline}
            eta={prediction.eta}
            confidence={prediction.confidence}
            phase={phase}
          />
        )}

        {/* EXECUTIVE WAR ROOM */}
        {phase !== "idle" && (
          <ExecutiveWarRoom
            impact={impact}
            confidence={confidence}
            action={mitigated ? "Rollback executed" : "Rollback Deploy #4271"}
            phase={phase}
          />
        )}

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Sparkline
            label="checkout-api memory"
            value={mem}
            suffix=" Mi"
            data={last.mem}
            color={mem > 380 ? "var(--crit)" : mem > 260 ? "var(--warn)" : "var(--ok)"}
          />
          <Sparkline
            label="p99 latency"
            value={lat}
            suffix=" ms"
            data={last.lat}
            color={lat > 800 ? "var(--crit)" : lat > 150 ? "var(--warn)" : "var(--ok)"}
          />
          <Sparkline
            label="error rate"
            value={err}
            suffix=" %"
            precision={2}
            data={last.err}
            color={err > 4 ? "var(--crit)" : err > 1 ? "var(--warn)" : "var(--ok)"}
          />
          <Sparkline
            label="throughput"
            value={qps}
            suffix=" rps"
            data={last.qps}
            color="var(--info)"
          />
        </div>

        {/* GRID */}
        <div className="grid grid-cols-12 gap-4">
          {/* LEFT: AGENTS */}
          <section className="col-span-12 space-y-4 xl:col-span-3">
            <HypothesisStream trail={hypothesisTrail} confidence={confidence} />
            <div>
              <PanelHeader
                icon={<Zap className="h-4 w-4" />}
                title="Agent Swarm"
                subtitle="13 specialist investigators"
              />
              <div className="mt-2">
                <AgentSwarm agents={agentStates} />
              </div>
            </div>
          </section>

          {/* CENTER */}
          <section className="col-span-12 space-y-4 xl:col-span-6">
            <div className="glass hover-lift rounded-xl p-4">
              <PanelHeader
                icon={<GitBranch className="h-4 w-4" />}
                title="AI Reasoning Graph"
                subtitle="cause → effect · each edge carries evidence"
              />
              <div className="mt-3">
                <RootCauseGraph nodes={visibleNodes} edges={visibleEdges} allNodes={allNodes} />
              </div>
            </div>

            {/* FIX PLANS — appears once simulation step starts */}
            <FixPlans active={tForViz >= 7 || mitigated} />

            <div className="glass hover-lift rounded-xl p-4">
              <PanelHeader
                icon={<Activity className="h-4 w-4" />}
                title="Service Map · Digital Twin"
                subtitle="blast radius · live health"
              />
              <div className="mt-3">
                <ServiceMap
                  t={tForViz}
                  mitigated={mitigated}
                  services={graph.services}
                  edges={graph.serviceEdges}
                  onSelectService={runBlastRadius}
                  selectedService={selectedService}
                />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] mono opacity-80">
                <Dot c="var(--ok)" /> healthy
                <Dot c="var(--warn)" /> degraded
                <Dot c="var(--crit)" /> failing
                <span className="ml-auto opacity-60">
                  blast radius:{" "}
                  {phase === "idle" || mitigated
                    ? "0 services"
                    : "3 services · 3,142 sessions · ~$18,400/min"}
                </span>
              </div>
            </div>

            <DigitalTwin live={blastRadius} onRunScenario={runBlastRadius} />

            <CodeReview />

            <PullRequestCard phase={phase} />

            <PostIncidentAutomation active={phase === "closed"} />

            <Postmortem />
          </section>

          {/* RIGHT */}
          <section className="col-span-12 space-y-4 xl:col-span-3">
            <EvidenceBreakdown overall={confidence} />
            <SimilarIncidents
              incidents={graph.similarIncidents}
              isLive={graph.source === "neo4j"}
            />
            <div className="glass hover-lift rounded-xl p-4">
              <PanelHeader
                icon={<AlertTriangle className="h-4 w-4" />}
                title="Live Timeline"
                subtitle={`${visibleEvents.length} events`}
              />
              <div className="mt-3 max-h-[360px] overflow-y-auto pr-1">
                <Timeline events={visibleEvents} />
              </div>
            </div>
            <div className="glass rounded-xl">
              <ChatPanel />
            </div>
          </section>
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 text-[11px] mono opacity-60">
          <div>
            Sentinel v1.0 · autonomous engineer · multi-agent reasoning · digital twin · auto-PR ·
            auto-rollback · verified recovery
          </div>
          <div>built with TanStack Start · Gemini AI Gateway · gemini-3-flash</div>
        </footer>
      </main>
    </div>
  );
}

function Dot({ c }: { c: string }) {
  return <span className="inline-block h-2 w-2 rounded-full" style={{ background: c }} />;
}

function PanelHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-muted/60">{icon}</span>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        {subtitle && (
          <div className="mono text-[10px] uppercase tracking-wider opacity-60">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

function TopBar({
  phase,
  health,
  t,
  onStart,
  onRollback,
  onReset,
  onReplay,
  mitigated,
}: {
  phase: string;
  health: "ok" | "warn" | "crit";
  t: number;
  onStart: () => void;
  onRollback: () => void;
  onReset: () => void;
  onReplay: () => void;
  mitigated: boolean;
}) {
  const color = health === "ok" ? "var(--ok)" : health === "warn" ? "var(--warn)" : "var(--crit)";
  const label =
    phase === "idle"
      ? "ALL SYSTEMS NOMINAL"
      : phase === "investigating"
        ? "AUTONOMOUS SRE ENGAGED — INVESTIGATING"
        : phase === "remediating"
          ? "AUTONOMOUS SRE ENGAGED — REMEDIATING"
          : phase === "verifying"
            ? "ROLLBACK EXECUTED — VERIFYING RECOVERY"
            : phase === "mitigated"
              ? "MITIGATED — MONITORING"
              : "INCIDENT CLOSED · AUTONOMOUSLY RESOLVED";
  return (
    <header className="sticky top-0 z-30 border-b border-border glass-strong">
      <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-3">
        <Logo />
        <div className="hidden items-center gap-2 md:flex">
          <span className="relative h-2 w-2">
            <span className="absolute inset-0 rounded-full pulse-dot" style={{ color }} />
            <span className="absolute inset-0 rounded-full" style={{ background: color }} />
          </span>
          <span className="mono text-[11px] tracking-wider" style={{ color }}>
            {label}
          </span>
          <span className="mono ml-2 text-[11px] opacity-60">
            prod-1 · us-east-1 · t+{t.toFixed(1)}s
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {phase === "idle" && (
            <button
              onClick={onStart}
              className="group relative overflow-hidden rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground shadow-lg shadow-destructive/30"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <Play className="h-3.5 w-3.5" /> Deploy Broken Version
              </span>
            </button>
          )}
          {(phase === "investigating" || phase === "remediating") && !mitigated && (
            <button
              onClick={onRollback}
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/30"
            >
              <ShieldCheck className="mr-1 inline h-3.5 w-3.5" /> Execute Rollback Now
            </button>
          )}
          {(phase === "mitigated" || phase === "verifying" || phase === "closed") && (
            <>
              <button
                onClick={onReplay}
                className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
              >
                <Play className="mr-1 inline h-3.5 w-3.5" /> Replay Incident
              </button>
              <button
                onClick={onReset}
                className="rounded-md border border-border bg-muted/40 px-3 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                <RotateCcw className="mr-1 inline h-3.5 w-3.5" /> Reset
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div
        className="relative grid h-8 w-8 place-items-center rounded-lg"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--primary) 60%, transparent), color-mix(in oklab, var(--accent) 60%, transparent))",
          boxShadow: "0 8px 24px -8px color-mix(in oklab, var(--primary) 60%, transparent)",
        }}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-background">
          <path d="M12 2 L21 6 V12 C21 17 17 21 12 22 C7 21 3 17 3 12 V6 Z" fill="currentColor" />
          <path
            d="M9 12 L11 14 L15 10"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="leading-tight">
        <div className="text-sm font-bold">Sentinel</div>
        <div className="mono text-[9px] uppercase tracking-[0.18em] opacity-60">
          autonomous ai · sre engineer
        </div>
      </div>
    </div>
  );
}

function IncidentHero({
  phase,
  mitigated,
  confidence,
}: {
  phase: string;
  mitigated: boolean;
  confidence: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl glass p-5">
      <div className="absolute inset-x-0 top-0 h-px scanline" />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mono flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] opacity-70">
            <span>incident</span>
            <ChevronRight className="h-3 w-3" />
            <span>INC-4271</span>
            <ChevronRight className="h-3 w-3" />
            <span>SEV-{phase === "idle" || mitigated ? "—" : "2"}</span>
            <ChevronRight className="h-3 w-3" />
            <span>{phase === "idle" ? "armed" : phase}</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-gradient">
            {phase === "idle" && "Autonomous AI SRE engineer · standing by"}
            {phase === "investigating" && "Investigating · multi-agent reasoning in progress"}
            {phase === "remediating" && "Recovery plan selected · opening PR & executing rollback"}
            {phase === "verifying" && "Rollback executed · verifying production recovery"}
            {phase === "mitigated" && "Mitigated — services recovering"}
            {phase === "closed" && "Incident closed autonomously · zero human intervention"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm opacity-80">
            {phase === "idle" &&
              "Click Deploy Broken Version to ship a buggy commit to prod. Sentinel will autonomously: investigate with 13 agents → simulate 3 fixes against a digital twin → predict impact → select the safest plan → open a GitHub PR → generate a rollback plan → execute it → verify production recovery → close the incident and draft the postmortem. Zero humans in the loop."}
            {phase !== "idle" &&
              "Sentinel is acting as a staff-level SRE engineer. Every step below is being performed autonomously — investigation, simulation, prediction, PR authoring, rollback execution and recovery verification."}
          </p>
        </div>
        <AnimatePresence>
          {phase !== "idle" && confidence > 0.5 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="min-w-[280px] rounded-xl border border-primary/30 bg-primary/5 p-3"
            >
              <div className="mono text-[10px] uppercase tracking-wider opacity-70">
                root cause · conf {Math.round(confidence * 100)}%
              </div>
              <div className="mt-1 text-sm font-semibold">Unbounded LRU cache in checkout-api</div>
              <div className="mt-0.5 text-xs opacity-80">
                Deploy #4271 (commit <span className="mono">a91f3b2</span>) → memory leak →
                OOMKilled → PG pool exhaustion → cascading 5xx.
              </div>
              <div className="mt-2 text-[11px] mono opacity-70">
                {mitigated
                  ? "executed: kubectl rollout undo deployment/checkout-api"
                  : "queued: kubectl rollout undo deployment/checkout-api"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
