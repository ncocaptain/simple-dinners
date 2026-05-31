const CUSTOM_SIDES_STORAGE_KEY = "simple-dinners:custom-sides:v1";

export type CustomSidesMap = Record<string, string[]>;

function cleanSideName(value: string) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

export function loadCustomSides(): CustomSidesMap {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(CUSTOM_SIDES_STORAGE_KEY) || "{}"
    );

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    return parsed as CustomSidesMap;
  } catch {
    return {};
  }
}

export function saveCustomSides(map: CustomSidesMap) {
  localStorage.setItem(CUSTOM_SIDES_STORAGE_KEY, JSON.stringify(map));
}

export function getCustomSides(recipeKey: string): string[] | null {
  const key = cleanSideName(recipeKey);
  if (!key) return null;

  const map = loadCustomSides();
  const sides = map[key];

  if (!Array.isArray(sides)) return null;

  return sides
    .map(cleanSideName)
    .filter(Boolean);
}

export function setCustomSides(recipeKey: string, sides: string[]) {
  const key = cleanSideName(recipeKey);
  if (!key) return;

  const cleanedSides = Array.from(
    new Set(
      sides
        .map(cleanSideName)
        .filter(Boolean)
    )
  );

  const map = loadCustomSides();

  if (cleanedSides.length === 0) {
    delete map[key];
  } else {
    map[key] = cleanedSides;
  }

  saveCustomSides(map);
}

export function getDisplaySides(
  recipeKey: string,
  defaultSides?: string[]
): string[] {
  const custom = getCustomSides(recipeKey);

  if (custom && custom.length > 0) {
    return custom;
  }

  return Array.isArray(defaultSides)
    ? defaultSides.map(cleanSideName).filter(Boolean)
    : [];
}