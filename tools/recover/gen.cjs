// Recupera o código do app a partir do bundle: divide em arquivos conforme o manifesto,
// reconstrói JSX, CSS modules e imports/exports.
const fs=require('fs'),path=require('path');
const traverse=require('@babel/traverse').default,generate=require('@babel/generator').default,t=require('@babel/types');
const {load}=require('./units.cjs');
const [,, bundle, manifestFile, outDir, cssDir]=process.argv;
const M=require(path.resolve(manifestFile));
const B=load(bundle);
const report=[]; const warn=(...a)=>report.push(a.join(' '));

// ---------- 1. atribuir unidades a arquivos
const ranges=M.files.map(([from,to,file])=>({from,to,file}));
const fileOf=u=>{ const r=ranges.find(r=>u.start>=r.from&&u.start<=r.to); return r?r.file:null; };
for(const u of B.units) u.file=fileOf(u);
const drop=new Set(M.drop||[]);            // nomes do bundle a descartar (substituídos por lib)
const lib=M.lib||{};                       // nome -> {from, name} | {from, ns:true} | {from, def:true} | {expr, from, name}
const libMember=M.libMember||{};           // "obj.prop" -> {from,name}
const rename=M.rename||{};                 // nome do bundle -> nome novo

// ---------- 2. CSS modules: objeto de estilos cujos valores são consts "_classe_hash_n"
const cssConst=new Map(); // nome const -> {cls,hash}
for(const u of B.units){
  if(u.type==='var'&&u.node.init&&t.isStringLiteral(u.node.init)){
    const m=/^_([\w-]+)_([a-z0-9]{5})_\d+$/.exec(u.node.init.value);
    if(m&&u.file) cssConst.set(u.names[0],{cls:m[1],hash:m[2],unit:u});
  }
}
const styleUnits=new Map(); // unit -> hash
for(const u of B.units){
  if(u.type!=='var'||!u.file||!t.isObjectExpression(u.node.init)) continue;
  const props=u.node.init.properties; if(!props.length) continue;
  const hs=new Set(); let ok=true;
  for(const p of props){
    if(t.isObjectProperty(p)&&t.isIdentifier(p.value)&&cssConst.has(p.value.name)) hs.add(cssConst.get(p.value.name).hash);
    else if(t.isObjectProperty(p)&&t.isStringLiteral(p.value)&&/^_[\w-]+_[a-z0-9]{5}_\d+$/.test(p.value.value)) hs.add(/_([a-z0-9]{5})_\d+$/.exec(p.value.value)[1]);
    else ok=false;
  }
  if(ok&&hs.size===1) styleUnits.set(u,[...hs][0]); else if(hs.size) warn('estilo irregular',u.start,u.names[0]);
}
for(const [name,c] of cssConst){
  const outside=(B.refs.get(name)||[]).filter(r=>!styleUnits.has(r.unit));
  if(outside.length) warn('classe css usada fora do objeto de estilos:',name,c.cls,'em',outside.map(r=>r.unit.start).join(','));
  c.unit.skip=true;
}

// ---------- 3. renomear (sem scope.rename, que é lento)
const prog=B.scope;
const jsxTypeNames=new Set();
traverse(B.ast,{CallExpression(p){
  const c=p.node.callee;
  if(t.isMemberExpression(c)&&t.isIdentifier(c.object,{name:M.jsx})&&['jsx','jsxs'].includes(c.property.name)){
    const ty=p.node.arguments[0];
    if(t.isIdentifier(ty)){ const b=p.scope.getBinding(ty.name); if(b&&b.scope===prog) jsxTypeNames.add(ty.name); else if(b&&/^[a-z_$]/.test(ty.name)) b.__cap=true; }
  }
}});
const taken=new Set(Object.keys(prog.bindings));
function doRename(binding,newName){
  const set=(p)=>{ const n=p.node; const par=p.parent;
    if(t.isObjectProperty(par)&&par.shorthand){ par.shorthand=false; if(par.key===n){ par.key=t.identifier(n.name); } }
    if(t.isIdentifier(n)||t.isJSXIdentifier(n)) n.name=newName; };
  for(const p of binding.referencePaths){ if(p.scope.hasBinding(newName)&&p.scope.getBinding(newName).scope!==binding.scope&&p.scope.getBinding(newName)!==binding) warn('conflito de nome',newName,'linha',p.node.loc&&p.node.loc.start.line); set(p); }
  for(const p of binding.constantViolations){ const ids=p.getBindingIdentifierPaths?Object.values(p.getBindingIdentifierPaths()).filter(x=>x.node.name===binding.identifier.name):[]; ids.forEach(set); if(p.isAssignmentExpression()&&t.isIdentifier(p.node.left,{name:binding.identifier.name})) p.node.left.name=newName; if(p.isUpdateExpression()&&t.isIdentifier(p.node.argument,{name:binding.identifier.name})) p.node.argument.name=newName; }
  binding.identifier.name=newName;
}
const finalName=new Map(); // nome bundle -> nome final
for(const [name,b] of Object.entries(prog.bindings)){
  const u=B.owner.get(name); if(!u) continue;
  let nn=rename[name];
  if(!nn&&lib[name]) nn=lib[name].local||lib[name].name||null;
  if(!nn&&jsxTypeNames.has(name)&&/^[a-z_$]/.test(name)&&u.file) nn='C_'+name.replace(/\$/g,'S');
  if(!nn&&styleUnits.has(u)) nn=null;
  if(nn&&nn!==name){ if(taken.has(nn)&&!lib[name]) warn('nome novo já existe',name,'->',nn); taken.add(nn); doRename(b,nn); finalName.set(name,nn); } else finalName.set(name,name);
}
// variáveis locais minúsculas usadas como tipo JSX
traverse(B.ast,{Scope(){}, Scopable(p){ for(const [n,b] of Object.entries(p.scope.bindings)){ if(b.__cap&&b.scope===p.scope){ const nn='X'+n.replace(/\$/g,'S'); let k=nn,i=1; while(p.scope.hasBinding(k)) k=nn+(i++); doRename(b,k); b.__cap=false; } } }});

// ---------- 4. JSX
const jsxName=(n)=> t.isIdentifier(n)?t.jsxIdentifier(n.name): t.isMemberExpression(n)&&!n.computed? t.jsxMemberExpression(jsxName(n.object),t.jsxIdentifier(n.property.name)) : null;
const safeText=s=>s.length>0&&!/[{}<>&\n\r\\]/.test(s)&&s.trim()===s&&!/  /.test(s)&&s!=='';
function child(c){
  if(t.isJSXElement(c)||t.isJSXFragment(c)) return c;
  if(t.isStringLiteral(c)&&safeText(c.value)) return t.jsxText(c.value);
  if(t.isSpreadElement(c)) return t.jsxSpreadChild(c.argument);
  return t.jsxExpressionContainer(c);
}
function toJsx(p){
  const [ty,props,key]=p.node.arguments; const isS=p.node.callee.property.name==='jsxs';
  let name; const isFrag=t.isMemberExpression(ty)&&t.isIdentifier(ty.property,{name:'Fragment'});
  if(!isFrag){ if(t.isStringLiteral(ty)) name=t.jsxIdentifier(ty.value); else name=jsxName(ty); if(!name||(t.isJSXIdentifier(name)&&!t.isStringLiteral(ty)&&/^[a-z]/.test(name.name))) { return; } }
  const attrs=[]; let children=[];
  if(key&&!(t.isIdentifier(key,{name:'undefined'})||(t.isUnaryExpression(key)&&key.operator==='void'))) attrs.push(t.jsxAttribute(t.jsxIdentifier('key'),t.jsxExpressionContainer(key)));
  if(t.isObjectExpression(props)){
    for(const pr of props.properties){
      if(t.isSpreadElement(pr)){ attrs.push(t.jsxSpreadAttribute(pr.argument)); continue; }
      if(!t.isObjectProperty(pr)||pr.computed){ return; }
      const k=t.isIdentifier(pr.key)?pr.key.name:t.isStringLiteral(pr.key)?pr.key.value:null; if(k==null||!/^[A-Za-z_$][\w$:.-]*$/.test(k)) return;
      if(k==='children'){ const v=pr.value; children=(isS&&t.isArrayExpression(v))?v.elements.filter(Boolean).map(child):[child(v)]; continue; }
      const v=pr.value;
      attrs.push(t.jsxAttribute(t.jsxIdentifier(k), t.isStringLiteral(v)&&!/["\n\\]/.test(v.value)?t.stringLiteral(v.value): t.isBooleanLiteral(v,{value:true})?null: t.jsxExpressionContainer(v)));
    }
  } else if(props&&!t.isNullLiteral(props)) attrs.push(t.jsxSpreadAttribute(props));
  if(isFrag&&!attrs.length){ p.replaceWith(t.jsxFragment(t.jsxOpeningFragment(),t.jsxClosingFragment(),children)); return; }
  if(isFrag) name=t.jsxMemberExpression(t.jsxIdentifier('React'),t.jsxIdentifier('Fragment'));
  const self=children.length===0;
  p.replaceWith(t.jsxElement(t.jsxOpeningElement(name,attrs,self),self?null:t.jsxClosingElement(name),children,self));
}
traverse(B.ast,{CallExpression:{exit(p){
  const c=p.node.callee;
  if(t.isMemberExpression(c)&&t.isIdentifier(c.object)&&c.object.name===(finalName.get(M.jsx)||M.jsx)&&['jsx','jsxs'].includes(c.property.name)) toJsx(p);
}},
 UnaryExpression(p){ // !0 / !1 -> true/false ; void 0 -> undefined
  const n=p.node; if(n.operator==='!'&&t.isNumericLiteral(n.argument)) p.replaceWith(t.booleanLiteral(!n.argument.value));
  else if(n.operator==='void'&&t.isNumericLiteral(n.argument,{value:0})) p.replaceWith(t.identifier('undefined'));
 }});

// ---------- 5. membros de lib (ex.: fe.isNativePlatform -> Capacitor.isNativePlatform) e literais especiais
const extraImports=new Map(); // file -> Map(from -> Set(spec))
const addImp=(file,from,spec)=>{ if(!extraImports.has(file)) extraImports.set(file,new Map()); const m=extraImports.get(file); if(!m.has(from)) m.set(from,new Set()); m.get(from).add(spec); };
const unitOfPath=(p)=>{ const top=p.findParent(x=>x.parentPath&&x.parentPath.isProgram())||p; let node=top.node; if(t.isVariableDeclaration(node)){ const d=p.findParent(x=>x.isVariableDeclarator()&&x.parentPath.parentPath.isProgram()); node=d?d.node:node; } return B.units.find(u=>u.node===node); };

// ---------- 6. gerar arquivos
const files=new Map();
for(const u of B.units){ if(!u.file||u.skip) continue; if(u.names.length&&u.names.every(n=>drop.has(n)||lib[n])) continue; if((M.dropLines||[]).includes(u.start)) continue; if(!files.has(u.file)) files.set(u.file,[]); files.get(u.file).push(u); }
const relImp=(from,to)=>{ let r=path.relative(path.dirname(from),to).replace(/\\/g,'/'); if(!r.startsWith('.')) r='./'+r; return r.replace(/\.(tsx?|jsx?)$/,''); };
const unresolved=new Map();
const graph=new Map();
const outputs=new Map();
for(const [file,units] of files){
  const imports=new Map(); // from -> Set(spec strings)
  const imp=(from,spec)=>{ if(!imports.has(from)) imports.set(from,new Set()); imports.get(from).add(spec); };
  const body=[]; const styleNames=[]; const exported=new Set(); const local=new Set(units.flatMap(u=>u.names));
  for(const u of units){
    if(styleUnits.has(u)){ const hash=styleUnits.get(u); const css=file.replace(/\.(tsx?|jsx?)$/,'')+(M.cssSuffix&&M.cssSuffix[hash]||'')+'.module.css'; const nm=finalName.get(u.names[0]);
      imp('./'+path.basename(css),'default:'+nm); outputs.set(css,{css:hash}); u.isStyle=true; styleNames.push(u); continue; }
    let code;
    if(u.type==='var'){ const kind=(B.refs.get(u.names[0])||[]).some(r=>r.write)||u.declKind==='let'&&false?'let':(u.declKind==='let'||u.declKind==='var')&&(B.refs.get(u.names[0])||[]).some(r=>r.write)?'let':'const';
      code=generate(t.variableDeclaration(u.node.init?kind:'let',[u.node]),{jsescOption:{minimal:true}}).code; }
    else code=generate(u.node,{jsescOption:{minimal:true}}).code;
    body.push({u,code});
  }
  // referências para fora
  for(const [name,arr] of B.refs){
    const o=B.owner.get(name); if(!o) continue; const fn=finalName.get(name)||name;
    for(const r of arr){
      if(r.unit.file!==file||r.unit.skip||r.unit.isStyle) continue;
      if(r.unit.names.length&&r.unit.names.every(n=>drop.has(n)||lib[n])) continue; if((M.dropLines||[]).includes(r.unit.start)) continue;
      if(local.has(name)&&o.file===file&&!drop.has(name)&&!lib[name]) continue;
      if(lib[name]){ const L=lib[name]; if(L.skip) break; if(L.from.startsWith('~/')&&L.from.slice(2)===file.replace(/\.(tsx?|jsx?)$/,'')) break; imp(L.from.startsWith('~/')?relImp(file,L.from.slice(2)):L.from, L.ns?'ns:'+fn: L.def?'default:'+fn : (L.name===fn?L.name:L.name+' as '+fn)); break; }
      if(o.file&&o.file!==file){ if(arr.some(x=>x.unit.file===file&&x.write)) warn('escrita entre arquivos',name,file,'<-',o.file); imp(relImp(file,o.file),fn); o.exported=true; if(!graph.has(file)) graph.set(file,new Map()); const g=graph.get(file); const cur=g.get(o.file)||{eager:false,names:new Set()}; cur.eager=cur.eager||arr.some(x=>x.unit.file===file&&x.eager); cur.names.add(fn+(arr.some(x=>x.unit.file===file&&x.eager)?'!':'')); g.set(o.file,cur); break; }
      if(!o.file){ if(!unresolved.has(name)) unresolved.set(name,new Set()); unresolved.get(name).add(file+':'+r.unit.start); }
    }
  }
  outputs.set(file,{body,imports,styleNames});
}
// escrever
for(const n of (M.forceExport||[])){ const o=B.owner.get(n); if(o) o.exported=true; }
fs.rmSync(outDir,{recursive:true,force:true});
for(const [file,o] of outputs){
  const full=path.join(outDir,file); fs.mkdirSync(path.dirname(full),{recursive:true});
  if(o.css){ fs.copyFileSync(path.join(cssDir,o.css+'.css'),full); continue; }
  const ex=(M.extraImports&&M.extraImports[file])||[];
  const lines=[];
  for(const [from,specs] of o.imports){
    const def=[...specs].find(s=>s.startsWith('default:')), ns=[...specs].find(s=>s.startsWith('ns:')); const named=[...specs].filter(s=>!s.includes(':')).sort();
    if(ns) lines.push(`import * as ${ns.slice(3)} from '${from}';`);
    if(def||named.length) lines.push(`import ${[def&&def.slice(8),named.length&&`{ ${named.join(', ')} }`].filter(Boolean).join(', ')} from '${from}';`);
  }
  lines.push(...ex);
  const styleExp=o.styleNames.filter(u=>u.exported).map(u=>finalName.get(u.names[0])); const code=(styleExp.length?`export { ${styleExp.join(', ')} };\n\n`:'')+o.body.map(({u,code})=>{ const exp=u.names.some(n=>B.owner.get(n).exported); return (exp&&u.type!=='stmt'?'export ':'')+code; }).join('\n\n');
  fs.writeFileSync(full,`// @ts-nocheck\n// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).\n${lines.join('\n')}\n\n${code}\n`);
}
// ciclos: componentes fortemente conexos com alguma aresta "eager"
const cyc=[]; const nodes=[...files.keys()]; let idx=0; const st=[],on=new Set(),ix=new Map(),low=new Map();
function sc(v){ ix.set(v,idx);low.set(v,idx);idx++;st.push(v);on.add(v);
  for(const [w] of (graph.get(v)||[])){ if(!ix.has(w)){sc(w);low.set(v,Math.min(low.get(v),low.get(w)));} else if(on.has(w)) low.set(v,Math.min(low.get(v),ix.get(w))); }
  if(low.get(v)===ix.get(v)){ const comp=[]; let w; do{w=st.pop();on.delete(w);comp.push(w);}while(w!==v);
    if(comp.length>1){ const cs=new Set(comp); const edges=[]; let eager=false; for(const a of comp) for(const [b,e] of (graph.get(a)||[])) if(cs.has(b)){ if(e.eager) eager=true; edges.push(`   ${a} -> ${b} ${e.eager?'EAGER':'lazy'} [${[...e.names].slice(0,8).join(',')}]`); }
      cyc.push(`${eager?'CICLO-EAGER':'ciclo-lazy'} (${comp.length}): ${comp.join(', ')}`); if(eager) cyc.push(...edges); } } }
nodes.forEach(n=>{ if(!ix.has(n)) sc(n); });
console.log('arquivos',outputs.size,'| não resolvidos',unresolved.size,'| avisos',report.length,'| ciclos/frente',cyc.length);
fs.writeFileSync(path.join(path.dirname(path.resolve(manifestFile)),'report.txt'),['# NAO RESOLVIDOS',...[...unresolved].map(([n,s])=>`${n}\t${B.owner.get(n).start}\t${[...s].slice(0,3).join(' ')}\t${B.src.slice(B.owner.get(n).node.start,B.owner.get(n).node.start+70).replace(/\s+/g,' ')}`),'# AVISOS',...report,'# CICLOS',...cyc].join('\n'));
