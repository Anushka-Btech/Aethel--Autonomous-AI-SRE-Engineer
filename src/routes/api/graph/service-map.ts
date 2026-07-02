import { createFileRoute } from "@tanstack/react-router";
import { fetchServiceMap } from "@/lib/neo4j/queries.server";
import { SERVICES, SERVICE_EDGES } from "@/lib/sre/scenario";

export const Route = createFileRoute("/api/graph/service-map")({
  server: {
    handlers: {
      GET: async () => {
        const live = await fetchServiceMap();
        if (live) return Response.json(live);
        return Response.json({
          source: "fallback",
          cypher: null,
          data: { services: SERVICES, edges: SERVICE_EDGES },
        });
      },
    },
  },
});
