"use strict";
const { assert, fs, storage, createLoader, uuid, NOW, iso, store, product, observation, mock, snapshot,
  content, act, render, live, selectStores, compare, confirmForms, close } = require('./fixtures/deals-preview-harness.cjs');
const loader=createLoader(null);const load=loader.load;
const { resolveMembershipConditions }=load('src/deals/membership.ts');
const { effectivePrice, calculateSaleSavings, compareNeedPrices }=load('src/deals/savings.ts');
const { DealsCoordinator }=load('src/deals/coordinator.ts');
const { DealsProviderRegistry }=load('src/deals/providerRegistry.ts');
const { DealsSession }=load('src/deals/session.ts');
const { DealsCache, dealsCacheKey }=load('src/deals/cache.ts');
const { createSimpleDinnersPriceProvider }=load('src/deals/providers/simpleDinnersPriceProvider.ts');
const { createFakeDealsProvider }=load('src/deals/testing/fakeProvider.ts');
const { priceNetworkSessionInput, priceNetworkMembershipKey }=load('src/deals/priceNetworkPreview.ts');
const { createDealsRouteSnapshot }=load('src/deals/fixturePreview.ts');
const fixture=require('./fixtures/deals-comparison.cjs');
const clockContext={retailerId:'Fictional Card Market',storeId:uuid(1),currency:'USD',channel:'in-store',now:NOW};
const cardPrice={...fixture.offers[0].price,...clockContext,productId:'milk',regularPrice:null,salePrice:{amountMinor:419,currency:'USD'},
  conditions:[{kind:'membership',eligibility:'unknown'}],observedAt:NOW-1000,expiresAt:NOW+60000};
function freeze(value){if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
freeze(cardPrice);
function pilotSnapshot(){
  const rawItems=[{id:'milk',text:'milk',normalizedName:'milk',grocerySearchName:'milk',quantity:1000,unit:'ml',recipeIngredientText:'1000 ml milk'},
    {id:'eggs',text:'eggs',normalizedName:'eggs',grocerySearchName:'eggs',quantity:12,unit:'each',recipeIngredientText:'12 eggs'}]
    .map(r=>({...r,checked:false,addedAt:1,category:'Other'}));
  return createDealsRouteSnapshot({rawItems,combinedRows:rawItems.map(r=>({id:r.id,sourceIds:[r.id],checked:false,pantryCoverage:'none',pantryKey:r.id,pantryRestock:false})),pantryBuyAnywayIds:new Set()});
}
function pilot(options={}){
  // Synthetic milk/egg-style card-only examples. No production rows or keys.
  const stores=options.stores??[store(1,{retailer_name:'Fictional Card Market'})];
  const products=[product(10,{canonical_ingredient_id:'milk',grocery_search_name:'milk',product_form_key:'whole-milk',package_quantity:3785,package_unit:'ml'}),
    product(11,{canonical_ingredient_id:'egg',grocery_search_name:'eggs',product_form_key:'large-eggs',content_basis:'count',package_quantity:12,package_unit:'each'})];
  const observations=stores.flatMap((s,i)=>[observation({id:uuid(100+i*2),store_id:s.id,regular_price_minor:null,sale_price_minor:419,conditions:[{kind:'membership',eligibility:'unknown'}]}),
    observation({id:uuid(101+i*2),store_id:s.id,product_id:uuid(11),regular_price_minor:null,sale_price_minor:199,conditions:[{kind:'membership',eligibility:'unknown'}]})]);
  if(options.observations)observations.splice(0,observations.length,...options.observations);
  const s=mock(stores,products,observations);const snap=pilotSnapshot();
  const basis=Object.fromEntries(snap.needs.map(n=>[n.id,{productFormKey:n.identity.canonicalIngredientId==='milk'?'whole-milk':'large-eggs',requirementBasis:n.identity.canonicalIngredientId==='milk'?'net':'count'}]));
  const now=()=>NOW;const provider=createSimpleDinnersPriceProvider(s.client,now);
  const coordinator=new DealsCoordinator(new DealsProviderRegistry([provider]),undefined,now);
  const session=new DealsSession(coordinator,now);
  const input=(memberships={})=>priceNetworkSessionInput(snap,stores,stores.map(s=>s.id),basis,memberships);
  async function run(memberships={}){session.setInput(input(memberships));await session.refresh();return session.getState().result;}
  return {s,snap,stores,basis,provider,coordinator,session,input,run};
}
const memberMap=(stores,state)=>Object.fromEntries(stores.map(s=>[priceNetworkMembershipKey(s),state]));
const tests=[];const test=(name,fn)=>tests.push([name,fn]);
test('membership defaults to unknown, never inferred from store selection',async()=>{
  const p=pilot();const input=p.input();assert.ok(input.selections.every(s=>s.membershipEligibility==='unknown'));
  const r=await p.run();assert.ok(r.comparisons.every(c=>c.result.offers.every(o=>o.packagePrice.reason==='unresolved-condition')));assert.equal(r.basket.cheapestCompleteStores.length,0);
  assert.equal(effectivePrice(resolveMembershipConditions(cardPrice),clockContext).reason,'unresolved-condition');
});
test('eligible resolves card conditions for effective/package/requirement/basket costs',async()=>{
  const resolved=resolveMembershipConditions(cardPrice,'eligible');assert.equal(resolved.conditions[0].eligibility,'eligible');assert.equal(effectivePrice(resolved,clockContext).value.amountMinor,419);
  const p=pilot();const r=await p.run(memberMap(p.stores,'eligible'));assert.equal(r.basket.stores[0].merchandiseSubtotal.amountMinor,618);assert.equal(r.basket.cheapestCompleteStores.length,1);
  assert.deepEqual(r.comparisons.map(c=>c.result.offers[0].packagePrice.value.amountMinor).sort(),[199,419]);assert.ok(r.comparisons.every(c=>c.result.offers[0].requirementCost.value));
});
test('ineligible card-only prices suppressed and unknown stays unresolved',async()=>{
  for(const [state,reason]of [['ineligible','ineligible-condition'],['unknown','unresolved-condition']]){
    assert.equal(effectivePrice(resolveMembershipConditions(cardPrice,state),clockContext).reason,reason);
    const p=pilot();const r=await p.run(memberMap(p.stores,state));assert.ok(r.comparisons.every(c=>c.result.offers[0].packagePrice.reason===reason));assert.equal(r.basket.stores[0].pricedItemCount,0);assert.equal(r.basket.stores[0].merchandiseSubtotal,null);
  }
});
test('unknown regular price remains null and produces no fake savings',async()=>{
  const resolved=resolveMembershipConditions(cardPrice,'eligible');assert.equal(resolved.regularPrice,null);assert.equal(calculateSaleSavings(resolved,clockContext).reason,'missing-regular-price');
  const p=pilot();const before=JSON.stringify(p.s.tables);const r=await p.run(memberMap(p.stores,'eligible'));
  assert.ok(r.offers.every(o=>o.price.regularPrice===null&&calculateSaleSavings(o.price,{...clockContext,now:NOW}).value===null));assert.equal(JSON.stringify(p.s.tables),before);
  assert.deepEqual(cardPrice.conditions,[{kind:'membership',eligibility:'unknown'}]);
  const queries=JSON.stringify(p.s.requests,(k,v)=>k==='signal'?undefined:v);assert.ok(!queries.includes('membershipEligibility'));
});
test('membership cannot resolve coupon, quantity or unsupported promotion conditions',()=>{
  for(const [extra,reason]of [[{kind:'coupon',eligibility:'unknown'},'unresolved-condition'],[{kind:'coupon',eligibility:'ineligible'},'ineligible-condition'],[{kind:'minimum-quantity',packages:2},'minimum-quantity'],[{kind:'unsupported-promotion',description:'Unknown offer'},'unsupported-promotion']]){
    const raw=freeze({...cardPrice,conditions:[...cardPrice.conditions,extra]});const resolved=resolveMembershipConditions(raw,'eligible');assert.deepEqual(resolved.conditions[1],extra);assert.equal(effectivePrice(resolved,clockContext).reason,reason);
  }
});
test('membership does not bypass stale prices, availability, currency or expired sale rules',async()=>{
  assert.equal(effectivePrice(resolveMembershipConditions({...cardPrice,expiresAt:NOW-1},'eligible'),clockContext).reason,'stale-price');
  assert.equal(effectivePrice(resolveMembershipConditions({...cardPrice,availability:'out-of-stock'},'eligible'),clockContext).reason,'unavailable');
  assert.equal(effectivePrice(resolveMembershipConditions(cardPrice,'eligible'),{...clockContext,currency:'CAD'}).reason,'currency-mismatch');
  const p=pilot();p.s.tables.price_network_observations[0].observed_at=iso(NOW-86400001);p.s.tables.price_network_observations[1].sale_expires_at=iso(NOW-1);
  const r=await p.run(memberMap(p.stores,'eligible'));assert.equal(r.basket.stores[0].pricedItemCount,0);assert.ok(r.offers.every(o=>o.price.salePrice===null));assert.equal(r.basket.cheapestCompleteStores.length,0);
});
test('membership cannot bypass product mismatch, unknown size, basis or dimensions',()=>{
  const target={need:snapshot().needs[0],productFormKey:'raw-chicken-breast',requirementBasis:'net'};
  const offer={...fixture.offers[0],price:resolveMembershipConditions({...cardPrice,productId:fixture.offers[0].productId},'eligible')};
  for(const [change,reason]of [[{productFormKey:'cooked-chicken'},'product-mismatch'],[{compatibility:'unverified'},'unverified-product'],[{packageSize:{kind:'single',basis:'drained',size:{quantity:12,unit:'oz'}}},'basis-mismatch'],[{packageSize:{kind:'single',basis:'net',size:null}},'unknown-package'],[{packageSize:{kind:'single',basis:'net',size:{quantity:500,unit:'ml'}}},'dimension-mismatch']]){
    const comparison=compareNeedPrices(target,[{...offer,...change}],clockContext).offers[0];assert.equal(comparison.requirementCost.reason,reason);assert.equal(comparison.unitPrice.value,null);
  }
});
test('preferences are isolated between retailers AND individual stores of one retailer',async()=>{
  const stores=[store(1,{retailer_name:'Fictional A'}),store(2,{retailer_name:'Fictional B'}),store(3,{retailer_name:'Fictional A'})];const p=pilot({stores});
  const r=await p.run({[priceNetworkMembershipKey(stores[0])]:'eligible'});
  assert.deepEqual(r.basket.stores.map(s=>s.pricedItemCount),[2,0,0]);assert.equal(r.basket.cheapestCompleteStores.length,0);
  assert.equal(new Set(stores.map(priceNetworkMembershipKey)).size,3);
});
test('non-membership prices remain identical for all preference states',()=>{
  const ordinary={...cardPrice,regularPrice:{amountMinor:300,currency:'USD'},salePrice:null,conditions:[]};
  for(const state of ['eligible','ineligible','unknown'])assert.deepEqual(resolveMembershipConditions(ordinary,state),ordinary);
});
test('ground beef with unknown weight keeps its unit rate but cannot price a package/basket',async()=>{
  // Generic variable-weight safeguards are identical for beef or any other product.
  const { buildShoppingPurchaseSnapshot }=load('src/deals/shoppingSnapshot.ts');
  const raw=[{id:'beef',text:'ground beef',normalizedName:'ground beef',grocerySearchName:'ground beef',recipeIngredientText:'1 lb ground beef',quantity:1,unit:'lb',checked:false,addedAt:1,category:'Meat'}];
  const snap=buildShoppingPurchaseSnapshot({rawItems:raw,combinedRows:[{id:'beef',sourceIds:['beef'],checked:false,pantryCoverage:'none',pantryKey:'beef',pantryRestock:false}],pantryBuyAnywayIds:new Set()});
  const target={need:snap.needs[0],productFormKey:'raw-ground-beef',requirementBasis:'net'};
  const offer={id:'beef',needId:target.need.id,productId:'beef',productFormKey:'raw-ground-beef',compatibility:'verified',packageSize:{kind:'variable-weight',basis:'net'},price:{...cardPrice,productId:'beef',regularPrice:{amountMinor:499,currency:'USD'},salePrice:null,conditions:[],sellingBasis:{kind:'measure',measure:{quantity:1,unit:'lb'}}}};
  for(const eligibility of ['eligible','unknown','ineligible']){
    const result=compareNeedPrices(target,[{...offer,price:resolveMembershipConditions(offer.price,eligibility)}],clockContext).offers[0];assert.equal(result.packagePrice.reason,'variable-weight');assert.equal(result.requirementCost.reason,'variable-weight');assert.equal(result.unitPrice.value.money.amountMinor,499);
  }
});
test('generic provider receives context, raw private cache stays unresolved, keys isolate preferences',async()=>{
  const now=()=>NOW;const fake=createFakeDealsProvider({now});const base=fake.provider.getPrices.bind(fake.provider);const contexts=[];const rows=[];
  const provider={...fake.provider,getPrices:async(request,signal)=>{contexts.push(request.context);const r=await base(request,signal);for(const item of r.items){item.price.regularPrice=null;item.price.salePrice={amountMinor:419,currency:'USD'};item.price.conditions=[{kind:'membership',eligibility:'unknown'}];}rows.push(structuredClone(r));return r;}};
  const map=new Map();const backing={get:k=>structuredClone(map.get(k)),set:(k,v)=>map.set(k,structuredClone(v)),delete:k=>map.delete(k),clear:()=>map.clear()};
  const coordinator=new DealsCoordinator(new DealsProviderRegistry([provider]),new DealsCache(backing,now),now);const session=new DealsSession(coordinator,now);
  const route=snapshot();const initial=priceNetworkSessionInput(route,[store()],[uuid(1)],{'need-0':{productFormKey:'chicken-breast',requirementBasis:'net'}});
  const make=state=>({...initial,selections:initial.selections.map(s=>({...s,providerId:provider.identity.id,environment:'test',membershipEligibility:state})),cacheAccess:{visibility:'private',ownerKey:'test-session',personalized:false}});
  session.setInput(make('eligible'));await session.refresh(false);assert.equal(session.getState().result.basket.stores[0].merchandiseSubtotal.amountMinor,419);assert.ok(contexts.every(c=>c.membershipEligibility==='eligible'));
  assert.ok([...map.values()].some(v=>v.data?.items?.some(i=>i.price?.conditions?.[0]?.eligibility==='unknown')));
  session.setInput(make('unknown'));assert.equal(session.getState().result,null);await session.refresh(false);assert.equal(session.getState().result.basket.stores[0].pricedItemCount,0);
  const requests=fake.requests.length;session.setInput(make('eligible'));await session.refresh(false);assert.equal(fake.requests.length,requests);assert.equal(session.getState().result.basket.stores[0].merchandiseSubtotal.amountMinor,419);
  assert.ok(rows.every(r=>r.items.every(i=>i.price.conditions[0].eligibility==='unknown')));
  const ctx={...make('eligible').selections[0],query:{searchName:'chicken breast',canonicalIngredientId:'chicken-breast',productConstraints:[]},productIds:[],storeSearch:null,pageCursor:null,...initial.cacheAccess};
  assert.notEqual(dealsCacheKey('negative',ctx),dealsCacheKey('negative',{...ctx,membershipEligibility:'unknown'}));
});
async function chooseMembership(h,value,index=0){await act(()=>h.root.root.findAllByType('select').filter(s=>s.props['aria-label']?.startsWith('Store card / membership'))[index].props.onChange({target:{value}}));}
test('DEV milk/egg-style UI labels eligible card prices, no invented regular price or savings',async()=>{
  const p=pilot();const h=await live(await render(p.s,p.snap));try{await selectStores(h);
    const controls=h.root.root.findAllByType('select').filter(s=>s.props['aria-label']?.startsWith('Store card / membership'));assert.equal(controls[0].props.value,'unknown');assert.match(controls[0].props['aria-label'],/Fictional Card Market.*Store 1/);
    await compare(h);await confirmForms(h);await compare(h);assert.doesNotMatch(content(h.root),/\$4\.19|\$1\.99|With store card/);
    await chooseMembership(h,'eligible');assert.doesNotMatch(content(h.root),/Lowest estimated subtotal among selected stores/);await compare(h);assert.match(content(h.root),/\$4\.19/);assert.match(content(h.root),/\$1\.99/);assert.match(content(h.root),/With store card/);assert.match(content(h.root),/\$6\.18/);assert.doesNotMatch(content(h.root),/Regular.*\$|Save \$|Savings.*\$/);
    await chooseMembership(h,'ineligible');await compare(h);assert.match(content(h.root),/Recent observed price.*Price unavailable/);assert.doesNotMatch(content(h.root),/\$4\.19|\$1\.99|With store card|Lowest estimated subtotal among selected stores/);
  }finally{await close(h);}
});
test('membership resets on session recreation and never writes browser storage',async()=>{
  const p=pilot();const h=await live(await render(p.s,p.snap));try{await selectStores(h);await chooseMembership(h,'eligible');assert.equal(storage.size,0);
    await act(()=>h.root.root.findAllByType('select').find(s=>s.props['aria-label']==='Preview data source').props.onChange({target:{value:'synthetic'}}));await live(h);await selectStores(h);
    assert.equal(h.root.root.findAllByType('select').find(s=>s.props['aria-label']?.startsWith('Store card / membership')).props.value,'unknown');assert.equal(storage.size,0);
  }finally{await close(h);}
});
test('production guard excludes membership UI and source stays generic/read-only',async()=>{
  const h=await render(mock(),snapshot(),false);try{assert.match(content(h.root),/Shopping List destination/);assert.doesNotMatch(content(h.root),/Store card \/ membership/);assert.equal(h.s.requests.length,0);}finally{await close(h);}
  for(const file of ['src/deals/membership.ts','src/deals/coordinator.ts','src/deals/priceNetworkPreview.ts','src/components/deals/PriceNetworkWorkspace.tsx']){
    const source=fs.readFileSync(file,'utf8');assert.doesNotMatch(source,/Food City|Food Club|localStorage|sessionStorage|\.(insert|update|upsert|rpc)\s*\(|service_role|sb_secret_/);
  }
});
(async()=>{for(const[name,fn]of tests){await fn();console.log('PASS:',name);}console.log(`${tests.length} Phase 5C membership scenarios passed`);})().catch(error=>{console.error(error);process.exitCode=1;});
