"use strict";
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const renderer = require('react-test-renderer');
const { MemoryRouter, Routes, Route } = require('react-router-dom');
const storage = new Map();
global.localStorage = { getItem: k => storage.get(k) ?? null, setItem: (k,v) => storage.set(k,v) };
function createLoader(client, dev=true) {
  const modules=new Map(), loaded=[];
  function load(file) {
    const filename=path.resolve(file); if(modules.has(filename))return modules.get(filename).exports;
    loaded.push(filename);const mod={exports:{}};modules.set(filename,mod);
    if(filename.endsWith('/lib/supabase.ts')) {mod.exports={supabase:client};return mod.exports;}
    const output=ts.transpileModule(fs.readFileSync(filename,'utf8').replaceAll('import.meta.env.DEV',String(dev)),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
    new Function('require','module','exports',output)(name=>{
      if(['react','react/jsx-runtime','react-router-dom','zod'].includes(name))return require(name);
      assert.ok(name.startsWith('.'),`Unexpected dependency: ${name}`);if(name.endsWith('.css'))return {};
      const target=path.resolve(path.dirname(filename),name.replace(/\.js$/,''));
      return load([target+'.ts',target+'.tsx',path.join(target,'index.ts')].find(fs.existsSync));
    },mod,mod.exports);return mod.exports;
  }
  return {load,loaded};
}
const uuid=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const NOW=Date.now();const iso=n=>new Date(n).toISOString();
const store=(n=1,more={})=>({id:uuid(n),retailer_name:'Fictional Network Market',store_name:`Store ${n}`,store_number:String(n),city:'Example City',state:'NY',active:true,...more});
const product=(n=10,more={})=>({id:uuid(n),normalized_name:'Fictional chicken',canonical_ingredient_id:'chicken-breast',grocery_search_name:'chicken breast',product_form_key:'raw-chicken-breast',form_verified:true,package_kind:'single',content_basis:'net',package_quantity:24,package_unit:'oz',pack_count:null,...more});
const observation=(more={})=>({id:uuid(100),product_id:uuid(10),store_id:uuid(1),regular_price_minor:500,sale_price_minor:null,currency:'USD',channel:'in-store',selling_basis:'package',selling_quantity:null,selling_unit:null,observed_at:iso(NOW-1000),expires_at:null,sale_expires_at:null,availability:'in-stock',conditions:[],source_type:'manual',source_confidence:'verified',...more});
function mock(stores=[store()],products=[product()],observations=[observation()],options={}) {
  const tables={price_network_stores:stores,price_network_products:products,price_network_observations:observations};const requests=[];
  const client={from(table){const req={table,operations:[]};requests.push(req);let rows=[...tables[table]],orders=[];
    const b={select(columns){req.columns=columns;return this;},eq(k,v){req.operations.push(['eq',k,v]);rows=rows.filter(r=>r[k]===v);return this;},
      gte(k,v){req.operations.push(['gte',k,v]);rows=rows.filter(r=>r[k]>=v);return this;},lte(k,v){req.operations.push(['lte',k,v]);rows=rows.filter(r=>r[k]<=v);return this;},
      order(k,opts={}){orders.push([k,opts.ascending!==false]);return this;},limit(n){req.limit=n;return this;},abortSignal(s){req.signal=s;return this;},
      then(resolve,reject){rows.sort((a,b)=>{for(const [k,asc]of orders){if(a[k]!==b[k])return(a[k]<b[k]?-1:1)*(asc?1:-1);}return 0;});
        const response=()=>({data:rows.slice(0,req.limit),error:options.error?{}:null});
        return (options.wait?options.wait(req):Promise.resolve()).then(response).then(resolve,reject);}};return b;}};
  return {client,requests,tables};
}
const baseLoader=createLoader(null);
const fixtures=baseLoader.load('src/deals/fixturePreview.ts');
function snapshot(names=['chicken breast']) {
  const rawItems=names.map((name,i)=>({id:`item-${i}`,text:name,normalizedName:name,grocerySearchName:name,checked:false,addedAt:1,category:'Other',quantity:20,unit:'oz',recipeIngredientText:`20 oz ${name}`}));
  return fixtures.createDealsRouteSnapshot({rawItems,combinedRows:rawItems.map(r=>({id:r.id,sourceIds:[r.id],checked:false,pantryCoverage:'none',pantryKey:r.id,pantryRestock:false})),pantryBuyAnywayIds:new Set()});
}
const content=root=>{const collect=node=>typeof node==='string'?node:node?(node.children||[]).map(collect).join(' '):'';const json=root.toJSON();return Array.isArray(json)?json.map(collect).join(' '):collect(json);};
async function act(fn){await renderer.act(async()=>{await fn();for(let i=0;i<50;i++)await Promise.resolve();});}
async function render(s=mock(),snap=snapshot(),dev=true,clock) {
  const loader=createLoader(s.client,dev);const Page=loader.load('src/pages/ShoppingDealsPage.tsx').default;let root;
  await act(()=>{root=renderer.create(React.createElement(MemoryRouter,{initialEntries:[{pathname:'/shopping-deals',state:{dealsSnapshot:snap}}]},React.createElement(Routes,null,
    React.createElement(Route,{path:'/shopping-deals',element:React.createElement(Page)}),React.createElement(Route,{path:'/shopping-list',element:React.createElement('p',null,'Shopping List destination')}))));});
  return {s,loader,root,snap,clock};
}
async function live(h){await act(()=>h.root.root.findAllByType('select').find(s=>s.props['aria-label']==='Preview data source').props.onChange({target:{value:'network'}}));return h;}
async function selectStores(h){await act(()=>{for(const checkbox of h.root.root.findAllByType('input').filter(i=>i.props.type==='checkbox'))checkbox.props.onChange({target:{checked:true}});});}
async function compare(h){const button=h.root.root.findAllByType('button').find(b=>b.children.join('')==='Compare recent observations');assert.ok(button&&!button.props.disabled);await act(()=>button.props.onClick());}
async function confirmForms(h){await act(()=>{for(const select of h.root.root.findAllByType('select').filter(s=>s.props['aria-label']?.startsWith('Confirm product form'))){const option=select.findAllByType('option').find(o=>o.props.value);select.props.onChange({target:{value:option.props.value}});}});}
async function close(h){await act(()=>h.root.unmount());}
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
