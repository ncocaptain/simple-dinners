// This alias-only pass must not change source text, quantities, units, sizes,
// inclusion or any English audit result. Run after the existing bilingual audit.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createTypeScriptLoader } = require('./lib/load-typescript.cjs');
const { normalizeSpanishIngredientLine } = createTypeScriptLoader()('src/core/ingredientRegistry.ts');
const cases = require('./fixtures/spanish-alias-followup.json');
const [beforePath, afterPath, outputPath] = process.argv.slice(2);
if (!outputPath) throw Error('Usage: node scripts/spanish-alias-followup-audit-comparison.cjs before.json after.json comparison.json');
const before = JSON.parse(fs.readFileSync(beforePath, 'utf8'));
const after = JSON.parse(fs.readFileSync(afterPath, 'utf8'));
assert.equal(after.rows.length, before.rows.length, 'Catalog size changed');
const counts = new Map(cases.map(c => [c.englishName, { alias: c.alias, canonicalId: c.canonicalId, canonicalOccurrencesFixed: 0, newlyCoveredThumbnails: 0, fullyResolvedOccurrences: 0, examples: [] }]));
const isUnresolved = r => Boolean(r.shopping && r.classifications.some(c => c !== 'clean exact match'));
const numbers = r => ({ parsed: [r.parsed.quantity, r.parsed.quantityMax, r.parsed.unit, r.parsed.packageSize], shopping: r.shopping && [r.shopping.quantity, r.shopping.unit, r.shopping.packageSize] });
let englishRows = 0;
for (const [i, row] of after.rows.entries()) {
  const prior = before.rows[i];
  const context = `${row.recipe}: ${row.raw}`;
  assert.deepEqual([row.locale, row.recipeIndex, row.line, row.raw], [prior.locale, prior.recipeIndex, prior.line, prior.raw], context);
  assert.deepEqual(numbers(row), numbers(prior), 'Quantity/unit/package/inclusion changed: ' + context);
  if (row.locale === 'en') {
    assert.deepEqual(row, prior, 'English behavior changed: ' + context);
    englishRows++;
    continue;
  }
  if (prior.choice?.requiresSelection) assert.equal(row.choice?.requiresSelection, true, 'Alternative collapsed: ' + context);
  if (!prior.canonical && row.canonical) {
    const target = normalizeSpanishIngredientLine(row.raw).productName;
    const group = counts.get(target);
    assert.ok(group, 'Unexpected canonical gain outside the alias scope: ' + context);
    assert.equal(row.canonical.id, group.canonicalId, context);
    group.canonicalOccurrencesFixed++;
    if (!prior.thumbnail?.covered && row.thumbnail?.covered) group.newlyCoveredThumbnails++;
    if (isUnresolved(prior) && !isUnresolved(row)) group.fullyResolvedOccurrences++;
    if (group.examples.length < 2) group.examples.push({ recipe: row.recipe, raw: row.raw });
  }
  if (prior.canonical) assert.equal(row.canonical?.id, prior.canonical.id, 'Existing canonical identity changed: ' + context);
}
const metrics = report => ({ ...report.byLocale.es, unresolvedOccurrences: report.rows.filter(r => r.locale === 'es' && isUnresolved(r)).length });
const groups = new Map();
for (const row of after.rows.filter(r => r.locale === 'es' && isUnresolved(r))) {
  const identity = row.canonical?.id || row.shopping.normalizedName;
  const group = groups.get(identity) || { identity, occurrences: 0, examples: [] };
  group.occurrences++;
  if (group.examples.length < 2) group.examples.push({ recipe: row.recipe, raw: row.raw, classifications: row.classifications });
  groups.set(identity, group);
}
const aliases = [...counts.values()];
assert.ok(aliases.every(c => c.canonicalOccurrencesFixed > 0), 'Every alias must fix a built-in occurrence');
const result = { baseCommit: before.sourceCommit, before: metrics(before), after: metrics(after), englishRowsUnchanged: englishRows, sourceTextChanges: 0, quantityUnitPackageChanges: 0, shoppingInclusionChanges: 0, aliases, canonicalOccurrencesFixed: aliases.reduce((n, c) => n + c.canonicalOccurrencesFixed, 0), top20Unresolved: [...groups.values()].sort((a, b) => b.occurrences - a.occurrences || a.identity.localeCompare(b.identity)).slice(0, 20) };
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + '\n');
console.log(`PASS: ${englishRows} English rows identical; source text/quantities/units/package sizes/inclusion unchanged; ${result.canonicalOccurrencesFixed} canonical occurrences fixed`);
