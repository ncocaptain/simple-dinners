import type { Meal } from "./types";


export const COOKBOOK_LS_KEY = "simple-dinners:cookbook:v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function deleteFromCookbook(slug: string) {
  const items = getCookbook();
  const filtered = items.filter((r) => (r.slug ?? r.id) !== slug);
  setCookbook(filtered);
}

export function getCookbook(): (Meal & any)[] {
  return safeParse<(Meal & any)[]>(localStorage.getItem(COOKBOOK_LS_KEY), []);
}

export function setCookbook(items: (Meal & any)[]) {
  localStorage.setItem(COOKBOOK_LS_KEY, JSON.stringify(items));
}

export function addToCookbook(recipe: any) {
  const slug = (recipe?.slug ?? recipe?.id ?? "").toString().trim();
  if (!slug) return { ok: false, reason: "missing-slug" as const };

  const items = getCookbook();

  const already = items.some((r) => (r.slug ?? r.id) === slug);
  if (already) return { ok: true, already: true as const };

  const normalized = {
    ...recipe,
    slug,
    id: recipe?.id ?? slug,
    // optional metadata:
    // addedAt: Date.now(),
  };

  setCookbook([...items, normalized]);
  return { ok: true, already: false as const };
}