// Portal container is stubbed for React's Node renderer; the real portal,
// focus loop and clipping are additionally exercised in the browser.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const React=require('react');
const {act,create}=require('react-test-renderer');
const {createTypeScriptLoader}=require('./lib/load-typescript.cjs');
let language='en';
global.localStorage={getItem:()=>language};
global.document={body:{}};
const i18n=createTypeScriptLoader()('src/i18n/index.ts');
const mod={exports:{}};
const code=ts.transpileModule(fs.readFileSync('src/components/ShoppingItemActions.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
new Function('require','module','exports',code)(name=>name==='react-dom'?{createPortal:child=>child}:name==='../i18n'?i18n:require(name),mod,mod.exports);
const Actions=mod.exports.default;
for(const locale of ['en','es']){
 language=locale;let edits=0,deletes=0,stopped=0;
 const event={stopPropagation:()=>stopped++,target:null,currentTarget:{},preventDefault(){}};
 let tree;act(()=>{tree=create(React.createElement(Actions,{name:'Sour Cream or Greek Yogurt',onEdit:()=>edits++,onDelete:()=>deletes++}));});
 const trigger=()=>tree.root.findAllByType('button').find(b=>b.props['aria-haspopup']==='dialog');
 assert.equal(tree.root.findAll(n=>n.props.role==='dialog').length,0);
 act(()=>trigger().props.onClick(event));
 assert.equal(tree.root.findAll(n=>n.props.role==='dialog').length,1);
 assert.equal(edits+deletes,0,'Opening actions cannot edit/delete/check an item');
 const layer=()=>tree.root.findAllByType('div').find(n=>n.props.onKeyDown);
 act(()=>layer().props.onTouchStart(event));act(()=>layer().props.onTouchEnd(event));
 assert.ok(stopped>=3,'Menu and touch gestures stay out of the parent row');
 act(()=>layer().props.onKeyDown({...event,key:'Escape'}));
 assert.equal(tree.root.findAll(n=>n.props.role==='dialog').length,0);
 act(()=>trigger().props.onClick(event));
 const editLabel=locale==='en'?'Edit Sour Cream or Greek Yogurt':'Editar Sour Cream or Greek Yogurt';
 act(()=>tree.root.findByProps({'aria-label':editLabel}).props.onClick(event));
 assert.equal(edits,1);assert.equal(deletes,0);assert.equal(tree.root.findAll(n=>n.props.role==='dialog').length,0);
 act(()=>trigger().props.onClick(event));
 const deleteLabel=locale==='en'?'Delete Sour Cream or Greek Yogurt':'Eliminar Sour Cream or Greek Yogurt';
 act(()=>tree.root.findByProps({'aria-label':deleteLabel}).props.onClick(event));
 assert.equal(deletes,1);assert.equal(edits,1);
 act(()=>tree.unmount());
}
console.log('PASS: English/Spanish item actions, explicit edit/delete dispatch, Escape, and parent-row touch/click isolation.');
