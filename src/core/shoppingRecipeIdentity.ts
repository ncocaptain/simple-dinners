import { parseIngredientLine } from "./ingredientParser";

/** Descriptor commas are not the start of a preparation note. */
export function protectShoppingDescriptorCommas(text: string): string {
  return text.replace(
    /\b(boneless|skinless|bone-in|skin-on)\s*,\s*(?=(?:boneless|skinless|bone-in|skin-on)\b)/gi,
    "$1 ",
  );
}

/**
 * Source-backed mozzarella identity before generic prep cleanup erases forms.
 * Quantities, units and packages still belong to the caller's compatibility key.
 * No inference from a cached label or a generic Pantry key is sufficient here.
 */
export function getShoppingMozzarellaIdentity(source: string): string | null {
  if (!/\bmozzarella\b/i.test(source)) return null;
  const name = parseIngredientLine(source).nameText
    .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ").trim();
  // The bilingual Caprese recipe buys balls and slices them during prep.
  const preparedBalls = name.match(/^((?:fresh )?mozzarella (?:balls|pearls)),\s*sliced$/);
  if (preparedBalls) return preparedBalls[1];
  // Retain choices in full, including parenthetical alternatives.
  if (/\b(?:or|o)\b|\//.test(name)) return name;
  const words = name.replace(/[,]/g, " ").replace(/\s+/g, " ")
    .replace(/\s+(?:divided|optional)$/, "").trim();
  if (/^(?:shredded mozzarella(?: cheese)?|mozzarella(?: cheese)? shredded)$/.test(words)) {
    return "shredded mozzarella cheese";
  }
  // Other forms remain explicit; never map fresh/sliced/pearls/blocks to shredded.
  return words;
}

/** The complete product heads from the three evidenced descriptor/comma rows. */
export function getShoppingDescriptorChickenIdentity(source: string): string | null {
  if (!/bone-in.*skin-on.*chicken/i.test(source)) return null;
  const name = parseIngredientLine(source).nameText.trim().toLowerCase();
  const match = name.match(/^bone-in,?\s+skin-on chicken (pieces|thighs)$/);
  return match ? `bone-in skin-on chicken ${match[1]}` : null;
}
