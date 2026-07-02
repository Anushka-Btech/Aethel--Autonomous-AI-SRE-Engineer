import { useState } from "react";
import { Bug, GitPullRequest, Sparkles } from "lucide-react";
import { BUGGY_CODE, FIXED_CODE, CODE_ANNOTATIONS } from "@/lib/sre/scenario";

export function CodeReview() {
  const [view, setView] = useState<"buggy" | "fix">("buggy");
  const code = view === "buggy" ? BUGGY_CODE : FIXED_CODE;
  return (
    <div className="glass hover-lift rounded-xl p-4">
      <div className="flex items-center gap-2">
        <Bug
          className="h-4 w-4"
          style={{ color: view === "buggy" ? "var(--crit)" : "var(--ok)" }}
        />
        <div>
          <div className="text-sm font-semibold">AI Code Reviewer</div>
          <div className="mono text-[10px] uppercase tracking-wider opacity-60">
            commit a91f3b2 · OrderCache.java · auto-annotated
          </div>
        </div>
        <div className="ml-auto inline-flex rounded-md border border-border bg-muted/40 p-0.5">
          <button
            onClick={() => setView("buggy")}
            className={`mono rounded px-2 py-0.5 text-[10px] ${view === "buggy" ? "bg-destructive text-destructive-foreground" : "opacity-70"}`}
          >
            buggy
          </button>
          <button
            onClick={() => setView("fix")}
            className={`mono rounded px-2 py-0.5 text-[10px] ${view === "fix" ? "bg-primary text-primary-foreground" : "opacity-70"}`}
          >
            sentinel fix
          </button>
        </div>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-background/60">
        <pre className="mono text-[11px] leading-relaxed">
          {code.split("\n").map((ln, i) => {
            const ann =
              view === "buggy" ? CODE_ANNOTATIONS.find((a) => a.line === i + 1) : undefined;
            const bg = ann
              ? ann.severity === "crit"
                ? "color-mix(in oklab, var(--crit) 14%, transparent)"
                : "color-mix(in oklab, var(--warn) 14%, transparent)"
              : "transparent";
            return (
              <div key={i} className="flex" style={{ background: bg }}>
                <span className="w-8 shrink-0 select-none border-r border-border px-1 text-right opacity-40">
                  {i + 1}
                </span>
                <code className="flex-1 px-2 py-0.5 whitespace-pre">{ln || "\u00A0"}</code>
                {ann && (
                  <span
                    className="mono shrink-0 px-2 py-0.5 text-[10px]"
                    style={{ color: ann.severity === "crit" ? "var(--crit)" : "var(--warn)" }}
                  >
                    ← {ann.text}
                  </span>
                )}
              </div>
            );
          })}
        </pre>
      </div>

      {view === "buggy" ? (
        <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-[11px]">
          <div
            className="mono uppercase tracking-wider opacity-70"
            style={{ color: "var(--crit)" }}
          >
            problem
          </div>
          <div>
            No eviction policy. Expected growth: infinite. Estimated OOM in ~9 min at current QPS
            (1240 rps).
          </div>
        </div>
      ) : (
        <div
          className="mt-2 flex items-center justify-between rounded-md border bg-primary/5 p-2 text-[11px]"
          style={{ borderColor: "color-mix(in oklab, var(--ok) 40%, transparent)" }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--ok)" }} />
            <span>Caffeine bounded LRU + 5m TTL. Load-tested: stable at 4× peak QPS.</span>
          </div>
          <a
            className="mono inline-flex items-center gap-1 rounded-md bg-ok/20 px-2 py-1 text-[10px]"
            style={{
              background: "color-mix(in oklab, var(--ok) 18%, transparent)",
              color: "var(--ok)",
            }}
            href="#pr-814"
            onClick={(e) => e.preventDefault()}
          >
            <GitPullRequest className="h-3 w-3" /> PR #814
          </a>
        </div>
      )}
    </div>
  );
}
