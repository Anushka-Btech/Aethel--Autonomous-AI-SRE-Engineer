import neo4j, { type Driver, type Session } from "neo4j-driver";

/**
 * Sentinel's knowledge graph lives in Neo4j.
 *
 * Everything that used to be a hardcoded array in `scenario.ts` — the causal
 * chain, the service topology, historical incidents, evidence sources — is
 * now modeled as nodes and relationships and queried live with Cypher. See
 * `seed.server.ts` for the schema and `src/routes/api/graph/*` for the
 * queries the UI actually calls at runtime.
 *
 * Sentinel still works with zero configuration (it falls back to the static
 * scenario so the demo never breaks on stage), but set NEO4J_URI /
 * NEO4J_USERNAME / NEO4J_PASSWORD (see .env.example) to run it for real.
 */

let driver: Driver | null | undefined;

export function isNeo4jConfigured(): boolean {
  return Boolean(process.env.NEO4J_URI && process.env.NEO4J_USERNAME && process.env.NEO4J_PASSWORD);
}

export function getDriver(): Driver | null {
  if (driver !== undefined) return driver;

  if (!isNeo4jConfigured()) {
    driver = null;
    return driver;
  }

  driver = neo4j.driver(
    process.env.NEO4J_URI!,
    neo4j.auth.basic(process.env.NEO4J_USERNAME!, process.env.NEO4J_PASSWORD!),
    { maxConnectionPoolSize: 10 },
  );
  return driver;
}

/** Run `fn` with a live session. Returns `null` if Neo4j isn't configured or unreachable. */
export async function withSession<T>(
  fn: (session: Session) => Promise<T>,
  database = process.env.NEO4J_DATABASE || "neo4j",
): Promise<T | null> {
  const d = getDriver();
  if (!d) return null;
  const session = d.session({ database });
  try {
    return await fn(session);
  } catch (err) {
    console.error("[neo4j] query failed:", err instanceof Error ? err.message : err);
    return null;
  } finally {
    await session.close();
  }
}

export async function verifyConnectivity(): Promise<boolean> {
  const d = getDriver();
  if (!d) return false;
  try {
    await d.verifyConnectivity();
    return true;
  } catch {
    return false;
  }
}
