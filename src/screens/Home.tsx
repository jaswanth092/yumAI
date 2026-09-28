import { useRef } from "react";
import { Card, ErrorBanner, PageBody, PrimaryButton, Spinner } from "../components/ui";
import { SCANS_PER_DAY, WATER_GOAL } from "../lib/store";
import type { Analysis, Profile, Screen } from "../types";

export function HomeScreen({
  profile,
  streak,
  scansUsed,
  caloriesToday,
  water,
  pending,
  busy,
  error,
  lastResult,
  onPickFile,
  onRemovePhoto,
  onAnalyze,
  onAddWater,
  go,
}: {
  profile: Profile;
  streak: number;
  scansUsed: number;
  caloriesToday: number;
  water: number;
  pending: { dataUrl: string; name: string } | null;
  busy: boolean;
  error: string | null;
  lastResult: Analysis | null;
  onPickFile: (file: File) => void;
  onRemovePhoto: () => void;
  onAnalyze: () => void;
  onAddWater: () => void;
  go: (screen: Screen) => void;
}) {
  const camera = useRef<HTMLInputElement | null>(null);
  const gallery = useRef<HTMLInputElement | null>(null);
  const remaining = Math.max(0, SCANS_PER_DAY - scansUsed);
  const progress = Math.min(100, (scansUsed / SCANS_PER_DAY) * 100);
  const name = profile.name?.trim() || "friend";

  const features: { icon: string; title: string; text: string; onClick: () => void }[] = [
    { icon: "💬", title: "Food Chat", text: "Ask anything about food", onClick: () => go("chat") },
    {
      icon: "📊",
      title: "Nutrition",
      text: "Understand your meal",
      onClick: () => go(lastResult ? "nutrition" : "analysis"),
    },
    {
      icon: "🥗",
      title: "Fix My Plate",
      text: "Improve your meal",
      onClick: () => go(lastResult ? "nutrition" : "analysis"),
    },
    { icon: "📖", title: "History", text: "Previous meals", onClick: () => go("history") },
    { icon: "🍽️", title: "What To Eat?", text: "Situation suggestions", onClick: () => go("eatNow") },
    { icon: "🔒", title: "Privacy", text: "Data & control", onClick: () => go("privacy") },
  ];

  return (
    <PageBody className="space-y-4 sm:space-y-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">Welcome back 👋</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 capitalize lg:text-3xl">
            {name}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
            🔥 {streak} {streak === 1 ? "day" : "days"}
          </span>
          <button
            type="button"
            onClick={() => go("profile")}
            aria-label="Profile and settings"
            className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 lg:size-10"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* phones: one column · desktop: scan area beside the trackers */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <div className="space-y-4 lg:min-w-0 lg:flex-1">
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 lg:p-6">
            <div className="text-3xl lg:text-4xl">🥗 🍚 🍳</div>
            <h2 className="mt-2 text-lg font-extrabold lg:text-xl">
              What's on your plate? 🍽️
            </h2>
            <p className="mt-1 text-sm text-white/85">
              Snap your meal and YumAI reads the real food, macros and how to fix it.
            </p>
          </Card>

          <Card className="lg:p-6">
            <div className="text-center">
              <div className="text-3xl">📸</div>
              <h2 className="mt-1 text-base font-extrabold text-slate-900">
                Analyze your food
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Upload a food photo or take one with your camera.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => camera.current?.click()}
                className="rounded-2xl bg-slate-900 px-3 py-3 text-xs font-bold text-white transition active:scale-[0.98]"
              >
                📷 Take Photo
              </button>
              <button
                type="button"
                onClick={() => gallery.current?.click()}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-700 transition active:scale-[0.98]"
              >
                🖼️ Upload Photo
              </button>
            </div>

            <input
              ref={camera}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              aria-label="Take a photo of your food"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPickFile(file);
                e.target.value = "";
              }}
            />
            <input
              ref={gallery}
              type="file"
              accept="image/*"
              hidden
              aria-label="Upload a photo of your food"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPickFile(file);
                e.target.value = "";
              }}
            />

            {pending && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                <img
                  src={pending.dataUrl}
                  alt="Selected food"
                  className="h-48 w-full object-cover sm:h-64"
                />
                <div className="flex items-center justify-between gap-2 bg-slate-50 px-3 py-2">
                  <span className="truncate text-xs text-slate-500">{pending.name}</span>
                  <button
                    type="button"
                    onClick={onRemovePhoto}
                    className="shrink-0 text-xs font-bold text-rose-600"
                  >
                    ✕ Remove
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-3">
                <ErrorBanner message={error} />
              </div>
            )}

            <div className="mt-4">
              <PrimaryButton onClick={onAnalyze} disabled={!pending || busy || remaining === 0}>
                {busy ? <Spinner label="Analyzing your plate…" /> : "📸 Analyze Food"}
              </PrimaryButton>
              {remaining === 0 && (
                <p className="mt-2 text-center text-[11px] font-semibold text-amber-600">
                  You've used all {SCANS_PER_DAY} scans for today — more tomorrow.
                </p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4 lg:w-80 lg:shrink-0 xl:w-96">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">📸 Daily Food Scans</h3>
                <p className="text-xs text-slate-500">Track your daily photo analyses</p>
              </div>
              <span className="rounded-xl bg-slate-100 px-2.5 py-1 text-sm font-black text-slate-700">
                {scansUsed}/{SCANS_PER_DAY}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              You have {remaining} food {remaining === 1 ? "scan" : "scans"} left today.
            </p>
          </Card>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            <Card>
              <p className="text-xs font-bold text-slate-500">🔥 Today's calories</p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {caloriesToday}
                <span className="ml-1 text-xs font-semibold text-slate-400">kcal</span>
              </p>
            </Card>
            <Card>
              <p className="text-xs font-bold text-slate-500">💧 Water intake</p>
              <p className="mt-1 text-2xl font-black text-slate-900">
                {water}
                <span className="ml-1 text-xs font-semibold text-slate-400">
                  / {WATER_GOAL} glasses
                </span>
              </p>
              <button
                type="button"
                onClick={onAddWater}
                className="mt-2 rounded-xl bg-sky-50 px-2.5 py-1.5 text-xs font-bold text-sky-700"
              >
                + 1 Glass
              </button>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-2">
            {features.map((f) => (
              <button
                key={f.title}
                type="button"
                onClick={f.onClick}
                className="rounded-3xl border border-slate-200/70 bg-white p-4 text-left shadow-sm shadow-slate-900/[0.03] transition hover:border-emerald-300 active:scale-[0.99]"
              >
                <span className="text-2xl">{f.icon}</span>
                <span className="mt-2 block text-sm font-bold text-slate-900">{f.title}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{f.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageBody>
  );
}
