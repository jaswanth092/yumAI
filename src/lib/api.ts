import type { Analysis, AnalysisResult, ChatMessage, EatResult, Profile } from "../types";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => null)) as
    | (T & { error?: string })
    | null;
  if (!res.ok) {
    throw new Error(data?.error || `Something went wrong (${res.status}).`);
  }
  if (!data) throw new Error("The server sent back something we could not read.");
  return data;
}

export function checkHealth(): Promise<{ model?: string; keyConfigured?: boolean }> {
  return fetch("/api/health")
    .then((r) => r.json())
    .catch(() => ({ keyConfigured: false }));
}

export async function analyzePhoto(
  image: string,
  profile: Profile,
): Promise<AnalysisResult> {
  const data = await post<{ result: AnalysisResult }>("/api/analyze", { image, profile });
  return data.result;
}

export async function askFood(
  messages: ChatMessage[],
  profile: Profile,
  lastMeal: Analysis | null,
): Promise<string> {
  const data = await post<{ reply: string }>("/api/chat", { messages, profile, lastMeal });
  return data.reply;
}

export async function suggestMeal(
  situation: string,
  budget: number,
  profile: Profile,
  lastMeal: Analysis | null,
): Promise<EatResult> {
  const data = await post<{ result: EatResult }>("/api/eat-now", {
    situation,
    budget,
    profile,
    lastMeal,
  });
  return data.result;
}
