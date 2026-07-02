import { createFileRoute } from "@tanstack/react-router";
import { seedNeo4j } from "@/lib/neo4j/seed.server";
import { isNeo4jConfigured } from "@/lib/neo4j/client.server";

export const Route = createFileRoute("/api/graph/seed")({
  server: {
    handlers: {
      POST: async () => {
        if (!isNeo4jConfigured()) {
          return Response.json(
            {
              ok: false,
              error: "NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD are not set. See .env.example.",
            },
            { status: 503 },
          );
        }
        try {
          const counts = await seedNeo4j();
          return Response.json({ ok: true, ...counts });
        } catch (err) {
          return Response.json(
            {
              ok: false,
              error: err instanceof Error ? err.message : "Unknown error seeding Neo4j",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
