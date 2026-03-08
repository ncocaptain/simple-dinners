export type DinnerStreakState = {
  lastCookedDay: string | null;
  currentStreak: number;
  bestStreak: number;
};

const LS_KEY = "simple-dinners:dinner-streak:v1";

const DEFAULT_STREAK_STATE: DinnerStreakState = {
  lastCookedDay: null,
  currentStreak: 0,
  bestStreak: 0,
};

function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

export function getDinnerStreak(): DinnerStreakState {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_STREAK_STATE;

    const parsed = JSON.parse(raw) as Partial<DinnerStreakState>;

    return {
      lastCookedDay:
        typeof parsed.lastCookedDay === "string" ? parsed.lastCookedDay : null,
      currentStreak:
        typeof parsed.currentStreak === "number" ? parsed.currentStreak : 0,
      bestStreak:
        typeof parsed.bestStreak === "number" ? parsed.bestStreak : 0,
    };
  } catch {
    return DEFAULT_STREAK_STATE;
  }
}

export function recordDinnerStreak(date: Date = new Date()): DinnerStreakState {
  const state = getDinnerStreak();
  const today = todayKey(date);
  const yesterday = todayKey(addDays(date, -1));

  if (state.lastCookedDay === today) {
    return state;
  }

  const currentStreak =
    state.lastCookedDay === yesterday ? state.currentStreak + 1 : 1;

  const next: DinnerStreakState = {
    lastCookedDay: today,
    currentStreak,
    bestStreak: Math.max(currentStreak, state.bestStreak),
  };

  localStorage.setItem(LS_KEY, JSON.stringify(next));
  return next;
}