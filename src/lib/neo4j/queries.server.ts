import { withSession } from "./client.server";
import type { GraphNode, GraphEdge, ServiceNode } from "../sre/scenario";

export type CypherResult<T> = { source: "neo4j"; cypher: string; data: T } | null;

/** The live causal graph — replaces the hardcoded GRAPH_NODES/GRAPH_EDGES arrays. */
export async function fetchRootCauseGraph(
  incidentId = "INC-4271",
): Promise<CypherResult<{ nodes: GraphNode[]; edges: GraphEdge[] }>> {
  const cypher = `
    MATCH (i:Incident {id: $incidentId})-[:HAS_CAUSAL_NODE]->(n:CausalNode)
    OPTIONAL MATCH (n)-[r:LEADS_TO]->(m:CausalNode)<-[:HAS_CAUSAL_NODE]-(i)
    RETURN n.id AS id, n.label AS label, n.kind AS kind, n.x AS x, n.y AS y,
           n.appearAt AS appearAt, n.evidence AS evidence,
           collect(DISTINCT { to: m.id, appearAt: r.appearAt }) AS out
  `;
  const result = await withSession(async (session) => session.run(cypher, { incidentId }));
  if (!result || result.records.length === 0) return null;

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  for (const rec of result.records) {
    nodes.push({
      id: rec.get("id"),
      label: rec.get("label"),
      kind: rec.get("kind"),
      x: rec.get("x"),
      y: rec.get("y"),
      appearAt: rec.get("appearAt"),
      evidence: rec.get("evidence") ?? [],
    });
    for (const out of rec.get("out") as { to: string | null; appearAt: number | null }[]) {
      if (out.to != null)
        edges.push({ from: rec.get("id"), to: out.to, appearAt: out.appearAt ?? 0 });
    }
  }
  return { source: "neo4j", cypher: cypher.trim(), data: { nodes, edges } };
}

/** The service dependency topology — replaces SERVICES/SERVICE_EDGES. */
export async function fetchServiceMap(): Promise<
  CypherResult<{ services: ServiceNode[]; edges: [string, string][] }>
> {
  const cypher = `
    MATCH (s:Service)
    OPTIONAL MATCH (s)-[:DEPENDS_ON]->(d:Service)
    RETURN s.id AS id, s.label AS label, s.x AS x, s.y AS y, s.healthBaseline AS healthBaseline,
           collect(DISTINCT d.id) AS deps
  `;
  const result = await withSession(async (session) => session.run(cypher));
  if (!result || result.records.length === 0) return null;

  const services: ServiceNode[] = [];
  const edges: [string, string][] = [];
  for (const rec of result.records) {
    services.push({
      id: rec.get("id"),
      label: rec.get("label"),
      x: rec.get("x"),
      y: rec.get("y"),
      healthBaseline: rec.get("healthBaseline"),
    });
    for (const dep of rec.get("deps") as (string | null)[]) {
      if (dep) edges.push([rec.get("id"), dep]);
    }
  }
  return { source: "neo4j", cypher: cypher.trim(), data: { services, edges } };
}

export type BlastRadiusHit = { id: string; label: string; hops: number };
export type BlastRadiusResult = {
  serviceId: string;
  affected: BlastRadiusHit[];
  verdict: "safe" | "risky" | "catastrophic";
  latencyDelta: string;
  errorDelta: string;
  revenueLossPerMin: number;
  narrative: string;
};

/** Live variable-length graph traversal — works for ANY service, not just 3 canned scenarios. */
export async function fetchBlastRadius(
  serviceId: string,
  maxHops = 3,
): Promise<CypherResult<BlastRadiusResult>> {
  const cypher = `
    MATCH (s:Service {id: $serviceId})
    OPTIONAL MATCH p = (s)-[:DEPENDS_ON*1..${maxHops}]-(affected:Service)
    WHERE affected <> s
    RETURN s.label AS label, affected.id AS id, affected.label AS affectedLabel,
           min(length(p)) AS hops
  `;
  const result = await withSession(async (session) => session.run(cypher, { serviceId }));
  if (!result || result.records.length === 0 || !result.records[0].get("label")) return null;

  const affected: BlastRadiusHit[] = [];
  for (const rec of result.records) {
    const id = rec.get("id");
    if (id)
      affected.push({
        id,
        label: rec.get("affectedLabel"),
        hops: rec.get("hops")?.toNumber?.() ?? rec.get("hops"),
      });
  }
  affected.sort((a, b) => a.hops - b.hops);

  const coreDatastore = affected.some((a) => a.id === "postgres" || a.id === "redis");
  const count = affected.length;
  const verdict: BlastRadiusResult["verdict"] =
    count === 0
      ? "safe"
      : coreDatastore || count >= 4
        ? "catastrophic"
        : count >= 2
          ? "risky"
          : "safe";
  const revenueLossPerMin = count === 0 ? 0 : count * 4500 + (coreDatastore ? 15000 : 0);
  const maxHop = affected.reduce((m, a) => Math.max(m, a.hops), 0);
  const latencyDelta = count === 0 ? "no measurable impact" : `+${80 + maxHop * 140}ms p99`;
  const errorDelta = count === 0 ? "0%" : `+${(count * 1.1 + (coreDatastore ? 3 : 0)).toFixed(1)}%`;

  const narrative =
    count === 0
      ? `${result.records[0].get("label")} has no downstream or upstream dependents within ${maxHops} hops — isolated failure, no cascade.`
      : `Graph traversal from ${result.records[0].get("label")} reaches ${count} service${count === 1 ? "" : "s"} within ${maxHops} hops (${affected.map((a) => a.label).join(", ")}).${
          coreDatastore
            ? " Traversal crosses a stateful core service (postgres/redis) — high blast radius."
            : ""
        }`;

  return {
    source: "neo4j",
    cypher: cypher.trim(),
    data: { serviceId, affected, verdict, latencyDelta, errorDelta, revenueLossPerMin, narrative },
  };
}

export type SimilarIncidentHit = {
  id: string;
  title: string;
  date: string;
  similarity: number;
  sharedSignals: string[];
  sharedCount: number;
  totalTags: number;
};

/** Graph-native similarity: Jaccard index over shared evidence tags — explainable, not a black-box embedding. */
export async function fetchSimilarIncidents(
  incidentId = "INC-4271",
): Promise<CypherResult<SimilarIncidentHit[]>> {
  const cypher = `
    MATCH (i:Incident {id: $incidentId})-[:TAGGED]->(t:EvidenceTag)
    WITH i, collect(t.tag) AS iTags
    MATCH (p:PastIncident)-[:TAGGED]->(t2:EvidenceTag)
    WITH i, iTags, p, collect(t2.tag) AS pTags
    WITH p, iTags, pTags,
         [tag IN iTags WHERE tag IN pTags] AS shared,
         apoc.coll.toSet(iTags + pTags) AS union
    RETURN p.id AS id, p.title AS title, p.date AS date, shared, size(shared) AS sharedCount,
           size(iTags) + size(pTags) - size(shared) AS unionCount
    ORDER BY sharedCount DESC
  `;
  // Some Neo4j deployments (e.g. AuraDB Free) don't ship APOC — fall back to
  // plain Cypher list arithmetic if the APOC call fails.
  const plainCypher = `
    MATCH (i:Incident {id: $incidentId})-[:TAGGED]->(t:EvidenceTag)
    WITH i, collect(t.tag) AS iTags
    MATCH (p:PastIncident)-[:TAGGED]->(t2:EvidenceTag)
    WITH i, iTags, p, collect(t2.tag) AS pTags
    WITH p, iTags, pTags, [tag IN iTags WHERE tag IN pTags] AS shared
    WITH p, shared, size(iTags) AS iCount, size(pTags) AS pCount
    RETURN p.id AS id, p.title AS title, p.date AS date, shared,
           size(shared) AS sharedCount, iCount + pCount - size(shared) AS unionCount
    ORDER BY sharedCount DESC
  `;

  let usedCypher = cypher;
  let result = await withSession(async (session) => session.run(cypher, { incidentId }));
  if (!result) {
    usedCypher = plainCypher;
    result = await withSession(async (session) => session.run(plainCypher, { incidentId }));
  }
  if (!result || result.records.length === 0) return null;

  const hits: SimilarIncidentHit[] = result.records.map((rec) => {
    const sharedCount = rec.get("sharedCount")?.toNumber?.() ?? rec.get("sharedCount") ?? 0;
    const unionCount = rec.get("unionCount")?.toNumber?.() ?? rec.get("unionCount") ?? 1;
    return {
      id: rec.get("id"),
      title: rec.get("title"),
      date: rec.get("date"),
      similarity: unionCount > 0 ? sharedCount / unionCount : 0,
      sharedSignals: rec.get("shared") ?? [],
      sharedCount,
      totalTags: unionCount,
    };
  });

  return { source: "neo4j", cypher: usedCypher.trim(), data: hits };
}

export async function fetchGraphStats(): Promise<
  CypherResult<{ nodes: number; relationships: number; labels: string[] }>
> {
  const cypher = `
    MATCH (n) WHERE n.demo = true
    WITH count(n) AS nodes, collect(DISTINCT labels(n)[0]) AS labels
    MATCH ()-[r]->() WHERE r.demo = true
    RETURN nodes, count(r) AS relationships, labels
  `;
  const result = await withSession(async (session) => session.run(cypher));
  if (!result || result.records.length === 0) return null;
  const rec = result.records[0];
  return {
    source: "neo4j",
    cypher: cypher.trim(),
    data: {
      nodes: rec.get("nodes")?.toNumber?.() ?? rec.get("nodes") ?? 0,
      relationships: rec.get("relationships")?.toNumber?.() ?? rec.get("relationships") ?? 0,
      labels: rec.get("labels") ?? [],
    },
  };
}
