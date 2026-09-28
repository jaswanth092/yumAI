import { useCallback, useEffect, useMemo, useState } from "react";
import { HomeScreen } from "./screens/Home";
import { AnalysisScreen, NutritionScreen } from "./screens/Analysis";
import { ChatScreen } from "./screens/Chat";
import { EatNowScreen } from "./screens/EatNow";
import { HistoryScreen, PrivacyScreen } from "./screens/History";
import { LoginScreen, SignupScreen, WelcomeScreen } from "./screens/Onboarding";
import { ProfileScreen, type FontMode } from "./screens/Profile";
import { analyzePhoto, askFood, checkHealth, suggestMeal } from "./lib/api";
import { makeThumb, playYummyChime, preparePhoto } from "./lib/media";
import {
  SCANS_PER_DAY,
  bumpCounter,
  counterToday,
  newId,
  streakFrom,
  today,
  usePersistentState,
} from "./lib/store";
import {
  emptyProfile,
  type Analysis,
  type ChatMessage,
  type Profile,
  type Screen,
} from "./types";

type User = { name: string; email: string };

const NAV: { screen: Screen; icon: string; label: string }[] = [
  { screen: "home", icon: "🏠", label: "Home" },
  { screen: "chat", icon: "💬", label: "AI Chat" },
  { screen: "eatNow", icon: "🍽️", label: "Eat Now" },
  { screen: "history", icon: "📜", label: "History" },
];

/** Desktop / tablet: a proper side rail instead of the phone-style bottom bar. */
function SideNav({
  screen,
  go,
  user,
  streak,
}: {
  screen: Screen;
  go: (screen: Screen) => void;
  user: User | null;
  streak: number;
}) {
  const isActive = (item: Screen) =>
    screen === item ||
    (item === "home" && ["profile", "privacy", "nutrition", "analysis"].includes(screen));

  return (
    <aside className="hidden border-r border-slate-200/70 bg-white/60 px-3 py-5 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-60 lg:shrink-0 lg:flex-col xl:w-64">
      <button
        type="button"
        onClick={() => go("home")}
        className="flex items-center gap-2.5 rounded-2xl px-2 py-1 text-left"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-xl shadow-lg shadow-emerald-500/25">
          🍱
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-black tracking-tight text-slate-900">
            YumAI
          </span>
          <span className="block truncate text-[11px] text-slate-500">Your Food AI</span>
        </span>
      </button>

      <nav className="mt-6 space-y-1">
        {NAV.map((item) => (
          <button
            key={item.screen}
            type="button"
            onClick={() => go(item.screen)}
            aria-current={isActive(item.screen) ? "page" : undefined}
            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition ${
              isActive(item.screen)
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-500 hover:bg-slate-100/70 hover:text-slate-700"
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-2">
        <button
          type="button"
          onClick={() => go("profile")}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-100/70 hover:text-slate-700"
        >
          <span className="text-lg leading-none">⚙️</span>
          Profile & settings
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
          <p className="truncate text-xs font-bold text-slate-700">
            {user?.name || "Student"}
          </p>
          <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
          <p className="mt-1 text-[11px] font-bold text-amber-600">
            🔥 {streak}-day streak
          </p>
        </div>
      </div>
    </aside>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [user, setUser] = usePersistentState<User | null>("yumai.user", null);
  const [profile, setProfile] = usePersistentState<Profile>("yumai.profile", emptyProfile);
  const [history, setHistory] = usePersistentState<Analysis[]>("yumai.history", []);
  const [scans, setScans] = usePersistentState("yumai.scans", { day: "", value: 0 });
  const [water, setWater] = usePersistentState("yumai.water", { day: "", value: 0 });
  const [sound, setSound] = usePersistentState("yumai.sound", true);
  const [font, setFont] = usePersistentState<FontMode>("yumai.font", "default");

  const [pending, setPending] = useState<{ dataUrl: string; name: string } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const [aiReady, setAiReady] = useState<boolean | null>(null);

  /* ---- first load ------------------------------------------------ */
  useEffect(() => {
    let alive = true;
    checkHealth().then((h) => alive && setAiReady(h.keyConfigured === true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (user && profile.name && screen === "welcome") setScreen("home");
    // only on the very first render of a returning user
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = useCallback((next: Screen) => {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* ---- derived --------------------------------------------------- */
  const scansToday = counterToday(scans);
  const waterToday = counterToday(water);
  const streak = useMemo(() => streakFrom(history), [history]);
  const caloriesToday = useMemo(
    () =>
      history
        .filter(
          (h) => new Date(h.at).toISOString().slice(0, 10) === today() && h.identified,
        )
        .reduce((sum, h) => sum + (h.calories || 0), 0),
    [history],
  );

  /* ---- photo + analysis ------------------------------------------ */
  const pickPhoto = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const dataUrl = await preparePhoto(file);
        setPending({ dataUrl, name: file.name || "food photo" });
        setStatus("idle");
        go("home");
      } catch (e) {
        setError(e instanceof Error ? e.message : "That photo could not be used.");
      }
    },
    [go],
  );

  const runAnalysis = useCallback(async () => {
    if (!pending) return;
    if (scansToday >= SCANS_PER_DAY) {
      setError(`You've used all ${SCANS_PER_DAY} scans for today — more tomorrow.`);
      return;
    }
    setError(null);
    setResult(null);
    setStatus("loading");
    go("analysis");
    try {
      const analysed = await analyzePhoto(pending.dataUrl, profile);
      const thumbnail = await makeThumb(pending.dataUrl);
      const entry: Analysis = {
        ...analysed,
        id: newId(),
        at: Date.now(),
        image: thumbnail,
      };
      setResult(entry);
      setStatus("done");
      setHistory((h) => [entry, ...h].slice(0, 60));
      setScans((s) => bumpCounter(s));
      if (sound) playYummyChime();
    } catch (e) {
      setError(e instanceof Error ? e.message : "The analysis failed. Please try again.");
      setStatus("error");
    }
  }, [go, pending, profile, scansToday, setHistory, setScans, sound]);

  const scanAnother = useCallback(() => {
    setPending(null);
    setStatus("idle");
    setError(null);
    go("home");
  }, [go]);

  const sendChat = useCallback(
    async (text: string) => {
      const next: ChatMessage[] = [...chat, { role: "user", text }];
      setChat(next);
      setChatBusy(true);
      setChatError(null);
      try {
        const reply = await askFood(next, profile, result);
        setChat((c) => [...c, { role: "model", text: reply }]);
      } catch (e) {
        setChatError(e instanceof Error ? e.message : "The reply failed. Please try again.");
      } finally {
        setChatBusy(false);
      }
    },
    [chat, profile, result],
  );

  /* ---- shell ----------------------------------------------------- */
  const navVisible = user && ["home", "analysis", "nutrition", "chat", "eatNow", "history"].includes(screen);

  const body = (() => {
    switch (screen) {
      case "welcome":
        return (
          <WelcomeScreen
            aiReady={aiReady}
            onStart={() => go(user ? (profile.name ? "home" : "profile") : "login")}
          />
        );

      case "login":
        return (
          <LoginScreen
            onBack={() => go("welcome")}
            onSignup={() => go("signup")}
            onLogin={(email) => {
              setUser({ name: profile.name || email.split("@")[0], email });
              go(profile.name ? "home" : "profile");
            }}
          />
        );

      case "signup":
        return (
          <SignupScreen
            onBack={() => go("welcome")}
            onLogin={() => go("login")}
            onCreated={(name, email) => {
              setUser({ name, email });
              setProfile((p) => ({ ...p, name }));
              go("profile");
            }}
          />
        );

      case "profile":
        return (
          <ProfileScreen
            profile={profile}
            aiReady={aiReady}
            soundOn={sound}
            onSoundChange={setSound}
            font={font}
            onFontChange={setFont}
            onPrivacy={() => go("privacy")}
            onBack={() => go(user ? "home" : "welcome")}
            onSave={(draft) => {
              const name = draft.name.trim() || profile.name || "friend";
              setProfile({ ...draft, name });
              setUser((u) => (u ? { ...u, name } : u));
              go("home");
            }}
          />
        );

      case "home":
        return (
          <HomeScreen
            profile={profile}
            streak={streak}
            scansUsed={scansToday}
            caloriesToday={caloriesToday}
            water={waterToday}
            pending={pending}
            busy={status === "loading"}
            error={error}
            lastResult={result}
            onPickFile={(file) => void pickPhoto(file)}
            onRemovePhoto={() => {
              setPending(null);
              setError(null);
            }}
            onAnalyze={() => void runAnalysis()}
            onAddWater={() => setWater((w) => bumpCounter(w))}
            go={go}
          />
        );

      case "analysis":
        return (
          <AnalysisScreen
            image={pending?.dataUrl ?? result?.image ?? null}
            status={status === "idle" && result ? "done" : status}
            result={result}
            error={error}
            onBack={() => go("home")}
            onRetry={() => void runAnalysis()}
            onScanAnother={scanAnother}
            onNutrition={() => go("nutrition")}
            onEatNow={() => go("eatNow")}
          />
        );

      case "nutrition":
        return (
          <NutritionScreen
            result={result}
            onBack={() => go("home")}
            onEatNow={() => go("eatNow")}
            onScan={scanAnother}
          />
        );

      case "eatNow":
        return (
          <EatNowScreen
            onBack={() => go("home")}
            lastMeal={result}
            onSuggest={(situation, budget) => suggestMeal(situation, budget, profile, result)}
          />
        );

      case "chat":
        return (
          <ChatScreen
            messages={chat}
            busy={chatBusy}
            error={chatError}
            lastMeal={result}
            onSend={(text) => void sendChat(text)}
            onBack={() => go("home")}
          />
        );

      case "history":
        return (
          <HistoryScreen
            history={history}
            onBack={() => go("home")}
            onScan={scanAnother}
            onDeleteAll={() => {
              setHistory([]);
              setResult(null);
              setStatus("idle");
            }}
            onOpen={(item) => {
              setResult(item);
              setPending(null);
              setStatus("done");
              setError(null);
              go("analysis");
            }}
          />
        );

      case "privacy":
        return <PrivacyScreen onBack={() => go(user ? "home" : "welcome")} />;
    }
  })();

  return (
    <div
      data-font={font}
      className="min-h-dvh bg-gradient-to-br from-emerald-50 via-[#fbfbf9] to-amber-50 text-slate-900"
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-[100rem] bg-[#fbfbf9] shadow-xl shadow-slate-900/5">
        {navVisible && <SideNav screen={screen} go={go} user={user} streak={streak} />}

        <main
          className={`min-w-0 flex-1 ${
            navVisible && screen !== "chat" ? "pb-24 lg:pb-0" : ""
          }`}
        >
          {body}
        </main>
      </div>

      {navVisible && (
        <nav className="fixed bottom-0 left-0 z-30 flex h-[4.25rem] w-full items-center justify-around border-t border-slate-200/80 bg-white/95 px-2 backdrop-blur lg:hidden">
          {NAV.map((item) => {
            const active =
              screen === item.screen ||
              (item.screen === "home" && ["profile", "privacy", "nutrition"].includes(screen));
            return (
              <button
                key={item.screen}
                type="button"
                onClick={() => go(item.screen)}
                aria-current={active ? "page" : undefined}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[10px] font-bold transition ${
                  active ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
