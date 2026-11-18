// Read-only diagnostic: execute the actual ShoppingListPage callbacks against
// disposable fresh storage and authentic pre-PR49 generator output.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createTypeScriptLoader}=require('./lib/load-typescript.cjs');
const loadGrouping=require('./lib/load-shopping-page-grouping.cjs');
const oldRoot=process.argv[2];
const output=process.argv[3];
assert.ok(oldRoot&&output,'Usage: node scripts/shopping-tlc-diagnostic.cjs /path/to/643fa15-checkout /path/to/report.json');
const storage=new Map();
global.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const load=createTypeScriptLoader(), oldLoad=createTypeScriptLoader();
const shopping=load('src/shoppingList.ts');
const oldShopping=oldLoad(path.join(oldRoot,'src/shoppingList.ts'));
const {ALL_RECIPES,days}=load('src/core/data.ts');
const registry=load('src/core/ingredientRegistry.ts');
const products=load('src/core/groceryProductIdentity.ts');
const {generatePlan}=load('src/core/planner.ts');
const {isRecipeSuppliedShoppingIngredient}=load('src/core/shoppingProcessIngredients.ts');
const source=fs.readFileSync('src/pages/ShoppingListPage.tsx','utf8');
const marker='const key = `recipe::${category}::${normalizedName}::${groupedUnit || ""}::${packageKey}`;';
assert.ok(source.includes(marker));
// Instrument a temporary in-memory copy, not production code or a duplicate algorithm.
const instrumented=source.replace(marker,marker+`\n globalThis.__shoppingTlcTrace.push({id:item.id,recipeName,recipeIngredientText,preservedRecipeIngredientText,savedName,cleanedRaw,parsed:{...parsed},shouldRefreshFromRecipeText,cleanedName,preNormalizedName,safeName,normalizedName,parsedUnit,parsedQuantity,packageSize,mergeUnit,groupedUnit,groupedPackageSize,category,key});`);
const group=loadGrouping(instrumented), plainGroup=loadGrouping();
function traced(items,pantry=[]){
  const trace=[];global.__shoppingTlcTrace=trace;
  const snapshot=JSON.stringify(items),persistedSnapshot=storage.get('simple-dinners.shoppingList.v1');const rows=group(items,pantry);
  assert.equal(storage.get('simple-dinners.shoppingList.v1'),persistedSnapshot,'Page refresh does not migrate raw storage');
  assert.equal(JSON.stringify(items),snapshot,'Grouping cannot rewrite persisted inputs');
  assert.deepEqual(rows,plainGroup(items,pantry),'Instrumentation must preserve real results');
  delete global.__shoppingTlcTrace;
  return {rows,trace};
}
function generate(generator,name,ingredients){storage.set('simple-dinners.shoppingList.v1','[]');generator.addIngredientsToList(name,ingredients);return generator.loadRawShoppingList();}
function enrich(item,run,original){
  const row=run.rows.find(r=>r.sourceIds.includes(item.id));
  const step=run.trace.find(t=>t.id===item.id);
  return {originalIngredient:original??item.recipeIngredientText,preview:shopping.previewRecipeIngredientForShopping(item.recipeIngredientText||item.text),stored:item,preservedRecipeIngredientText:item.recipeIngredientText||null,page:step||null,canonical:step?registry.findCanonicalIngredient(step.normalizedName)||null:null,product:step?products.getGroceryProductIdentity(step.normalizedName):null,mergeKey:row?.id||null,pantryKey:row?.pantryKey||null,finalLabel:row?.displayText||null,coverage:row?.pantryCoverage||null};
}
const catalog=[], legacy=[], duplicates=[],processControls=[];
let freshCount=0,legacyCount=0,refreshDifferences=0;
for(const recipe of ALL_RECIPES)for(const [language,version]of [['en',recipe],['es',recipe.translations?.es]]){
  if(!version?.ingredients)continue;
  const fresh=generate(shopping,version.name,version.ingredients);
  const old=generate(oldShopping,version.name,version.ingredients);
  const current=traced(fresh), migrated=traced(old);
  freshCount+=fresh.length;legacyCount+=old.length;
  const interesting=/very|tortilla|chicken pieces|bone.in|parmesan|shav|frying|drippings|mozzarella|sour cream|sesame|chicken (?:breast|thigh)|broth|olive oil/i;
  for(const item of fresh){
    if(!interesting.test([item.recipeIngredientText,item.normalizedName,current.rows.find(r=>r.sourceIds.includes(item.id))?.displayText].join(' ')))continue;
    const original=version.ingredients.split(/\r?\n/).find(l=>l.trim()===item.recipeIngredientText)||version.ingredients.split(/\r?\n/).find(l=>l.toLowerCase().includes(String(item.recipeIngredientText).toLowerCase()))||null;
    catalog.push({slug:recipe.slug||recipe.id,recipe:version.name,language,...enrich(item,current,original)});
  }
  for(const item of old){
    if(isRecipeSuppliedShoppingIngredient(version.name,item.recipeIngredientText||''))processControls.push({recipe:version.name,language,freshRawPresent:fresh.some(f=>f.recipeIngredientText===item.recipeIngredientText),legacyVisible:migrated.rows.some(r=>r.sourceIds.includes(item.id)),...enrich(item,migrated)});
    const matching=fresh.find(f=>f.recipeIngredientText===item.recipeIngredientText);
    const oldRow=migrated.rows.find(r=>r.sourceIds.includes(item.id));
    const newRow=matching?current.rows.find(r=>r.sourceIds.includes(matching.id)):null;
    if((oldRow?.displayText||null)!==(newRow?.displayText||null)){
      refreshDifferences++;
      legacy.push({slug:recipe.slug||recipe.id,recipe:version.name,language,freshLabel:newRow?.displayText||null,...enrich(item,migrated)});
    }
  }
  const labels=new Map();for(const row of current.rows){const a=labels.get(row.displayText)||[];a.push(row);labels.set(row.displayText,a);}
  for(const [label,rows]of labels)if(rows.length>1&&/cheese|cream|chicken|broth|oil/i.test(label))duplicates.push({recipe:version.name,language,label,rows:rows.map(r=>({id:r.id,unit:r.unit,packageSize:r.packageSize,quantity:r.quantity,pantryKey:r.pantryKey,sources:r.sourceIds.map(id=>fresh.find(i=>i.id===id)?.recipeIngredientText)}))});
}
// A real production-generated week, with a small set of locked built-ins so
// suspicious classes are reproducible; remaining days are generated normally.
const names=['Dolly-Inspired Country-Fried Crispy Chicken','Chicken Alfredo','Wild West Shrimp'];
const locks=Object.fromEntries(names.map((name,i)=>[days[i],ALL_RECIPES.find(r=>r.name===name)]));
assert.ok(Object.values(locks).every(Boolean));
const plan=generatePlan({preferences:{vegetarian:false,allergens:[]},lockedMeals:locks,daySettings:{}});
storage.set('simple-dinners.shoppingList.v1','[]');
for(const day of days)if(plan[day])shopping.addIngredientsToList(plan[day].name,plan[day].ingredients);
const weekItems=shopping.loadRawShoppingList(),week=traced(weekItems);
assert.ok(weekItems.some(i=>/garlic/.test(i.recipeIngredientText||'')));
assert.ok(!weekItems.some(i=>/reserved frying oil/.test(i.recipeIngredientText||'')));
const refreshControls=[];
const meatloaf=ALL_RECIPES.find(r=>r.name==='Classic Meatloaf');
const prototype=generate(oldShopping,meatloaf.name,'2 cloves garlic, minced')[0];
const dolly=ALL_RECIPES.find(r=>r.slug==='big-dolly-inspired-country-fried-crispy-chicken');
const oldDollyItems=generate(oldShopping,dolly.name,dolly.ingredients);
const oldOil=oldDollyItems.find(i=>/reserved frying oil/.test(i.recipeIngredientText||''));
const oldChicken=oldDollyItems.find(i=>/3 lb bone-in/.test(i.recipeIngredientText||''));
assert.ok(oldOil);
for(const variant of [
  {name:'authentic old row',item:prototype},
  {name:'authentic old Dolly oil with preserved source',item:oldOil},
  {name:'authentic old Dolly chicken with source',item:oldChicken},
  {name:'degraded old Dolly chicken without source (simulation)',item:{...oldChicken,recipeIngredientText:undefined}},
  {name:'degraded old Dolly oil without preserved source (simulation)',item:{...oldOil,recipeIngredientText:undefined}},
  {name:'stale tortilla wording without preserved source (simulation)',item:{...prototype,grocerySearchName:'very flour tortillas',recipeIngredientText:undefined,text:'Very Flour Tortillas',displayText:'Very Flour Tortillas',normalizedName:'very flour tortillas',quantity:8,unit:''}},
  {name:'corrupted cached fields, preserved source',item:{...prototype,text:'Garlics',displayText:'Garlics',normalizedName:'obsolete garlics',quantity:999,unit:'jar',packageSize:'99 oz'}},
  {name:'no preserved source, corrupted fallback',item:{...prototype,recipeIngredientText:undefined,text:'Garlics',displayText:'Garlics',normalizedName:'garlics'}},
  {name:'pencil-edited recipe row retaining old Smart metadata (current handler shape)',item:{...prototype,id:'edited-recipe',text:'8 flour tortillas',category:'Bakery',sourceRecipe:'',normalizedName:'flour tortillas',quantity:8,unit:undefined,packageSize:undefined}},
  {name:'manual source-free user wording',item:{id:'manual-wording',text:'Very Flour Tortillas',normalizedName:'very flour tortillas',sourceRecipe:'',checked:false,addedAt:1,category:'Bakery'}},
  {name:'synthetic imported very large tortillas, not built-in attribution',item:{...prototype,id:'synthetic-tortillas',grocerySearchName:'very flour tortillas',displayText:'8 Very Flour Tortillas',sourceRecipe:'Synthetic import control',recipeIngredientText:'8 very large flour tortillas',text:'8 very large flour tortillas',normalizedName:'very flour tortillas',quantity:8,unit:''}},
  {name:'synthetic shaved Parmesan, not built-in attribution',item:{...prototype,id:'synthetic-parmesan',grocerySearchName:'shaved parmesan cheese',displayText:'Shaved Parmesan Cheese',sourceRecipe:'Synthetic import control',recipeIngredientText:'1/4 cup shaved Parmesan cheese',text:'1/4 cup shaved Parmesan cheese',normalizedName:'shaved parmesan cheese',quantity:0.25,unit:'cup'}},
]){const run=traced([variant.item]);refreshControls.push({name:variant.name,...enrich(variant.item,run)});}
// Manual protection, identical count/container/package behavior, fresh vs old
// Pantry parity in both UI selector state and the persisted source fields.
const controls=[];
const pairs=[
 ['1 cup shredded mozzarella cheese','1 cup mozzarella cheese, shredded'],
 ['1 cup fresh mozzarella pearls','1 cup shredded mozzarella cheese'],
 ['1 cup fresh mozzarella cheese','1 cup shredded mozzarella cheese'],
 ['1 cup shredded mozzarella','1 cup shredded mozzarella cheese'],
 ['1 cup mozzarella or provolone cheese','1 cup mozzarella cheese'],
 ['1 cup sour cream','2 Tbsp sour cream'],
 ['1 lb chicken breast','1 lb chicken thigh'],
 ['1 lb chicken','1 lb chicken breast'],
 ['1 tsp toasted sesame oil','1 tsp sesame oil'],
 ['1 (15 oz) can black beans','1 (28 oz) can black beans'],
 ['1 cup chicken broth','8 oz chicken broth'],
 ['8 corn or flour tortillas','8 flour tortillas'],
];
for(const raws of pairs){const items=raws.flatMap((raw,i)=>generate(shopping,`Compatibility ${i}`,raw));const run=traced(items);controls.push({raws,rows:run.rows,trace:run.trace});}
const pantryChecks=[];
for(const [language,raw,recipeName]of [['en','2 cloves garlic, minced','Classic Meatloaf'],['es','2 dientes de ajo, picados','Pastel de carne clásico']]){
  const fresh=generate(shopping,recipeName,raw),old=generate(oldShopping,recipeName,raw);
  for(const stock of [[],[{id:'stock',name:'garlic',quantity:9,unit:null}],[{id:'stock',name:'garlic',quantity:1,unit:null}],[{id:'stock',name:'garlic',quantity:9,unit:'jar'}]]){
    const a=traced(fresh,stock),b=traced(old,stock);
    assert.deepEqual(a.rows.map(r=>[r.pantryKey,r.pantryCoverage]),b.rows.map(r=>[r.pantryKey,r.pantryCoverage]));
    pantryChecks.push({language,raw,stock,keys:a.rows.map(r=>r.pantryKey),coverage:a.rows.map(r=>r.pantryCoverage)});
  }
}
const localeChecks=[];
for(const locale of ['en','es']){
 storage.set('simple-dinners.language.v1',locale);
 for(const [recipe,ingredients]of [[dolly.name,dolly.ingredients],[dolly.translations.es.name,dolly.translations.es.ingredients]]){
  const fresh=generate(shopping,recipe,ingredients),old=generate(oldShopping,recipe,ingredients);
  const a=traced(fresh),b=traced(old);
  assert.deepEqual(a.rows.map(r=>[r.displayText,r.pantryKey]),b.rows.map(r=>[r.displayText,r.pantryKey]));
  localeChecks.push({locale,recipe,freshRaw:fresh.length,legacyRaw:old.length,rows:a.rows.map(r=>({label:r.displayText,pantryKey:r.pantryKey}))});
 }
}
storage.set('simple-dinners.language.v1','en');
const out={baseline:'56581e6',legacyGenerator:'643fa15',counts:{recipes:ALL_RECIPES.length,freshCount,legacyCount,refreshDifferences},catalog,legacy,duplicates,processControls,localeChecks,generatedWeek:{plan:Object.fromEntries(days.map(d=>[d,plan[d]?.name||null])),items:weekItems,rows:week.rows,trace:week.trace},refreshControls,compatibility:controls,pantryChecks};
fs.writeFileSync(output,JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({counts:out.counts,legacyDifferenceCount:legacy.length,generatedWeekRows:week.rows.length,controls:refreshControls.map(c=>({name:c.name,label:c.finalLabel,pantryKey:c.pantryKey})),compatibility:controls.map(c=>({raws:c.raws,labels:c.rows.map(r=>r.displayText),keys:c.rows.map(r=>r.id)}))},null,2));
