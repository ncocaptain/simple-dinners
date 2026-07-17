import type { Meal } from "./types";

export const COOKBOOK_LS_KEY =
  "simple-dinners:cookbook:v1";

export type CookbookChangeSource =
  | "local"
  | "cloud";

export type CookbookChangedDetail = {
  recipes: Meal[];
  source: CookbookChangeSource;
};

export const COOKBOOK_CHANGED_EVENT =
  "simple-dinners:cookbook-changed";

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [
          key,
          canonicalize(value[key]),
        ]),
    );
  }

  return value;
}

export function cookbookSignature(
  recipes: Meal[],
): string {
  return JSON.stringify(
    canonicalize(recipes),
  );
}

function announceCookbookChange(
  recipes: Meal[],
  source: CookbookChangeSource,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<CookbookChangedDetail>(
      COOKBOOK_CHANGED_EVENT,
      {
        detail: {
          recipes,
          source,
        },
      },
    ),
  );
}

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

export function setCookbook(
  items: Meal[],
  source: CookbookChangeSource = "local",
) {
  const previous = getCookbook();

  const previousSignature =
    cookbookSignature(previous);

  const nextSignature =
    cookbookSignature(items);

  localStorage.setItem(
    COOKBOOK_LS_KEY,
    JSON.stringify(items),
  );

  /*
   * App.tsx persists the cookbook from a larger
   * effect that also watches pantry and plan data.
   * Only announce a real cookbook change.
   */
  if (
    previousSignature === nextSignature
  ) {
    return;
  }

  announceCookbookChange(
    items,
    source,
  );
}

export function replaceCookbookFromCloud(
  items: Meal[],
) {
  setCookbook(items, "cloud");
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