export type Severity = "info" | "warn" | "crit";

export type AgentId =
  | "router"
  | "logs"
  | "metrics"
  | "traces"
  | "deploy"
  | "infra"
  | "k8s"
  | "db"
  | "security"
  | "fusion"
  | "rootcause"
  | "recommend"
  | "postmortem";

export type AgentSpec = {
  id: AgentId;
  name: string;
  role: string;
  startAt: number; // seconds from t0
  duration: number;
  findings: string[];
};

export const AGENTS: AgentSpec[] = [
  {
    id: "router",
    name: "Incident Router",
    role: "Triage signal & dispatch",
    startAt: 0.0,
    duration: 1.2,
    findings: ["SEV-2 candidate", "Dispatching 8 investigators"],
  },
  {
    id: "logs",
    name: "Log Investigator",
    role: "Loki cluster analysis",
    startAt: 0.6,
    duration: 3.0,
    findings: ["Cluster L-882: OutOfMemoryError ×1204", "Cluster L-417: Hikari pool timeout ×318"],
  },
  {
    id: "metrics",
    name: "Metrics Investigator",
    role: "Prometheus anomaly",
    startAt: 0.8,
    duration: 3.0,
    findings: ["RSS slope +0.62 Mi/s", "pool.wait_ms p99 350× baseline"],
  },
  {
    id: "traces",
    name: "Trace Investigator",
    role: "Jaeger span analysis",
    startAt: 1.4,
    duration: 2.8,
    findings: ["Trace 7a9e3c: GC pause 3.8s on OrderCache.get", "Tail latency dominated by GC"],
  },
  {
    id: "deploy",
    name: "Deployment Investigator",
    role: "Release correlation",
    startAt: 1.0,
    duration: 2.4,
    findings: ["Deploy #4271 t-9m before first OOM", "PR #812 author: m.alvarez"],
  },
  {
    id: "infra",
    name: "Infra Investigator",
    role: "Node & network",
    startAt: 1.6,
    duration: 2.0,
    findings: ["Nodes healthy", "No NLB drops, AZ-a clean"],
  },
  {
    id: "k8s",
    name: "Kubernetes Investigator",
    role: "Cluster events",
    startAt: 1.8,
    duration: 2.4,
    findings: ["12× OOMKilled / 18× BackOff", "6/8 pods restarted within 9 min"],
  },
  {
    id: "db",
    name: "Database Investigator",
    role: "Postgres health",
    startAt: 2.0,
    duration: 2.6,
    findings: ["pg_stat_activity: 40/40 conns", "No primary failover, replication lag flat"],
  },
  {
    id: "security",
    name: "Security Investigator",
    role: "AuthZ / anomaly",
    startAt: 2.4,
    duration: 1.6,
    findings: ["No auth anomalies", "No CVE match on dependency diff"],
  },
  {
    id: "fusion",
    name: "Evidence Fusion",
    role: "Cross-source correlation",
    startAt: 4.4,
    duration: 2.0,
    findings: [
      "Temporal join: deploy → OOM → pool exhaustion (Δ 9m12s, 32s)",
      "Causal graph built (7 nodes)",
    ],
  },
  {
    id: "rootcause",
    name: "Root Cause Agent",
    role: "Hypothesis scoring",
    startAt: 6.0,
    duration: 1.6,
    findings: ["H1 unbounded cache: 0.92", "H2 pg failover: 0.04", "H3 upstream Stripe: 0.04"],
  },
  {
    id: "recommend",
    name: "Recommendation Agent",
    role: "Remediation planning",
    startAt: 7.2,
    duration: 1.4,
    findings: [
      "Rollback deploy #4271 (ETA 90s)",
      "Cap cache: Caffeine maxSize 10k, expireAfterAccess 5m",
    ],
  },
  {
    id: "postmortem",
    name: "Postmortem Writer",
    role: "Narrative synthesis",
    startAt: 8.0,
    duration: 1.6,
    findings: ["Postmortem draft ready", "Action items assigned"],
  },
];

export type TimelineEvent = {
  t: number; // sim seconds
  at: string; // UTC label
  title: string;
  source: "deploy" | "metric" | "k8s" | "log" | "trace" | "db" | "alert" | "ai";
  severity: Severity;
  detail: string;
  evidence?: string[];
};

export const TIMELINE: TimelineEvent[] = [
  {
    t: 0.4,
    at: "14:02:11Z",
    title: "Deployment #4271 rolled out",
    source: "deploy",
    severity: "info",
    detail:
      "checkout-api → commit a91f3b2 by m.alvarez ('feat: in-memory order cache for hot SKUs')",
    evidence: ["GitHub PR #812", "Argo rollout success"],
  },
  {
    t: 1.0,
    at: "14:04:30Z",
    title: "Memory RSS climbing linearly",
    source: "metric",
    severity: "warn",
    detail: "container_memory_working_set_bytes slope = +0.62 Mi/s on 6/8 checkout-api pods",
    evidence: ["Prom query #m-3122", "Grafana panel CHK-Mem"],
  },
  {
    t: 2.0,
    at: "14:11:08Z",
    title: "OOMKilled — pod checkout-api-7f9c-x2k",
    source: "k8s",
    severity: "crit",
    detail:
      "kubelet evicted pod after memory.usage > limit (512Mi). 5 sibling pods follow within 90s.",
    evidence: ["kube-event/oom-7f9c", "dmesg ring buffer"],
  },
  {
    t: 2.6,
    at: "14:11:40Z",
    title: "Postgres pool exhaustion",
    source: "db",
    severity: "crit",
    detail:
      "HikariCP: 40/40 active, wait_ms p99 = 4207ms (baseline 12ms). Connection acquisition timeouts begin.",
    evidence: ["pg_stat_activity dump", "Hikari metrics", "log cluster L-417"],
  },
  {
    t: 3.2,
    at: "14:12:05Z",
    title: "cart-service retry storm",
    source: "trace",
    severity: "warn",
    detail:
      "Retry budget exceeded. Effective load amplification 3.4×. Circuit breaker → half-open.",
    evidence: ["Jaeger trace 7a9e3c", "Resilience4j metrics"],
  },
  {
    t: 3.8,
    at: "14:12:48Z",
    title: "payments-gateway → Stripe 429",
    source: "log",
    severity: "warn",
    detail: "Upstream rate-limit hit. Stripe status remained green — symptom, not cause.",
    evidence: ["log line 88241", "Stripe-Request-Id batch"],
  },
  {
    t: 4.4,
    at: "14:13:30Z",
    title: "PagerDuty SEV-2 fired",
    source: "alert",
    severity: "crit",
    detail: "Checkout error rate 8.7%. Sentinel auto-attached to bridge #inc-4271.",
    evidence: ["PD incident Q1X8R", "SLO burn rate 14.2×"],
  },
  {
    t: 6.4,
    at: "14:14:02Z",
    title: "Sentinel: hypothesis confirmed",
    source: "ai",
    severity: "info",
    detail: "Unbounded ConcurrentHashMap in OrderCache (commit a91f3b2) — confidence 0.92.",
    evidence: ["Causal graph G-7", "Fusion score 0.92"],
  },
];

export type GraphNode = {
  id: string;
  label: string;
  kind: "cause" | "effect" | "symptom" | "impact";
  x: number;
  y: number;
  evidence: string[];
  appearAt: number; // sim seconds
};

export type GraphEdge = { from: string; to: string; appearAt: number };

export const GRAPH_NODES: GraphNode[] = [
  {
    id: "deploy",
    label: "Deploy #4271\ncommit a91f3b2",
    kind: "cause",
    x: 80,
    y: 60,
    appearAt: 0.4,
    evidence: ["GitHub PR #812", "Argo rollout"],
  },
  {
    id: "cache",
    label: "Unbounded\nLRU cache",
    kind: "cause",
    x: 280,
    y: 60,
    appearAt: 1.6,
    evidence: ["a91f3b2 +ConcurrentHashMap", "no eviction policy"],
  },
  {
    id: "mem",
    label: "Memory leak\n+0.62 Mi/s",
    kind: "effect",
    x: 480,
    y: 60,
    appearAt: 2.0,
    evidence: ["Prom slope", "heap dump"],
  },
  {
    id: "oom",
    label: "OOMKilled\n6/8 pods",
    kind: "effect",
    x: 680,
    y: 60,
    appearAt: 2.4,
    evidence: ["kube-event/oom-7f9c", "dmesg"],
  },
  {
    id: "pool",
    label: "PG pool\nexhaustion",
    kind: "effect",
    x: 680,
    y: 200,
    appearAt: 3.0,
    evidence: ["HikariCP 40/40", "wait_ms 4207"],
  },
  {
    id: "retry",
    label: "Retry storm\n×3.4",
    kind: "effect",
    x: 480,
    y: 200,
    appearAt: 3.4,
    evidence: ["Jaeger 7a9e3c", "Resilience4j"],
  },
  {
    id: "rate",
    label: "Stripe 429\nrate-limited",
    kind: "symptom",
    x: 280,
    y: 200,
    appearAt: 3.8,
    evidence: ["log 88241"],
  },
  {
    id: "impact",
    label: "Checkout\nfailure 8.7%",
    kind: "impact",
    x: 80,
    y: 200,
    appearAt: 4.4,
    evidence: ["PagerDuty Q1X8R", "SLO 14.2×"],
  },
];

export const GRAPH_EDGES: GraphEdge[] = [
  { from: "deploy", to: "cache", appearAt: 1.6 },
  { from: "cache", to: "mem", appearAt: 2.0 },
  { from: "mem", to: "oom", appearAt: 2.4 },
  { from: "oom", to: "pool", appearAt: 3.0 },
  { from: "pool", to: "retry", appearAt: 3.4 },
  { from: "retry", to: "rate", appearAt: 3.8 },
  { from: "rate", to: "impact", appearAt: 4.4 },
  { from: "pool", to: "impact", appearAt: 4.6 },
];

export type ServiceNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  healthBaseline: "ok" | "warn" | "crit";
};

export const SERVICES: ServiceNode[] = [
  { id: "edge", label: "edge-gateway", x: 60, y: 140, healthBaseline: "ok" },
  { id: "cart", label: "cart-service", x: 230, y: 60, healthBaseline: "ok" },
  { id: "checkout", label: "checkout-api", x: 230, y: 220, healthBaseline: "ok" },
  { id: "payments", label: "payments-gateway", x: 420, y: 140, healthBaseline: "ok" },
  { id: "postgres", label: "postgres-prod", x: 600, y: 60, healthBaseline: "ok" },
  { id: "redis", label: "redis-cache", x: 600, y: 220, healthBaseline: "ok" },
  { id: "stripe", label: "stripe (ext)", x: 770, y: 140, healthBaseline: "ok" },
];

export const SERVICE_EDGES: [string, string][] = [
  ["edge", "cart"],
  ["edge", "checkout"],
  ["cart", "checkout"],
  ["cart", "redis"],
  ["checkout", "payments"],
  ["checkout", "postgres"],
  ["checkout", "redis"],
  ["payments", "stripe"],
];

// service health transitions keyed by sim seconds
export const SERVICE_HEALTH_AT = (
  t: number,
  id: string,
  mitigated: boolean,
): "ok" | "warn" | "crit" => {
  if (mitigated) return "ok";
  if (id === "checkout") return t < 1 ? "ok" : t < 2 ? "warn" : "crit";
  if (id === "postgres") return t < 2.6 ? "ok" : t < 3.4 ? "warn" : "crit";
  if (id === "cart") return t < 3.2 ? "ok" : "warn";
  if (id === "payments") return t < 3.8 ? "ok" : "warn";
  if (id === "redis") return "ok";
  if (id === "stripe") return t < 3.8 ? "ok" : "warn";
  return "ok";
};

// Live metric synthesis (per-tick) for sparklines
export function synthMetrics(now: number, mitigated: boolean) {
  // returns memory MiB, p99 latency ms, error rate %, qps
  const t = mitigated ? Math.max(0, now - 0.001) : now;
  const ramp = (a: number, b: number, t0: number, t1: number) =>
    t <= t0 ? a : t >= t1 ? b : a + (b - a) * ((t - t0) / (t1 - t0));
  const baseline = 180 + Math.sin(now * 3.1) * 4;
  let mem = baseline + ramp(0, 360, 0.6, 2.4);
  let lat = 42 + Math.sin(now * 2.3) * 5 + ramp(0, 1800, 2.0, 3.8);
  let err = 0.2 + ramp(0, 8.7, 2.4, 4.4) + Math.sin(now * 4) * 0.1;
  let qps = 1240 + Math.sin(now * 1.7) * 30 - ramp(0, 380, 2.6, 4.0);
  if (mitigated) {
    const decay = Math.min(1, (now - 0.0) * 1.6); // immediate recover after rollback click
    mem = baseline;
    lat = 42 + Math.sin(now * 2.3) * 5;
    err = 0.2;
    qps = 1240 + Math.sin(now * 1.7) * 30;
    void decay;
  }
  return { mem, lat, err: Math.max(0, err), qps: Math.max(0, qps) };
}

/* ============================================================
 * AUTONOMOUS SRE PIPELINE
 * ============================================================ */

export type PipelineStepId =
  "investigate" | "simulate" | "predict" | "select" | "pr" | "rollback" | "verify" | "close";

export type PipelineStep = {
  id: PipelineStepId;
  label: string;
  detail: string;
  startAt: number;
  duration: number;
};

/* Autonomous flow: agents finish ~t=8 → simulate → predict → select →
 * open PR → execute rollback (auto-mitigation t≈12) → verify → close. */
export const PIPELINE: PipelineStep[] = [
  {
    id: "investigate",
    label: "Investigate",
    detail: "13 specialist agents · log/metrics/trace/k8s/deploy/db fusion",
    startAt: 0.0,
    duration: 8.0,
  },
  {
    id: "simulate",
    label: "Simulate Fixes",
    detail: "3 candidate plans replayed against digital twin",
    startAt: 8.0,
    duration: 1.6,
  },
  {
    id: "predict",
    label: "Predict Impact",
    detail: "Recovery time · risk · revenue exposure",
    startAt: 9.6,
    duration: 1.2,
  },
  {
    id: "select",
    label: "Select Safest Fix",
    detail: "Plan A · rollback · success 0.96",
    startAt: 10.8,
    duration: 0.8,
  },
  {
    id: "pr",
    label: "Open GitHub PR",
    detail: "Auto-revert PR #813 + Caffeine cap PR #814",
    startAt: 11.6,
    duration: 1.0,
  },
  {
    id: "rollback",
    label: "Generate Rollback Plan",
    detail: "kubectl rollout undo · canary verify · SLO gate",
    startAt: 12.6,
    duration: 0.8,
  },
  {
    id: "verify",
    label: "Verify Recovery",
    detail: "p99/err/mem within SLO for 60s · synthetic checkout pass",
    startAt: 13.4,
    duration: 1.4,
  },
  {
    id: "close",
    label: "Close Incident",
    detail: "Postmortem drafted · PagerDuty resolved · stakeholders paged",
    startAt: 14.8,
    duration: 0.6,
  },
];

/* Time at which Sentinel autonomously applies the rollback (mitigation). */
export const AUTO_MITIGATE_AT = 13.0;

/* ===== Hypothesis confidence trail (Building hypothesis…) ===== */
export const HYPOTHESIS_TRAIL: { t: number; label: string; conf: number }[] = [
  { t: 0.2, label: "Connecting to Prometheus…", conf: 0.03 },
  { t: 0.5, label: "Streaming Loki log clusters…", conf: 0.07 },
  { t: 0.8, label: "Pulling Jaeger spans (last 15m)…", conf: 0.12 },
  { t: 1.1, label: "Diffing deployments vs t-30m…", conf: 0.18 },
  { t: 1.5, label: "Inspecting Kubernetes events…", conf: 0.24 },
  { t: 1.9, label: "Searching historical incidents…", conf: 0.32 },
  { t: 2.4, label: "Building causal graph (7 nodes)…", conf: 0.41 },
  { t: 2.9, label: "Testing hypothesis #1: pg failover", conf: 0.27 },
  { t: 3.2, label: "Rejected — replication lag flat", conf: 0.31 },
  { t: 3.6, label: "Testing hypothesis #2: unbounded cache", conf: 0.52 },
  { t: 4.2, label: "Cross-correlating heap & GC pauses…", conf: 0.62 },
  { t: 5.0, label: "Running recovery simulation…", conf: 0.76 },
  { t: 5.8, label: "Validating database & pool state…", conf: 0.84 },
  { t: 6.6, label: "Searching repo for cache mutations…", conf: 0.89 },
  { t: 7.2, label: "Root cause confirmed.", conf: 0.92 },
];

/* ===== Evidence sources, with per-source confidence ===== */
export type EvidenceSource = {
  id: string;
  label: string;
  signals: number; // raw count
  confidence: number; // 0..1
  note: string;
};

export const EVIDENCE_SOURCES: EvidenceSource[] = [
  {
    id: "logs",
    label: "Logs (Loki)",
    signals: 1522,
    confidence: 0.94,
    note: "OOMError ×1204 · Hikari timeout ×318",
  },
  {
    id: "metrics",
    label: "Metrics (Prometheus)",
    signals: 38,
    confidence: 0.91,
    note: "RSS slope +0.62 Mi/s · pool wait p99 4207ms",
  },
  {
    id: "traces",
    label: "Traces (Jaeger)",
    signals: 412,
    confidence: 0.88,
    note: "GC pause 3.8s on OrderCache.get",
  },
  {
    id: "deploy",
    label: "Deploys (Argo)",
    signals: 1,
    confidence: 0.86,
    note: "Deploy #4271 t-9m before first OOM",
  },
  {
    id: "k8s",
    label: "Kubernetes",
    signals: 30,
    confidence: 0.83,
    note: "12× OOMKilled · 18× BackOff",
  },
  {
    id: "github",
    label: "Source (GitHub)",
    signals: 1,
    confidence: 0.71,
    note: "PR #812 commit a91f3b2 — no eviction policy",
  },
];

/* ===== Fix plans evaluated against the digital twin ===== */
export type FixPlan = {
  id: "A" | "B" | "C";
  label: string;
  command: string;
  successProb: number;
  downtimeSec: number;
  revenueExposureUsd: number;
  blastRadius: string;
  rationale: string;
  recommended?: boolean;
};

export const FIX_PLANS: FixPlan[] = [
  {
    id: "A",
    label: "Rollback Deploy #4271",
    command: "kubectl rollout undo deployment/checkout-api -n prod",
    successProb: 0.96,
    downtimeSec: 90,
    revenueExposureUsd: 27600,
    blastRadius: "checkout-api only",
    rationale:
      "Reverts commit a91f3b2 to last known good (a82f1c4). Digital-twin replay: memory flat, pool drains in 38s, p99 returns to SLO at t+72s.",
    recommended: true,
  },
  {
    id: "B",
    label: "Increase memory limit to 1Gi",
    command: "kubectl set resources deploy/checkout-api --limits memory=1Gi",
    successProb: 0.54,
    downtimeSec: 180,
    revenueExposureUsd: 55200,
    blastRadius: "checkout-api + cluster scheduler",
    rationale:
      "Delays OOM by ~14min but cache still unbounded — exhausts node memory under sustained traffic. Risks evictions of neighboring pods.",
  },
  {
    id: "C",
    label: "Restart pods (recycle)",
    command: "kubectl rollout restart deployment/checkout-api",
    successProb: 0.31,
    downtimeSec: 120,
    revenueExposureUsd: 36800,
    blastRadius: "checkout-api",
    rationale:
      "Clears heap but bug persists. OOM re-occurs within ~9 min under current QPS (1240 rps). Buys time, not a fix.",
  },
];

/* ===== Historical incident memory ===== */
export type SimilarIncident = {
  id: string;
  title: string;
  date: string;
  similarity: number;
  sharedSignals: string[];
};

export const SIMILAR_INCIDENTS: SimilarIncident[] = [
  {
    id: "INC-3908",
    title: "checkout-api OOM after promo cache rollout",
    date: "2026-04-17",
    similarity: 0.92,
    sharedSignals: [
      "same repo (checkout-api)",
      "same service",
      "same engineer (m.alvarez)",
      "same library (ConcurrentHashMap, no eviction)",
      "rollback resolved",
    ],
  },
  {
    id: "INC-3417",
    title: "cart-service retry storm during DB failover",
    date: "2025-11-02",
    similarity: 0.61,
    sharedSignals: ["retry-storm signature ×3.x", "Hikari pool saturation"],
  },
  {
    id: "INC-2901",
    title: "payments-gateway 429s misattributed to Stripe",
    date: "2025-08-22",
    similarity: 0.47,
    sharedSignals: ["downstream 429 was symptom not cause", "Stripe status green"],
  },
];

/* ===== Digital twin: what-if scenarios ===== */
export type WhatIfScenario = {
  id: string;
  question: string;
  blastRadius: string[];
  latencyDelta: string;
  errorDelta: string;
  revenueLossPerMin: number;
  verdict: "safe" | "risky" | "catastrophic";
  narrative: string;
};

export const WHATIF_SCENARIOS: WhatIfScenario[] = [
  {
    id: "checkout-restart",
    question: "What if checkout-api restarts?",
    blastRadius: ["checkout-api"],
    latencyDelta: "+120ms for 38s",
    errorDelta: "+0.4% transient",
    revenueLossPerMin: 1200,
    verdict: "safe",
    narrative:
      "Twin replay: graceful drain succeeds. Connection pool releases in 12s. No cascading failure.",
  },
  {
    id: "redis-dies",
    question: "What if redis-cache dies?",
    blastRadius: ["cart-service", "checkout-api", "inventory"],
    latencyDelta: "+340ms p99",
    errorDelta: "+6.2%",
    revenueLossPerMin: 38000,
    verdict: "catastrophic",
    narrative:
      "Twin replay: cart falls back to postgres reads (×8 load). Pool saturates at 22s. Full checkout failure.",
  },
  {
    id: "pg-failover",
    question: "What if postgres-prod fails over?",
    blastRadius: ["checkout-api", "payments-gateway"],
    latencyDelta: "+800ms for 14s",
    errorDelta: "+2.1%",
    revenueLossPerMin: 9400,
    verdict: "risky",
    narrative:
      "Twin replay: 14s read-only window during promotion. Cart retries swallow it; checkout p99 spikes briefly.",
  },
];

/* ===== AI Code Review (buggy commit a91f3b2) ===== */
export const BUGGY_CODE = `// checkout-api/src/main/java/com/shop/cache/OrderCache.java
@Component
public class OrderCache {
  // ⚠ unbounded — grows forever
  private final Map<OrderKey, OrderData> cache =
      new ConcurrentHashMap<>();

  public OrderData get(OrderKey k, Supplier<OrderData> loader) {
    return cache.computeIfAbsent(k, _k -> loader.get());
  }
}`;

export const FIXED_CODE = `// checkout-api/src/main/java/com/shop/cache/OrderCache.java
@Component
public class OrderCache {
  // ✓ bounded LRU with TTL — proven under load test
  private final Cache<OrderKey, OrderData> cache =
      Caffeine.newBuilder()
          .maximumSize(10_000)
          .expireAfterAccess(Duration.ofMinutes(5))
          .recordStats()
          .build();

  public OrderData get(OrderKey k, Supplier<OrderData> loader) {
    return cache.get(k, _k -> loader.get());
  }
}`;

export const CODE_ANNOTATIONS: { line: number; severity: "crit" | "warn"; text: string }[] = [
  { line: 3, severity: "crit", text: "No eviction policy → unbounded growth" },
  {
    line: 4,
    severity: "crit",
    text: "Expected OOM in ~9 min at current QPS (1240 rps × 0.7Mi/req)",
  },
  { line: 9, severity: "warn", text: "computeIfAbsent under load amplifies allocation pressure" },
];

/* ===== Executive war-room metrics (live) ===== */
export function executiveImpact(t: number, mitigated: boolean) {
  if (mitigated) {
    return { revenuePerMin: 0, customers: 0, cumulativeLoss: 27600, etaSec: 0, sessions: 0 };
  }
  if (t < 2.0)
    return { revenuePerMin: 0, customers: 0, cumulativeLoss: 0, etaSec: 90, sessions: 0 };
  const ramp = Math.min(1, (t - 2.0) / 3.0);
  const revenuePerMin = Math.round(18400 * ramp);
  const customers = Math.round(3142 * ramp);
  const sessions = customers;
  // cumulative loss grows from t=2 onward
  const cumulativeLoss = Math.round(((revenuePerMin * Math.max(0, t - 2.0)) / 60) * 1000) / 10;
  const etaSec = Math.max(0, Math.round(90 - (t - 7) * 8));
  return { revenuePerMin, customers, cumulativeLoss, etaSec, sessions };
}

/* ===== Predictive: OOM ETA before it happens ===== */
export function predictiveOOM(t: number, mitigated: boolean) {
  if (mitigated)
    return { eta: null as number | null, confidence: 0, headline: "No predicted incidents" };
  // before t=2 the system is still healthy → AI predicts upcoming OOM
  if (t < 0.6) return { eta: 8 * 60, confidence: 0.62, headline: "Memory trend → OOM in ~8 min" };
  if (t < 1.2) return { eta: 6 * 60, confidence: 0.74, headline: "Memory trend → OOM in ~6 min" };
  if (t < 1.8) return { eta: 4 * 60, confidence: 0.83, headline: "Memory trend → OOM in ~4 min" };
  if (t < 2.4)
    return { eta: 90, confidence: 0.91, headline: "OOM imminent — rollback recommended" };
  return { eta: 0, confidence: 0.96, headline: "OOM in progress · auto-remediation engaged" };
}
