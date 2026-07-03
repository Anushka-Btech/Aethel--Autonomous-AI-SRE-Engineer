import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Why did checkout fail?",
  "What should I rollback?",
  "Show evidence for the root cause",
  "Was Stripe actually down?",
];

type Message = {
  role: "user" | "assistant";
  text: string;
};

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function send(text: string) {
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      text,
    };

    setMessages((m) => [...m, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              parts: [
                {
                  text,
                },
              ],
            },
          ],
        }),
      });

      const data = await res.json();

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: data.text ?? data.error ?? "No response",
        },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: "Failed to contact Gemini.",
        },
      ]);

      console.error(err);
    }

    setLoading(false);
  }

  return (
    <div className="flex h-[480px] flex-col">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Sparkles className="h-4 w-4" />
        <div className="text-sm font-semibold">
          Ask Aethel
        </div>

        <div className="mono ml-auto text-[10px] opacity-60">
          Gemini 2.5 Flash
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 p-3">

        {messages.length === 0 && (
          <>
            <p className="text-xs opacity-70">
              Aethel has the complete incident context.
            </p>

            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "flex justify-end"
                : "flex justify-start"
            }
          >
            <div
              className={
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-[80%]"
                  : "glass rounded-lg px-3 py-2 max-w-[80%]"
              }
            >
              <div className="whitespace-pre-wrap">
                {m.text}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="glass rounded-lg px-3 py-2 inline-block">
            Thinking...
          </div>
        )}

        <div ref={endRef} />
      </div>

      <form
        className="flex gap-2 border-t border-border p-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          ref={inputRef}
          className="flex-1 rounded-md border border-border bg-muted/40 px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Aethel..."
        />

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-3 text-primary-foreground"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}