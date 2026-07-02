# Sentinel — Autonomous AI SRE Engineer

Sentinel plays back a full production incident — deploy → memory leak → OOMKill → cascading
failure — and shows an autonomous AI engineer investigating it with 13 specialist agents,
building a causal graph, simulating fixes against a digital twin, opening a PR, executing a
rollback, and verifying recovery. Zero humans in the loop.

## What changed: this is now backed by a real graph database

The original build was a beautiful piece of UI theater: every causal edge, every "similar
incident," every service dependency was a hardcoded array replayed against a stopwatch. It
looked like reasoning, but there was no data structure underneath doing the reasoning.

Sentinel now runs on **Neo4j**. The incident's causal chain, the service dependency topology,
the evidence trail, and the historical-incident memory are modeled as a real graph and queried
live with Cypher:

| Feature | Before | Now |
|---|---|---|
| Root-cause graph | Hardcoded `GRAPH_NODES`/`GRAPH_EDGES` arrays | `MATCH (i:Incident)-[:HAS_CAUSAL_NODE]->(n)-[:LEADS_TO]->(m)` — a real causal path query |
| Service map | Hardcoded `SERVICES`/`SERVICE_EDGES` | `MATCH (s:Service)-[:DEPENDS_ON]->(d)` — a real dependency graph |
| "What if X dies?" | 3 canned buttons with pre-written outcomes | **Click any service** → live `MATCH (s)-[:DEPENDS_ON*1..3]-(affected)` variable-length traversal, works for a node that was never scripted |
| Similar incidents | Hand-picked "92% similar" numbers | Jaccard similarity computed live over shared `EvidenceTag` nodes — explainable, not a black-box score |
| Evidence | Static list | `Evidence` nodes linked to the incident via `EVIDENCED_BY` |

The UI is unchanged where it was already excellent (the cinematic replay, the agent swarm, the
autonomous pipeline). What changed is *where the data comes from* and *what new questions you
can ask it live*.

Every `/api/graph/*` route degrades gracefully to the static scenario if Neo4j isn't configured
or reachable — so the demo never dies on stage, it just flips a visible "offline demo mode"
badge instead of a live one. This resiliency is itself part of the pitch: it's a genuinely
production-shaped fallback, not just enough to make a video.

## Architecture

```
src/lib/neo4j/
  client.server.ts    driver singleton, graceful "not configured" handling
  seed.server.ts       converts scenario.ts into a real graph (idempotent MERGE-based seed)
  queries.server.ts    the actual Cypher: root cause, service map, blast radius, similarity, stats

src/routes/api/graph/
  seed.ts               POST — seed the graph from the app itself
  root-cause.ts          GET — live causal graph
  service-map.ts         GET — live service topology
  blast-radius.ts         GET ?serviceId=&maxHops= — live variable-length traversal
  similar-incidents.ts    GET — live Jaccard similarity over evidence tags
  stats.ts                GET — node/relationship counts for the "powered by Neo4j" badge

src/lib/sre/useGraphEngine.ts   client hook: fetches all of the above, exposes the actual
                                 Cypher used so it can be shown in the UI (see "Graph Reasoning
                                 Engine" panel), falls back to static data transparently
```

The graph schema (see `seed.server.ts` for the full Cypher):

```
(:Incident)-[:HAS_CAUSAL_NODE]->(:CausalNode)-[:LEADS_TO]->(:CausalNode)
(:Incident)-[:EVIDENCED_BY]->(:Evidence)
(:Incident)-[:TAGGED]->(:EvidenceTag)<-[:TAGGED]-(:PastIncident)
(:Incident)-[:RECOMMENDS]->(:FixPlan)
(:Incident)-[:HAS_EVENT]->(:TimelineEvent)
(:Service)-[:DEPENDS_ON]->(:Service)
```

## Running it

### 1. Install deps

```bash
npm install
```

### 2. (Optional but recommended) Start Neo4j

Local Docker:

```bash
cp .env.example .env
docker compose up -d neo4j
npm run db:seed
```

Or use [Neo4j AuraDB Free](https://neo4j.com/cloud/aura-free/) — create an instance, then put
its connection URI/credentials in `.env` (see the commented-out block in `.env.example`) and run
`npm run db:seed`.

Neo4j Browser is at http://localhost:7474 if you want to explore the graph yourself —
try `MATCH (n) WHERE n.demo = true RETURN n LIMIT 100`.

### 3. Run the app

```bash
npm run dev
```

If you skip step 2, Sentinel runs entirely in offline demo mode — every feature still works,
sourced from the static scenario. The "Graph Reasoning Engine" panel tells you which mode
you're in.

## Why this is the right upgrade for judging

- **It's honest.** The old similarity scores and blast-radius numbers were invented for the
  narrative. The new ones are computed from a real query and the UI shows you the query.
- **It's genuinely interactive, not just replayed.** Click *any* service on the map — not just
  the 3 the demo script anticipated — and get a real traversal result.
- **It degrades gracefully.** No live DB in the room? Sentinel doesn't crash or stub out —
  it flips to a clearly-labeled offline mode with identical UX. That's a production-grade
  design decision, not just a demo hack.
- **The graph model is the right tool for the job.** Causal chains, blast-radius propagation,
  and incident similarity-by-shared-signal are all naturally graph problems — traversals and
  path-finding, not joins. That's the actual argument for Neo4j here, not just "we used a
  database."
