export type CookHistoryEntry = {
  timesCooked: number;
  lastCookedAt?: string;
};

export type CookHistoryMap = Record<string, CookHistoryEntry>;

const STORAGE_KEY = "simpledinners:cook-history";

function safeParse(value: string | null): CookHistoryMap {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getCookHistory(): CookHistoryMap {
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

export function saveCookHistory(history: CookHistoryMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getCookHistoryFor(slug?: string): CookHistoryEntry {
  if (!slug) return { timesCooked: 0 };
  const history = getCookHistory();
  return history[slug] ?? { timesCooked: 0 };
}

export function recordCook(slug?: string) {
  if (!slug) return;

  const history = getCookHistory();
  const current = history[slug] ?? { timesCooked: 0 };

  history[slug] = {
    timesCooked: current.timesCooked + 1,
    lastCookedAt: new Date().toISOString(),
  };

  saveCookHistory(history);
}