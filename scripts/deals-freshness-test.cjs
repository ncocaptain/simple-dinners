"use strict";
const { assert, fs, React, renderer, createLoader, uuid, NOW, iso, store, product, observation, mock, snapshot, content, act,
  live, render, selectStores, compare, confirmForms, close }=require('./fixtures/deals-preview-harness.cjs');
const loader=createLoader(null);const load=loader.load;
const { priceNetworkFreshness }=load('src/deals/priceNetworkFreshness.ts');
const { createSimpleDinnersPriceProvider }=load('src/deals/providers/simpleDinnersPriceProvider.ts');
const { DealsCoordinator }=load('src/deals/coordinator.ts');
const { DealsProviderRegistry }=load('src/deals/providerRegistry.ts');
const { DealsCache, MemoryDealsCacheStorage }=load('src/deals/cache.ts');
const { DealsSession }=load('src/deals/session.ts');
const { priceNetworkSessionInput, priceNetworkMembershipKey }=load('src/deals/priceNetworkPreview.ts');
const { effectivePrice }=load('src/deals/savings.ts');
const { parseProviderResult, providerPriceSchema }=load('src/deals/provider.ts');
const DAY=86400000;
const context={retailerId:'Fictional Network Market',storeId:uuid(1),channel:'in-store',currency:'USD',eligibilityKey:'public'};
function setup(rows=[observation()],products=[product()],clock={time:NOW}){
  const s=mock(undefined,products,rows);const now=()=>clock.time;const provider=createSimpleDinnersPriceProvider(s.client,now);
  const prices=(ids=[uuid(10)])=>provider.getPrices({context,productIds:ids},new AbortController().signal);
  return {s,clock,now,provider,prices};
}
const testCases=[];const test=(name,fn)=>testCases.push([name,fn]);
test('manual without explicit expiration uses seven days, including observations older than 24h',async()=>{
  const observed=NOW-3*DAY;const s=setup([observation({observed_at:iso(observed)})]);const r=await s.prices();
  assert.equal(r.items[0].price.expiresAt,observed+7*DAY);assert.equal(r.metadata.expiresAt,observed+7*DAY);assert.equal(r.items[0].price.sourceExpiresAt,undefined);
  assert.equal(priceNetworkFreshness({sourceType:'manual',observedAt:observed,expiresAt:null,saleExpiresAt:null,hasSalePrice:false},observed+7*DAY).status,'stale');
});
test('manual weekly-ad explicit expiration survives 24h and precedes its source maximum',async()=>{
  const observed=NOW-3*DAY,explicit=NOW+4*DAY;const s=setup([observation({observed_at:iso(observed),expires_at:iso(explicit)})]);const r=await s.prices();
  assert.equal(r.items[0].price.expiresAt,explicit);assert.equal(r.items[0].price.sourceExpiresAt,explicit);assert.equal(r.metadata.expiresAt,explicit);
});
test('manual explicit validity can exceed the seven-day fallback but never fourteen-day maximum',async()=>{
  for(const [days,expected]of [[10,10],[100,14]]){
    const observed=NOW-3*DAY;const s=setup([observation({observed_at:iso(observed),expires_at:iso(observed+days*DAY)})]);
    assert.equal((await s.prices()).items[0].price.expiresAt,observed+expected*DAY);
  }
});
test('receipt-confirmed, user-contributed and approved-feed fallbacks are source-specific',async()=>{
  for(const [source,days]of [['receipt-confirmed',7],['user-contributed',3],['approved-feed',1]]){
    const observed=NOW-1000;const s=setup([observation({source_type:source,observed_at:iso(observed)})]);assert.equal((await s.prices()).items[0].price.expiresAt,observed+days*DAY);
    s.clock.time=observed+days*DAY;assert.equal((await s.prices()).items.length,0);
  }
});
test('approved verified feeds may use explicit expiry beyond 24h, bounded to seven days',async()=>{
  for(const [days,expected]of [[5,5],[100,7]]){
    const s=setup([observation({source_type:'approved-feed',observed_at:iso(NOW-2*DAY),expires_at:iso(NOW-2*DAY+days*DAY)})]);assert.equal((await s.prices()).items[0].price.expiresAt,NOW-2*DAY+expected*DAY);
  }
  const s=setup([observation({source_type:'approved-feed',source_confidence:'unverified',observed_at:iso(NOW-2*DAY),expires_at:iso(NOW+DAY)})]);assert.equal((await s.prices()).items.length,0);
});
test('future and expired observations are suppressed at exact boundaries',async()=>{
  for(const o of [observation({observed_at:iso(NOW+1)}),observation({expires_at:iso(NOW)}),observation({observed_at:iso(NOW-7*DAY)}),observation({observed_at:iso(NOW-15*DAY),expires_at:iso(NOW+DAY)})]){
    assert.equal((await setup([o]).prices()).items.length,0);
  }
  assert.equal(priceNetworkFreshness({sourceType:'manual',observedAt:NOW+1,expiresAt:null,saleExpiresAt:null,hasSalePrice:false},NOW).status,'future');
});
test('malformed expiration ranges and nonfinite dates fail closed behind latest evidence',async()=>{
  const observed=NOW-1000;
  for(const patch of [{expires_at:iso(observed)},{expires_at:iso(observed-1)},{sale_expires_at:iso(observed)},{sale_expires_at:iso(observed-1)},{expires_at:'Infinity'},{sale_expires_at:'not-a-date'}]){
    const s=setup([observation(patch),observation({id:uuid(101),observed_at:iso(NOW-2000),regular_price_minor:100})]);const r=await s.prices();assert.equal(r.items.length,0);assert.equal(r.failures[0].code,'malformed-response');
  }
  for(const patch of [{observedAt:NaN},{expiresAt:Infinity},{saleExpiresAt:NaN},{expiresAt:NOW-1001}]){
    assert.equal(priceNetworkFreshness({sourceType:'manual',observedAt:observed,expiresAt:null,saleExpiresAt:null,hasSalePrice:false,...patch},NOW).status,'malformed');
  }
});
test('active sale expiry bounds usable quote and metadata separately from observation validity',async()=>{
  const s=setup([observation({observed_at:iso(NOW-2*DAY),expires_at:iso(NOW+4*DAY),sale_price_minor:199,sale_expires_at:iso(NOW+DAY)})]);
  const r=await s.prices();assert.equal(r.items[0].price.expiresAt,NOW+DAY);assert.equal(r.items[0].price.sourceExpiresAt,NOW+4*DAY);assert.equal(r.metadata.expiresAt,NOW+DAY);
  const validity=priceNetworkFreshness({sourceType:'manual',observedAt:NOW-2*DAY,expiresAt:NOW+4*DAY,saleExpiresAt:NOW+DAY,hasSalePrice:true},NOW);
  assert.equal(validity.observationExpiresAt,NOW+4*DAY);assert.equal(validity.priceExpiresAt,NOW+DAY);
});
test('expired sale falls back to regular, clears sale conditions and preserves source expiry',async()=>{
  const s=setup([observation({observed_at:iso(NOW-3*DAY),expires_at:iso(NOW+3*DAY),sale_price_minor:199,sale_expires_at:iso(NOW),conditions:[{kind:'membership',eligibility:'unknown'}]})]);
  const r=await s.prices();const price=r.items[0].price;assert.equal(price.salePrice,null);assert.equal(price.regularPrice.amountMinor,500);assert.deepEqual(price.conditions,[]);assert.equal(price.expiresAt,NOW+3*DAY);
  assert.equal(effectivePrice(price,{...context,now:NOW}).value.amountMinor,500);
});
test('expired card-only sale never invents a regular price',async()=>{
  const s=setup([observation({regular_price_minor:null,sale_price_minor:419,sale_expires_at:iso(NOW),observed_at:iso(NOW-3*DAY),expires_at:iso(NOW+DAY),conditions:[{kind:'membership',eligibility:'unknown'}]})]);
  const price=(await s.prices()).items[0].price;assert.equal(price.regularPrice,null);assert.equal(price.salePrice,null);assert.equal(effectivePrice(price,{...context,now:NOW}).reason,'missing-price');
});
test('provider metadata is the earliest usable returned quote expiry, without one-minute/day clamp',async()=>{
  const s=setup([observation({expires_at:iso(NOW+4*DAY)}),observation({id:uuid(101),product_id:uuid(11),expires_at:iso(NOW+2*DAY)})],[product(),product(11)]);
  const r=await s.prices([uuid(10),uuid(11)]);assert.equal(r.metadata.expiresAt,NOW+2*DAY);assert.ok(r.items.every(i=>r.metadata.expiresAt<=i.price.expiresAt));assert.ok(r.metadata.expiresAt>NOW+DAY);
  const invalid={...r,items:r.items.map(i=>({...i,price:{...i.price,sourceExpiresAt:NOW+1000}}))};assert.ok(parseProviderResult(invalid,providerPriceSchema,s.provider.identity).failures.length>0);
});
function sessionSetup(s,member='unknown',cache){
  const snap=snapshot();const stores=[store()];const input=priceNetworkSessionInput(snap,stores,[uuid(1)],{'need-0':{productFormKey:'raw-chicken-breast',requirementBasis:'net'}},{[priceNetworkMembershipKey(stores[0])]:member});
  const coordinator=new DealsCoordinator(new DealsProviderRegistry([s.provider]),cache,s.now);const session=new DealsSession(coordinator,s.now);session.setInput(input);return {session,coordinator,input};
}
test('weekly-ad price works through session/coordinator and still obeys membership preferences',async()=>{
  for(const [member,priced]of [['eligible',1],['unknown',0],['ineligible',0]]){
    const s=setup([observation({observed_at:iso(NOW-3*DAY),expires_at:iso(NOW+4*DAY),regular_price_minor:null,sale_price_minor:419,conditions:[{kind:'membership',eligibility:'unknown'}]})]);
    const {session}=sessionSetup(s,member);await session.refresh(false);const r=session.getState().result;assert.equal(r.basket.stores[0].pricedItemCount,priced);
    if(priced){assert.equal(r.basket.stores[0].merchandiseSubtotal.amountMinor,419);assert.equal(r.basket.cheapestCompleteStores.length,1);}else assert.equal(r.basket.cheapestCompleteStores.length,0);
  }
});
test('multi-day source can be cached briefly and cache hits never renew source or copy freshness',async()=>{
  const explicit=NOW+20000;const s=setup([observation({observed_at:iso(NOW-3*DAY),expires_at:iso(explicit)})]);const cache=new DealsCache(new MemoryDealsCacheStorage(),s.now);
  const {session,coordinator,input}=sessionSetup(s,'unknown',cache);await session.refresh(false);assert.equal(session.getState().result.expiresAt,explicit);const requests=s.s.requests.length;
  s.clock.time+=10000;const cached=await coordinator.run(input);assert.equal(s.s.requests.length,requests);assert.equal(cached.offers[0].price.expiresAt,explicit);assert.equal(cached.expiresAt,explicit);
  s.clock.time=explicit;const expired=await coordinator.run(input);assert.equal(expired.offers.length,0);assert.equal(expired.basket.cheapestCompleteStores.length,0);assert.ok(s.s.requests.length>requests);
});
test('cache/availability TTL stays short even when a source remains valid for days',async()=>{
  const s=setup([observation({observed_at:iso(NOW-3*DAY),expires_at:iso(NOW+4*DAY)})]);const cache=new DealsCache(undefined,s.now,{availability:1000});const {coordinator,input}=sessionSetup(s,'unknown',cache);
  const first=await coordinator.run(input);assert.equal(first.expiresAt,NOW+1000);assert.equal(first.offers[0].price.expiresAt,NOW+4*DAY);const requests=s.s.requests.length;
  s.clock.time+=500;const second=await coordinator.run(input);assert.equal(s.s.requests.length,requests);assert.equal(second.expiresAt,NOW+1000);
  s.clock.time=NOW+1000;await coordinator.run(input);assert.ok(s.s.requests.length>requests);
});
test('UI displays explicit validity only when it governs the current price; no fallback dates',async()=>{
  for(const [patch,show]of [[{observed_at:iso(NOW-3*DAY),expires_at:iso(NOW+4*DAY)},true],[{expires_at:null},false],[{expires_at:iso(NOW+100*DAY)},false],[{expires_at:iso(NOW+3*DAY),sale_price_minor:199,sale_expires_at:iso(NOW+DAY)},false]]){
    const s=setup([observation(patch)]);const h=await live(await render(s.s));try{await selectStores(h);await compare(h);await confirmForms(h);await compare(h);
      assert.match(content(h.root),/Recent observed price/);assert.match(content(h.root),/Observed/);assert.match(content(h.root),/Source.*manual/);
      if(show)assert.match(content(h.root),/Valid through/);else assert.doesNotMatch(content(h.root),/Valid through/);
    }finally{await close(h);}
  }
});
test('production guard remains isolated and freshness never queries or mutates Supabase directly',async()=>{
  const h=await render(mock(),snapshot(),false);try{assert.match(content(h.root),/Shopping List destination/);assert.equal(h.s.requests.length,0);assert.ok(!h.loader.loaded.some(f=>f.includes('PriceNetworkWorkspace')));}finally{await close(h);}
  assert.doesNotMatch(fs.readFileSync('src/deals/priceNetworkFreshness.ts','utf8'),/Food City|\.from\(|fetch\(|localStorage|sessionStorage/);
});
(async()=>{for(const[name,fn]of testCases){await fn();console.log('PASS:',name);}console.log(`${testCases.length} Phase 5D freshness scenarios passed`);})().catch(error=>{console.error(error);process.exitCode=1;});
