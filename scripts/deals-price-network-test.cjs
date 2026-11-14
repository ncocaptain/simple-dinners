"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const React = require("react");
const renderer = require("react-test-renderer");
const modules = new Map();
function load(file) {
  const filename = path.resolve(file);
  if (modules.has(filename)) return modules.get(filename).exports;
  const mod = { exports: {} }; modules.set(filename, mod);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("require", "module", "exports", output)((name) => {
    if (["react", "zod"].includes(name)) return require(name);
    assert.ok(name.startsWith("."), `Unexpected dependency: ${name}`);
    return load(path.resolve(path.dirname(filename), name.replace(/\.js$/, "") + ".ts"));
  }, mod, mod.exports);
  return mod.exports;
}
const { createSimpleDinnersPriceProvider } = load('src/deals/providers/simpleDinnersPriceProvider.ts');
const { buildShoppingPurchaseSnapshot } = load('src/deals/shoppingSnapshot.ts');
const { DealsCoordinator } = load('src/deals/coordinator.ts');
const { DealsProviderRegistry } = load('src/deals/providerRegistry.ts');
const { DealsCache } = load('src/deals/cache.ts');
const { comparePackages } = load('src/deals/packageComparability.ts');
const NOW = Date.parse('2026-11-14T12:00:00Z');
const uuid = n => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const iso = n => new Date(n).toISOString();
const context = { storeId: uuid(1), retailerId: 'Fictional Market', channel: 'in-store', currency: 'USD', eligibilityKey: 'private-not-sent' };
const product = (n=10, more={}) => ({ id:uuid(n), normalized_name:'Fictional chicken breast', canonical_ingredient_id:'chicken-breast', grocery_search_name:'chicken breast', product_form_key:'raw-chicken-breast', form_verified:true, package_kind:'single', content_basis:'net', package_quantity:24, package_unit:'oz', pack_count:null, ...more });
const observation = (more={}) => ({ id:uuid(100), product_id:uuid(10), store_id:uuid(1), regular_price_minor:500, sale_price_minor:null, currency:'USD', channel:'in-store', selling_basis:'package', selling_quantity:null, selling_unit:null, observed_at:iso(NOW-1000), expires_at:null, sale_expires_at:null, availability:'in-stock', conditions:[], source_type:'manual', source_confidence:'verified', ...more });
// A query-evaluating fake: assertions exercise real Supabase filter construction,
// ordering and limits as well as normalization. SQL security runs separately.
function setup(products=[product()], observations=[observation()], options={}) {
  const requests=[];
  const tables = { price_network_products: products, price_network_observations: observations,
    price_network_stores: [{id:uuid(1), retailer_name:'Fictional Market', active:true}, {id:uuid(2),retailer_name:'Fictional Market',active:true}] };
  const client = { from(table) {
    const req={table, operations:[]}; requests.push(req); let rows=[...tables[table]]; const orders=[];
    const builder={ select(columns){ req.columns=columns; return this; }, eq(k,v){req.operations.push(['eq',k,v]); rows=rows.filter(r=>r[k]===v); return this;},
      gte(k,v){req.operations.push(['gte',k,v]);rows=rows.filter(r=>r[k]>=v);return this;}, lte(k,v){req.operations.push(['lte',k,v]);rows=rows.filter(r=>r[k]<=v);return this;},
      order(k,opts={}){orders.push([k,opts.ascending!==false]);return this;}, limit(n){req.limit=n;return this;}, abortSignal(){return this;},
      then(resolve,reject){rows.sort((a,b)=>{for(const [k,asc] of orders){if(a[k]!==b[k])return (a[k]<b[k]?-1:1)*(asc?1:-1);} return 0;});return Promise.resolve({data:rows.slice(0,req.limit),error:options.error?{}:null}).then(resolve,reject);} };
    return builder;
  }};
  return { provider:createSimpleDinnersPriceProvider(client,()=>NOW),requests, tables };
}
const signal = () => new AbortController().signal;
const query = { requestId:'private-request', canonicalIngredientId:'chicken-breast', searchName:'chicken breast', productConstraints:['20 oz chicken breast'] };
const search = (s,q=query) => s.provider.searchProducts({context,queries:[q]},signal());
const prices = (s,c=context,ids=[uuid(10)]) => s.provider.getPrices({context:c,productIds:ids},signal());
const tests=[]; const test=(name,fn)=>tests.push([name,fn]);
function snapshot() {
  const raw=['chicken breast','rice'].map((text,i)=>({id:`item-${i}`,text,normalizedName:text,grocerySearchName:text,recipeIngredientText:`20 oz ${text}`,quantity:20,unit:'oz',checked:false,addedAt:1,category:'Other'}));
  return buildShoppingPurchaseSnapshot({rawItems:raw,combinedRows:raw.map(r=>({id:r.id,sourceIds:[r.id],checked:false,pantryCoverage:'none',pantryKey:r.id,pantryRestock:false})),pantryBuyAnywayIds:new Set()});
}
async function coordinate(s, snap=snapshot(), contexts=[context]) {
  const input={snapshot:snap,selections:contexts.map(c=>({...c,providerId:s.provider.identity.id,environment:'production'})),currency:'USD',
    comparisonBasis:Object.fromEntries(snap.needs.map(n=>[n.id,{productFormKey:n.identity.canonicalIngredientId==='rice'?'dry-rice':'raw-chicken-breast',requirementBasis:'net'}])),cacheAccess:{visibility:'public',ownerKey:null,personalized:false}};
  return new DealsCoordinator(new DealsProviderRegistry([s.provider]),new DealsCache(undefined,()=>NOW),()=>NOW).run(input);
}
test('reads canonical products and valid observed prices with explicit provenance',async()=>{
  const s=setup();assert.equal((await search(s)).items[0].compatibility,'verified');
  const r=await prices(s);assert.equal(r.items[0].price.regularPrice.amountMinor,500);assert.match(r.metadata.attribution,/manual.*verified.*2026/);
  assert.ok(s.requests.some(r=>r.operations.some(op=>op[1]==='canonical_ingredient_id'&&op[2]==='chicken-breast')));
});
test('newest valid observation wins, append-only history input remains intact',async()=>{
  const history=[observation({id:uuid(101),observed_at:iso(NOW-10000),regular_price_minor:100}),observation({regular_price_minor:800}),observation({id:uuid(102),observed_at:iso(NOW-500),expires_at:iso(NOW-1)})];
  const before=JSON.stringify(history);assert.equal((await prices(setup(undefined,history))).items[0].price.regularPrice.amountMinor,800);assert.equal(JSON.stringify(history),before);
});
test('stale, future and expired observations are excluded',async()=>{
  for(const o of [observation({observed_at:iso(NOW-7*86400000-1)}),observation({observed_at:iso(NOW+1)}),observation({expires_at:iso(NOW-1)})])assert.equal((await prices(setup(undefined,[o]))).items.length,0);
});
test('expired sales fall back to regular and active sales expire the quote',async()=>{
  const expired=await prices(setup(undefined,[observation({sale_price_minor:200,sale_expires_at:iso(NOW-1),conditions:[{kind:'coupon',eligibility:'unknown'}]})]));
  assert.equal(expired.items[0].price.salePrice,null);assert.deepEqual(expired.items[0].price.conditions,[]);
  const r=await prices(setup(undefined,[observation({sale_price_minor:200,sale_expires_at:iso(NOW+500)})]));assert.equal(r.items[0].price.salePrice.amountMinor,200);assert.equal(r.metadata.expiresAt,NOW+500);
});
test('missing latest price stays null, never resurrects historical price or zero',async()=>{
  const r=await prices(setup(undefined,[observation({regular_price_minor:null}),observation({id:uuid(101),observed_at:iso(NOW-2000)})]));assert.equal(r.items[0].price.regularPrice,null);
  assert.equal((await prices(setup(undefined,[observation({regular_price_minor:0})]))).items[0].price.regularPrice.amountMinor,0);
});
test('store, retailer, currency and channel are isolated',async()=>{
  const s=setup(undefined,[observation({store_id:uuid(2),regular_price_minor:1}),observation({currency:'CAD',regular_price_minor:2}),observation({channel:'delivery',regular_price_minor:3}),observation()]);
  assert.equal((await prices(s)).items[0].price.regularPrice.amountMinor,500);
  assert.equal((await prices(s,{...context,storeId:uuid(3)})).items.length,0);
  assert.equal((await prices(s,{...context,retailerId:'Other'})).items.length,0);
});
test('form verification required and modified/ambiguous constraints remain review-required',async()=>{
  assert.equal((await search(setup([product(10,{form_verified:false})]))).items[0].compatibility,'unverified');
  for(const wording of ['20 oz cooked chicken breast','20 oz bone-in chicken breast','20 oz chicken breast or tofu','20 oz canned chicken breast'])assert.equal((await search(setup(),{...query,productConstraints:[wording]})).items[0].compatibility,'unverified');
  assert.equal((await search(setup(),{...query,searchName:'chicken'})).items.length,0);
  assert.equal((await search(setup(),{...query,canonicalIngredientId:'rice'})).items.length,0);
});
test('package sizes and multipack dimensions are preserved; net/drained mismatch suppressed',async()=>{
  const s=setup([product(),product(11,{package_kind:'multipack',pack_count:4,package_quantity:6,content_basis:'drained'})]);
  const r=await search(s);assert.equal(r.items[1].packageSize.packCount,4);assert.equal(r.items[1].packageSize.innerSize.quantity,6);
  assert.equal(comparePackages(r.items[0],r.items[1]).reason,'basis-mismatch');
  const wrong=setup([product(10,{content_basis:'drained'})]);assert.equal((await coordinate(wrong)).basket.stores[0].complete,false);
});
test('partial coverage stays partial; complete coverage yields Phase 2 winner across two stores',async()=>{
  const partial=await coordinate(setup());assert.equal(partial.basket.stores[0].complete,false);assert.equal(partial.basket.stores[0].pricedItemCount,1);assert.equal(partial.basket.cheapestCompleteStores.length,0);
  const rice=product(11,{canonical_ingredient_id:'rice',grocery_search_name:'rice',normalized_name:'Fictional rice',product_form_key:'dry-rice'});
  const obs=[observation(),observation({id:uuid(101),product_id:uuid(11),regular_price_minor:300}),observation({id:uuid(102),store_id:uuid(2),regular_price_minor:600}),observation({id:uuid(103),store_id:uuid(2),product_id:uuid(11),regular_price_minor:400})];
  const r=await coordinate(setup([product(),rice],obs),snapshot(),[context,{...context,storeId:uuid(2)}]);assert.ok(r.basket.stores.every(s=>s.complete));assert.equal(r.basket.cheapestCompleteStores[0].storeId,uuid(1));assert.equal(r.basket.stores[0].merchandiseSubtotal.amountMinor,800);
});
test('ambiguous product never wins; missing price and unverified source suppress totals',async()=>{
  for(const s of [setup([product(10,{form_verified:false})]),setup(undefined,[observation({regular_price_minor:null})]),setup(undefined,[observation({source_confidence:'unverified'})])]){
    const r=await coordinate(s);assert.equal(r.basket.stores[0].pricedItemCount,0);assert.equal(r.basket.cheapestCompleteStores.length,0);
  }
});
test('snapshot/list untouched; no private signature or constraint wording sent in queries',async()=>{
  const snap=snapshot();const before=JSON.stringify(snap);const s=setup();await coordinate(s,snap);assert.equal(JSON.stringify(snap),before);
  const requests=JSON.stringify(s.requests);for(const secret of [snap.signature,'20 oz chicken breast','private-not-sent','private-request'])assert.ok(!requests.includes(secret));
});
test('malformed data, bounded truncation, transport errors and cancellation fail closed',async()=>{
  assert.equal((await prices(setup(undefined,[observation({regular_price_minor:-1})]))).failures[0].code,'malformed-response');
  assert.equal((await search(setup(Array.from({length:100},(_,i)=>product(10+i))))).items.length,0);
  assert.equal((await prices(setup(undefined,Array.from({length:100},()=>observation())))).items.length,0);
  assert.equal((await prices(setup(undefined,undefined,{error:true}))).failures[0].code,'unavailable');
  const a=new AbortController();a.abort();const s=setup();assert.equal((await s.provider.getPrices({context,productIds:[uuid(10)]},a.signal)).failures[0].code,'cancelled');assert.equal(s.requests.length,0);
});
test('migration has RLS and SELECT-only client policies and no secrets in adapter',()=>{
  const sql=fs.readFileSync('supabase/migrations/20261114143631_deals_owned_price_network.sql','utf8');
  for(const table of ['stores','products','observations'])assert.ok(sql.includes(`alter table public.price_network_${table} enable row level security`));
  const policies=sql.match(/create policy[^;]+;/g);assert.equal(policies.length,3);assert.ok(policies.every(p=>p.includes('for select to anon, authenticated')));
  assert.ok(!/for (insert|update|delete|all) to/i.test(sql));assert.match(sql,/revoke all on public.price_network_stores/);
  const adapter=fs.readFileSync('src/deals/providers/simpleDinnersPriceProvider.ts','utf8');assert.ok(!/service_role|sb_secret_|SUPABASE_.*KEY|\.insert\(|\.update\(|\.delete\(|\.upsert\(/.test(adapter));
});
(async()=>{for(const [name,fn] of tests){await fn();console.log('PASS:',name);}console.log(`${tests.length} Price Network tests passed`);})().catch(e=>{console.error(e);process.exitCode=1;});
