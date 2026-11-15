const assert = require('node:assert/strict');
const fs = require('node:fs');
const { createTypeScriptLoader } = require('./lib/load-typescript.cjs');
const load = createTypeScriptLoader();
const { ALL_RECIPES } = load('src/core/data.ts');
const { findCanonicalIngredient } = load('src/core/ingredientRegistry.ts');
const parser = load('src/core/ingredientParser.ts');
const { getPantryComparableName: key, buildPantryUsageSuggestions, applyPantryUsage } = load('src/core/pantryUsage.ts');
const { matchRecipeToPantry } = load('src/core/pantryRecipeMatch.ts');
const { rankCookNowMeals } = load('src/core/cookNow.ts');
const { categorizePantryItem: category } = load('src/core/pantryCategory.ts');
const { previewRecipeIngredientForShopping: shopping } = load('src/shoppingList.ts');
const thumbnails = load('src/plus/smartShoppingThumbnails.ts');
function inventory(name, unit, quantity=8) { return { id:'test', name, unit, quantity, createdAt:1 }; }
const recipe = ingredients => ({id:'test-recipe',name:'Test recipe',ingredients});
function matches(raw, name, unit) {
 const item = inventory(name,unit);
 assert.equal(parser.parseIngredientLine(raw).normalizedName,key(name,unit),raw);
 assert.equal(matchRecipeToPantry(recipe(raw),[item]).matchedCount,1,raw);
 assert.equal(buildPantryUsageSuggestions([raw],[item]).length,1,raw);
}
for(const [raw,name,unit] of [
 ['1 can (15 oz) corn, drained','Canned Corn','can'],
 ['4 ears corn, husked','Corn on the Cob','ear'],
 ['1 can (14.5 oz) diced tomatoes, undrained','Diced Tomatoes','can'],
 ['1 tomato, diced','Fresh Tomatoes',undefined],
 ['1 cup cherry tomatoes, halved','Cherry Tomatoes',undefined],
 ['2 cans (14.5 oz) fire-roasted diced tomatoes','Fire Roasted Diced Tomatoes','can'],
 ['1 can (14 oz) fire-roasted tomatoes','Fire Roasted Diced Tomatoes','can'],
 ['1 can Italian-style diced tomatoes','Italian Style Diced Tomatoes','can'],
 ['4 scallions, trimmed','Green Onion',undefined],
 ['8 oz egg noodles','Egg Noodles','oz'],
 ['1 cup heavy cream','Heavy Cream','cup'],
 ['1/2 cup sour cream, for serving','Sour Cream','cup'],
 ['1 lb lean ground beef','Ground Beef','lb'],
 ['1 1/2 lb boneless, skinless chicken breast','Chicken Breasts','lb'],
 ['1 cup shredded cheddar cheese','Cheddar Cheese','cup'],
 ['1/2 cup Parmesan cheese, grated','Grated Parmesan Cheese','cup'],
 ['1 can black beans, drained and rinsed','Canned Black Beans','can'],
 ['2 cans kidney beans, drained and rinsed','Kidney Beans','can'],
 ['1 can chickpeas, drained and rinsed','Chickpeas','can'],
 ['1 can Rotel','Diced Tomatoes with Green Chiles','can'],
 ['3 cups chicken stock (kept warm)','Chicken Broth','cup'],
 ['1 1/2 cups beef stock','Beef Broth','cup'],
 ['3 cups vegetable stock','Vegetable Broth','cup'],
 ['8 flour tortillas','Flour Tortillas',undefined],
 ['8 corn tortillas','Corn Tortillas',undefined],
 ['1 cup all-purpose flour','Flour','cup'],
 ['1 cup granulated sugar','Sugar','cup'],
 ['1/4 cup panko breadcrumbs','Panko Breadcrumbs','cup'],
]) matches(raw,name,unit);
for(const [name,unit,expected]of [
 ['canned corn','can','Pantry'],['fresh corn',null,'Produce'],['corn on the cob','ear','Produce'],
 ['canned diced tomatoes','can','Pantry'],['fresh tomatoes',null,'Produce'],['cherry tomatoes',null,'Produce'],
 ['Fire Roasted Diced Tomatoes','can','Pantry'],['Italian Style Diced Tomatoes','can','Pantry'],
 ['green onion',null,'Produce'],['scallions',null,'Produce'],['kiwi',null,'Produce'],
 ['Extra Wide Egg Noodles',null,'Pantry'],['heavy cream',null,'Dairy / Eggs'],['sour cream',null,'Dairy / Eggs'],
 ['panko breadcrumbs',null,'Pantry'],['cornmeal',null,'Pantry'],['coconut milk','can','Pantry'],
 ['yellow bell pepper',null,'Produce'],['Hand Warmers',null,'Other'],['Colace',null,'Other'],['custom keepsake',null,'Other'],
]) assert.equal(category(name,unit),expected,name);
// Do not turn a product/preparation/choice into a fuzzy match.
for(const [raw,name,unit] of [
 ['1 ear corn','Corn','can'],['1 can corn','Corn on the Cob','ear'],
 ['1 tomato, diced','Diced Tomatoes','can'],['1 can diced tomatoes','Fresh Tomato',null],
 ['1 cup frozen corn','Corn','can'],['1 can black beans','Dried Black Beans','bag'],
 ['1 cup heavy cream','Sour Cream','cup'],['1 cup chicken broth','Chicken Breast','lb'],
 ['1 cup breadcrumbs or crackers','Breadcrumbs','cup'],['8 flour or corn tortillas','Flour Tortillas',null],
 ['1 cup chicken broth or white wine','Chicken Broth','cup'],['2 jalapenos (fresh or pickled)','Pickled Jalapenos','jar'],
 ['4 bone-in chicken thighs','Boneless Skinless Chicken Thighs','lb'],
 ['1 can Rotel','Diced Tomatoes','can'],
 ['1 clove garlic, minced','Minced Garlic','tsp'],
 ['1 tsp smoked paprika','Paprika','tsp'],['1 Tbsp lemon juice','Lemon',null],
]) {
 const item=inventory(name,unit);
 assert.notEqual(parser.parseIngredientLine(raw).normalizedName,key(name,unit),raw);
 assert.equal(matchRecipeToPantry(recipe(raw),[item]).matchedCount,0,raw);
 assert.equal(buildPantryUsageSuggestions([raw],[item]).length,0,raw);
 assert.equal(rankCookNowMeals({meals:[recipe(raw)],pantry:[item]})[0]?.matched.length || 0,0,raw);
}
// Every registry addition/alias must cite a concrete, unchanged built-in line.
for(const entry of require('./fixtures/pantry-registry-evidence.json')) {
 assert.ok(ALL_RECIPES.some(r=>r.name===entry.recipe && r.ingredients.split(/\r?\n/).some(l=>l.trim()===entry.raw)),JSON.stringify(entry));
 assert.equal(findCanonicalIngredient(entry.lookup)?.id,entry.id,entry.lookup);
}
for(const raw of ['1 can diced tomatoes','1 can crushed tomatoes','1 can fire-roasted diced tomatoes','1 can tomato sauce','1 can tomato paste']) {
 const item=shopping(raw); assert.equal(item.category,'Pantry',raw);
 assert.equal(item.quantity,1); assert.equal(item.unit,'can');
 assert.ok(item.normalizedName.includes(raw.replace('1 can ', '').replace('fire-roasted','fire roasted')),raw);
}
assert.equal(shopping('1 tsp smoked paprika').normalizedName,'smoked paprika');
for(const [name,category,key,unit] of [
 ['Corn','Pantry','canned-corn','can'],['diced tomatoes','Pantry','diced-tomatoes','can'],
 ['fire-roasted tomatoes','Pantry','diced-tomatoes','can'],['Italian Style Diced Tomatoes','Pantry','diced-tomatoes','can'],
 ['smoked paprika','Spices / Seasonings','paprika'],['dried italian seasoning','Spices / Seasonings','italian-seasoning'],
 ['plain breadcrumbs','Pantry','breadcrumbs'],['pint cherry tomatoes','Produce','tomato'],
 ['mild salsa','Pantry','salsa'],['vanilla yogurt','Dairy / Eggs','yogurt'],
 ['natural peanut butter','Pantry','peanut-butter'],['whole wheat tortillas','Bakery','tortillas'],
 ['toasted sesame seeds','Pantry','sesame-seeds'],
]) {
 const match=thumbnails.resolveSmartShoppingThumbnail(name,category,{unit});
 assert.equal(match.thumbnailKey,key,name);
 assert.ok(thumbnails.hasLocalSmartShoppingThumbnail(key),name);
 assert.ok(fs.existsSync('public'+thumbnails.getLocalSmartShoppingThumbnailSrc(key)),name);
}
for(const name of ['unknown keepsake','canned tomatoes','coconut milk','shelf-stable potato gnocchi']) {
 const match=thumbnails.resolveSmartShoppingThumbnail(name,'Other');
 assert.equal(match.matchType,'category',name);
 assert.equal(thumbnails.hasLocalSmartShoppingThumbnail(match.thumbnailKey),false,name);
}
assert.equal(thumbnails.resolveSmartShoppingThumbnail('tomato','Pantry',{unit:'can'}).matchType,'category');
// Existing partial usage, staple handling, and Used up behavior retain storage shape.
const item=inventory('Black Beans','can',8);
const suggestions=buildPantryUsageSuggestions(['2 cans black beans, drained and rinsed'],[item]);
assert.equal(suggestions[0].canDeduct,true);
const next=applyPantryUsage([item],suggestions,new Set(['test']));
assert.equal(next[0].quantity,6);
assert.equal(buildPantryUsageSuggestions(['2 cans black beans'],[{...item,isStaple:true}])[0].canDeduct,false);
// Smart Week must preserve locked planned/special nights and never mutate
// inventory while using the shared Pantry recipe matcher.
const storage = new Map();
global.localStorage = { getItem:k=>storage.get(k)||null, setItem:(k,v)=>storage.set(k,v) };
global.window = { dispatchEvent:()=>true };
const { buildSmartWeekDraft } = load('src/core/smartWeek.ts');
const { days } = load('src/core/data.ts');
const currentMeals = Object.fromEntries(days.map((day,index)=>[day,index===1?{mode:'leftovers',meal:null}:index===2?{mode:'freezer',meal:null}:{mode:'planned',meal:ALL_RECIPES[index]}]));
const pantry = [inventory('Black Beans','can',8),inventory('Corn','can',3)];
const original = JSON.stringify({currentMeals,pantry});
const draft = buildSmartWeekDraft({currentMeals,pantry,lockedDays:Object.fromEntries(days.map(d=>[d,true])),preferences:{vegetarian:false,allergens:[]}});
for(const day of days) assert.deepEqual(draft.days[day].plannedDay,currentMeals[day]);
assert.equal(JSON.stringify({currentMeals,pantry}),original);
assert.equal(storage.has('simple-dinners.hasGeneratedFirstPlan'),false);
// Explicit restocks remain purchases even when inventory is present.
const { addPantryRestockToList, loadRawShoppingList } = load('src/shoppingList.ts');
addPantryRestockToList(pantry[0]);
assert.ok(loadRawShoppingList().some(item=>item.forceBuy&&item.pantryRestock));
console.log('PASS: catalog evidence, exact Pantry aliases/forms, categories, quantity/partial usage, Cook Now safety, thumbnail assets/fallbacks');
