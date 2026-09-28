import { useCallback, useEffect, useState } from "react";

export const today = () => new Date().toISOString().slice(0, 10);

/** A tiny localStorage-backed state hook — survives refreshes. */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or blocked — the app still works for this session */
    }
  }, [key, value]);

  const reset = useCallback(() => setValue(initial), [initial]);
  return [value, setValue, reset] as const;
}

export const SCANS_PER_DAY = 10;
export const WATER_GOAL = 8;

export type DayCounter = { day: string; value: number };

export function counterToday(state: DayCounter): number {
  return state.day === today() ? state.value : 0;
}

export function bumpCounter(state: DayCounter, by = 1): DayCounter {
  const t = today();
  return state.day === t
    ? { day: t, value: state.value + by }
    : { day: t, value: by };
}

/** Consecutive days (ending today or yesterday) with at least one scan. */
export function streakFrom(history: { at: number }[]): number {
  if (!history.length) return 0;
  const days = new Set(history.map((h) => new Date(h.at).toISOString().slice(0, 10)));
  const cursor = new Date();
  if (!days.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.toISOString().slice(0, 10))) return 0;
  }
  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function newId(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `id-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}
