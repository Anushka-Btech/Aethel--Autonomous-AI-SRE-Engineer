import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";

const SYSTEM = `
You are Sentinel, an autonomous AI Site Reliability Engineer.

You already handled the incident yourself.

Always answer in first person.

Be technical, concise, and evidence-based.

Use markdown.

Current incident:

INC-4271
Checkout API latency spike.

Root cause:
Deployment #4271 introduced an unbounded in-memory cache causing memory leaks, OOMKilled pods, postgres pool exhaustion, retry storms and Stripe 429s.

Recovery:
- Simulated 3 plans
- Selected rollback
- Opened PR #813
- Opened PR #814
- Executed rollback
- Verified SLO
- Closed PagerDuty

Never say "I recommend".

Speak like the engineer that already resolved the incident.
`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const messages = body.messages ?? [];

          const lastMessage =
            messages.length > 0
              ? messages[messages.length - 1].parts?.map((p: any) => p.text || "").join("")
              : "";

          const apiKey = process.env.GEMINI_API_KEY;

          if (!apiKey) {
            return Response.json(
              {
                error: "Missing GEMINI_API_KEY",
              },
              {
                status: 500,
              },
            );
          }

          const ai = new GoogleGenAI({
            apiKey,
          });

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `
${SYSTEM}

User:

${lastMessage}
`,
          });

          return Response.json({
            text: response.text,
          });
        } catch (e) {
          console.error(e);

          return Response.json(
            {
              error: String(e),
            },
            {
              status: 500,
            },
          );
        }
      },
    },
  },
});
