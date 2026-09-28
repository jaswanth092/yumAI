import { useState } from "react";
import { Card, Field, PageBody, PrimaryButton, SecondaryButton, ScreenHeader, inputClass } from "../components/ui";
import type { Profile } from "../types";

export type FontMode = "default" | "bold" | "soft" | "italic";

export function ProfileScreen({
  profile,
  onSave,
  onBack,
  onPrivacy,
  soundOn,
  onSoundChange,
  font,
  onFontChange,
  aiReady,
}: {
  profile: Profile;
  onSave: (profile: Profile) => void;
  onBack: () => void;
  onPrivacy: () => void;
  soundOn: boolean;
  onSoundChange: (on: boolean) => void;
  font: FontMode;
  onFontChange: (font: FontMode) => void;
  aiReady: boolean | null;
}) {
  const [draft, setDraft] = useState<Profile>(profile);
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const fonts: { key: FontMode; label: string; sample: string }[] = [
    { key: "default", label: "Classic", sample: "Aa" },
    { key: "bold", label: "Bold", sample: "Aa" },
    { key: "soft", label: "Soft", sample: "Aa" },
    { key: "italic", label: "Italic", sample: "Aa" },
  ];

  return (
    <div>
      <ScreenHeader
        title="Let's personalize YumAI"
        subtitle="Tell us about your routine"
        onBack={onBack}
      />

      <PageBody>
        <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-6">
          <Card className="space-y-3.5 lg:p-6">
            <Field label="Your name">
              <input
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Your name"
                aria-label="Your name"
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Age">
                <input
                  type="number"
                  value={draft.age}
                  onChange={(e) => set("age", e.target.value)}
                  placeholder="21"
                  aria-label="Age"
                  className={inputClass}
                />
              </Field>
              <Field label="Weight (kg)">
                <input
                  type="number"
                  value={draft.weight}
                  onChange={(e) => set("weight", e.target.value)}
                  placeholder="68"
                  aria-label="Weight in kilograms"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Height (cm)">
              <input
                type="number"
                value={draft.height}
                onChange={(e) => set("height", e.target.value)}
                placeholder="174"
                aria-label="Height in centimetres"
                className={inputClass}
              />
            </Field>

            <Field label="Activity level">
              <select
                value={draft.activity}
                onChange={(e) => set("activity", e.target.value as Profile["activity"])}
                aria-label="Activity level"
                className={inputClass}
              >
                <option value="">Select activity level</option>
                <option value="low">🪑 Low (mostly sitting / studying)</option>
                <option value="moderate">🚶 Moderate (walking / campus labs)</option>
                <option value="high">🏃 High (sports / gym routine)</option>
              </select>
            </Field>

            <Field label="Food preference">
              <select
                value={draft.foodPreference}
                onChange={(e) =>
                  set("foodPreference", e.target.value as Profile["foodPreference"])
                }
                aria-label="Food preference"
                className={inputClass}
              >
                <option value="">Select preference</option>
                <option value="vegetarian">🥗 Vegetarian</option>
                <option value="non-vegetarian">🍗 Non-vegetarian</option>
                <option value="vegan">🌱 Vegan</option>
                <option value="eggetarian">🥚 Eggetarian</option>
              </select>
            </Field>

            <Field label="Health goals or dietary notes" hint="optional">
              <textarea
                value={draft.healthInfo}
                onChange={(e) => set("healthInfo", e.target.value)}
                rows={3}
                placeholder="e.g. need more protein, avoiding excess oil in the hostel mess…"
                aria-label="Health goals or dietary notes"
                className={`${inputClass} resize-none`}
              />
            </Field>
          </Card>

          <div className="space-y-4">
            <Card className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-900">🔊 Yummy sound</p>
                <p className="text-xs text-slate-500">Chime when a scan finishes</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={soundOn}
                aria-label="Yummy sound"
                onClick={() => onSoundChange(!soundOn)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                  soundOn ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 size-5 rounded-full bg-white shadow transition-all ${
                    soundOn ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </Card>

            <Card>
              <h2 className="text-sm font-bold text-slate-900">✨ Font Design</h2>
              <p className="text-xs text-slate-500">Choose how your app looks</p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {fonts.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => onFontChange(f.key)}
                    aria-pressed={font === f.key}
                    className={`rounded-2xl border px-2 py-3 text-center transition ${
                      font === f.key
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <span
                      className={`block text-lg leading-none ${
                        f.key === "bold"
                          ? "font-black"
                          : f.key === "soft"
                            ? "font-medium"
                            : f.key === "italic"
                              ? "italic"
                              : ""
                      }`}
                    >
                      {f.sample}
                    </span>
                    <span className="mt-1 block text-[10px] font-semibold">{f.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            <div className="space-y-3">
              <PrimaryButton onClick={() => onSave(draft)}>
                Save Profile & Continue →
              </PrimaryButton>

              <SecondaryButton onClick={onPrivacy}>
                🔒 Privacy Policy & Data Control
              </SecondaryButton>
            </div>

            <p className="text-center text-[11px] text-slate-400 lg:text-left">
              {aiReady === null
                ? "Checking the AI connection…"
                : aiReady
                  ? "✓ AI connected — your key stays on the server"
                  : "⚠ No AI key configured"}
            </p>
          </div>
        </div>
      </PageBody>
    </div>
  );
}
