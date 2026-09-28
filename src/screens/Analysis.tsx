import {
  Card,
  ErrorBanner,
  ListCard,
  PageBody,
  PrimaryButton,
  SecondaryButton,
  ScreenHeader,
} from "../components/ui";
import type { Analysis } from "../types";

const MACROS = [
  { key: "calories", icon: "🔥", label: "Calories", unit: "kcal" },
  { key: "protein", icon: "💪", label: "Protein", unit: "g" },
  { key: "carbs", icon: "🍚", label: "Carbs", unit: "g" },
  { key: "fat", icon: "🥑", label: "Fat", unit: "g" },
  { key: "fiber", icon: "🌾", label: "Fiber", unit: "g" },
  { key: "sugar", icon: "🍬", label: "Sugar", unit: "g" },
  { key: "sodium", icon: "🧂", label: "Sodium", unit: "mg" },
] as const;

function confidenceTone(confidence: Analysis["confidence"]) {
  if (confidence === "High") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (confidence === "Low") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

export function AnalysisScreen({
  image,
  status,
  result,
  error,
  onBack,
  onRetry,
  onScanAnother,
  onNutrition,
  onEatNow,
}: {
  image: string | null;
  status: "idle" | "loading" | "done" | "error";
  result: Analysis | null;
  error: string | null;
  onBack: () => void;
  onRetry: () => void;
  onScanAnother: () => void;
  onNutrition: () => void;
  onEatNow: () => void;
}) {
  const showsResults = status === "done" && !!result && result.identified;

  return (
    <div>
      <ScreenHeader
        title="Your Plate 🍽️"
        subtitle="Here's what we found in your meal"
        onBack={onBack}
      />

      <PageBody>
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
          <div className="space-y-4">
            {image && (
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
                <img
                  src={image}
                  alt="Your food"
                  className="h-56 w-full object-cover sm:h-72 lg:h-64"
                />
                <span className="absolute right-3 bottom-3 rounded-full bg-slate-900/75 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">
                  ✨ AI analyzed
                </span>
              </div>
            )}

            {status === "idle" && !result && (
              <Card className="space-y-3 text-center">
                <div className="text-5xl">🍽️</div>
                <h2 className="text-base font-extrabold text-slate-900">
                  No plate analysed yet
                </h2>
                <p className="text-sm text-slate-500">
                  Scan a meal from the home screen and the full breakdown shows up here.
                </p>
                <PrimaryButton onClick={onScanAnother}>📸 Go scan a meal</PrimaryButton>
              </Card>
            )}

            {status === "loading" && (
              <Card className="text-center">
                <div className="mx-auto size-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" />
                <h3 className="mt-3 text-sm font-extrabold text-slate-900">
                  Analyzing your plate…
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Finding every food item 🥗🍚🥚
                </p>
                <div className="mt-3 flex justify-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-2 animate-bounce rounded-full bg-emerald-400"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </Card>
            )}

            {status === "error" && (
              <Card className="space-y-3">
                <div className="text-3xl">😕</div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  That scan didn't go through
                </h3>
                <ErrorBanner message={error || "Please try again."} />
                <PrimaryButton onClick={onRetry}>🔄 Try this photo again</PrimaryButton>
                <SecondaryButton onClick={onScanAnother}>📸 Scan another meal</SecondaryButton>
              </Card>
            )}

            {status === "done" && result && !result.identified && (
              <Card className="space-y-3 text-center">
                <div className="text-5xl">🔍❓</div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Food could not be confidently identified
                </h2>
                <p className="text-sm leading-relaxed text-slate-500">
                  {result.note ||
                    "No recognizable food was clear in this photo. It might be blurry, too dark, or not a plate of food."}
                </p>
                <PrimaryButton onClick={onScanAnother}>📸 Try another photo</PrimaryButton>
              </Card>
            )}

            {showsResults && result && (
              <>
                <Card>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-black tracking-wider text-emerald-600 uppercase">
                        🍛 Your plate
                      </p>
                      <h2 className="mt-0.5 text-xl font-black tracking-tight text-slate-900 lg:text-2xl">
                        {result.foodName}
                      </h2>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${confidenceTone(result.confidence)}`}
                    >
                      {result.confidence} confidence
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Estimated portion:{" "}
                    <strong className="text-slate-700">{result.portion}</strong>
                  </p>
                </Card>

                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 lg:grid-cols-4 xl:grid-cols-7">
                  {MACROS.map((m) => (
                    <div
                      key={m.key}
                      className="rounded-2xl border border-slate-200/70 bg-white p-2.5 text-center shadow-sm shadow-slate-900/[0.03]"
                    >
                      <span className="text-base">{m.icon}</span>
                      <p className="mt-0.5 text-sm font-black text-slate-900">
                        {result[m.key]}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400">{m.label}</p>
                    </div>
                  ))}
                </div>

                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold">Nutrition Health Score</h3>
                      <p className="text-[11px] text-white/60">
                        Based on overall nutrient balance
                      </p>
                    </div>
                    <span className="text-2xl font-black">
                      {result.healthScore}
                      <span className="text-sm font-bold text-white/50">/100</span>
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300"
                      style={{ width: `${Math.max(4, result.healthScore)}%` }}
                    />
                  </div>
                </Card>
              </>
            )}
          </div>

          {showsResults && result && (
            <div className="space-y-4">
              <ListCard title="🥗 Visible ingredients" items={result.ingredients} />
              <ListCard title="💚 What's good?" items={result.positives} tone="green" />
              <ListCard title="⚠️ Things to consider" items={result.concerns} tone="amber" />
              <ListCard title="✨ Tiffin dabba tip" items={result.suggestions} tone="violet" />

              {result.note && (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-700">
                    AI note on uncertainty
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {result.note}
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-1 lg:max-w-sm">
                <PrimaryButton onClick={onScanAnother}>📸 Scan another meal</PrimaryButton>
                <SecondaryButton onClick={onNutrition}>📊 View full nutrition</SecondaryButton>
                <SecondaryButton onClick={onEatNow}>
                  🍽️ What should I eat now?
                </SecondaryButton>
              </div>
            </div>
          )}
        </div>
      </PageBody>
    </div>
  );
}

export function NutritionScreen({
  result,
  onBack,
  onEatNow,
  onScan,
}: {
  result: Analysis | null;
  onBack: () => void;
  onEatNow: () => void;
  onScan: () => void;
}) {
  if (!result || !result.identified) {
    return (
      <div>
        <ScreenHeader
          title="Full Nutrition 📊"
          subtitle="Understand your meal better"
          onBack={onBack}
        />
        <PageBody>
          <Card className="space-y-3 text-center">
            <div className="text-4xl">🍽️</div>
            <h3 className="text-sm font-extrabold text-slate-900">
              No meal analysed yet
            </h3>
            <p className="text-sm text-slate-500">
              Scan a plate and the full nutrition breakdown shows up here.
            </p>
            <PrimaryButton onClick={onScan}>📸 Scan a meal</PrimaryButton>
          </Card>
        </PageBody>
      </div>
    );
  }

  const insights = [
    { icon: "💪", title: "Protein & macros", items: result.positives },
    { icon: "⚠️", title: "Watch out for", items: result.concerns },
    { icon: "✨", title: "Make it better", items: result.suggestions },
  ];

  return (
    <div>
      <ScreenHeader title="Full Nutrition 📊" subtitle={result.foodName} onBack={onBack} />

      <PageBody className="space-y-4 sm:space-y-5">
        <Card className="flex items-center justify-between gap-3 bg-gradient-to-br from-emerald-500 to-teal-500 text-white lg:p-6">
          <div>
            <p className="text-xs font-semibold text-white/80">Estimated calories</p>
            <p className="text-3xl font-black lg:text-4xl">
              {result.calories}
              <span className="ml-1 text-sm font-bold text-white/70">kcal</span>
            </p>
            <p className="mt-1 text-[11px] text-white/70">
              {result.portion} · {result.confidence} confidence
            </p>
          </div>
          <span className="text-4xl lg:text-5xl">🔥</span>
        </Card>

        <h2 className="px-1 text-sm font-black tracking-wide text-slate-700 uppercase">
          Macronutrients
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { icon: "🍚", label: "Carbohydrates", value: `${result.carbs} g` },
            { icon: "💪", label: "Protein", value: `${result.protein} g` },
            { icon: "🥑", label: "Fat", value: `${result.fat} g` },
            { icon: "🌾", label: "Fiber", value: `${result.fiber} g` },
            { icon: "🍬", label: "Sugar", value: `${result.sugar} g` },
            { icon: "🧂", label: "Sodium", value: `${result.sodium} mg` },
          ].map((m) => (
            <Card key={m.label}>
              <span className="text-xl">{m.icon}</span>
              <p className="text-xs font-semibold text-slate-500">{m.label}</p>
              <p className="text-lg font-black text-slate-900">{m.value}</p>
            </Card>
          ))}
        </div>

        <h2 className="px-1 text-sm font-black tracking-wide text-slate-700 uppercase">
          Nutrition insights 💡
        </h2>

        <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
          {insights
            .filter((i) => i.items.length > 0)
            .map((i) => (
              <Card key={i.title}>
                <p className="text-sm font-bold text-slate-900">
                  {i.icon} {i.title}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {i.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex gap-2 text-sm leading-relaxed text-slate-600"
                    >
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}

          {result.ingredients.length > 0 && (
            <ListCard title="🥗 Ingredients spotted" items={result.ingredients} />
          )}
        </div>

        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[11px] leading-relaxed font-medium text-amber-800">
          ⚠️ Nutrition values are estimates from a photo. Real values vary with ingredients,
          preparation and portion size — not medical advice.
        </p>

        <div className="lg:max-w-sm">
          <SecondaryButton onClick={onEatNow}>
            🍽️ What should I eat now?
          </SecondaryButton>
        </div>
      </PageBody>
    </div>
  );
}
