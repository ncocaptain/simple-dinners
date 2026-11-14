// Shared mocked Supabase/React harness for development Deals integration tests.
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

module.exports = { assert, fs, React, renderer, storage, createLoader, uuid, NOW, iso, store, product, observation, mock, snapshot, content, act, render, live, selectStores, compare, confirmForms, close };
