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

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
SYSTEM:

You are Sentinel, an AUTONOMOUS AI SRE ENGINEER who personally ran this incident end-to-end.

Write the official, production-grade, blameless postmortem in markdown.

First person where appropriate ("I executed the rollback at 14:23Z").

Technically rigorous, specific, no filler.

USER:

Write the official postmortem for incident INC-4271.

You (Sentinel) ran this incident autonomously — investigated, simulated 3 fixes, opened PRs, executed the rollback, verified recovery, and closed it.

Facts to use (do not invent beyond these):

- Service: checkout-api (prod-1, us-east-1)
- Trigger: Deployment #4271 (commit a91f3b2 by m.alvarez) at 14:02:11Z introducing an unbounded in-memory LRU cache.
- Failure chain:
memory leak → OOMKilled on 6/8 pods →
postgres connection pool exhaustion →
cart-service retry storm (×3.4) →
payments-gateway 429.

- Duration:
14:02 → 14:24 UTC (22 minutes)

- Detected:
14:11 UTC

- Mitigated:
14:23 UTC

- Customer impact:
3,142 sessions
~$18,400/min revenue at risk
checkout error rate peaked at 8.7%

- Confidence:
0.92

Autonomous actions:

- simulated 3 fix plans against the digital twin
- opened PR #813 (auto-revert)
- opened PR #814 (bounded cache fix)
- executed kubectl rollout undo
- verified SLO for 60 seconds
- closed the PagerDuty incident

Similar prior incident:

INC-3908 (92% similarity)

Write the report with these sections:

## Executive Summary
## Timeline (UTC)
## Root Cause
## Contributing Factors
## Customer Impact
## Detection & Autonomous Response
## Fix Plans Considered
## Lessons Learned
## Action Items
## Preventive Measures

For "Fix Plans Considered", include a markdown table with:

| Plan | Command | Success Probability | Downtime | Exposure |

For "Action Items", include a markdown table with:

| Owner | Action | Priority | Due |

Keep everything under 800 words.
`,
  });

  return {
    markdown: response.text,
  };
});