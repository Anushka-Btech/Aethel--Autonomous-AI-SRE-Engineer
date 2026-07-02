import { createFileRoute } from "@tanstack/react-router";
import { fetchSimilarIncidents } from "@/lib/neo4j/queries.server";
import { SIMILAR_INCIDENTS } from "@/lib/sre/scenario";

export const Route = createFileRoute("/api/graph/similar-incidents")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const incidentId = new URL(request.url).searchParams.get("incidentId") ?? "INC-4271";
        const live = await fetchSimilarIncidents(incidentId);
        if (live) return Response.json(live);
        return Response.json({
          source: "fallback",
          cypher: null,
          data: SIMILAR_INCIDENTS.map((s) => ({
            id: s.id,
            title: s.title,
            date: s.date,
            similarity: s.similarity,
            sharedSignals: s.sharedSignals,
            sharedCount: s.sharedSignals.length,
            totalTags: s.sharedSignals.length,
          })),
        });
      },
    },
  },
});
