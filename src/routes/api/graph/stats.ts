import { createFileRoute } from "@tanstack/react-router";
import { fetchGraphStats } from "@/lib/neo4j/queries.server";
import { isNeo4jConfigured, verifyConnectivity } from "@/lib/neo4j/client.server";

export const Route = createFileRoute("/api/graph/stats")({
  server: {
    handlers: {
      GET: async () => {
        if (!isNeo4jConfigured()) {
          return Response.json({
            source: "fallback",
            configured: false,
            connected: false,
            data: null,
          });
        }
        const connected = await verifyConnectivity();
        const live = connected ? await fetchGraphStats() : null;
        return Response.json({
          source: live ? "neo4j" : "fallback",
          configured: true,
          connected,
          data: live?.data ?? null,
        });
      },
    },
  },
});
