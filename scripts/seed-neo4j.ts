/**
 * Standalone seeding CLI: `npm run db:seed`
 *
 * Loads .env, connects to Neo4j, and converts the incident scenario
 * (services, causal graph, evidence, past incidents, fix plans) into a
 * real graph. Safe to re-run — seeding is idempotent (MERGE-based) and
 * scoped to nodes/relationships tagged `demo: true`.
 */
import "dotenv/config";
import { seedNeo4j } from "../src/lib/neo4j/seed.server";
import { isNeo4jConfigured } from "../src/lib/neo4j/client.server";

async function main() {
  if (!isNeo4jConfigured()) {
    console.error(
      "\n✗ NEO4J_URI / NEO4J_USERNAME / NEO4J_PASSWORD are not set.\n" +
        "  Copy .env.example to .env and fill in your Neo4j Aura (or local) credentials.\n",
    );
    process.exit(1);
  }

  console.log("Seeding Neo4j with the Sentinel incident knowledge graph…");
  const { nodes, rels } = await seedNeo4j();
  console.log(`\n✓ Seeded ${nodes} nodes and ${rels} relationships.`);
  console.log('  Start the app and click "Start Incident" — the causal graph,');
  console.log("  service map, and similarity search are now queried live from Neo4j.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("\n✗ Seeding failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
