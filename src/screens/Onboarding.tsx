import { useState } from "react";
import { Card, Field, PrimaryButton, inputClass } from "../components/ui";

export function WelcomeScreen({
  onStart,
  aiReady,
}: {
  onStart: () => void;
  aiReady: boolean | null;
}) {
  const highlights = [
    { icon: "📸", title: "Visual food scan", text: "Photo in, real dish and macros out" },
    { icon: "⚡", title: "Instant macros", text: "Calories, protein, carbs, fat, fiber, sugar, sodium" },
    { icon: "🥗", title: "Fix my plate", text: "What to add or drop next time" },
    { icon: "🎓", title: "Student hacks", text: "Canteen, tiffin and ₹-budget meals" },
  ];

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-md flex-col items-center justify-center gap-10 px-6 py-10 text-center sm:max-w-2xl lg:min-h-dvh lg:max-w-5xl lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-12 lg:text-left">
      <div className="flex flex-col items-center lg:max-w-lg lg:items-start">
        <div className="mb-4 flex gap-2 text-2xl" aria-hidden="true">
          {["🍎", "🥗", "🍚", "🥑"].map((emoji, i) => (
            <span
              key={emoji}
              className="animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: "1.8s" }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold tracking-wide text-emerald-700 uppercase">
          ✨ Next-gen food intelligence
        </span>

        <div className="mt-6 text-6xl lg:text-7xl">🍱</div>

        <h1 className="mt-3 bg-gradient-to-br from-emerald-600 to-teal-500 bg-clip-text text-4xl font-black tracking-tight text-transparent lg:text-5xl">
          YumAI
        </h1>
        <p className="mt-1 text-sm font-bold text-slate-700">Your Personal Food AI</p>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500 lg:max-w-md lg:text-base">
          Understand your food. Improve your plate. Fuel your student and active life with
          precision AI nutrition.
        </p>

        <div className="mt-8 w-full max-w-xs">
          <PrimaryButton onClick={onStart}>Get Started →</PrimaryButton>
          <p className="mt-3 text-[11px] font-medium text-slate-400">
            {aiReady === null
              ? "Connecting to the AI…"
              : aiReady
                ? "✓ Food AI connected"
                : "⚠ AI key not set up yet"}
          </p>
        </div>
      </div>

      {/* phones: compact pills · desktop: the fuller feature panel */}
      <div className="mt-6 flex flex-wrap justify-center gap-2 lg:hidden">
        {[
          "📸 Visual Food Scan",
          "⚡ Instant Macros",
          "🥗 Fix My Plate",
          "🎓 Student Hacks",
        ].map((f) => (
          <span
            key={f}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"
          >
            {f}
          </span>
        ))}
      </div>

      <div className="hidden w-full max-w-md lg:block">
        <Card className="space-y-4 p-6">
          <p className="text-sm font-extrabold text-slate-900">What's inside</p>
          <ul className="space-y-3">
            {highlights.map((h) => (
              <li key={h.title} className="flex gap-3">
                <span className="text-xl">{h.icon}</span>
                <span>
                  <span className="block text-sm font-bold text-slate-900">{h.title}</span>
                  <span className="block text-xs text-slate-500">{h.text}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-400">
            Estimates for general guidance — not medical advice.
          </p>
        </Card>
      </div>
    </div>
  );
}

export function LoginScreen({
  onBack,
  onLogin,
  onSignup,
}: {
  onBack: () => void;
  onLogin: (email: string) => void;
  onSignup: () => void;
}) {
  const [email, setEmail] = useState("student@yumai.app");
  const [password, setPassword] = useState("yumai123");

  return (
    <div className="flex min-h-[calc(100dvh-2rem)] items-center justify-center px-5 py-10 lg:min-h-dvh">
      <Card className="w-full max-w-md sm:max-w-lg">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="mb-2 text-slate-400 transition hover:text-slate-600"
        >
          ←
        </button>
        <div className="text-4xl">🍱</div>
        <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">
          Welcome to YumAI 👋
        </h2>
        <p className="mt-1 text-sm text-slate-500">Your food. Your health. Your AI.</p>

        <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2">
          <span className="text-[11px] font-semibold text-amber-800">
            💡 Quick demo login
          </span>
          <button
            type="button"
            onClick={() => {
              setEmail("student@yumai.app");
              setPassword("yumai123");
            }}
            className="rounded-lg bg-amber-200/80 px-2.5 py-1 text-[11px] font-bold text-amber-900"
          >
            Auto-fill
          </button>
        </div>

        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) onLogin(email.trim());
          }}
        >
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email"
              className={inputClass}
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              aria-label="Password"
              className={inputClass}
            />
          </Field>

          <PrimaryButton type="submit" disabled={!email.trim()}>
            Login →
          </PrimaryButton>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSignup}
            className="font-bold text-emerald-600 underline-offset-2 hover:underline"
          >
            Sign Up
          </button>
        </p>
      </Card>
    </div>
  );
}

export function SignupScreen({
  onBack,
  onCreated,
  onLogin,
}: {
  onBack: () => void;
  onCreated: (name: string, email: string) => void;
  onLogin: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex min-h-[calc(100dvh-2rem)] items-center justify-center px-5 py-10 lg:min-h-dvh">
      <Card className="w-full max-w-md sm:max-w-lg">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="mb-2 text-slate-400 transition hover:text-slate-600"
        >
          ←
        </button>
        <div className="text-4xl">🍱</div>
        <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">
          Create your account ✨
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Let's get your YumAI companion set up.
        </p>

        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || !email.trim()) {
              setError("A name and an email are needed.");
              return;
            }
            if (password.length < 4) {
              setError("Pick a password with at least 4 characters.");
              return;
            }
            onCreated(name.trim(), email.trim());
          }}
        >
          <Field label="Full name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arjun Sharma"
              aria-label="Full name"
              className={inputClass}
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. arjun@university.edu"
              aria-label="Email"
              className={inputClass}
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              aria-label="Password"
              className={inputClass}
            />
          </Field>

          {error && (
            <p role="alert" className="text-xs font-semibold text-rose-600">
              {error}
            </p>
          )}

          <PrimaryButton type="submit">Create Account ✨</PrimaryButton>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onLogin}
            className="font-bold text-emerald-600 underline-offset-2 hover:underline"
          >
            Login
          </button>
        </p>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">
          This demo keeps your account, profile and scans in this browser only.
        </p>
      </Card>
    </div>
  );
}
