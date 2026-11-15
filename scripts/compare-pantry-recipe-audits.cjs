const assert = require('node:assert/strict');
const fs = require('node:fs');
const [beforePath, afterPath, outputPath] = process.argv.slice(2);
if (!beforePath || !afterPath || !outputPath) throw Error('Usage: node scripts/compare-pantry-recipe-audits.cjs before.json after.json comparison.json');
const before = JSON.parse(fs.readFileSync(beforePath,'utf8'));
const after = JSON.parse(fs.readFileSync(afterPath,'utf8'));
assert.equal(after.rows.length,before.rows.length,'Catalog occurrence count changed');
const numericChanges = [], newlyCovered = [], safeFallbacks = [], imageCorrections = [];
for (const [i,row] of after.rows.entries()) {
  const prior = before.rows[i];
  assert.deepEqual([row.recipeIndex,row.locale,row.line,row.raw],[prior.recipeIndex,prior.locale,prior.line,prior.raw],'Built-in content/order changed');
  const amount = r => ({ parsed: [r.parsed.quantity,r.parsed.quantityMax,r.parsed.unit,r.parsed.packageSize], shopping: r.shopping && [r.shopping.quantity,r.shopping.unit,r.shopping.packageSize] });
  if (JSON.stringify(amount(row)) !== JSON.stringify(amount(prior))) numericChanges.push({recipe:row.recipe,locale:row.locale,raw:row.raw,before:amount(prior),after:amount(row)});
  const context = { recipe:row.recipe,locale:row.locale,raw:row.raw,identity:row.canonical?.id||row.shopping?.normalizedName };
  if (row.thumbnail?.covered && !prior.thumbnail?.covered) newlyCovered.push(context);
  if (!row.thumbnail?.covered && prior.thumbnail?.covered) safeFallbacks.push(context);
  if (row.thumbnail?.covered && prior.thumbnail?.covered && row.thumbnail.thumbnailKey !== prior.thumbnail.thumbnailKey) imageCorrections.push({...context,before:prior.thumbnail.thumbnailKey,after:row.thumbnail.thumbnailKey});
}
const top = (rows, locale) => {
 const counts = new Map();
 for(const r of rows.filter(r=>!locale||r.locale===locale)) counts.set(r.identity,(counts.get(r.identity)||0)+1);
 return [...counts].sort((a,b)=>b[1]-a[1]).map(([identity,occurrences])=>({identity,occurrences}));
};
const gaps = after.missingThumbnailsRanked.filter(g=>g.examples.some(e=>e.locale==='en'));
const assetsNeeded = gaps.filter(g=>g.examples.some(e=>e.locale==='en'&&!/\b(?:or|choice|toppings|garnish|sprigs?|spray)\b/.test(e.shoppingName))).slice(0,20).map(g=>({
 proposedAsset: 'public/shopping-thumbnails/'+g.identity.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'.webp',
 identity:g.identity, occurrences:g.occurrences, examples:g.examples,
}));
const report = { before:before.summary,after:after.summary,byLocale:{before:before.byLocale,after:after.byLocale},
 numericalInventoryChanges:numericChanges, newlyCovered, safeFallbacks, imageCorrections,
 thumbnailChangeCounts:{newlyCovered:newlyCovered.length,safeFallbacks:safeFallbacks.length,imageCorrections:imageCorrections.length},
 top20UnresolvedEnglish:top(after.rows.filter(r=>r.shopping&&r.classifications.some(c=>!['clean exact match','intentionally skipped/non-purchasable'].includes(c))).map(r=>({locale:r.locale,identity:r.canonical?.id||r.shopping.normalizedName})),'en').slice(0,20),
 top20UnresolvedSpanish:top(after.rows.filter(r=>r.shopping&&r.classifications.some(c=>!['clean exact match','intentionally skipped/non-purchasable'].includes(c))).map(r=>({locale:r.locale,identity:r.canonical?.id||r.shopping.normalizedName})),'es').slice(0,20),
 requiredNewAssets:assetsNeeded,
};
fs.writeFileSync(outputPath,JSON.stringify(report,null,2)+'\n');
assert.equal(numericChanges.length,0,'Recipe/Shopping quantity, unit, package or inclusion changed; inspect comparison report');
console.log('PASS: all catalog variants retain recipe text, quantities, units, package sizes, ranges, and Shopping inclusion');
console.log(JSON.stringify(report.thumbnailChangeCounts));
