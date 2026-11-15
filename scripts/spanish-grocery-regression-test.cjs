const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createTypeScriptLoader}=require('./lib/load-typescript.cjs');
const load=createTypeScriptLoader();
const registry=load('src/core/ingredientRegistry.ts');
const language=load('src/core/spanishIngredients.ts');
const parser=load('src/core/ingredientParser.ts');
const shopping=load('src/shoppingList.ts');
const pantry=load('src/core/pantryUsage.ts');
const {matchRecipeToPantry}=load('src/core/pantryRecipeMatch.ts');
const {resolveGroceryChoice}=load('src/core/groceryChoiceResolver.ts');
const thumbs=load('src/plus/smartShoppingThumbnails.ts');
const {ALL_RECIPES}=load('src/core/data.ts');
const rows=[
 ['1/2 tsp de sal','salt',0.5,'tsp','salt'],
 ['1/4 tsp de pimienta negra','black pepper',0.25,'tsp','black pepper'],
 ['1 Tbsp de aceite de oliva','olive oil',1,'Tbsp','olive oil'],
 ['2 dientes de ajo, picados','garlic',2,'clove','garlic'],
 ['1 Tbsp de ajo, picado','garlic',1,'Tbsp','garlic'],
 ['1 cebolla amarilla pequeña, finamente picada','yellow onion',1,'','yellow onion'],
 ['2 cebollines, en rebanadas','green onion',2,'','green onion'],
 ['2 cebollines, rebanados','green onion',2,'','green onion'],
 ['1 tomate, cortado en cubitos','tomato',1,'','tomato'],
 ['1 lata (28 oz) de tomates en cubitos','diced tomatoes',1,'can','diced tomatoes'],
 ['1 lata (28 oz) de tomates en cubos','diced tomatoes',1,'can','diced tomatoes'],
 ['2 latas (14.5 oz) de tomates asados en cubitos','fire roasted diced tomatoes',2,'can','fire roasted diced tomatoes'],
 ['1 lata (15 oz) de maíz, escurrido','corn',1,'can','corn'],
 ['1 cup de maíz','corn',1,'cup','corn'],
 ['1 1/2 tazas de leche','milk',1.5,'cup','milk'],
 ['4 cucharadas de mantequilla, divididas','butter',4,'Tbsp','butter'],
 ['1/2 cup de crema agria','sour cream',0.5,'cup','sour cream'],
 ['1 cup de crema espesa','heavy cream',1,'cup','heavy cream'],
 ['1/2 cup de queso cheddar rallado','shredded cheddar cheese',0.5,'cup','shredded cheddar cheese'],
 ['2 huevos grandes','egg',2,'','egg'],
 ['1 cup de arroz','white rice',1,'cup','rice'],
 ['3 cups de caldo de pollo, mantenido caliente','chicken broth',3,'cup','chicken broth'],
 ['1 lata (15 oz) de frijoles negros, escurridos y enjuagados','black beans',1,'can','black beans'],
 ['1 lb de pechugas de pollo sin hueso y sin piel, cortadas en trozos pequeños','chicken breast',1,'lb','chicken breast'],
 ['1 lb de carne molida de res','ground beef',1,'lb','ground beef'],
 ['3/4 cup (1 1/2 barras) de mantequilla','butter',0.75,'cup','butter'],
 ['1/2 tsp de sal, más al gusto','salt',0.5,'tsp','salt'],
];
for(const [raw,name,quantity,unit,inventoryName]of rows){
 const parsed=parser.parseIngredientLine(raw),item=shopping.previewRecipeIngredientForShopping(raw);
 assert.ok(item,raw);
 assert.equal(parsed.raw,raw,'Displayed/source text changed');
 assert.equal(item.normalizedName,name,raw);
 assert.equal(item.quantity,quantity,raw);
 assert.equal(item.unit,unit,raw);
 const english=registry.findCanonicalIngredient(name);
 assert.equal(registry.findCanonicalIngredient(item.normalizedName)?.id,english?.id,raw);
 assert.equal(item.category,english.category,raw);
 const stock={id:'stock',name:inventoryName,quantity:8,unit:unit||null,createdAt:1};
 assert.equal(parsed.normalizedName,pantry.getPantryComparableName(stock.name,stock.unit),raw);
 assert.equal(matchRecipeToPantry({name:'Test',ingredients:raw},[stock]).matchedCount,1,raw);
 assert.equal(pantry.buildPantryUsageSuggestions([raw],[stock]).length,1,raw);
 const image=thumbs.resolveSmartShoppingThumbnail(item.normalizedName,item.category,{unit});
 const englishImage=thumbs.resolveSmartShoppingThumbnail(name,item.category,{unit});
 assert.deepEqual(image,englishImage,raw);
 if(thumbs.hasLocalSmartShoppingThumbnail(image.thumbnailKey)) assert.ok(fs.existsSync('public'+thumbs.getLocalSmartShoppingThumbnailSrc(image.thumbnailKey)));
}
for(const raw of ['2 cups de agua','1/2 taza de agua fría','1/2 cup de agua reservada de la pasta','1 quart de agua caliente','1/4 cup de agua tibia','1/2 cup de agua o agua reservada de la pasta']){
 assert.equal(registry.normalizeSpanishIngredientLine(raw).processWater,true,raw);
 assert.equal(shopping.previewRecipeIngredientForShopping(raw),null,raw);
}
for(const raw of ['2 oz de agua mineral con gas','1 taza de agua de coco','1 tsp de maicena + 2 Tbsp de agua para espesar']) assert.ok(shopping.previewRecipeIngredientForShopping(raw),raw);
for(const raw of ['1 Tbsp de aceite de oliva o mantequilla','1/2 tsp de sal / pimienta negra','1 taza de frijoles negros o pintos','1/2 cup de caldo de pollo o vino blanco','1/2 cup de queso gouda ahumado o cheddar, opcional para más sabor']){
 const item=shopping.previewRecipeIngredientForShopping(raw);
 assert.ok(item,raw);
 assert.match(item.normalizedName,/\bo\b/,raw+' must retain the full choice');
 assert.equal(registry.findCanonicalIngredient(item.normalizedName),null,raw+' must not select the first food');
 const choice=resolveGroceryChoice({recipeIngredientText:raw,normalizedName:item.normalizedName,grocerySearchName:item.grocerySearchName});
 assert.equal(choice.requiresSelection,true,raw);
 for(const name of ['Olive Oil','Butter','Salt','Black Beans','Chicken Broth','Cheddar Cheese']){
  const stock={id:'stock',name,unit:'cup',quantity:8,createdAt:1};
  assert.equal(pantry.buildPantryUsageSuggestions([raw],[stock]).length,0,raw+' vs '+name);
 }
 assert.equal(thumbs.resolveSmartShoppingThumbnail(item.normalizedName,'Other').matchType,'category',raw);
}
assert.equal(resolveGroceryChoice({recipeIngredientText:'1/2 tsp de orégano seco',normalizedName:'dried oregano'}).requiresSelection,false,'Accented orégano is not English or');
assert.equal(resolveGroceryChoice({recipeIngredientText:'1/2 tsp de sal',normalizedName:'salt'}).requiresSelection,false,'Fraction is not a choice');
assert.equal(resolveGroceryChoice({recipeIngredientText:'1/2 cebolla amarilla pequeña, finamente picada o rallada'}).status,'preparation-note');
assert.equal(registry.findCanonicalIngredient('cebollín').id,'green-onion');
assert.equal(registry.findCanonicalIngredient('limón'),null,'Ambiguous lemon/lime terminology must not be guessed');
assert.equal(registry.findCanonicalIngredient('crema'),null,'Unspecified cream must not become heavy/sour cream');
assert.notEqual(pantry.getPantryComparableIngredientName('1 Tbsp de jugo de lima'),pantry.getPantryComparableName('Lime'));
assert.notEqual(pantry.getPantryComparableIngredientName('1 taza de maíz'),pantry.getPantryComparableName('Corn','can'));
assert.notEqual(pantry.getPantryComparableIngredientName('1 tomate, cortado en cubitos'),pantry.getPantryComparableName('Diced Tomatoes','can'));
assert.notEqual(pantry.getPantryComparableIngredientName('1 tsp de paprika ahumada'),pantry.getPantryComparableName('Paprika','tsp'));
assert.equal(parser.parseIngredientLine('1 1/2 a 2 lb de papas').quantityMax,2);
assert.equal(parser.parseIngredientLine('2 cucharaditas de mantequilla').unit,'tsp');
// Every exact alias/unit and grammar rule cites a real unchanged Spanish line.
const evidence=require('./fixtures/spanish-grocery-evidence.json');
for(const entry of [...evidence.aliases,...evidence.units,...evidence.rules]){
 const source=ALL_RECIPES[entry.recipeIndex].translations.es.ingredients.split(/\r?\n/)[entry.line-1].trim();
 assert.equal(source,entry.raw,JSON.stringify(entry));
}
assert.deepEqual(language.SPANISH_GROCERY_ALIASES.flatMap(e=>e.aliases).sort(),evidence.aliases.map(e=>e.alias).sort());
for(const entry of evidence.aliases){
 assert.equal(language.spanishGroceryName(entry.alias),entry.englishName,entry.alias);
 assert.equal(registry.findCanonicalIngredient(entry.alias)?.id||null,entry.canonicalId,entry.alias);
}
for(const entry of evidence.units) assert.equal(language.SPANISH_UNITS[entry.alias],entry.englishUnit,entry.alias);
// Local/source/household payloads keep original inventory names, units and
// ingredient wording. Reading normalized data must not translate stored data.
const storage=new Map();
global.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
global.window={dispatchEvent:()=>true};
const {writePantryItems,loadPantryItems}=load('src/core/pantryStore.ts');
const legacy=[{id:'legacy',name:'Mi artículo personalizado',createdAt:1},{id:'sal',name:'Sal',unit:'taza',quantity:2,packageSize:'custom pack',createdAt:2}];
writePantryItems(legacy);
assert.deepEqual(loadPantryItems().map(({category,...item})=>item),legacy);
const beforeRead=storage.get('pantry');loadPantryItems();assert.equal(storage.get('pantry'),beforeRead);
const raw='1 lata (15 oz) de frijoles negros, escurridos y enjuagados';
shopping.addIngredientsToList('Receta española',raw);
const saved=shopping.loadRawShoppingList()[0];
assert.equal(saved.recipeIngredientText,raw);assert.equal(saved.quantity,1);assert.equal(saved.unit,'can');assert.equal(saved.packageSize,'15 oz');
const beforeShopping=storage.get('simple-dinners.shoppingList.v1');shopping.loadShoppingList();assert.equal(storage.get('simple-dinners.shoppingList.v1'),beforeShopping);
const stock={id:'beans',name:'Black Beans',unit:'can',quantity:8,createdAt:1};
const use=pantry.buildPantryUsageSuggestions(['2 latas de frijoles negros, escurridos y enjuagados'],[stock]);
assert.equal(use[0].canDeduct,true);assert.equal(pantry.applyPantryUsage([stock],use,new Set(['beans']))[0].quantity,6);
assert.equal(pantry.buildPantryUsageSuggestions(['2 latas de frijoles negros'],[{...stock,isStaple:true}])[0].canDeduct,false);
shopping.addPantryRestockToList(stock);assert.ok(shopping.loadRawShoppingList().some(i=>i.forceBuy&&i.pantryRestock));
console.log('PASS: Spanish aliases/units/choices/water, canonical Pantry/categories/thumbnails, source quantities/packages, evidence and persistence boundaries');
