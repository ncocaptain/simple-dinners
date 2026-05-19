import { en } from "./en";
import { es } from "./es";

export type LanguageCode = "en" | "es";

const STORAGE_KEY = "simple-dinners.language.v1";

const dictionaries = {
  en,
  es,
};

export function getStoredLanguage(): LanguageCode {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved === "es" || saved === "en") {
    return saved;
  }

  return "en";
}

export function saveStoredLanguage(language: LanguageCode) {
  localStorage.setItem(STORAGE_KEY, language);
  window.dispatchEvent(new Event("simple-dinners:language-changed"));
}

export function getLanguageLabel(language: LanguageCode) {
  if (language === "es") return "Español";
  return "English";
}

export function t(path: string, fallback = "") {
  const language = getStoredLanguage();
  const dictionary = dictionaries[language] || dictionaries.en;

  const value = path.split(".").reduce<any>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return current[key];
  }, dictionary);

  if (typeof value === "string") return value;

  const englishValue = path.split(".").reduce<any>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return current[key];
  }, dictionaries.en);

  if (typeof englishValue === "string") return englishValue;

  return fallback || path;
}