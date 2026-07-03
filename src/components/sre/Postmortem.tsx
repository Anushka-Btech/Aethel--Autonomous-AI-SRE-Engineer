import { useState } from "react";
import { FileText, Loader2, Download } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { generatePostmortem } from "@/lib/postmortem.functions";

function renderMarkdown(md: string): string {
  // tiny safe-ish md → html (headings, bold, italic, code, lists, tables, line breaks)
  const esc = (s: string) =>
    s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
  let html = esc(md);
  html = html.replace(
    /^### (.+)$/gm,
    '<h3 class="mt-4 mb-1 text-sm font-semibold opacity-90">$1</h3>',
  );
  html = html.replace(
    /^## (.+)$/gm,
    '<h2 class="mt-5 mb-2 text-base font-bold text-gradient">$1</h2>',
  );
  html = html.replace(/^# (.+)$/gm, '<h1 class="mb-3 text-lg font-bold">$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="mono rounded bg-muted px-1 py-0.5 text-[11px]">$1</code>',
  );
  html = html.replace(/^\s*[-*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/(<li[\s\S]+?<\/li>\n?)+/g, (m) => `<ul class="my-1 space-y-0.5">${m}</ul>`);
  // tables (simple)
  html = html.replace(/^\|(.+)\|\n\|[\s:|-]+\|\n((?:\|.+\|\n?)+)/gm, (_, head, body) => {
    const ths = head
      .split("|")
      .map((s: string) => s.trim())
      .filter(Boolean)
      .map(
        (s: string) =>
          `<th class="px-2 py-1 text-left mono text-[10px] uppercase opacity-70">${s}</th>`,
      )
      .join("");
    const rows = body
      .trim()
      .split("\n")
      .map((r: string) => {
        const tds = r
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => `<td class="px-2 py-1 border-t border-border text-xs">${s}</td>`)
          .join("");
        return `<tr>${tds}</tr>`;
      })
      .join("");
    return `<table class="my-2 w-full overflow-hidden rounded-md border border-border"><thead class="bg-muted/40">${ths}</thead><tbody>${rows}</tbody></table>`;
  });
  html = html.replace(/\n{2,}/g, '</p><p class="my-2 text-sm leading-relaxed opacity-90">');
  return `<p class="text-sm leading-relaxed opacity-90">${html}</p>`;
}

export function Postmortem() {
  const gen = useServerFn(generatePostmortem);
  const [md, setMd] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await gen();
      setMd(r.markdown);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!md) return;
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "INC-4271-postmortem.md";
    a.click();
  };

  return (
    <div className="glass hover-lift rounded-xl p-4">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4" style={{ color: "var(--accent)" }} />
        <div className="text-sm font-semibold">Auto-Postmortem</div>
        <div className="ml-auto flex gap-2">
          {md && (
            <button
              onClick={download}
              className="mono rounded-md border border-border px-2 py-1 text-[11px] hover:bg-muted"
            >
              <Download className="mr-1 inline h-3 w-3" /> .md
            </button>
          )}
          <button
            onClick={run}
            disabled={loading}
            className="mono rounded-md bg-accent px-3 py-1 text-[11px] font-semibold text-accent-foreground disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
                drafting…
              </>
            ) : md ? (
              "Regenerate"
            ) : (
              "Generate"
            )}
          </button>
        </div>
      </div>
      {err && (
        <div className="mt-2 text-xs" style={{ color: "var(--crit)" }}>
          {err}
        </div>
      )}
      <div className="mt-3 max-h-[420px] overflow-y-auto pr-1">
        {md ? (
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }} />
        ) : (
          <p className="text-xs opacity-60">
            Aethel will synthesize a blameless postmortem from the investigation graph. Click{" "}
            <span className="mono">Generate</span> to draft the document.
          </p>
        )}
      </div>
    </div>
  );
}
