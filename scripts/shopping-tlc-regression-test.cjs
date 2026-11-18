const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createTypeScriptLoader} = require('./lib/load-typescript.cjs');
const loadGrouping = require('./lib/load-shopping-page-grouping.cjs');
const cleanRoot = process.argv[2], pre49Root = process.argv[3];
assert.ok(cleanRoot && pre49Root, 'Usage: node scripts/shopping-tlc-regression-test.cjs /clean/56581e6 /clean/643fa15');
const storage = new Map();
global.localStorage = {getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const load = createTypeScriptLoader(), oldLoad = createTypeScriptLoader();
const shopping = load('src/shoppingList.ts');
const oldShopping = oldLoad(path.join(pre49Root,'src/shoppingList.ts'));
const {ALL_RECIPES,days} = load('src/core/data.ts');
const {generatePlan} = load('src/core/planner.ts');
const {parseIngredientLine} = load('src/core/ingredientParser.ts');
const {buildGroceryHandoffFromShopping} = load('src/fulfillment/groceryHandoffFromShopping.ts');
const group = loadGrouping();
const baseline = loadGrouping(fs.readFileSync(path.join(cleanRoot,'src/pages/ShoppingListPage.tsx'),'utf8'),cleanRoot);
function generated(generator,name,ingredients){storage.set('simple-dinners.shoppingList.v1','[]');generator.addIngredientsToList(name,ingredients);return generator.loadRawShoppingList();}
function rows(raw,name='Control'){return group(generated(shopping,name,raw));}
function comparable(result){return result.map(({sourceIds,...r})=>({...r,count:r.count}));}
const beforeAfter=[];
for(const [recipeName,raw,after] of [
 ['Dolly-Inspired Country-Fried Crispy Chicken','3 lb bone-in, skin-on chicken pieces','Bone-in Skin-on Chicken Pieces'],
 ['Grilled BBQ Chicken Thighs','6 bone-in, skin-on chicken thighs','Bone-in Skin-on Chicken Thighs'],
 ['Baked Chicken Thighs','6 bone-in, skin-on chicken thighs','Bone-in Skin-on Chicken Thighs'],
 ['Portobellos rellenos estilo caprese','5 a 6 bolitas de mozzarella fresca, rebanadas','Fresh Mozzarella Balls'],
]){
 const recipe=ALL_RECIPES.flatMap(r=>[r,r.translations?.es].filter(Boolean)).find(r=>r.name===recipeName);
 assert.ok(recipe?.ingredients.split(/\r?\n/).includes(raw));
 const saved=generated(shopping,recipeName,raw),old=generated(oldShopping,recipeName,raw);
 const snapshot=JSON.stringify(saved);const current=group(saved)[0];
 assert.equal(current.displayText,after,raw);assert.equal(group(old)[0].displayText,after,'Legacy intact source');
 assert.equal(JSON.stringify(saved),snapshot,'Read-only source refresh');
 beforeAfter.push({recipe:recipeName,raw,before:baseline(old)[0].displayText,after:current.displayText,quantity:current.quantity,unit:current.unit});
}
const span='5 a 6 bolitas de mozzarella fresca, rebanadas';
const parsed=parseIngredientLine(span);assert.equal(parsed.quantity,5);assert.equal(parsed.quantityMax,6);assert.equal(parsed.raw,span);
assert.equal(rows(span)[0].quantity,6);
assert.equal(rows('5 to 6 fresh mozzarella balls, sliced')[0].quantity,6);
assert.equal(rows(span)[0].displayText,rows('5 to 6 fresh mozzarella balls, sliced')[0].displayText);
// The Spanish recipe specifies the purchase form (balls); sliced is preparation.
assert.ok(!rows(span)[0].displayText.includes('A 6'));

// Execute the page's actual save-edit handler, not a hand-written equivalent.
const oldGarlic=generated(oldShopping,'Classic Meatloaf','2 cloves garlic, minced')[0];
const corrupt={...oldGarlic,unit:'jar',packageSize:'99 oz',groceryNotes:'old note',forceBuy:true,pantryRestock:true};
const two=[corrupt,{...corrupt,id:'other-source',sourceRecipe:'Chicken Alfredo',checked:true}];
const initial=JSON.stringify(two);
const edited=group.edit(two,two.map(r=>r.id),'8 flour tortillas');
assert.equal(edited.length,1,'One explicit manual need from a merged group');
assert.equal(edited[0].text,'8 flour tortillas');assert.equal(edited[0].normalizedName,'flour tortillas');
assert.equal(edited[0].sourceRecipe,'');assert.equal(edited[0].quantity,8);assert.equal(edited[0].checked,false);
for(const k of ['recipeIngredientText','grocerySearchName','displayText','groceryNotes','forceBuy','pantryRestock'])assert.equal(k in edited[0],false,k);
assert.equal(edited[0].unit,undefined);assert.equal(edited[0].packageSize,undefined);
assert.equal(JSON.stringify(two),initial);
const tortillas=group(edited)[0];assert.equal(tortillas.displayText,'Flour Tortillas');assert.notEqual(tortillas.pantryKey,'garlic');
const garlicStock=[{id:'g',name:'garlic',quantity:50,unit:null}];assert.equal(group(edited,garlicStock)[0].pantryCoverage,'none');
const tortillaStock=[{id:'t',name:'flour tortillas',quantity:20,unit:null}];assert.equal(group(edited,tortillaStock)[0].pantryCoverage,'covered');
assert.equal(group.select(group(edited,tortillaStock)).pantryCoveredItems.length,1);
const handoff=buildGroceryHandoffFromShopping(edited,group(edited),new Set());
assert.ok(handoff.lines.every(line=>![line.shoppingName,line.searchCandidate,line.sourceRecipe,line.originalIngredient].join(' ').toLowerCase().includes('garlic')),'Retailer product identity must be the edited product; stable item IDs are not product identity');
const measured=group.edit(two,two.map(r=>r.id),'2 jars (12 oz) salsa')[0];
assert.equal(measured.unit,'jar');assert.equal(measured.packageSize,'12 oz');assert.equal(measured.quantity,2);
const unrelated={id:'untouched',text:'My own exact wording',checked:true,addedAt:1,category:'Other'};
assert.equal(group.edit([...two,unrelated],two.map(r=>r.id),'1 lemon')[1],unrelated);
// Repair display/keys for existing pencil edits without writing their raw records.
const legacyEdit={...corrupt,sourceRecipe:'',text:'8 flour tortillas',normalizedName:'flour tortillas',quantity:8,unit:undefined,packageSize:undefined,forceBuy:undefined,pantryRestock:undefined};
const oldSnapshot=JSON.stringify(legacyEdit);
assert.equal(group([legacyEdit])[0].displayText,'Flour Tortillas');assert.equal(group([legacyEdit])[0].pantryKey,tortillas.pantryKey);
assert.equal(JSON.stringify(legacyEdit),oldSnapshot);
// Source-free Smart Shopping approvals retain the previous manual path.
const approved={id:'smart',text:'2 ripe bananas',normalizedName:'banana',grocerySearchName:'banana',quantity:2,unit:'',sourceRecipe:'',checked:false,addedAt:1,category:'Produce'};
assert.deepEqual(group([approved]),baseline([approved]));
const manual={id:'manual',text:'Very Flour Tortillas',normalizedName:'very flour tortillas',sourceRecipe:'',checked:false,addedAt:1,category:'Bakery'};
assert.deepEqual(group([manual]),baseline([manual]));
const quantityBaseline={...manual,id:'quantity-baseline',text:'2 Birthday Candles',normalizedName:'Birthday Candles',quantity:2};
assert.deepEqual(group([quantityBaseline]),baseline([quantityBaseline]),'Known manual quantity display is outside this fix');

function pair(a,b){return group([...generated(shopping,'First',a),...generated(shopping,'Second',b)]);}
assert.equal(pair('1/2 cup shredded mozzarella','1/2 cup shredded mozzarella cheese').length,1);
assert.equal(pair('1/2 cup shredded mozzarella','1/2 cup shredded mozzarella cheese')[0].quantity,1);
assert.equal(pair('1/2 cup mozzarella cheese, shredded','1/2 cup shredded mozzarella cheese').length,1);
for(const [a,b] of [
 ['1 cup fresh mozzarella cheese','1 cup shredded mozzarella cheese'],
 ['1 cup sliced mozzarella cheese','1 cup shredded mozzarella cheese'],
 ['1 cup fresh mozzarella pearls','1 cup shredded mozzarella cheese'],
 ['1 cup mozzarella cheese cubes','1 cup shredded mozzarella cheese'],
 ['1 cup mozzarella or provolone cheese','1 cup shredded mozzarella cheese'],
 ['1 package (8 oz) shredded mozzarella','1 package (16 oz) shredded mozzarella cheese'],
 ['1 cup shredded mozzarella','8 oz shredded mozzarella cheese'],
 ['1 tsp toasted sesame oil','1 tsp sesame oil'],
 ['1 lb chicken breast','1 lb chicken thigh'],
 ['1 lb chicken','1 lb chicken breast'],
 ['1 (15 oz) can black beans','1 (28 oz) can black beans'],
 ['1 cup chicken broth','8 oz chicken broth'],
])assert.equal(pair(a,b).length,2,`${a} / ${b}`);
assert.ok(rows('1 cup mozzarella or provolone cheese')[0].displayText.includes(' or '));
assert.ok(rows('1 cup queso mozzarella o provolone')[0].displayText.toLowerCase().includes(' o '));

const dolly=ALL_RECIPES.find(r=>r.slug==='big-dolly-inspired-country-fried-crispy-chicken');
const processEvidence=[];
for(const version of [dolly,dolly.translations.es]){
 const old=generated(oldShopping,version.name,version.ingredients);
 const oil=old.find(r=>/reserved frying oil|aceite de freír reservado/.test(r.recipeIngredientText||''));
 assert.ok(oil);assert.equal(group([oil]).length,0);
 const lost={...oil,recipeIngredientText:undefined};assert.equal(group([lost]).length,0);
 assert.equal(group([{...lost,sourceRecipe:''}]).length,1,'Manual rows protected');
 assert.equal(group([{...lost,sourceRecipe:'Different recipe'}]).length,1);
 assert.equal(group([{...lost,id:'unproven'}]).length,1);
 assert.equal(group([{...lost,id:lost.id+'-extra'}]).length,1);
 assert.equal(group([{...lost,text:'My frying oil'}]).length,1);
 assert.equal(group([{...lost,recipeIngredientText:'1/2 cup reserved frying oil or chicken drippings'}]).length,1);
 assert.ok(generated(shopping,version.name,version.ingredients).every(r=>r.recipeIngredientText!==oil.recipeIngredientText));
 processEvidence.push({recipe:version.name,id:oil.id,intactSourceExcluded:true,lostSourceExcluded:true});
}
assert.equal(rows('frying oil (enough for about 2 inches deep)','Wild West Shrimp').length,1);
assert.equal(rows('1 cup reserved pan juices',dolly.name).length,1);

// Pantry/Already in Pantry parity, independent from the presentation changes.
for(const lang of ['en','es']){
 storage.set('simple-dinners.language.v1',lang);
 for(const raw of ['2 cloves garlic, minced','2 dientes de ajo, picados','1 tomato','1 can diced tomatoes','1/2 cup shredded mozzarella cheese']){
  const saved=generated(shopping,'Parity',raw);
  for(const stock of [[],[{id:'g',name:'garlic',quantity:20,unit:null}],[{id:'g',name:'garlic',quantity:1,unit:null}],[{id:'g',name:'garlic',quantity:20,unit:'jar'}]]){
   const a=group(saved,stock),b=baseline(saved,stock);
   assert.deepEqual(a.map(r=>[r.pantryKey,r.pantryCoverage,r.unit,r.quantity,r.packageSize]),b.map(r=>[r.pantryKey,r.pantryCoverage,r.unit,r.quantity,r.packageSize]));
   assert.equal(group.select(a).pantryCoveredItems.length,baseline.select(b).pantryCoveredItems.length);
   if(a[0])assert.equal(group.select(a,new Set([a[0].id])).pantryCoveredItems.length,0);
  }
 }
 const a=rows(span)[0],b=rows('5 to 6 fresh mozzarella balls')[0];assert.equal(a.pantryKey,b.pantryKey);assert.equal(a.quantity,b.quantity);
}
storage.set('simple-dinners.language.v1','en');

// Fresh generated week and actual old-generator storage opened in the current page.
const lockedMeals=Object.fromEntries([dolly,ALL_RECIPES.find(r=>r.name==='Chicken Alfredo'),ALL_RECIPES.find(r=>r.name==='Spinach Mushroom Feta Crustless Quiche')].map((r,i)=>[days[i],r]));
const plan=generatePlan({preferences:{vegetarian:false,allergens:[]},lockedMeals,daySettings:{}});
function week(generator){storage.set('simple-dinners.shoppingList.v1','[]');for(const day of days)if(plan[day])generator.addIngredientsToList(plan[day].name,plan[day].ingredients);return generator.loadRawShoppingList();}
const freshWeek=week(shopping),legacyWeek=week(oldShopping);
assert.deepEqual(comparable(group(freshWeek)),comparable(group(legacyWeek)));
assert.ok(!group(freshWeek).some(r=>r.displayText==='Bone in'));

// Smart Week must produce the same choices as clean main for identical random
// draws and user constraints. Exercise planning through ingredient generation.
const cleanPlanner = createTypeScriptLoader()(path.join(cleanRoot,'src/core/planner.ts'));
function seededPlan(generator, options) {
 const originalRandom = Math.random; let seed = 123456;
 try { Math.random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296); return generator(options); }
 finally { Math.random = originalRandom; }
}
const smartWeekCases = [
 {preferences:{vegetarian:false,allergens:[]},lockedMeals,daySettings:{},favorites:[],cookedRecently:[]},
 {preferences:{vegetarian:true,allergens:[]},favorites:[],cookedRecently:[]},
 {preferences:{vegetarian:false,allergens:['shellfish']},favorites:[dolly.name],cookedRecently:['Chicken Alfredo'],excludeMeals:['Baked Chicken Thighs'],requestConstraints:{excludedKeywords:['salmon'],preferredKeywords:['chicken'],preferredTags:[],mostlyQuick:true,vegetarianNightCount:1,pantryPriority:true,budgetPriority:true,kidFriendly:true,proteinTargets:[]},pantry:['garlic','mozzarella']},
];
for(const options of smartWeekCases){
 const current=seededPlan(generatePlan,options), clean=seededPlan(cleanPlanner.generatePlan,options);
 assert.deepEqual(current,clean,'Smart Week choices and constraints must match clean main');
 for(const meal of Object.values(current).filter(Boolean)) assert.ok(group(generated(shopping,meal.name,meal.ingredients)).length>0);
}

// Whole-catalog guard: record only the evidenced source classes as changed.
let checked=0;const catalogChanges=[];
for(const recipe of ALL_RECIPES)for(const v of [recipe,recipe.translations?.es].filter(Boolean)){
 for(const item of generated(shopping,v.name,v.ingredients||'')){
  const snapshot=JSON.stringify(item),a=group([item]),b=baseline([item]);checked++;
  assert.equal(JSON.stringify(item),snapshot);
  if(JSON.stringify(a)!==JSON.stringify(b)){
   const raw=item.recipeIngredientText||'';
   assert.ok(/mozzarella|bone-in,\s*skin-on chicken/i.test(raw),`Unexpected scope: ${v.name}: ${raw}`);
   catalogChanges.push({recipe:v.name,raw,before:b[0]?.displayText,after:a[0]?.displayText,pantryBefore:b[0]?.pantryKey,pantryAfter:a[0]?.pantryKey});
  }
 }
}
console.log(JSON.stringify({baseline:'56581e6',beforeAfter,processEvidence,generatedWeek:{recipes:Object.values(plan).map(r=>r?.name),freshRaw:freshWeek.length,legacyRaw:legacyWeek.length,rows:group(freshWeek).length},smartWeekCases:smartWeekCases.length,catalog:{checked,changed:catalogChanges.length},catalogChanges},null,2));
console.log('PASS: actual edit handler, fresh/legacy final page, ID-gated recovery, form/unit/package guards, manual and Pantry protection, English/Spanish.');
