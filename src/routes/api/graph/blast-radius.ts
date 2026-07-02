import { createFileRoute } from "@tanstack/react-router";
import { fetchBlastRadius, type BlastRadiusResult } from "@/lib/neo4j/queries.server";
import { SERVICES, SERVICE_EDGES } from "@/lib/sre/scenario";

/** Offline fallback: same BFS the Cypher query does, run in-process over the static topology. */
function bfsFallback(serviceId: string, maxHops: number): BlastRadiusResult | null {
  const svc = SERVICES.find((s) => s.id === serviceId);
  if (!svc) return null;
  const adjacency = new Map<string, Set<string>>();
  for (const [a, b] of SERVICE_EDGES) {
    if (!adjacency.has(a)) adjacency.set(a, new Set());
    if (!adjacency.has(b)) adjacency.set(b, new Set());
    adjacency.get(a)!.add(b);
    adjacency.get(b)!.add(a);
  }
  const dist = new Map<string, number>([[serviceId, 0]]);
  const queue = [serviceId];
  while (queue.length) {
    const cur = queue.shift()!;
    const d = dist.get(cur)!;
    if (d >= maxHops) continue;
    for (const next of adjacency.get(cur) ?? []) {
      if (!dist.has(next)) {
        dist.set(next, d + 1);
        queue.push(next);
      }
    }
  }
  dist.delete(serviceId);
  const affected = [...dist.entries()]
    .map(([id, hops]) => ({ id, label: SERVICES.find((s) => s.id === id)?.label ?? id, hops }))
    .sort((a, b) => a.hops - b.hops);

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

  return {
    serviceId,
    affected,
    verdict,
    latencyDelta: count === 0 ? "no measurable impact" : `+${80 + maxHop * 140}ms p99`,
    errorDelta: count === 0 ? "0%" : `+${(count * 1.1 + (coreDatastore ? 3 : 0)).toFixed(1)}%`,
    revenueLossPerMin,
    narrative:
      count === 0
        ? `${svc.label} has no downstream or upstream dependents within ${maxHops} hops — isolated failure, no cascade.`
        : `Traversal from ${svc.label} reaches ${count} service${count === 1 ? "" : "s"} within ${maxHops} hops (${affected.map((a) => a.label).join(", ")}).${
            coreDatastore
              ? " Crosses a stateful core service (postgres/redis) — high blast radius."
              : ""
          }`,
  };
}

export const Route = createFileRoute("/api/graph/blast-radius")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const serviceId = url.searchParams.get("serviceId");
        const maxHops = Number(url.searchParams.get("maxHops") ?? "3");
        if (!serviceId)
          return Response.json({ ok: false, error: "serviceId is required" }, { status: 400 });

        const live = await fetchBlastRadius(serviceId, maxHops);
        if (live) return Response.json(live);

        const fallbackData = bfsFallback(serviceId, maxHops);
        if (!fallbackData)
          return Response.json(
            { ok: false, error: `Unknown service ${serviceId}` },
            { status: 404 },
          );
        return Response.json({ source: "fallback", cypher: null, data: fallbackData });
      },
    },
  },
});
