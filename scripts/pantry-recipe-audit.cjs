// Read-only full built-in catalog audit. Inventory fixtures are synthetic, never
// household data. Multiple findings per occurrence are retained, not sampled.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createTypeScriptLoader } = require('./lib/load-typescript.cjs');
const sourceRoot = path.resolve(process.env.AUDIT_SOURCE_ROOT || process.cwd());
const sourceLoad = createTypeScriptLoader();
const load = file => sourceLoad(path.join(sourceRoot, file));
const { ALL_RECIPES } = load('src/core/data.ts');
const parser = load('src/core/ingredientParser.ts');
const { previewRecipeIngredientForShopping: preview } = load('src/shoppingList.ts');
const { findCanonicalIngredient } = load('src/core/ingredientRegistry.ts');
const { categorizePantryItem } = load('src/core/pantryCategory.ts');
const { getPantryComparableName, buildPantryUsageSuggestions } = load('src/core/pantryUsage.ts');
const { matchRecipeToPantry } = load('src/core/pantryRecipeMatch.ts');
const { classifyPantryUnitMatch } = load('src/core/pantryShoppingCompatibility.ts');
const { resolveGroceryChoice } = load('src/core/groceryChoiceResolver.ts');
const thumbs = load('src/plus/smartShoppingThumbnails.ts');
const { getLocalizedMeal } = load('src/core/localizedMeal.ts');
const variants = ALL_RECIPES.flatMap((recipe, recipeIndex) => [
  { recipe, recipeIndex, locale: 'en' },
  ...(recipe.translations?.es?.ingredients ? [{ recipe: getLocalizedMeal(recipe, 'es'), recipeIndex, locale: 'es' }] : []),
]);
const rows = [];
for (const { recipeIndex, recipe, locale } of variants) {
  const rawLines = String(recipe.ingredients || '').replace(/<br\s*\/?>/gi, '\n').split(/\r?\n/);
  for (const [lineIndex, rawLine] of rawLines.entries()) {
    const raw = rawLine.trim();
    if (!raw) continue;
    const parsed = parser.parseIngredientLine(raw);
    const item = parsed.sectionHeader ? null : preview(raw);
    const row = { recipeIndex, locale, recipeId: recipe.id || recipe.slug || null, recipe: recipe.name, line: lineIndex + 1, raw, parsed, shopping: item, classifications: [], reasons: [] };
    const flag = (type, reason) => { row.classifications.push(type); row.reasons.push({ type, reason }); };
    if (!item) {
      flag('intentionally skipped/non-purchasable', parsed.sectionHeader ? 'Ingredient section heading' : 'Excluded by production Shopping List preview (e.g. water or preparation ice)');
      rows.push(row);
      continue;
    }
    const canonical = findCanonicalIngredient(item.normalizedName);
    row.canonical = canonical ? { id: canonical.id, name: canonical.canonicalName, category: canonical.category } : null;
    if (!canonical) flag('canonical identity missing', 'No exact registry entry for Shopping List normalized identity');
    const choice = resolveGroceryChoice({ normalizedName: item.normalizedName, recipeIngredientText: raw, grocerySearchName: item.grocerySearchName });
    row.choice = choice;
    const requiresReview = choice.status !== 'ready' || (locale === 'es' && /\bo\b/i.test(raw));
    if (requiresReview) flag('ambiguous identity', choice.reason || (choice.status === 'ready' ? 'Spanish alternative is not recognized by the production choice resolver' : choice.status));
    // Model the normal canonical inventory item, with its existing package/unit
    // metadata. Fallback uses the actual Shopping identity when registry is absent.
    const fixture = { id: 'audit-inventory', name: canonical?.canonicalName || item.normalizedName, unit: canonical?.defaultUnit || item.unit || null, quantity: 100, createdAt: 1 };
    const pantryKey = getPantryComparableName(fixture.name, fixture.unit);
    const category = categorizePantryItem(fixture.name, fixture.unit);
    const keyMatched = pantryKey === parsed.normalizedName;
    const usage = buildPantryUsageSuggestions([raw], [fixture]);
    const recipeMatch = matchRecipeToPantry({ ...recipe, ingredients: raw }, [fixture]);
    const unitMatch = classifyPantryUnitMatch(parsed.unit, fixture.unit, !parsed.unit && parsed.quantity !== null);
    row.pantry = { fixture, key: pantryKey, ingredientKey: parsed.normalizedName, keyMatched, recipeMatched: recipeMatch.matchedCount > 0, usageMatched: usage.length > 0, canDeduct: usage[0]?.canDeduct || false, unitMatch, category };
    if (!keyMatched && !requiresReview && !parsed.optional) flag('Pantry mismatch', 'Canonical/Shopping inventory identity does not match the recipe parser key');
    if (category !== item.category || (canonical && canonical.category !== item.category)) flag('category mismatch', `Pantry ${category}; Shopping ${item.category}; registry ${canonical?.category || '(missing)'}`);
    if (!item.grocerySearchName || /\b(?:to taste|as needed|optional|divided|for serving)\b/i.test(item.grocerySearchName) || /^\d/.test(item.grocerySearchName)) flag('bad grocery search name', 'Search name is missing or contains quantity/instructional wording');
    const thumbnail = thumbs.resolveSmartShoppingThumbnail(item.normalizedName, item.category, { unit: item.unit });
    const src = thumbs.getLocalSmartShoppingThumbnailSrc(thumbnail.thumbnailKey);
    const local = thumbs.hasLocalSmartShoppingThumbnail(thumbnail.thumbnailKey) && fs.existsSync(path.join(sourceRoot, 'public', src));
    // Coverage deliberately excludes generic category placeholders and optional
    // garnish-only wording. Those still retain the existing UI fallback.
    const localizedNonShopping = /^(?:(?:tazas?|quart|cups?) )?(?:de )?(?:agua|hielo)\b/.test(item.normalizedName) || item.normalizedName === 'aceite en aerosol';
    if (localizedNonShopping && item.normalizedName !== 'aceite en aerosol') flag('other anomaly', 'Localized water/ice is retained by the production Shopping preview');
    const eligible = !localizedNonShopping && !/\b(?:water|cooking spray|nonstick spray)\b/i.test(item.normalizedName) && !(/\boptional\b/i.test(raw) && /\b(?:garnish|topping|for serving)\b/i.test(raw)) && !requiresReview;
    row.thumbnail = { ...thumbnail, src, local, eligible, covered: eligible && local && thumbnail.matchType !== 'category' };
    if (eligible && !row.thumbnail.covered) flag('thumbnail missing', local ? 'Only category fallback available' : 'No registered local WebP asset');
    if (/^packs?\s/.test(item.normalizedName) && !parsed.unit) flag('package/form mismatch', 'Packaging word was not recognized as a unit');
    if (unitMatch === 'incompatible') flag('package/form mismatch', 'Canonical inventory packaging conflicts with recipe unit');
    if ((/\b(?:can|cans|canned)\b/i.test(raw) && /\b(?:corn|tomatoes?)\b/i.test(raw)) && ['corn', 'tomato'].includes(thumbnail.thumbnailKey) && !requiresReview) flag('package/form mismatch', 'Canned ingredient resolves to a fresh-product thumbnail');
    if (!parsed.normalizedName) flag('other anomaly', 'Purchasable Shopping item has no recipe parser identity');
    if (!row.classifications.length) flag('clean exact match', 'All audited boundaries agree; local product thumbnail exists or ingredient is excluded from thumbnail expansion');
    rows.push(row);
  }
}
const shopping = rows.filter(r => r.shopping);
const pct = (n, d) => d ? Number((n * 100 / d).toFixed(2)) : 0;
function rank(filter) {
  const groups = new Map();
  for (const row of shopping.filter(filter)) {
    const identity = row.canonical?.id || row.shopping.normalizedName;
    if (!groups.has(identity)) groups.set(identity, { identity, occurrences: 0, recipes: new Set(), examples: [] });
    const group = groups.get(identity);
    group.occurrences++;
    group.recipes.add(row.recipeIndex);
    if (group.examples.length < 4) group.examples.push({ recipe: row.recipe, locale: row.locale, raw: row.raw, shoppingName: row.shopping.normalizedName, classifications: row.classifications });
  }
  return [...groups.values()].map(g => ({ ...g, recipes: g.recipes.size })).sort((a,b) => b.occurrences-a.occurrences || a.identity.localeCompare(b.identity));
}
function summarize(selected) {
  const shopping = selected.filter(r => r.shopping);
  const eligible = shopping.filter(r => r.thumbnail.eligible);
  const names = new Set(shopping.map(r => r.canonical?.id || r.shopping.normalizedName));
  const eligibleNames = new Set(eligible.map(r => r.canonical?.id || r.shopping.normalizedName));
  const coveredNames = new Set(eligible.filter(r=>r.thumbnail.covered).map(r => r.canonical?.id || r.shopping.normalizedName));
  const eligibleCanonical = new Set(eligible.filter(r=>r.canonical).map(r=>r.canonical.id));
  const coveredCanonical = new Set(eligible.filter(r=>r.canonical && r.thumbnail.covered).map(r=>r.canonical.id));
  const counts = {};
  for (const row of selected) for (const type of row.classifications) counts[type] = (counts[type] || 0) + 1;
  const unambiguous = shopping.filter(r => !r.classifications.includes('ambiguous identity') && !r.parsed.optional);
  const pantryMatched = unambiguous.filter(r => r.pantry.keyMatched && r.pantry.recipeMatched && r.pantry.usageMatched && r.pantry.unitMatch !== 'incompatible');
  return {
    recipesChecked: new Set(selected.map(r=>r.recipeIndex)).size,
    recipeVariantsChecked: new Set(selected.map(r=>`${r.recipeIndex}:${r.locale}`)).size, nonblankLinesChecked: selected.length,
    ingredientLinesChecked: selected.filter(r=>!r.parsed.sectionHeader).length,
    sectionHeadings: selected.filter(r=>r.parsed.sectionHeader).length,
    shoppingOccurrences: shopping.length,
    intentionallySkipped: selected.filter(r=>r.classifications.includes('intentionally skipped/non-purchasable')).length,
    canonicalOccurrences: shopping.filter(r=>r.canonical).length,
    canonicalCoveragePercent: pct(shopping.filter(r=>r.canonical).length, shopping.length),
    distinctIdentities: names.size,
    registeredDistinctIdentities: new Set(shopping.filter(r=>r.canonical).map(r=>r.canonical.id)).size,
    pantryMatchEligible: unambiguous.length, pantryMatches: pantryMatched.length,
    pantryMatchCoveragePercent: pct(pantryMatched.length, unambiguous.length),
    categoryMismatches: counts['category mismatch'] || 0, ambiguousLines: counts['ambiguous identity'] || 0,
    thumbnailEligibleOccurrences: eligible.length, thumbnailCoveredOccurrences: eligible.filter(r=>r.thumbnail.covered).length,
    thumbnailOccurrenceCoveragePercent: pct(eligible.filter(r=>r.thumbnail.covered).length, eligible.length),
    thumbnailEligibleIdentities: eligibleNames.size, thumbnailCoveredIdentities: coveredNames.size,
    thumbnailIdentityCoveragePercent: pct(coveredNames.size, eligibleNames.size),
    thumbnailEligibleCanonicalIdentities: eligibleCanonical.size, thumbnailCoveredCanonicalIdentities: coveredCanonical.size,
    thumbnailCanonicalIdentityCoveragePercent: pct(coveredCanonical.size, eligibleCanonical.size), classifications: counts,
  };
}
const report = {
  schemaVersion: 1,
  sourceChanges: execFileSync("git", ["-C", sourceRoot, "diff", "--name-only"], { encoding:"utf8" }).trim().split("\n").filter(Boolean),
  sourceCommit: execFileSync('git', ['-C', sourceRoot, 'rev-parse','HEAD'], { encoding:'utf8' }).trim(),
  methodology: {
    dataset: 'ALL_RECIPES, including seasonal, sides, desserts, Little Chefs; base and every available Spanish ingredient variant via getLocalizedMeal. Section headings retained separately.',
    pantryCoverage: 'Synthetic canonical/default-unit inventory (Shopping identity fallback when missing); all three matching paths plus unit compatibility. This is interoperability coverage, NOT coverage of a real household inventory. Ambiguous and optional lines excluded from denominator (recommendations intentionally omit optional ingredients).',
    thumbnails: 'Actual Shopping normalized name -> existing resolver -> registered existing local WebP; generic category fallback is not product coverage. Identity coverage includes unresolved normalized identities; canonical-only coverage is also reported separately. Excludes water, cooking spray (including recognized Spanish forms), optional garnish-only lines and unresolved choices. Spanish o alternatives are explicitly flagged for review even when the production resolver misses them.',
    categories: 'Registry/Pantry vs actual Shopping preview; disagreements are review findings, not proof that either category is wrong.',
    classifications: 'Multi-label; clean exact match is assigned only when no anomaly is found. No live services or storage used.'
  },
  summary: summarize(rows),
  byLocale: Object.fromEntries(['en','es'].map(locale=>[locale,summarize(rows.filter(r=>r.locale===locale))])),
  missingThumbnailsRanked: rank(r=>r.thumbnail.eligible && !r.thumbnail.covered),
  unresolvedIdentitiesRanked: rank(r=>r.classifications.some(c=>!['clean exact match','intentionally skipped/non-purchasable'].includes(c))),
  rows,
};
const output = path.resolve(process.argv[2] || 'work/pantry-recipe-audit/report.json');
fs.mkdirSync(path.dirname(output), { recursive:true });
fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.summary, null, 2));
console.log(`Report: ${output}`);
