const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync(process.argv[2],'utf8').split('\n');
const lines=fs.readFileSync(process.argv[3],'utf8').split('\n').slice(1).map(l=>l.split('\t')).filter(r=>+r[0]>=21239&&+r[0]<=21967);
const canon=o=>JSON.stringify(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort()):v);
const idx={};
for(const set of ['fi','fa','fa6','md','io5','lu','tb','bs','ri','hi','hi2','gi','pi','bi','ai']){
  let f; try{ f=fs.readFileSync(`/home/claude/focusfrog/node_modules/react-icons/${set}/index.mjs`,'utf8'); }catch{continue;}
  const re=/export function (\w+)\s*\(props\)\s*\{\s*return GenIcon\((\{.*?\})\)\(props\);?\s*\}/gs; let m;
  while((m=re.exec(f))){ try{ const j=JSON.parse(m[2]); delete j.tag; const k=canon(j); (idx[k]=idx[k]||[]).push([set,m[1]]);}catch{} }
}
const out={};
for(const [line,name] of lines){
  let i=+line-1,txt=''; while(!/^}/.test(src[i])){txt+=src[i]+'\n';i++;}
  const m=/return qe\(([\s\S]*)\)\(e\)/.exec(txt); if(!m){console.error('sem corpo',name);continue;}
  const obj=vm.runInNewContext("("+m[1]+")"); delete obj.tag; const hit=idx[canon(obj)];
  if(!hit) console.error('SEM MATCH',name,line); else { const h=hit.find(x=>x[0]==='fi')||hit[0]; out[name]={from:'react-icons/'+h[0],name:h[1]}; }
}
fs.writeFileSync(process.argv[4],JSON.stringify(out,null,1)); console.log(Object.keys(out).length, Object.values(out).map(v=>v.name).join(' '));
