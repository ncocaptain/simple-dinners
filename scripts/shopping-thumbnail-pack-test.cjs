// Real local assets and exact production lookup; no network or browser mocks.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const sharp = require('sharp');
const { createTypeScriptLoader } = require('./lib/load-typescript.cjs');
const load = createTypeScriptLoader();
const thumbs = load('src/plus/smartShoppingThumbnails.ts');
const { normalizeIngredientIdentity } = load('src/core/ingredientParser.ts');
const { ALL_RECIPES } = load('src/core/data.ts');
const { previewRecipeIngredientForShopping } = load('src/shoppingList.ts');
const cases = [
  ['taco seasoning', 'taco-seasoning'],
  ['tomato sauce', 'tomato-sauce'],
  ['tomato paste', 'tomato-paste'],
  ['ranch dressing', 'ranch-dressing'],
  ['balsamic glaze', 'balsamic-glaze'],
  ['buttermilk', 'buttermilk'],
  ['crushed tomatoes', 'crushed-tomatoes'],
  ['naan', 'naan'],
  ['caesar dressing', 'caesar-dressing'],
  ['cherry pie filling', 'cherry-pie-filling'],
  ['chili seasoning', 'chili-seasoning'],
  ['green cabbage', 'green-cabbage'],
  ['green chiles', 'green-chiles'],
  ['maple syrup', 'maple-syrup'],
  ['old bay seasoning', 'old-bay-seasoning'],
  ['pizza sauce', 'pizza-sauce'],
  ['pulled pork', 'pulled-pork'],
  ['diced tomatoes with green chiles', 'tomatoes-with-green-chiles'],
  ['beef stew meat', 'beef-stew-meat'],
  ['beef tallow', 'beef-tallow'],
];
function lookup(name) { return thumbs.resolveSmartShoppingThumbnail(name, 'Pantry'); }
(async () => {
  for (const [name, key] of cases) {
    const match = lookup(name);
    assert.equal(match.thumbnailKey, key, name);
    assert.equal(match.matchType, 'exact', name);
    assert.equal(thumbs.hasLocalSmartShoppingThumbnail(key), true, key);
    const src = thumbs.getLocalSmartShoppingThumbnailSrc(key);
    assert.equal(src, `/shopping-thumbnails/${key}.webp`);
    const bytes = fs.readFileSync('public' + src);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    const metadata = await sharp(bytes).metadata();
    assert.equal(metadata.format, 'webp');
    assert.ok(metadata.width > 0 && metadata.height > 0);
    await sharp(bytes).raw().toBuffer();
    // Each covered product must occur through the actual built-in Shopping path.
    assert.ok(ALL_RECIPES.some(recipe => recipe.ingredients.split(/\r?\n/).some(line => {
      const item = previewRecipeIngredientForShopping(line);
      return item && thumbs.resolveSmartShoppingThumbnail(item.normalizedName, item.category, { unit: item.unit }).thumbnailKey === key;
    })), `No built-in evidence for ${key}`);
  }
  for (const [name, key] of [
    ['Rotel', 'tomatoes-with-green-chiles'],
    ['ro-tel', 'tomatoes-with-green-chiles'],
    ['tomatoes with green chiles', 'tomatoes-with-green-chiles'],
    ['canned crushed tomatoes', 'crushed-tomatoes'],
    ['diced green chiles', 'green-chiles'],
    ['naan flatbreads', 'naan'],
    ['taco-seasoning', 'taco-seasoning'],
  ]) assert.equal(lookup(name).thumbnailKey, key, name);

  assert.equal(lookup('fresh tomatoes').thumbnailKey, 'tomato');
  assert.equal(lookup('cherry tomatoes').thumbnailKey, 'tomato');
  assert.equal(lookup('diced tomatoes').thumbnailKey, 'diced-tomatoes');
  assert.equal(lookup('canned tomatoes').matchType, 'category', 'Do not infer a crushed/diced form');
  assert.equal(lookup('lemon').thumbnailKey, 'lemon');
  assert.equal(lookup('lemon juice').matchType, 'category');
  assert.notEqual(normalizeIngredientIdentity('paprika'), normalizeIngredientIdentity('smoked paprika'));
  assert.equal(lookup('Hidden Valley Ranch Dressing').thumbnailKey, 'hidden-valley-ranch');
  assert.equal(lookup('ranch dressing').thumbnailKey, 'ranch-dressing');
  for (const name of [
    'unknown brand ranch dressing', 'unknown taco seasoning blend',
    'tomato sauce or tomato paste', 'green chiles or jalapenos',
    'generic seafood seasoning', 'lemon juice', 'fresh crushed tomatoes', 'unknown keepsake',
  ]) {
    const match = lookup(name);
    assert.equal(match.matchType, 'category', name);
    assert.equal(thumbs.hasLocalSmartShoppingThumbnail(match.thumbnailKey), false, name);
  }
  console.log('PASS: all 20 WebPs exist, decode, resolve exactly and have built-in evidence; aliases/forms/brands/fallbacks remain conservative');
})().catch(error => { console.error(error); process.exitCode = 1; });
