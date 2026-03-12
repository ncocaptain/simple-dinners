const STORAGE_KEY = "simpledinners:favorites";

export type FavoritesMap = Record<string, true>;

function safeParse(value: string | null): FavoritesMap {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function getFavorites(): FavoritesMap {
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

export function saveFavorites(favorites: FavoritesMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function isFavorite(slug?: string): boolean {
  if (!slug) return false;
  const favorites = getFavorites();
  return !!favorites[slug];
}

export function toggleFavorite(slug?: string): boolean {
  if (!slug) return false;

  const favorites = getFavorites();

  if (favorites[slug]) {
    delete favorites[slug];
    saveFavorites(favorites);
    return false;
  }

  favorites[slug] = true;
  saveFavorites(favorites);
  return true;
}