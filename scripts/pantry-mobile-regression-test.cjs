const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const cache = new Map();
let saved;
const supabase = {
  auth: { getUser: async () => ({ data: { user: { id: 'test-user' } } }) },
  from(table) {
    assert.equal(table, 'pantry_snapshots');
    return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { household_id: saved.household_id, items: saved.items, updated_at: saved.updated_at } }) }) }), upsert(payload, options) {
      saved = payload;
      assert.deepEqual(options, { onConflict: 'household_id' });
      return { select: () => ({ single: async () => ({ data: { updated_at: payload.updated_at } }) }) };
    }};
  },
};
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const mod = { exports: {} };
  cache.set(file, mod);
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;
  new Function('module', 'exports', 'require', output)(mod, mod.exports, name => {
    if (name === '../lib/supabase') return { supabase };
    if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
    return require(name);
  });
  return mod.exports;
}
const { categorizePantryItem: category } = load('src/core/pantryCategory.ts');
for (const name of ['canned corn', 'Fire Roasted Diced Tomatoes', 'Italian Style Diced Tomatoes', 'canned diced tomatoes', 'Extra Wide Egg Noodles', 'Fritos']) {
  assert.equal(category(name), 'Pantry', name);
}
assert.equal(category('Corn', 'can'), 'Pantry');
for (const name of ['fresh tomatoes', 'cherry tomatoes', 'green onion', 'kiwi', 'corn on the cob']) assert.equal(category(name), 'Produce', name);
for (const name of ['Hand Warmers', 'Colace', 'My custom thing']) assert.equal(category(name), 'Other', name);
const store = load('src/core/pantryStore.ts');
const presentation = load('src/core/pantryPresentation.ts');
const base = { id: 'custom-id', name: 'Corn', createdAt: 123, updatedAt: 456 };
const counted = { ...base, quantity: 1 };
const packaged = { ...base, quantity: 8, unit: 'can', packageSize: '15 oz', isLow: true, isStaple: false, expiresAt: 789 };
const label = item => presentation.formatPantryQuantity(item, 'In stock', 'Staple • In stock');
assert.equal(label(counted), '1');
assert.equal(`${label(packaged)} • ${packaged.packageSize}`, '8 cans • 15 oz');
assert.equal(label(base), 'In stock');
assert.equal(label({ ...packaged, isStaple: true }), 'Staple • In stock');
assert.equal(label({ ...base, quantity: 0.25, unit: 'cup' }), '0.25 cup');
for (const item of [counted, packaged]) assert.equal(presentation.canDecreasePantryQuantity(item), true);
for (const item of [base, { ...base, quantity: 0 }]) assert.equal(presentation.canDecreasePantryQuantity(item), false);
const fresh = load('src/core/pantryFreshness.ts');
const now = fresh.parsePantryDateInput('2026-11-15');
for (const [date, status] of [[null, 'none'], ['2026-11-14', 'past-date'], ['2026-11-15', 'use-soon'], ['2026-11-18', 'use-soon'], ['2026-11-19', 'fresh']]) {
  assert.equal(fresh.getPantryFreshness(date && fresh.parsePantryDateInput(date), now).status, status);
}
const page = fs.readFileSync('src/pages/PlanPage.tsx', 'utf8');
assert.match(page, /paddingBottom: "calc\(160px \+ env\(safe-area-inset-bottom, 0px\)\)"/);
assert.match(page, /boxSizing: "border-box"/);
assert.match(page, /disabled=\{\s*!canDecrease\s*\}/);
assert.match(page, /canDecreasePantryQuantity\(item\)/);
const memory = new Map();
global.localStorage = { getItem: key => memory.get(key), setItem: (key, value) => memory.set(key, value) };
(async () => {
  const normalized = store.writePantryItems([base, packaged]);
  assert.equal('quantity' in normalized[0], false, 'legacy quantities must not be invented');
  assert.deepEqual(normalized[1], { ...packaged, category: 'Pantry' });
  assert.deepEqual(store.loadPantryItems(), normalized);
  const sync = load('src/cloud/pantrySync.ts');
  assert.equal((await sync.saveCloudPantry('test-household', normalized)).error, null);
  assert.deepEqual(saved.items, normalized, 'cloud and local serialization must agree');
  const loaded = await sync.loadCloudPantry('test-household');
  assert.equal(loaded.error, null);
  assert.deepEqual(loaded.data.items, normalized, 'cloud reads preserve legacy and package inventory');
  const events = [];
  global.window = { dispatchEvent: event => events.push(event.detail) };
  store.savePantryItems([{ ...packaged, quantity: 7 }]);
  assert.equal(events.at(-1).source, 'local');
  store.replacePantryFromCloud(loaded.data.items);
  assert.equal(events.at(-1).source, 'cloud');
  assert.deepEqual(store.loadPantryItems(), normalized);
  assert.deepEqual(Object.keys(saved).sort(), ['household_id', 'items', 'updated_at', 'updated_by']);
  assert.equal(store.pantrySignature(saved.items), store.pantrySignature(normalized));
  console.log('PASS: Pantry categories, quantities, decrement, freshness, mobile guards, local/cloud serialization');
})().catch(error => { console.error(error); process.exitCode = 1; });
