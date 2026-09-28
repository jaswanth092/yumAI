import { useEffect, useRef, useState } from "react";
import { ErrorBanner, ScreenHeader } from "../components/ui";
import type { Analysis, ChatMessage } from "../types";

const QUICK = [
  "How much protein should I eat?",
  "Give me a healthy breakfast",
  "What foods are high in fiber?",
  "Suggest a cheap healthy meal",
  "Healthy late night study snacks?",
  "How to make instant noodles healthier?",
];

export function ChatScreen({
  messages,
  busy,
  error,
  onSend,
  onBack,
  lastMeal,
}: {
  messages: ChatMessage[];
  busy: boolean;
  error: string | null;
  onSend: (text: string) => void;
  onBack: () => void;
  lastMeal: Analysis | null;
}) {
  const [input, setInput] = useState("");
  const list = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    onSend(text);
  };

  return (
    <div className="flex h-[calc(100dvh-4.25rem)] flex-col lg:h-dvh">
      <ScreenHeader title="Food AI 🍎" subtitle="Your food specialist" onBack={onBack} />

      <div ref={list} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto w-full max-w-3xl space-y-3">
          <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-3 text-sm leading-relaxed text-slate-700 shadow-sm">
            👋 Hi! I'm YumAI. Ask me about food, nutrition, protein, calories or cheap
            campus meals — I keep your profile in mind.
            {lastMeal?.identified && (
              <span className="mt-1 block text-xs text-slate-400">
                I can also build on your last scan: {lastMeal.foodName}.
              </span>
            )}
          </div>

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-emerald-500 to-teal-500 px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-lg shadow-emerald-500/20"
                    : "max-w-[90%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-slate-700 shadow-sm"
                }
              >
                {m.text}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-2 animate-bounce rounded-full bg-emerald-400"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
                <span className="sr-only">Thinking</span>
              </div>
            </div>
          )}

          {error && <ErrorBanner message={error} />}
        </div>
      </div>

      <div className="border-t border-slate-200/70 bg-[#fbfbf9] px-3 py-3">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => !busy && onSend(q)}
                className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-emerald-300"
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about food…"
              aria-label="Ask about food"
              data-testid="chat-input"
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send message"
              data-testid="chat-send"
              className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white transition disabled:opacity-40"
            >
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
