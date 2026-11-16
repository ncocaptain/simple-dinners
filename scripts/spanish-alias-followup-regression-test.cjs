const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createTypeScriptLoader } = require('./lib/load-typescript.cjs');
const load = createTypeScriptLoader();
const registry = load('src/core/ingredientRegistry.ts');
const language = load('src/core/spanishIngredients.ts');
const parser = load('src/core/ingredientParser.ts');
const shopping = load('src/shoppingList.ts');
const pantry = load('src/core/pantryUsage.ts');
const { matchRecipeToPantry } = load('src/core/pantryRecipeMatch.ts');
const { categorizePantryItem } = load('src/core/pantryCategory.ts');
const { resolveGroceryChoice } = load('src/core/groceryChoiceResolver.ts');
const thumbs = load('src/plus/smartShoppingThumbnails.ts');
const { ALL_RECIPES } = load('src/core/data.ts');
const cases = require('./fixtures/spanish-alias-followup.json');

for (const c of cases) {
  const source = ALL_RECIPES[c.recipeIndex].translations.es.ingredients.split(/\r?\n/)[c.line - 1].trim();
  assert.equal(source, c.raw, 'Evidence must remain a real built-in recipe occurrence');
  assert.equal(language.spanishGroceryName(c.alias), c.englishName, c.alias);
  assert.equal(registry.findCanonicalIngredient(c.alias)?.id, c.canonicalId, c.alias);
  const parsed = parser.parseIngredientLine(c.raw);
  const englishParsed = parser.parseIngredientLine(c.englishRaw);
  const item = shopping.previewRecipeIngredientForShopping(c.raw);
  const englishItem = shopping.previewRecipeIngredientForShopping(c.englishRaw);
  assert.equal(parsed.raw, c.raw);
  assert.ok(item, c.raw);
  assert.equal(registry.findCanonicalIngredient(item.normalizedName)?.id, c.canonicalId, c.raw);
  assert.equal(item.normalizedName, englishItem.normalizedName, c.raw);
  assert.equal(item.category, englishItem.category, c.raw);
  assert.deepEqual(
    [parsed.quantity, parsed.quantityMax, parsed.unit, parsed.packageSize, parsed.normalizedName],
    [englishParsed.quantity, englishParsed.quantityMax, englishParsed.unit, englishParsed.packageSize, englishParsed.normalizedName], c.raw
  );
  const canonical = registry.findCanonicalIngredient(c.englishName);
  assert.equal(item.category, canonical.category, c.raw);
  const stock = { id: 'test', name: canonical.canonicalName, quantity: 8, unit: item.unit || null, createdAt: 1 };
  assert.equal(categorizePantryItem(stock.name, stock.unit), canonical.category, c.raw);
  assert.equal(categorizePantryItem(c.alias, stock.unit), canonical.category, c.alias);
  assert.equal(pantry.getPantryComparableName(c.alias, stock.unit), pantry.getPantryComparableName(stock.name, stock.unit), c.alias);
  assert.equal(pantry.getPantryComparableIngredientName(c.raw), pantry.getPantryComparableName(stock.name, stock.unit), c.raw);
  assert.equal(pantry.buildPantryUsageSuggestions([c.raw], [stock]).length, 1, c.raw);
  assert.equal(matchRecipeToPantry({ name: 'Evidence', ingredients: c.raw }, [stock]).matchedCount, 1, c.raw);
  const image = thumbs.resolveSmartShoppingThumbnail(item.normalizedName, item.category, { unit: item.unit, ingredientText: c.raw });
  const englishImage = thumbs.resolveSmartShoppingThumbnail(englishItem.normalizedName, englishItem.category, { unit: englishItem.unit, ingredientText: c.englishRaw });
  assert.deepEqual(image, englishImage, c.raw);
  assert.equal(image.thumbnailKey, c.thumbnailKey, c.raw);
  assert.ok(thumbs.hasLocalSmartShoppingThumbnail(image.thumbnailKey), c.raw);
  assert.ok(fs.existsSync('public' + thumbs.getLocalSmartShoppingThumbnailSrc(image.thumbnailKey)), c.raw);
}

// Added vocabulary must not flatten alternatives, subtypes, brands or forms.
for (const raw of ['1/4 cup de aderezo ranch o italiano', '1 cup de pan molido o galletas saladas trituradas']) {
  const item = shopping.previewRecipeIngredientForShopping(raw);
  assert.ok(item);
  assert.equal(resolveGroceryChoice({ recipeIngredientText: raw, normalizedName: item.normalizedName }).requiresSelection, true);
  assert.equal(registry.findCanonicalIngredient(item.normalizedName), null);
  assert.equal(thumbs.resolveSmartShoppingThumbnail(item.normalizedName, item.category, { ingredientText: raw }).matchType, 'category');
  for (const name of ['Ranch Dressing', 'Breadcrumbs', 'Panko Breadcrumbs']) {
    assert.equal(pantry.buildPantryUsageSuggestions([raw], [{ id: name, name, unit: 'cup', quantity: 8, createdAt: 1 }]).length, 0);
  }
}
for (const name of ['limón', 'jugo de limón', 'jugo de limón fresco', 'jugo de lima', 'gajos de limón', 'gajos de lima', 'crema', 'queso', 'queso rallado', 'pollo cocido deshebrado', 'brocoli', 'aderezo ranch southwest', 'chispas de chocolate sin lácteos', 'chispas de chocolate semidulce', 'Hidden Valley aderezo ranch']) {
  // No new single canonical ID for these previously unresolved/subtyped forms.
  if (name !== 'jugo de lima') assert.equal(registry.findCanonicalIngredient(name), null, name);
}
assert.notEqual(registry.findCanonicalIngredient('pechugas de pollo deshuesadas y sin piel').id, registry.findCanonicalIngredient('muslos de pollo deshuesados y sin piel').id);
assert.notEqual(registry.findCanonicalIngredient('pan molido').id, registry.findCanonicalIngredient('pan molido panko').id);
for (const raw of ['1 taza de agua', '1/2 cup de agua reservada de la pasta']) assert.equal(shopping.previewRecipeIngredientForShopping(raw), null);
assert.ok(shopping.previewRecipeIngredientForShopping('2 oz de agua mineral con gas'));
console.log(`PASS: ${cases.length} evidenced Spanish aliases reuse canonical Pantry/categories/local thumbnails and English identities; ambiguity/forms preserved`);
