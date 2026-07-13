import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI } from "@google/genai";

export const generatePostmortem = createServerFn({
  method: "POST",
}).handler(async () => {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const ai = new GoogleGenAI({
    apiKey: key,
  });

  /* ------------------------------------------------------------------
     Dynamic Incident Metadata
     ------------------------------------------------------------------ */

  const incidentId = "INC-4271";

  // Current UTC time becomes the incident start time
  const startedAt = new Date();

  // Timeline offsets
  const detectedAt = new Date(startedAt.getTime() + 9 * 60 * 1000);
  const mitigatedAt = new Date(startedAt.getTime() + 21 * 60 * 1000);
  const resolvedAt = new Date(startedAt.getTime() + 22 * 60 * 1000);

  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const formatTime = (d: Date) =>
    d.toISOString().split("T")[1].substring(0, 5);

  const incidentDate = formatDate(startedAt);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",

    contents: `
SYSTEM

You are Sentinel, an AUTONOMOUS AI SRE ENGINEER.

You personally investigated this incident, selected the safest recovery plan,
executed remediation, verified production recovery, and closed the incident.

Generate a production-grade blameless postmortem in markdown.

Be technically rigorous.

Do not use marketing language.

Write naturally like a senior Site Reliability Engineer.

--------------------------------------------------------------------

INCIDENT METADATA

Incident ID:
${incidentId}

Incident Date:
${incidentDate}

Started:
${incidentDate} ${formatTime(startedAt)} UTC

Detected:
${incidentDate} ${formatTime(detectedAt)} UTC

Mitigated:
${incidentDate} ${formatTime(mitigatedAt)} UTC

Resolved:
${incidentDate} ${formatTime(resolvedAt)} UTC

Duration:
22 minutes

Environment:
Production

Region:
us-east-1

Severity:
SEV-1

Confidence:
0.92

--------------------------------------------------------------------

INCIDENT DETAILS

Service:
checkout-api

Deployment:
#4271

Commit:
a91f3b2

Author:
m.alvarez

Root Cause:

Deployment #4271 introduced an unbounded in-memory LRU cache which caused
continuous memory growth.

Failure Chain

Memory leak

↓

OOMKilled on 6 of 8 checkout pods

↓

PostgreSQL connection pool exhaustion

↓

cart-service retry storm (3.4×)

↓

payments-gateway returned HTTP 429

--------------------------------------------------------------------

CUSTOMER IMPACT

Affected sessions:
3,142

Peak checkout error rate:
8.7%

Revenue at risk:
~$18,400 per minute

--------------------------------------------------------------------

AUTONOMOUS ACTIONS PERFORMED

✓ Correlated logs, metrics, traces and Kubernetes events

✓ Constructed the service dependency graph using Neo4j

✓ Retrieved similar historical incident (INC-3908, 92% similarity)

✓ Simulated three remediation plans using the Digital Twin

✓ Opened PR #813 (automatic rollback)

✓ Opened PR #814 (bounded cache implementation)

✓ Executed:

kubectl rollout undo deployment/checkout-api

✓ Verified SLO compliance for 60 seconds

✓ Closed PagerDuty incident automatically

--------------------------------------------------------------------

SIMILAR INCIDENT

INC-3908

Similarity:
92%

--------------------------------------------------------------------

Generate the report using these exact sections.

# Executive Summary

# Timeline (UTC)

# Root Cause

# Contributing Factors

# Customer Impact

# Detection & Autonomous Response

# Fix Plans Considered

Include a markdown table:

| Plan | Command | Success Probability | Downtime | Exposure |

# Lessons Learned

# Action Items

Include a markdown table:

| Owner | Action | Priority | Due |

# Preventive Measures

--------------------------------------------------------------------

CRITICAL INSTRUCTIONS

1. NEVER invent a different incident date.

2. NEVER write "On 2024-05-15".

3. NEVER replace the provided timestamps.

4. Every timestamp in the Executive Summary and Timeline MUST exactly match the Incident Metadata above.

5. Use first person when describing autonomous actions.

6. Produce professional GitHub-flavored Markdown.

7. Keep the report under 800 words.
`,
  });

  return {
    markdown: response.text,
  };
});