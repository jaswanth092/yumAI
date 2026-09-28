import { useState } from "react";
import { Card, PageBody, PrimaryButton, ScreenHeader, SecondaryButton } from "../components/ui";
import type { Analysis } from "../types";

const when = (at: number) =>
  new Date(at).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export function HistoryScreen({
  history,
  onOpen,
  onDeleteAll,
  onBack,
  onScan,
}: {
  history: Analysis[];
  onOpen: (analysis: Analysis) => void;
  onDeleteAll: () => void;
  onBack: () => void;
  onScan: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div>
      <ScreenHeader
        title="Food History 📜"
        subtitle={`${history.length} ${history.length === 1 ? "meal" : "meals"} analysed`}
        onBack={onBack}
      />

      <PageBody className="space-y-3">
        {history.length === 0 ? (
          <Card className="space-y-3 text-center">
            <div className="text-5xl">🍽️</div>
            <h2 className="text-base font-extrabold text-slate-900">No food history yet</h2>
            <p className="text-sm text-slate-500">
              Your analyzed meals will appear here.
            </p>
            <div className="mx-auto w-full max-w-xs">
              <PrimaryButton onClick={onScan}>📸 Scan your first meal</PrimaryButton>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid gap-3 lg:grid-cols-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onOpen(item)}
                  className="flex w-full items-center gap-3 rounded-3xl border border-slate-200/70 bg-white p-3 text-left shadow-sm shadow-slate-900/[0.03] transition hover:border-emerald-300"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.foodName}
                      className="size-16 shrink-0 rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-slate-100 text-2xl">
                      🍽️
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-slate-900">
                      {item.foodName}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {item.calories} kcal · {item.protein}g protein · {item.carbs}g carbs
                    </span>
                    <span className="mt-0.5 block text-[11px] text-slate-400">
                      {when(item.at)} · score {item.healthScore}/100
                    </span>
                  </span>
                  <span className="shrink-0 text-slate-300">›</span>
                </button>
              ))}
            </div>

            <div className="pt-1 lg:max-w-sm">
              {confirming ? (
                <div className="space-y-2">
                  <p className="text-center text-xs font-semibold text-rose-600">
                    Delete all {history.length} scans? This cannot be undone.
                  </p>
                  <PrimaryButton
                    onClick={() => {
                      onDeleteAll();
                      setConfirming(false);
                    }}
                    className="from-rose-500 to-rose-400 shadow-rose-500/20"
                  >
                    Yes, delete everything
                  </PrimaryButton>
                  <SecondaryButton onClick={() => setConfirming(false)}>Cancel</SecondaryButton>
                </div>
              ) : (
                <SecondaryButton onClick={() => setConfirming(true)} className="text-rose-600">
                  🗑️ Delete all history
                </SecondaryButton>
              )}
            </div>
          </>
        )}
      </PageBody>
    </div>
  );
}

export function PrivacyScreen({ onBack }: { onBack: () => void }) {
  const cards = [
    {
      icon: "🛡️",
      title: "What is stored, and where",
      text: "Your profile, water count and food history stay in this browser (local storage). Clearing your browser data removes them.",
    },
    {
      icon: "🔑",
      title: "Your AI key is server-side",
      text: "Food photos and questions are analysed through YumAI's own server, which holds the AI key. The key is never sent to your browser.",
    },
    {
      icon: "📸",
      title: "Food photos",
      text: "A photo is sent for analysis, then only a small thumbnail is kept in your history on this device. Avoid uploading private images.",
    },
    {
      icon: "🗑️",
      title: "Your control",
      text: "Delete your food history any time from the History screen, and edit your profile whenever you like.",
    },
  ];

  return (
    <div>
      <ScreenHeader title="Privacy 🔒" subtitle="Your data, your control" onBack={onBack} />

      <PageBody className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((c) => (
            <Card key={c.title} className="flex gap-3">
              <span className="text-2xl">{c.icon}</span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{c.text}</p>
              </div>
            </Card>
          ))}
        </div>

        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[11px] leading-relaxed font-medium text-amber-800">
          ⚠️ YumAI gives estimates for general guidance only. It is not a medical device and
          not a substitute for advice from a doctor or dietitian.
        </p>
      </PageBody>
    </div>
  );
}
