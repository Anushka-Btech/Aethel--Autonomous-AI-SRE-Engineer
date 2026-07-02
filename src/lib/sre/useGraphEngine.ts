import { useCallback, useEffect, useState } from "react";
import type { GraphNode, GraphEdge, ServiceNode } from "./scenario";
import { GRAPH_NODES, GRAPH_EDGES, SERVICES, SERVICE_EDGES, SIMILAR_INCIDENTS } from "./scenario";

export type DataSource = "neo4j" | "fallback" | "loading";

export type SimilarIncidentHit = {
  id: string;
  title: string;
  date: string;
  similarity: number;
  sharedSignals: string[];
  sharedCount: number;
  totalTags: number;
};

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

type GraphStats = {
  configured: boolean;
  connected: boolean;
  data: { nodes: number; relationships: number; labels: string[] } | null;
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json();
}

/**
 * Sources the causal graph, service topology, and similarity search from
 * `/api/graph/*` — which query Neo4j live when it's configured, and fall
 * back to the static scenario otherwise, transparently.
 */
export function useGraphEngine() {
  const [source, setSource] = useState<DataSource>("loading");
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [rootCauseCypher, setRootCauseCypher] = useState<string | null>(null);
  const [serviceMapCypher, setServiceMapCypher] = useState<string | null>(null);
  const [similarityCypher, setSimilarityCypher] = useState<string | null>(null);

  const [graphNodes, setGraphNodes] = useState<GraphNode[]>(GRAPH_NODES);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>(GRAPH_EDGES);
  const [services, setServices] = useState<ServiceNode[]>(SERVICES);
  const [serviceEdges, setServiceEdges] = useState<[string, string][]>(SERVICE_EDGES);
  const [similarIncidents, setSimilarIncidents] = useState<SimilarIncidentHit[]>(
    SIMILAR_INCIDENTS.map((s) => ({
      id: s.id,
      title: s.title,
      date: s.date,
      similarity: s.similarity,
      sharedSignals: s.sharedSignals,
      sharedCount: s.sharedSignals.length,
      totalTags: s.sharedSignals.length,
    })),
  );

  const refresh = useCallback(async () => {
    const [statsRes, rootCause, serviceMap, similar] = await Promise.all([
      getJson<GraphStats & { source: DataSource }>("/api/graph/stats"),
      getJson<{
        source: DataSource;
        cypher: string | null;
        data: { nodes: GraphNode[]; edges: GraphEdge[] };
      }>("/api/graph/root-cause"),
      getJson<{
        source: DataSource;
        cypher: string | null;
        data: { services: ServiceNode[]; edges: [string, string][] };
      }>("/api/graph/service-map"),
      getJson<{ source: DataSource; cypher: string | null; data: SimilarIncidentHit[] }>(
        "/api/graph/similar-incidents",
      ),
    ]);

    setStats(statsRes);
    setSource(rootCause.source === "neo4j" ? "neo4j" : "fallback");
    setRootCauseCypher(rootCause.cypher);
    setServiceMapCypher(serviceMap.cypher);
    setSimilarityCypher(similar.cypher);
    setGraphNodes(rootCause.data.nodes);
    setGraphEdges(rootCause.data.edges);
    setServices(serviceMap.data.services);
    setServiceEdges(serviceMap.data.edges);
    setSimilarIncidents(similar.data);
  }, []);

  useEffect(() => {
    refresh().catch(() => setSource("fallback"));
  }, [refresh]);

  const seed = useCallback(async () => {
    const res = await fetch("/api/graph/seed", { method: "POST" });
    const json = (await res.json()) as {
      ok: boolean;
      error?: string;
      nodes?: number;
      rels?: number;
    };
    if (json.ok) await refresh();
    return json;
  }, [refresh]);

  const blastRadius = useCallback(
    async (
      serviceId: string,
      maxHops = 3,
    ): Promise<{ source: DataSource; data: BlastRadiusResult } | null> => {
      try {
        const json = await getJson<{ source: DataSource; data: BlastRadiusResult }>(
          `/api/graph/blast-radius?serviceId=${encodeURIComponent(serviceId)}&maxHops=${maxHops}`,
        );
        return json;
      } catch {
        return null;
      }
    },
    [],
  );

  return {
    source,
    stats,
    seed,
    refresh,
    blastRadius,
    rootCauseCypher,
    serviceMapCypher,
    similarityCypher,
    graphNodes,
    graphEdges,
    services,
    serviceEdges,
    similarIncidents,
  };
}
