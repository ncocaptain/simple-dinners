import type { Meal } from "./types";

export const COOKBOOK_LS_KEY = "simple-dinners:cookbook:v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function slugify(value: any): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeMultilineField(value: any): string {
  if (Array.isArray(value)) {
    return value
      .map((v) => String(v ?? "").trim())
      .filter(Boolean)
      .join("\n");
  }

  return String(value ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "")
    .replace(/<\/p>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/•/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\n{2,}/g, "\n")
    .replace(/<[^>]+>/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

export function deleteFromCookbook(slug: string) {
  const items = getCookbook();
  const filtered = items.filter((r) => (r.slug ?? r.id) !== slug);
  setCookbook(filtered);
}

export function getCookbook(): Meal[] {
  return safeParse<Meal[]>(localStorage.getItem(COOKBOOK_LS_KEY), []);
}

export function setCookbook(items: Meal[]) {
  localStorage.setItem(COOKBOOK_LS_KEY, JSON.stringify(items));
}

export function addToCookbook(recipe: any) {
  const slug = (
    recipe?.slug ??
    recipe?.id ??
    slugify(recipe?.name) ??
    ""
  ).toString().trim();

  if (!slug) return { ok: false, reason: "missing-slug" as const };

  const items = getCookbook();

  const already = items.some((r) => (r.slug ?? r.id) === slug);
  if (already) return { ok: true, already: true as const };

  const normalized = {
    ...recipe,
    slug,
    id: recipe?.id ?? slug,
    name: String(recipe?.name ?? "").trim(),
    ingredients: normalizeMultilineField(recipe?.ingredients),
    instructions: normalizeMultilineField(recipe?.instructions),
    photoUrl: String(recipe?.photoUrl ?? "").trim(),
    notes: String(recipe?.notes ?? "").trim(),
  };

  setCookbook([...items, normalized]);
  return { ok: true, already: false as const };
}