// Compare identical catalog occurrences; Spanish unit recovery and process-water
// exclusion are intentional. English boundaries must remain byte-for-byte equal.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createTypeScriptLoader } = require('./lib/load-typescript.cjs');
const { normalizeSpanishIngredientLine } = createTypeScriptLoader()('src/core/ingredientRegistry.ts');
const [beforeFile, afterFile, outputFile] = process.argv.slice(2);
if (!outputFile) throw Error('Usage: node scripts/spanish-grocery-audit-comparison.cjs before.json after.json comparison.json');
const before = JSON.parse(fs.readFileSync(beforeFile,'utf8'));
const after = JSON.parse(fs.readFileSync(afterFile,'utf8'));
assert.equal(after.rows.length,before.rows.length);
const englishChanges=[],amountChanges=[],packageChanges=[],unitCorrections=[],waterExclusions=[],unexpectedInclusions=[],rangeCorrections=[];
for(const [i,r] of after.rows.entries()) {
 const prior=before.rows[i];
 assert.deepEqual([r.recipeIndex,r.locale,r.raw,r.line],[prior.recipeIndex,prior.locale,prior.raw,prior.line],'Source recipe wording/order changed');
 if(r.locale==='en') { if(JSON.stringify(r)!==JSON.stringify(prior)) englishChanges.push({raw:r.raw,recipe:r.recipe,before:prior,after:r}); continue; }
 const context={recipe:r.recipe,raw:r.raw};
 if(r.parsed.quantity!==prior.parsed.quantity) amountChanges.push({...context,boundary:'parser',before:prior.parsed.quantity,after:r.parsed.quantity});
 if(r.parsed.quantityMax!==prior.parsed.quantityMax) rangeCorrections.push({...context,before:prior.parsed.quantityMax,after:r.parsed.quantityMax});
 if(prior.shopping&&!r.shopping) {
  assert.equal(normalizeSpanishIngredientLine(r.raw).processWater,true,'A purchasable Spanish item was dropped: '+r.raw);
  waterExclusions.push(context);
 }
 if(!prior.shopping&&r.shopping) unexpectedInclusions.push(context);
 if(r.shopping&&prior.shopping) {
  if(r.shopping.quantity!==prior.shopping.quantity) amountChanges.push({...context,boundary:'shopping',before:prior.shopping.quantity,after:r.shopping.quantity});
  if(r.shopping.packageSize!==prior.shopping.packageSize) packageChanges.push({...context,before:prior.shopping.packageSize,after:r.shopping.packageSize});
  if(r.shopping.unit!==prior.shopping.unit) {
   assert.equal(prior.shopping.unit,'','Previously understood unit changed: '+r.raw);
   unitCorrections.push({...context,before:prior.shopping.unit,after:r.shopping.unit});
  }
 }
}
for(const r of rangeCorrections) assert.match(r.raw,/\d\s+a\s+\d/,'Unexpected range change: '+r.raw);
const gaps=after.rows.filter(r=>r.locale==='es'&&r.shopping&&r.classifications.some(c=>!['clean exact match','intentionally skipped/non-purchasable'].includes(c)));
const groups=new Map();
for(const r of gaps){const identity=r.canonical?.id||r.shopping.normalizedName;const g=groups.get(identity)||{identity,occurrences:0,examples:[]};g.occurrences++;if(g.examples.length<3)g.examples.push({recipe:r.recipe,raw:r.raw,classifications:r.classifications});groups.set(identity,g);}
const report={before:before.byLocale.es,after:after.byLocale.es,englishChanges,amountChanges,packageChanges,unitCorrections,rangeCorrections,waterExclusions,unexpectedInclusions,registeredCategoryDisagreements:after.rows.filter(r=>r.locale==='es'&&r.canonical&&r.classifications.includes('category mismatch')).length,top20Unresolved:[...groups.values()].sort((a,b)=>b.occurrences-a.occurrences||a.identity.localeCompare(b.identity)).slice(0,20),unresolvedAlternatives:after.rows.filter(r=>r.locale==='es'&&r.shopping&&r.choice.requiresSelection).slice(0,30).map(r=>({recipe:r.recipe,raw:r.raw,name:r.shopping.normalizedName,reason:r.choice.reason}))};
fs.writeFileSync(outputFile,JSON.stringify(report,null,2)+'\n');
assert.equal(englishChanges.length,0,'English behavior changed; see comparison report');
assert.equal(amountChanges.length,0,'Ingredient quantities changed; see comparison report');
assert.equal(packageChanges.length,0,'Package sizes changed; see comparison report');
assert.equal(unexpectedInclusions.length,0,'Previously excluded source item was added');
console.log(`PASS: all ${after.byLocale.en.nonblankLinesChecked} English occurrences unchanged; Spanish amounts/package sizes/source text preserved`);
console.log(`Recovered ${unitCorrections.length} missing units and ${rangeCorrections.length} range upper bounds; excluded ${waterExclusions.length} process-water occurrences`);
