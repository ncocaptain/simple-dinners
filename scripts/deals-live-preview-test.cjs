"use strict";
const { assert, fs, React, renderer, storage, createLoader, uuid, NOW, iso, store, product, observation, mock, snapshot, content, act, render, live, selectStores, compare, confirmForms, close } = require("./fixtures/deals-preview-harness.cjs");
const tests=[];const test=(name,fn)=>tests.push([name,fn]);
test('DEV selector renders; synthetic mode unchanged and makes no Supabase calls',async()=>{
  const h=await render();assert.match(content(h.root),/Synthetic Preview/);assert.match(content(h.root),/Simple Dinners Price Network/);assert.match(content(h.root),/Sample product:/);assert.match(content(h.root),/Lowest estimated subtotal among selected sample stores/);assert.equal(h.s.requests.length,0);
  assert.ok(!h.loader.loaded.some(f=>f.endsWith('PriceNetworkWorkspace.tsx')));await close(h);
});
test('production guard redirects without loading or instantiating network preview',async()=>{
  const h=await render(mock(),snapshot(),false);assert.match(content(h.root),/Shopping List destination/);assert.equal(h.s.requests.length,0);assert.ok(!h.loader.loaded.some(f=>f.endsWith('PriceNetworkWorkspace.tsx')));await close(h);
  const app=fs.readFileSync('src/App.tsx','utf8');assert.match(app,/path="\/shopping-deals"[\s\S]*?import\.meta\.env\.DEV[\s\S]*?<Navigate to="\/shopping-list" replace/);
  const list=fs.readFileSync('src/pages/ShoppingListPage.tsx','utf8');assert.match(list,/if \(!import\.meta\.env\.DEV\) return/);assert.match(list,/import\.meta\.env\.DEV &&[\s\S]*?openDealsPreview/);
});
test('only active stores load, with retailer, store number and city/state',async()=>{
  const h=await live(await render(mock([store(),store(2,{active:false})])));assert.match(content(h.root),/Fictional Network Market.*Store 1.*Example City, NY/);assert.doesNotMatch(content(h.root),/Store 2/);assert.equal(h.root.root.findAllByType('input').length,1);
  assert.ok(h.s.requests[0].operations.some(op=>op[1]==='active'&&op[2]===true));assert.doesNotMatch(content(h.root),/Sample product:|synthetic; these are not real offers/);await close(h);
});
test('empty store list, store failure and unconfigured connection are safe',async()=>{
  for(const [s,expected]of [[mock([]),/No Price Network stores have been added yet/],[mock(undefined,undefined,undefined,{error:true}),/stores are unavailable/]]){const h=await live(await render(s));assert.match(content(h.root),expected);assert.equal(h.s.requests.filter(r=>r.table==='price_network_observations').length,0);await close(h);}
  const loader=createLoader(null);const Workspace=loader.load('src/components/deals/PriceNetworkWorkspace.tsx').default;let root;await act(()=>{root=renderer.create(React.createElement(Workspace,{snapshot:snapshot()}));});assert.match(content(root),/not configured/);await act(()=>root.unmount());
});
test('store without products reports no reliable match and no synthetic fallback',async()=>{
  const h=await live(await render(mock(undefined,[])));await selectStores(h);await compare(h);assert.match(content(h.root),/No reliable match/);assert.match(content(h.root),/Price unavailable/);assert.doesNotMatch(content(h.root),/Sample product:|Lowest estimated subtotal/);await close(h);
});
test('real provider/coordinator/session renders recent observation and provenance after explicit form confirmation',async()=>{
  const h=await live(await render());await selectStores(h);await compare(h);
  assert.ok(h.loader.loaded.some(f=>f.endsWith('/useDealsSession.ts')));assert.ok(h.loader.loaded.some(f=>f.endsWith('/coordinator.ts')));assert.ok(h.loader.loaded.some(f=>f.endsWith('/providers/simpleDinnersPriceProvider.ts')));
  assert.match(content(h.root),/Review before comparing costs/);assert.doesNotMatch(content(h.root),/Lowest estimated subtotal among selected stores/);
  await confirmForms(h);await compare(h);assert.match(content(h.root),/Recent observed price.*\$5\.00/);assert.match(content(h.root),/Observed.*2026/);assert.match(content(h.root),/Source.*manual/);assert.match(content(h.root),/Lowest estimated subtotal among selected stores/);await close(h);
});
test('no observation, stale observation and missing price remain distinct',async()=>{
  for(const [obs,expected]of [[[],/No observation has been recorded/],[[observation({observed_at:iso(NOW-86400001)})],/Stale\/unavailable observation/],[[observation({regular_price_minor:null})],/Price unavailable/]]){
    const h=await live(await render(mock(undefined,undefined,obs)));await selectStores(h);await compare(h);if(h.root.root.findAllByType('select').some(s=>s.props['aria-label']?.startsWith('Confirm product form'))){await confirmForms(h);await compare(h);}
    assert.match(content(h.root),expected);assert.doesNotMatch(content(h.root),/\$5\.00|Lowest estimated subtotal among selected stores/);await close(h);
  }
});
test('expired sale falls back to regular; valid sale displays only recent prices',async()=>{
  for(const [expiry,saleVisible]of [[NOW-1,false],[NOW+60000,true]]){
    const h=await live(await render(mock(undefined,undefined,[observation({sale_price_minor:100,sale_expires_at:iso(expiry)})])));await selectStores(h);await compare(h);await confirmForms(h);await compare(h);
    assert.match(content(h.root),/Regular.*\$5\.00/);if(saleVisible)assert.match(content(h.root),/Sale.*\$1\.00/);else assert.doesNotMatch(content(h.root),/\$1\.00/);await close(h);
  }
});
test('partial store coverage cannot win; complete coverage uses Phase 2 winner',async()=>{
  const rice=product(11,{canonical_ingredient_id:'rice',grocery_search_name:'rice',product_form_key:'dry-rice'});
  const obs=[observation(),observation({id:uuid(101),store_id:uuid(2),regular_price_minor:600}),observation({id:uuid(102),product_id:uuid(11),regular_price_minor:300}),observation({id:uuid(103),product_id:uuid(11),store_id:uuid(2),regular_price_minor:400})];
  const s=mock([store(),store(2)],[product(),rice],obs.slice(0,3));const h=await live(await render(s,snapshot(['chicken breast','rice'])));await selectStores(h);await compare(h);await confirmForms(h);await compare(h);
  assert.match(content(h.root),/Priced 1 of 2/);assert.match(content(h.root),/No cheapest-store claim/);assert.doesNotMatch(content(h.root),/Lowest estimated subtotal among selected stores/);
  s.tables.price_network_observations.push(obs[3]);await compare(h);assert.match(content(h.root),/Lowest estimated subtotal among selected stores/);assert.match(content(h.root),/\$8\.00/);await close(h);
});
test('mode switch cancels pending work and never leaks live results into fixtures',async()=>{
  let release;const gate=new Promise(resolve=>release=resolve);const s=mock(undefined,undefined,undefined,{wait:req=>req.table==='price_network_products'?gate:Promise.resolve()});
  const h=await live(await render(s));await selectStores(h);await compare(h);
  await act(()=>h.root.root.findAllByType('select').find(s=>s.props['aria-label']==='Preview data source').props.onChange({target:{value:'synthetic'}}));release();await act(()=>Promise.resolve());
  assert.match(content(h.root),/Sample product:/);assert.doesNotMatch(content(h.root),/Fictional Network Market|Source.*manual/);assert.ok(s.requests.some(r=>r.signal?.aborted));await close(h);
});
test('expiry timer removes rendered winners and prices without background requests',async()=>{
  const originalSet=global.setTimeout,originalClear=global.clearTimeout;const timers=new Map();
  global.setTimeout=(fn)=>{const id={};timers.set(id,fn);return id;};global.clearTimeout=id=>timers.delete(id);
  let h;
  try {
    const s=mock();const loader=createLoader(s.client);const Workspace=loader.load('src/components/deals/PriceNetworkWorkspace.tsx').default;
    let clock=NOW;const now=()=>clock;const snap=snapshot();let root;await act(()=>{root=renderer.create(React.createElement(Workspace,{snapshot:snap,client:s.client,now}));});h={root,s};
    await selectStores(h);await compare(h);await confirmForms(h);await compare(h);assert.match(content(root),/Lowest estimated subtotal among selected stores/);const requests=s.requests.length;
    assert.equal(timers.size,1);clock+=60001;await act(()=>{for(const callback of [...timers.values()])callback();});
    assert.match(content(root),/results are stale\/unavailable/);assert.doesNotMatch(content(root),/\$5\.00|Lowest estimated subtotal among selected stores/);assert.equal(s.requests.length,requests);
  } finally {if(h)await close(h);global.setTimeout=originalSet;global.clearTimeout=originalClear;}
});
test('navigation leaves Phase 1 snapshot and Shopping List storage unchanged',async()=>{
  const snap=snapshot();const before=JSON.stringify(snap);const h=await live(await render(mock(),snap));await selectStores(h);await compare(h);await confirmForms(h);await compare(h);
  const back=h.root.root.findAllByType('a').find(a=>a.props.href==='/shopping-list');await act(()=>back.props.onClick({button:0,preventDefault(){},defaultPrevented:false}));assert.match(content(h.root),/Shopping List destination/);assert.equal(JSON.stringify(snap),before);assert.equal(storage.size,0);
  const queries=JSON.stringify(h.s.requests,(k,v)=>k==='signal'?undefined:v);assert.ok(!queries.includes('20 oz chicken breast'));assert.ok(!queries.includes(JSON.stringify(snap)));await close(h);
});
test('network path is read-only, no new credentials, no direct observation queries in UI',()=>{
  for(const file of ['src/components/deals/PriceNetworkWorkspace.tsx','src/deals/priceNetworkPreview.ts','src/pages/ShoppingDealsPage.tsx','src/deals/providers/simpleDinnersPriceProvider.ts']){
    const source=fs.readFileSync(file,'utf8');assert.doesNotMatch(source,/\.(insert|update|delete|upsert|rpc)\s*\(|service_role|sb_secret_|SUPABASE_.*KEY/);
    if(file.includes('Workspace')||file.includes('Page'))assert.doesNotMatch(source,/\.from\s*\(|price_network_observations/);
  }
  const workspace=fs.readFileSync('src/components/deals/PriceNetworkWorkspace.tsx','utf8');assert.match(workspace,/useDealsSession/);assert.match(workspace,/\.\.\/\.\.\/lib\/supabase/);assert.doesNotMatch(workspace,/buildFixturePreview|FIXTURE_NOW|FIXTURE_STORES/);
});
(async()=>{for(const[name,fn]of tests){await fn();console.log('PASS:',name);}console.log(`${tests.length} Phase 5B live preview scenarios passed`);})().catch(error=>{console.error(error);process.exitCode=1;});
