import { GitPullRequest, GitMerge, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function PullRequestCard({ phase }: { phase: string }) {
  const opened = ["remediating", "mitigated", "verifying", "closed"].includes(phase);
  const merged = ["mitigated", "verifying", "closed"].includes(phase);
  return (
    <div className="glass hover-lift rounded-xl p-4">
      <div className="flex items-center gap-2">
        <GitPullRequest className="h-4 w-4" style={{ color: "var(--accent)" }} />
        <div>
          <div className="text-sm font-semibold">Aethel auto-opened pull requests</div>
          <div className="mono text-[10px] uppercase tracking-wider opacity-60">
            github · shop/checkout-api
          </div>
        </div>
      </div>
      <ul className="mt-3 space-y-2">
        <PR
          num={813}
          title='revert: "feat: in-memory order cache for hot SKUs"'
          author="aethel-bot"
          branch="hotfix/revert-4271"
          status={opened ? (merged ? "merged" : "open") : "queued"}
          checks={{ lint: opened, test: opened, e2e: merged }}
          summary="Reverts a91f3b2. Restores OrderCache to pre-incident state. Tagged auto-revert."
        />
        <PR
          num={814}
          title="fix(cache): bound OrderCache with Caffeine maxSize+TTL"
          author="aethel-bot"
          branch="fix/order-cache-bounded"
          status={opened ? "open" : "queued"}
          checks={{ lint: opened, test: opened, e2e: false }}
          summary="Long-term fix. Adds maximumSize(10_000) + expireAfterAccess(5m). Includes regression load test."
        />
      </ul>
    </div>
  );
}

function PR({
  num,
  title,
  author,
  branch,
  status,
  checks,
  summary,
}: {
  num: number;
  title: string;
  author: string;
  branch: string;
  status: "queued" | "open" | "merged";
  checks: { lint: boolean; test: boolean; e2e: boolean };
  summary: string;
}) {
  const color =
    status === "merged"
      ? "var(--accent)"
      : status === "open"
        ? "var(--ok)"
        : "var(--muted-foreground)";
  const icon =
    status === "merged" ? <GitMerge className="h-3 w-3" /> : <GitPullRequest className="h-3 w-3" />;
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="hover-lift rounded-lg border border-border bg-background/40 p-2.5"
      style={{
        borderColor:
          status === "merged"
            ? "color-mix(in oklab, var(--accent) 35%, var(--color-border))"
            : status === "open"
              ? "color-mix(in oklab, var(--ok) 30%, var(--color-border))"
              : "var(--color-border)",
        transition: "border-color 400ms ease",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className={`mono inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${status === "open" ? "soft-pulse" : ""}`}
          style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color }}
        >
          {icon} {status}
        </span>
        <span className="mono text-[11px] opacity-70">#{num}</span>
        <span className="text-xs font-semibold">{title}</span>
      </div>
      <div className="mono mt-1 flex flex-wrap items-center gap-2 text-[10px] opacity-70">
        <span>{author}</span>
        <span>·</span>
        <span>{branch}</span>
        <span>·</span>
        <CheckRow ok={checks.lint} label="lint" />
        <CheckRow ok={checks.test} label="unit" />
        <CheckRow ok={checks.e2e} label="e2e" />
      </div>
      <p className="mt-1 text-[11px] opacity-75">{summary}</p>
    </motion.li>
  );
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      style={{ color: ok ? "var(--ok)" : "var(--muted-foreground)" }}
    >
      <CheckCircle2 className="h-2.5 w-2.5" /> {label}
    </span>
  );
}
