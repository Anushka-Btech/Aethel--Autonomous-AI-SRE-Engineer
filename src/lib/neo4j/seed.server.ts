import type { Session } from "neo4j-driver";
import { withSession } from "./client.server";
import {
  SERVICES,
  SERVICE_EDGES,
  GRAPH_NODES,
  GRAPH_EDGES,
  TIMELINE,
  EVIDENCE_SOURCES,
  FIX_PLANS,
} from "../sre/scenario";

/**
 * INC-4271's evidence, tagged as graph nodes. Historical incidents share a
 * subset of these tags — that overlap is what similarity.ts turns into a
 * live Jaccard score instead of a hand-picked "92% similar" number.
 */
const INCIDENT_EVIDENCE_TAGS = [
  "oom-error",
  "hikari-pool-exhaustion",
  "gc-pause-3s-plus",
  "unbounded-inmemory-cache",
  "checkout-api-oom-pattern",
  "retry-storm-3x",
  "stripe-429-symptom",
  "deploy-correlated-regression",
];

const PAST_INCIDENTS = [
  {
    id: "INC-3908",
    title: "checkout-api OOM after promo cache rollout",
    date: "2026-04-17",
    tags: [
      "oom-error",
      "unbounded-inmemory-cache",
      "checkout-api-oom-pattern",
      "deploy-correlated-regression",
      "same-author-malvarez",
    ],
  },
  {
    id: "INC-3417",
    title: "cart-service retry storm during DB failover",
    date: "2025-11-02",
    tags: ["hikari-pool-exhaustion", "retry-storm-3x", "db-failover-triggered"],
  },
  {
    id: "INC-2901",
    title: "payments-gateway 429s misattributed to Stripe",
    date: "2025-08-22",
    tags: ["stripe-429-symptom", "downstream-misattribution"],
  },
];

const CONSTRAINTS = [
  "CREATE CONSTRAINT incident_id IF NOT EXISTS FOR (n:Incident) REQUIRE n.id IS UNIQUE",
  "CREATE CONSTRAINT service_id IF NOT EXISTS FOR (n:Service) REQUIRE n.id IS UNIQUE",
  "CREATE CONSTRAINT causal_id IF NOT EXISTS FOR (n:CausalNode) REQUIRE n.id IS UNIQUE",
  "CREATE CONSTRAINT evidence_tag IF NOT EXISTS FOR (n:EvidenceTag) REQUIRE n.tag IS UNIQUE",
  "CREATE CONSTRAINT past_incident_id IF NOT EXISTS FOR (n:PastIncident) REQUIRE n.id IS UNIQUE",
  "CREATE CONSTRAINT fixplan_id IF NOT EXISTS FOR (n:FixPlan) REQUIRE n.id IS UNIQUE",
];

async function run(session: Session, cypher: string, params: Record<string, unknown> = {}) {
  await session.run(cypher, params);
}

async function seedGraph(session: Session) {
  for (const c of CONSTRAINTS) await run(session, c);

  // wipe previous demo data so re-seeding is idempotent
  await run(session, "MATCH (n) WHERE n.demo = true DETACH DELETE n");

  // --- Incident ---
  await run(session, `MERGE (i:Incident {id: $id}) SET i += $props, i.demo = true`, {
    id: "INC-4271",
    props: {
      title: "Checkout API p99 latency spike + elevated 5xx",
      severity: "SEV-2",
      rootCauseSummary: "Unbounded in-memory OrderCache introduced in commit a91f3b2",
      confidence: 0.92,
    },
  });

  // --- Service topology (drives ServiceMap + live blast-radius queries) ---
  for (const s of SERVICES) {
    await run(session, `MERGE (s:Service {id: $id}) SET s += $props, s.demo = true`, {
      id: s.id,
      props: { label: s.label, x: s.x, y: s.y, healthBaseline: s.healthBaseline },
    });
  }
  for (const [a, b] of SERVICE_EDGES) {
    await run(
      session,
      `MATCH (a:Service {id: $a}), (b:Service {id: $b}) MERGE (a)-[r:DEPENDS_ON]->(b) SET r.demo = true`,
      { a, b },
    );
  }

  // --- Causal graph (drives RootCauseGraph) ---
  for (const n of GRAPH_NODES) {
    await run(session, `MERGE (c:CausalNode {id: $id}) SET c += $props, c.demo = true`, {
      id: n.id,
      props: {
        label: n.label,
        kind: n.kind,
        x: n.x,
        y: n.y,
        appearAt: n.appearAt,
        evidence: n.evidence,
      },
    });
    await run(
      session,
      `MATCH (i:Incident {id: 'INC-4271'}), (c:CausalNode {id: $id}) MERGE (i)-[:HAS_CAUSAL_NODE]->(c)`,
      { id: n.id },
    );
  }
  for (const e of GRAPH_EDGES) {
    await run(
      session,
      `MATCH (a:CausalNode {id: $from}), (b:CausalNode {id: $to})
       MERGE (a)-[r:LEADS_TO]->(b) SET r.appearAt = $appearAt, r.demo = true`,
      { from: e.from, to: e.to, appearAt: e.appearAt },
    );
  }

  // --- Evidence sources (raw signal counts, drives EvidenceBreakdown) ---
  for (const ev of EVIDENCE_SOURCES) {
    await run(session, `MERGE (e:Evidence {id: $id}) SET e += $props, e.demo = true`, {
      id: ev.id,
      props: { label: ev.label, signals: ev.signals, confidence: ev.confidence, note: ev.note },
    });
    await run(
      session,
      `MATCH (i:Incident {id: 'INC-4271'}), (e:Evidence {id: $id}) MERGE (i)-[:EVIDENCED_BY]->(e)`,
      { id: ev.id },
    );
  }

  // --- Evidence *tags* (drive graph-native similarity search) ---
  for (const tag of INCIDENT_EVIDENCE_TAGS) {
    await run(session, `MERGE (t:EvidenceTag {tag: $tag}) SET t.demo = true`, { tag });
    await run(
      session,
      `MATCH (i:Incident {id: 'INC-4271'}), (t:EvidenceTag {tag: $tag}) MERGE (i)-[:TAGGED]->(t)`,
      { tag },
    );
  }

  // --- Timeline events ---
  for (const ev of TIMELINE) {
    const evId = `${ev.t}-${ev.title}`;
    await run(session, `MERGE (te:TimelineEvent {id: $id}) SET te += $props, te.demo = true`, {
      id: evId,
      props: {
        t: ev.t,
        at: ev.at,
        title: ev.title,
        source: ev.source,
        severity: ev.severity,
        detail: ev.detail,
      },
    });
    await run(
      session,
      `MATCH (i:Incident {id: 'INC-4271'}), (te:TimelineEvent {id: $id}) MERGE (i)-[:HAS_EVENT]->(te)`,
      { id: evId },
    );
  }

  // --- Fix plans ---
  for (const fp of FIX_PLANS) {
    await run(session, `MERGE (f:FixPlan {id: $id}) SET f += $props, f.demo = true`, {
      id: `INC-4271-${fp.id}`,
      props: {
        label: fp.label,
        command: fp.command,
        successProb: fp.successProb,
        downtimeSec: fp.downtimeSec,
        revenueExposureUsd: fp.revenueExposureUsd,
        blastRadius: fp.blastRadius,
        rationale: fp.rationale,
        recommended: Boolean(fp.recommended),
      },
    });
    await run(
      session,
      `MATCH (i:Incident {id: 'INC-4271'}), (f:FixPlan {id: $id}) MERGE (i)-[:RECOMMENDS]->(f)`,
      { id: `INC-4271-${fp.id}` },
    );
  }

  // --- Past incidents, tagged with a partially-overlapping evidence set ---
  for (const p of PAST_INCIDENTS) {
    await run(session, `MERGE (p:PastIncident {id: $id}) SET p += $props, p.demo = true`, {
      id: p.id,
      props: { title: p.title, date: p.date },
    });
    for (const tag of p.tags) {
      await run(session, `MERGE (t:EvidenceTag {tag: $tag}) SET t.demo = true`, { tag });
      await run(
        session,
        `MATCH (p:PastIncident {id: $id}), (t:EvidenceTag {tag: $tag}) MERGE (p)-[:TAGGED]->(t)`,
        { id: p.id, tag },
      );
    }
  }

  const counts = await session.run(
    `MATCH (n) WHERE n.demo = true WITH count(n) AS nodes
     MATCH ()-[r]->() WHERE r.demo = true
     RETURN nodes, count(r) AS rels`,
  );
  const rec = counts.records[0];
  return {
    nodes: rec?.get("nodes")?.toNumber?.() ?? rec?.get("nodes") ?? 0,
    rels: rec?.get("rels")?.toNumber?.() ?? rec?.get("rels") ?? 0,
  };
}

export async function seedNeo4j() {
  const result = await withSession((session) => seedGraph(session));
  if (result == null) {
    throw new Error(
      "Could not seed Neo4j — check NEO4J_URI/NEO4J_USERNAME/NEO4J_PASSWORD and connectivity.",
    );
  }
  return result;
}
