import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import loader from "./lib/load-typescript.cjs";

const load = loader.createTypeScriptLoader();
const { isIngredientSectionHeader } = load("src/core/ingredientParser.ts");
assert.equal(typeof isIngredientSectionHeader, "function");

for (const value of [
  "1 can (21 oz) ready-to-eat apple pie filling",
  "ready-to-eat apple pie filling",
  "1 packet taco seasoning",
  "taco seasoning",
  "2 Tbsp lemon glaze",
  "salad dressing",
  "vanilla pudding filling",
  "1 cup whipped cream",
]) {
  assert.equal(isIngredientSectionHeader(value), false, `Must keep ingredient: ${value}`);
}

for (const value of [
  "Filling:",
  "Seasoning:",
  "Glaze:",
  "Dressing:",
  "Topping:",
  "Marinade:",
]) {
  assert.equal(isIngredientSectionHeader(value), true, `Must skip heading: ${value}`);
}

// Guard against the same bug reappearing in ShoppingListPage, which
// previously implemented its own overly broad section-heading patterns.
const shoppingPage = readFileSync("src/pages/ShoppingListPage.tsx", "utf8");
assert.match(
  shoppingPage,
  /import\s*\{\s*isIngredientSectionHeader\s*\}\s*from\s*["']\.\.\/core\/ingredientParser["']/,
);
assert.match(shoppingPage, /if\s*\(isIngredientSectionHeader\(text\)\)\s*return\s*""/);
assert.doesNotMatch(shoppingPage, /SECTION_HEADER_PATTERNS/);

console.log("Shopping ingredient heading regression checks passed.");
