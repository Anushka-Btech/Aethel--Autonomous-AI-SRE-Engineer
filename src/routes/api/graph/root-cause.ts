import { createFileRoute } from "@tanstack/react-router";
import { fetchRootCauseGraph } from "@/lib/neo4j/queries.server";
import { GRAPH_NODES, GRAPH_EDGES } from "@/lib/sre/scenario";

export const Route = createFileRoute("/api/graph/root-cause")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const incidentId = new URL(request.url).searchParams.get("incidentId") ?? "INC-4271";
        const live = await fetchRootCauseGraph(incidentId);
        if (live) return Response.json(live);
        return Response.json({
          source: "fallback",
          cypher: null,
          data: { nodes: GRAPH_NODES, edges: GRAPH_EDGES },
        });
      },
    },
  },
});
