const assert = require('node:assert/strict');
const fs = require('node:fs');
const loadGrouping = require('./lib/load-shopping-page-grouping.cjs');
const { createTypeScriptLoader } = require('./lib/load-typescript.cjs');
const storage = new Map();
global.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
};
const load = createTypeScriptLoader();
const shopping = load('src/shoppingList.ts');
const { ALL_RECIPES } = load('src/core/data.ts');
const { isRecipeSuppliedShoppingIngredient } = load('src/core/shoppingProcessIngredients.ts');
// Pass a clean baseline page: git show 643fa15:src/pages/ShoppingListPage.tsx > /tmp/shopping-page-baseline.tsx
assert.ok(process.argv[2], 'Usage: node scripts/shopping-page-grouping-regression-test.cjs /path/to/643fa15-ShoppingListPage.tsx');
const baselineSource = fs.readFileSync(process.argv[2], 'utf8');
const baseline = loadGrouping(baselineSource);
const group = loadGrouping();
function rawItem(raw, recipe, id = 'test') {
  const preview = shopping.previewRecipeIngredientForShopping(raw);
  if (!preview) return null;
  return { ...preview, id, text: preview.displayText, sourceRecipe: recipe, recipeIngredientText: raw, checked: false, addedAt: 1 };
}
const cases = [
  ['Classic Meatloaf', '2 cloves garlic, minced', 'Garlics', 'Garlic'],
  ['Zuppa Toscana Soup', '5 yellow potatoes, cut into 1-inch pieces', 'Yellow Potatoess', 'Yellow Potatoes'],
  ['Chicken Parmesan Melts', '4 sandwich rolls (hoagie or sub rolls)', 'Sandwich Rollss', 'Sandwich Rolls'],
  ['Pork Street Tacos', '8 small corn or flour tortillas', 'Corn or Flour Tortillass', 'Corn or Flour Tortillas'],
  ['Lamb and Beef Gateway Burgers', '4 brioche burger buns', 'Brioche Burger Bunss', 'Brioche Burger Buns'],
  ['Baked Potato Bar', '6 large russet potatoes', 'Russet Potatoess', 'Russet Potatoes'],
  ['Smash Burger Tacos', '4 street taco-sized flour tortillas', 'Street Taco Sized Flour Tortillass', 'Street Taco Sized Flour Tortillas'],
  ['Summer Pool Day Chicken Caesar Wraps', '6 large flour tortillas', 'Flour Tortillass', 'Flour Tortillas'],
  ['Graduation Party Baked Sandwiches', '12 Hawaiian rolls or slider buns', 'Hawaiian Rolls or Slider Bunss', 'Hawaiian Rolls or Slider Buns'],
];
const evidence = [];
for (const [recipeName, raw, before, after] of cases) {
  const recipe = ALL_RECIPES.find(r => r.name === recipeName);
  assert.ok(recipe?.ingredients.split(/\r?\n/).map(s => s.trim()).includes(raw), `Built-in source: ${recipeName}: ${raw}`);
  const item = rawItem(raw, recipeName);
  const stock = [{ id: 'stock', name: item.normalizedName, quantity: 999, unit: item.unit || null, createdAt: 1 }];
  const snapshot = JSON.stringify([item, stock]);
  const old = baseline([item], stock)[0];
  const current = group([item], stock)[0];
  assert.equal(old.displayText, before);
  assert.equal(current.displayText, after);
  // Everything that drives identity, Pantry, grouping, retailer handoff and UI
  // "Already in Pantry" selection must be identical for presentation fixes.
  const withoutPresentation = ({ displayText, recipeBreakdown, ...row }) => row;
  assert.deepEqual(withoutPresentation(current), withoutPresentation(old));
  assert.equal(JSON.stringify([item, stock]), snapshot, 'Stored/source data is immutable');
  evidence.push({ recipe: recipeName, raw, before, after, pantryKey: current.pantryKey, pantryCoverage: current.pantryCoverage });
}
// Do not singularize quantity-one container phrases or qualified/choice names.
for (const [recipeName, raw, label] of [
  ['Greek Salad', '1 pint cherry tomatoes, halved', 'Pint Cherry Tomatoes'],
  ['Kimchi Brown Rice Bliss Bowls', '2 fried or soft-boiled eggs', 'Fried or Soft Boiled Eggs'],
  ['Crecientes de cheesecake con arándanos', '1 tubo de masa para crescent rolls', 'Tubo de Masa Para Crescent Rolls'],
]) {
  const source = ALL_RECIPES.flatMap(r => [r, r.translations?.es].filter(Boolean)).find(r => r.name === recipeName);
  assert.ok(source.ingredients.split(/\r?\n/).map(s => s.trim()).includes(raw));
  const item = rawItem(raw, recipeName);
  assert.equal(group([item])[0].displayText, label);
  assert.equal(group([item])[0].displayText, baseline([item])[0].displayText);
}

// Verify actual coverage states, including the state used by Already in Pantry.
const garlic = rawItem('2 cloves garlic, minced', 'Classic Meatloaf');
for (const stock of [[], [{id:'g', name:'garlic', unit:null, quantity:9}], [{id:'g', name:'garlic', unit:null, quantity:1}], [{id:'g', name:'garlic', unit:'jar', quantity:9}]]) {
  const old = baseline([garlic], stock)[0];
  const current = group([garlic], stock)[0];
  assert.equal(current.pantryKey, old.pantryKey);
  assert.equal(current.pantryCoverage, old.pantryCoverage);
}
assert.equal(group([garlic], [{id:'g', name:'garlic', unit:null, quantity:9}])[0].pantryCoverage, 'covered');
assert.equal(group([garlic], [{id:'g', name:'garlic', unit:null, quantity:1}])[0].pantryCoverage, 'partial');
assert.equal(group([garlic], [{id:'g', name:'garlic', unit:'jar', quantity:9}])[0].pantryCoverage, 'none');
assert.equal(group([{...garlic, forceBuy:true}], [{id:'g', name:'garlic', quantity:9, unit:null}])[0].pantryCoverage, 'none');
const stock = [{id:'g', name:'garlic', quantity:9, unit:null}];
const covered = group([garlic], stock);
const oldCovered = baseline([garlic], stock);
for (const buyAnyway of [new Set(), new Set([covered[0].id])]) {
  const selections = group.select(covered, buyAnyway);
  const oldSelections = baseline.select(oldCovered, buyAnyway);
  assert.deepEqual(selections.pantryCoveredItems.map(r => r.id), oldSelections.pantryCoveredItems.map(r => r.id));
  assert.deepEqual(selections.grouped.map(s => s.items.map(r => r.id)), oldSelections.grouped.map(s => s.items.map(r => r.id)));
}
assert.equal(group.select(covered).pantryCoveredItems.length, 1);
assert.equal(group.select(covered).grouped.length, 0);
assert.equal(group.select(covered, new Set([covered[0].id])).pantryCoveredItems.length, 0);
assert.equal(group.select(covered, new Set([covered[0].id])).grouped[0].items.length, 1);
assert.equal(group.select(group([{...garlic, checked:true}], stock)).pantryCoveredItems.length, 0);
const restock = {...garlic, id:'restock', sourceRecipe:'', text:'garlic', pantryRestock:true, forceBuy:true};
assert.equal(group.select(group([garlic, restock], stock)).pantryCoveredItems.length, 0);


// Duplicate controls: same identity + same unit/package merge; incompatible
// units, sizes and product forms remain separate even with the same row label.
function pair(a, b) {
  const items = [rawItem(a, 'First', 'a'), rawItem(b, 'Second', 'b')];
  const current = group(items);
  const old = baseline(items);
  const semantic = rows => rows.map(({displayText, recipeBreakdown, ...row}) => row);
  assert.deepEqual(semantic(current), semantic(old));
  return current;
}
assert.equal(pair('2 eggs', '1 egg').length, 1);
assert.equal(pair('2 eggs', '1 egg')[0].quantity, 3);
assert.equal(pair('1 cup chicken broth', '2 cups chicken broth').length, 1);
assert.equal(pair('1 cup chicken broth', '8 oz chicken broth').length, 2);
assert.equal(pair('1 (15 oz) can black beans', '2 (15 oz) cans black beans').length, 1);
assert.equal(pair('1 (15 oz) can black beans', '1 (28 oz) can black beans').length, 2);
assert.equal(pair('1 tomato', '1 (14 oz) can diced tomatoes').length, 2);
assert.equal(pair('1 tsp garlic powder', '2 cloves garlic').length, 2);
assert.equal(pair('1 cup Swiss cheese', '2 slices Swiss cheese').length, 2);

const chicken = ALL_RECIPES.find(r => r.slug === 'big-dolly-inspired-country-fried-crispy-chicken');
assert.match(chicken.instructions, /reserving 1\/4 cup of the oil or flavorful drippings in the skillet/);
for (const [name, ingredients] of [[chicken.name, chicken.ingredients], [chicken.translations.es.name, chicken.translations.es.ingredients]]) {
  const raw = ingredients.split(/\r?\n/).find(line => isRecipeSuppliedShoppingIngredient(name, line));
  assert.ok(raw, 'The exclusion must have a built-in source');
  const legacy = rawItem(raw, name);
  assert.equal(baseline([legacy]).length, 1);
  assert.equal(group([legacy]).length, 0, 'Existing saved rows use the same exclusion');
  storage.clear();
  shopping.addIngredientsToList(name, ingredients);
  const saved = shopping.loadRawShoppingList();
  assert.ok(!saved.some(i => i.recipeIngredientText === raw));
  assert.ok(saved.some(i => /4 cups.*(?:oil|aceite)/.test(i.recipeIngredientText)), 'Purchased frying oil remains');
  assert.equal(group([rawItem(raw, 'Unrelated recipe')]).length, 1, 'No global reserved filter');
}
for (const raw of ['1 cup reserved chicken broth', '1 cup reserved pan juices', '1/2 cup reserved frying oil or chicken drippings']) {
  assert.equal(isRecipeSuppliedShoppingIngredient(chicken.name, raw), false);
  assert.equal(group([rawItem(raw, chicken.name)]).length, 1);
}
// Whole-catalog comparison exercises the real final path, including Spanish.
const catalogChanges = [];
let checked = 0, changedLabels = 0, excludedProcessRows = 0;
for (const recipe of ALL_RECIPES) for (const version of [recipe, recipe.translations?.es].filter(Boolean)) {
  for (const raw of shopping.normalizeIngredientLines(version.ingredients || '')) {
    const item = rawItem(raw, version.name);
    if (!item) continue;
    const old = baseline([item]); const current = group([item]); checked++;
    if (isRecipeSuppliedShoppingIngredient(version.name, raw)) {
      assert.equal(current.length, 0); excludedProcessRows++; continue;
    }
    assert.equal(current.length, old.length, raw);
    if (!current.length) continue;
    assert.deepEqual(current.map(({displayText, recipeBreakdown, ...r}) => r), old.map(({displayText, recipeBreakdown, ...r}) => r), raw);
    if (current[0].displayText !== old[0].displayText) {
      changedLabels++;
      catalogChanges.push({ recipe: version.name, slug: recipe.slug || recipe.id, raw, before: old[0].displayText, after: current[0].displayText, pantryKey: current[0].pantryKey });
    }
  }
}
console.log(JSON.stringify({ baseline: '643fa15', evidence, catalog: { checked, changedLabels, excludedProcessRows }, catalogChanges }, null, 2));
console.log('PASS: Real page grouping/display; immutable identities; Pantry parity; duplicate unit/package/form controls; narrow process exclusion.');
