export type TakeoutCategory = { label: string; query: string; emoji: string };

export const TAKEOUT_LS_KEY = "simple-dinners:takeout-categories:v1";

export const DEFAULT_TAKEOUT_CATEGORIES: TakeoutCategory[] = [
  { emoji: "🍟", label: "Fast Food", query: "fast food" },
  { emoji: "🌮", label: "Mexican", query: "mexican restaurant" },
  { emoji: "🍝", label: "Italian", query: "italian restaurant" },
  { emoji: "🍕", label: "Pizza", query: "pizza" },
  { emoji: "🥡", label: "Chinese", query: "chinese restaurant" },
  { emoji: "🍣", label: "Sushi", query: "sushi restaurant" },
];

export function loadTakeoutCategories(): TakeoutCategory[] {
  try {
    const raw = localStorage.getItem(TAKEOUT_LS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_TAKEOUT_CATEGORIES;
  } catch {
    return DEFAULT_TAKEOUT_CATEGORIES;
  }
}

export function saveTakeoutCategories(cats: TakeoutCategory[]) {
  try {
    localStorage.setItem(TAKEOUT_LS_KEY, JSON.stringify(cats));
  } catch {
    // ignore
  }
}