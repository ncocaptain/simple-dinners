"use strict";
const {assert,fs,React,renderer,createLoader,uuid,NOW,iso,store,product,mock,content,act}=require('./fixtures/deals-preview-harness.cjs');
const path=require('node:path'), ts=require('typescript');
const {MemoryRouter,Routes,Route}=require('react-router-dom');
const loader=createLoader(null), load=loader.load;
const {dollarsToMinor,validateCaptureRow,captureEnvelopeSchema,storedConditions,sameCaptureProduct}=load('src/deals/capture/model.ts');
const {parseCapturePaste,blankCaptureDraft,reviewCaptureDraft}=load('src/deals/capture/draft.ts');
const productSpec=()=>{const p=product(10,{brand:null,gtin:null});delete p.id;return p;};
const row=(more={})=>({rowId:uuid(100),storeId:uuid(1),existingProductId:null,product:productSpec(),observation:{regular_price_minor:419,sale_price_minor:null,currency:'USD',channel:'in-store',selling_basis:'package',selling_quantity:null,selling_unit:null,observed_at:iso(NOW-60000),expires_at:null,sale_expires_at:null,availability:'in-stock',source_type:'manual',source_confidence:'verified',membership:'none'},...more});
function backend(){
 const s=mock([store(1,{retailer_name:'Fictional Capture Store',store_number:'657'})],[{id:uuid(10),...productSpec()}]);const calls=[];const prior=new Map();
 s.client.auth={getUser:async token=>({data:{user:{id:token==='maintainer-token'?uuid(50):uuid(51),user_metadata:{admin:true}}},error:token==='bad-token'?{}:null})};
 s.client.rpc=async(name,args)=>{calls.push({name,args});if(args.p_store_id!==uuid(1))return {data:null,error:{}};
   const body=JSON.stringify({...args,p_replay_only:false});if(prior.has(args.p_row_id)){const old=prior.get(args.p_row_id);return old.body===body?{data:{...old.data,status:'replayed'},error:null}:{data:null,error:{}};}
   if(args.p_replay_only)return {data:null,error:{}};
   const data={status:'saved',productId:uuid(10),observationId:args.p_row_id,productAction:'reused'};prior.set(args.p_row_id,{body,data});return {data,error:null};};
 return {...s,calls};
}
function serverLoader(client){const modules=new Map();function read(file){const filename=path.resolve(file);if(modules.has(filename))return modules.get(filename).exports;const mod={exports:{}};modules.set(filename,mod);
 const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 new Function('require','module','exports',output)(name=>{if(name==='@supabase/supabase-js')return {createClient:()=>client};if(name==='zod')return require(name);assert.ok(name.startsWith('.'));const target=path.resolve(path.dirname(filename),name.replace(/\.js$/,''))+'.ts';return target.includes('/src/')?load(target):read(target);},mod,mod.exports);return mod.exports;}return read;}
const savedEnv={};const envKeys=['NODE_ENV','VERCEL_ENV','PRICE_CAPTURE_ENABLED','PRICE_CAPTURE_MAINTAINER_IDS','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY'];
for(const key of envKeys)savedEnv[key]=process.env[key];
function enable(){process.env.NODE_ENV='development';delete process.env.VERCEL_ENV;process.env.PRICE_CAPTURE_ENABLED='true';process.env.PRICE_CAPTURE_MAINTAINER_IDS=uuid(50);process.env.SUPABASE_URL='https://example.invalid';process.env.SUPABASE_SERVICE_ROLE_KEY='synthetic-server-key';}
function restore(){for(const key of envKeys){if(savedEnv[key]===undefined)delete process.env[key];else process.env[key]=savedEnv[key];}}
async function request(handler,{method='POST',token='maintainer-token',body={rows:[row()]},type='application/json'}={}){let status,bodyOut;const headers={};const res={setHeader:(k,v)=>{headers[k]=v;},status(n){status=n;return this;},json(v){bodyOut=v;return this;}};await handler({method,headers:{authorization:token?`Bearer ${token}`:'','content-type':type},body},res);return {status,body:bodyOut,headers};}
const tests=[];const test=(name,fn)=>tests.push([name,fn]);
test('decimal money is integer minor units and rejects negative/nondecimal/extra precision',()=>{
 assert.equal(dollarsToMinor('4.19'),419);assert.equal(dollarsToMinor('0'),0);assert.equal(dollarsToMinor('12.1'),1210);assert.equal(dollarsToMinor(''),null);
 for(const value of ['-1','NaN','Infinity','1.001','1e2','+1','1,000'])assert.throws(()=>dollarsToMinor(value));
 assert.equal(validateCaptureRow(row({observation:{...row().observation,regular_price_minor:null}}),NOW).row,null);
});
test('paste prefills only explicit facts, never guesses identity/package/card or price kind',()=>{
 const parsed=parseCapturePaste('Chicken breast | $2.99/lb | in-stock\nSweet onions | $1.29/lb | in-stock\nHoneycrisp apples | $1.99/lb | in-stock');assert.equal(parsed.length,3);
 for(const p of parsed){assert.equal(p.canonical_ingredient_id,'');assert.equal(p.package_kind,'');assert.equal(p.content_basis,'');assert.equal(p.membership,'');assert.equal(p.regular,'');assert.equal(p.sale,'');assert.ok(p.quotedPrice);assert.equal(p.selling_unit,'lb');assert.equal(reviewCaptureDraft(p,NOW).row,null);}
 assert.equal(parseCapturePaste('Milk | sale: $4.19 | unknown')[0].sale,'4.19');assert.throws(()=>parseCapturePaste(Array(21).fill('x | 1 | unknown').join('\n')));
});
test('shared row validation bounds money, UUIDs, strings, sources, dates and batch size',()=>{
 assert.ok(validateCaptureRow(row(),NOW).row);
 const patches=[{rowId:'bad'},{storeId:'bad'},{product:{...productSpec(),normalized_name:'x'.repeat(501)}},{product:{...productSpec(),canonical_ingredient_id:'made-up'}},{observation:{...row().observation,regular_price_minor:1.1}},
 {observation:{...row().observation,observed_at:'x'.repeat(65)}},{observation:{...row().observation,currency:'ZZZ'}},{observation:{...row().observation,observed_at:iso(NOW+100000)}},{observation:{...row().observation,expires_at:iso(NOW-60000)}},
 {observation:{...row().observation,sale_expires_at:iso(NOW-60001)}},{observation:{...row().observation,source_type:'scraped'}},{observation:{...row().observation,source_confidence:'trust-me'}},{observation:{...row().observation,membership:'eligible'}},
 {observation:{...row().observation,selling_basis:'measure',selling_quantity:null,selling_unit:null}},{observation:{...row().observation,availability:'maybe'}}];
 for(const patch of patches)assert.equal(validateCaptureRow(row(patch),NOW).row,null,JSON.stringify(patch));
 assert.equal(captureEnvelopeSchema.safeParse({rows:Array(21).fill(row())}).success,false);assert.equal(captureEnvelopeSchema.safeParse({rows:[]}).success,false);
});
test('source cap warning does not extend or rewrite explicit source expiration',()=>{
 const r=row({observation:{...row().observation,expires_at:iso(NOW+100*86400000)}});const checked=validateCaptureRow(r,NOW);assert.ok(checked.row);assert.match(checked.warnings.join(' '),/capped/);assert.equal(checked.row.observation.expires_at,r.observation.expires_at);
});
test('card-only facts store unknown eligibility and preserve null regular price',()=>{
 const r=row({observation:{...row().observation,regular_price_minor:null,sale_price_minor:419,membership:'required'}});assert.ok(validateCaptureRow(r,NOW).row);assert.deepEqual(storedConditions(r),[{kind:'membership',eligibility:'unknown'}]);assert.equal(r.observation.regular_price_minor,null);
});
test('exact product identity matches safely; forms/packages/brand differences do not merge',()=>{
 const p=productSpec();assert.ok(sameCaptureProduct(p,{...p}));for(const patch of [{package_quantity:12},{content_basis:'drained'},{product_form_key:'cooked-chicken'},{brand:'Other brand'}])assert.ok(!sameCaptureProduct(p,{...p,...patch}));
});
test('server requires enabled local development and verified allowlisted identity before any write',async()=>{
 enable();const b=backend(),read=serverLoader(b.client),handler=read('api/deals-price-capture.ts').default;
 for(const token of ['', 'normal-token','bad-token']){assert.equal((await request(handler,{token})).status,403);assert.equal(b.calls.length,0);}
 process.env.PRICE_CAPTURE_MAINTAINER_IDS='';assert.equal((await request(handler)).status,403);process.env.PRICE_CAPTURE_MAINTAINER_IDS=uuid(50);
 process.env.NODE_ENV='production';assert.equal((await request(handler)).status,404);process.env.NODE_ENV='development';process.env.VERCEL_ENV='preview';assert.equal((await request(handler)).status,404);delete process.env.VERCEL_ENV;
 assert.equal(b.calls.length,0);assert.equal((await request(handler)).status,200);assert.equal(b.calls.length,1);restore();
});
test('authorized catalog loads active live-schema-shaped stores without hard-coded retailer',async()=>{
 enable();const b=backend(),handler=serverLoader(b.client)('api/deals-price-capture.ts').default;const r=await request(handler,{method:'GET'});assert.equal(r.status,200);assert.equal(r.body.stores[0].store_number,'657');assert.equal(r.body.stores[0].retailer_name,'Fictional Capture Store');assert.equal(b.calls.length,0);assert.equal(r.headers['Cache-Control'],'no-store');restore();
});
test('server reports per-row partial failures, validation errors and duplicate replay without updates',async()=>{
 const b=backend(),server=serverLoader(b.client)('api/_priceCaptureServer.ts');const r=await server.captureBatch(b.client,{rows:[row(),row({rowId:uuid(101),storeId:uuid(2)}),row({rowId:'bad'})]},NOW);
 assert.deepEqual(r.map(r=>r.status),['saved','failed','invalid']);const replay=await server.captureBatch(b.client,{rows:[row()]},NOW);assert.equal(replay[0].status,'replayed');
 const card=row({rowId:uuid(102),observation:{...row().observation,regular_price_minor:null,sale_price_minor:199,membership:'required'}});await server.captureBatch(b.client,{rows:[card]},NOW);
 assert.deepEqual(b.calls.at(-1).args.p_observation.conditions,[{kind:'membership',eligibility:'unknown'}]);assert.ok(!('membership' in b.calls.at(-1).args.p_observation));
 assert.equal(await server.captureBatch(b.client,{rows:Array(21).fill(row())},NOW),null);
});
test('expired retry can reconcile a saved row but cannot insert a new expired observation',async()=>{
 const b=backend(),server=serverLoader(b.client)('api/_priceCaptureServer.ts');
 await server.captureBatch(b.client,{rows:[row()]},NOW);
 const replay=await server.captureBatch(b.client,{rows:[row()]},NOW+8*86400000);assert.equal(replay[0].status,'replayed');assert.equal(b.calls.at(-1).args.p_replay_only,true);
 const missing=await server.captureBatch(b.client,{rows:[row({rowId:uuid(108)})]},NOW+8*86400000);assert.equal(missing[0].status,'failed');assert.equal(b.calls.at(-1).args.p_replay_only,true);
});
test('HTTP bounds reject non-JSON, oversized batches and malformed envelopes',async()=>{
 enable();const b=backend(),handler=serverLoader(b.client)('api/deals-price-capture.ts').default;
 assert.equal((await request(handler,{type:'text/plain'})).status,415);assert.equal((await request(handler,{body:{huge:'x'.repeat(100001)}})).status,413);
 assert.equal((await request(handler,{body:{rows:[]}})).status,400);assert.equal(b.calls.length,0);restore();
});
async function capturePage(b,dev=true,token='maintainer-token'){
 enable();const handler=serverLoader(b.client)('api/deals-price-capture.ts').default;const original=global.fetch;
 const calls=[];global.fetch=async(url,init={})=>{calls.push({url,init});const r=await request(handler,{method:init.method??'GET',token:init.headers?.Authorization?.slice(7)??'',body:init.body?JSON.parse(init.body):undefined});return {ok:r.status>=200&&r.status<300,status:r.status,json:async()=>r.body};};
 const client={auth:{getSession:async()=>({data:{session:{access_token:token}},error:null})}};const l=createLoader(client,dev);const Page=l.load('src/pages/PriceCapturePage.tsx').default;let root;
 await act(()=>{root=renderer.create(React.createElement(MemoryRouter,{initialEntries:['/shopping-deals/capture']},React.createElement(Routes,null,React.createElement(Route,{path:'/shopping-deals/capture',element:React.createElement(Page)}),React.createElement(Route,{path:'/shopping-list',element:React.createElement('p',null,'Shopping List destination')}))));});
 return {root,calls,async close(){await act(()=>root.unmount());global.fetch=original;restore();}};
}
const button=(h,label)=>h.root.root.findAllByType('button').find(b=>b.children.join('')===label);
async function field(h,label,value,tag='input'){await act(()=>h.root.root.findAllByType('label').find(l=>l.children[0]===label).findByType(tag).props.onChange({target:{value}}));}
test('production capture redirects and unauthorized development capture stays locked',async()=>{
 for(const [dev,token,pattern]of [[false,'maintainer-token',/Shopping List destination/],[true,'normal-token',/Capture is locked/]]){
  const b=backend(),h=await capturePage(b,dev,token);try{assert.match(content(h.root),pattern);assert.equal(b.calls.length,0);if(!dev)assert.equal(h.calls.length,0);}finally{await h.close();}
 }
 const app=fs.readFileSync('src/App.tsx','utf8');assert.match(app,/PriceCapturePage = import\.meta\.env\.DEV \? React\.lazy/);assert.match(app,/path="\/shopping-deals\/capture"[\s\S]*?<Navigate to="\/shopping-list" replace/);
});
test('review disables invalid save; reviewed save reports row ID and does not run Deals or change Shopping List',async()=>{
 const b=backend(),h=await capturePage(b);try{
  await act(()=>button(h,'Review selected batch').props.onClick());assert.equal(button(h,'Save reviewed batch').props.disabled,true);await act(()=>button(h,'Edit batch').props.onClick());
  await field(h,'Normalized product name','Fictional chicken');await field(h,'Store',uuid(1),'select');await field(h,'Existing product suggestions (review identity)',uuid(10),'select');
  await field(h,'Regular price (currency units)','4.19');await field(h,'Selling basis','package','select');await field(h,'Membership/card condition','none','select');await field(h,'Source confidence','verified','select');
  await field(h,'Observed date/time (ISO with timezone)',iso(NOW-60000));await act(()=>button(h,'Review selected batch').props.onClick());assert.equal(button(h,'Save reviewed batch').props.disabled,false);
  assert.match(content(h.root),/Existing product \(exact specification\)/);assert.match(content(h.root),/Provider usable until/);
  await act(()=>button(h,'Save reviewed batch').props.onClick());assert.match(content(h.root),/Submitted row\s+1\s*:\s*saved/);assert.match(content(h.root),/observation/);assert.equal(b.calls.length,1);const id=b.calls[0].args.p_row_id;
  await act(()=>button(h,'Retry unchanged batch').props.onClick());assert.match(content(h.root),/replayed/);assert.equal(b.calls[1].args.p_row_id,id);assert.ok(!button(h,'Edit batch'));
  assert.ok(h.calls.every(c=>c.url==='/api/deals-price-capture'));await act(()=>button(h,'Capture another batch').props.onClick());assert.ok(button(h,'Review selected batch'));assert.doesNotMatch(content(h.root),/Submitted row/);
 }finally{await h.close();}
});
test('capture path has no direct browser table writes, credentials, auto comparison or shopping mutation',()=>{
 for(const file of ['src/pages/PriceCapturePage.tsx','src/deals/capture/client.ts','src/deals/capture/model.ts','src/deals/capture/draft.ts']){
  const code=fs.readFileSync(file,'utf8');assert.doesNotMatch(code,/service_role|SUPABASE_SECRET|SUPABASE_SERVICE|\.from\(|\.rpc\(|localStorage|sessionStorage|DealsCoordinator|buildShoppingPurchaseSnapshot/);
 }
 const sql=fs.readFileSync('supabase/migrations/20261114184350_price_network_private_capture.sql','utf8');assert.match(sql,/security invoker/);assert.match(sql,/from public, anon, authenticated/);assert.doesNotMatch(sql,/security definer|create policy|update public\.|delete from public\./i);assert.match(sql,/pg_advisory_xact_lock/);
});
(async()=>{try{for(const[name,fn]of tests){await fn();console.log('PASS:',name);}console.log(`${tests.length} Phase 5E capture scenarios passed`);}finally{restore();}})().catch(error=>{console.error(error);process.exitCode=1;});
