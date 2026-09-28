import { useState } from "react";
import {
  Card,
  ErrorBanner,
  PageBody,
  PrimaryButton,
  ScreenHeader,
  Spinner,
  inputClass,
} from "../components/ui";
import { SITUATIONS, type Analysis, type EatResult } from "../types";

export function EatNowScreen({
  onBack,
  onSuggest,
  lastMeal,
}: {
  onBack: () => void;
  onSuggest: (situation: string, budget: number) => Promise<EatResult>;
  lastMeal: Analysis | null;
}) {
  const [situation, setSituation] = useState("class");
  const [budget, setBudget] = useState(50);
  const [result, setResult] = useState<EatResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (nextSituation = situation, nextBudget = budget) => {
    setBusy(true);
    setError(null);
    try {
      setResult(await onSuggest(nextSituation, nextBudget));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not fetch a suggestion.");
    } finally {
      setBusy(false);
    }
  };

  const budgets = [20, 50, 100, 150];
  const situationLabel =
    SITUATIONS.find((s) => s.key === situation)?.label.toLowerCase() ?? situation;

  return (
    <div>
      <ScreenHeader
        title="What Should I Eat? 🍽️"
        subtitle="Tell me what you're doing now"
        onBack={onBack}
      />

      <PageBody>
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
          <div className="space-y-4">
            <Card className="lg:p-6">
              <h2 className="text-sm font-extrabold text-slate-900">
                What are you doing now?
              </h2>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-3">
                {SITUATIONS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    aria-pressed={situation === s.key}
                    onClick={() => {
                      setSituation(s.key);
                      if (result) void run(s.key, budget);
                    }}
                    className={`rounded-2xl border px-2 py-3 text-center transition ${
                      situation === s.key
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <span className="block text-xl">{s.icon}</span>
                    <span className="mt-1 block text-[11px] font-bold">{s.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="lg:p-6">
              <h2 className="text-sm font-extrabold text-slate-900">💰 Your budget</h2>
              <p className="text-xs text-slate-500">
                How much can you spend on this meal?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {budgets.map((b) => (
                  <button
                    key={b}
                    type="button"
                    aria-pressed={budget === b}
                    onClick={() => {
                      setBudget(b);
                      if (result) void run(situation, b);
                    }}
                    className={`rounded-xl border px-3.5 py-2 text-sm font-bold transition ${
                      budget === b
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    ₹{b}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  min={0}
                  value={budget}
                  aria-label="Custom budget in rupees"
                  onChange={(e) => setBudget(Math.max(0, Number(e.target.value) || 0))}
                  className={inputClass}
                />
              </div>
            </Card>

            {error && <ErrorBanner message={error} />}

            <div className="lg:max-w-sm">
              <PrimaryButton onClick={() => void run()} disabled={busy}>
                {busy ? <Spinner label="Thinking of ideas…" /> : "🍴 What should I eat?"}
              </PrimaryButton>
            </div>
          </div>

          <div className="space-y-4">
            {result && !busy ? (
              <Card className="space-y-3 lg:p-6">
                <div>
                  <p className="text-[11px] font-black tracking-wider text-emerald-600 uppercase">
                    Your suggestion 🍴
                  </p>
                  <h2 className="mt-0.5 text-lg font-black tracking-tight text-slate-900">
                    {result.title}
                  </h2>
                </div>
                {result.text && (
                  <p className="text-sm leading-relaxed text-slate-600">{result.text}</p>
                )}
                <ul className="space-y-2">
                  {result.foods.map((f, i) => (
                    <li
                      key={i}
                      className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">{f.name}</span>
                        {f.price && (
                          <span className="shrink-0 text-xs font-black text-emerald-600">
                            {f.price}
                          </span>
                        )}
                      </div>
                      {f.why && (
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          {f.why}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-slate-400">
                  Picked for "{situationLabel}" within ₹{budget}
                  {lastMeal?.identified ? ` — after your ${lastMeal.foodName} scan` : ""}.
                </p>
              </Card>
            ) : (
              <Card className="hidden text-center lg:block">
                <div className="text-4xl">🍴</div>
                <h3 className="mt-2 text-sm font-extrabold text-slate-900">
                  Your meal idea appears here
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Pick where you are and what you can spend, then tap the button — I'll match
                  it to your profile and budget.
                </p>
              </Card>
            )}
          </div>
        </div>
      </PageBody>
    </div>
  );
}
