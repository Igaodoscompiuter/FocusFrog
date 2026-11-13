// Percorre o app (onboarding e abas) e grava texto + captura de cada passo.
const {chromium}=require('playwright'); const http=require('http'),fs=require('fs'),path=require('path');
const [,, root, out, port]=process.argv; fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{ let p=path.join(root,decodeURIComponent(q.url.split('?')[0])); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(root,'index.html'); r.writeHead(200,{'content-type':mime[path.extname(p)]||'application/octet-stream'}); fs.createReadStream(p).pipe(r); }).listen(+port);
(async()=>{
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  await ctx.addInitScript(()=>{ const fixed=new Date('2026-11-13T10:00:00').getTime(); const D=Date; const off=fixed-D.now(); Date.now=()=>D.prototype.getTime.call(new D())+off; Math.random=(()=>{let s=42;return()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296;};})(); });
  const pg=await ctx.newPage(); const errs=[]; const log=[];
  pg.on('pageerror',e=>errs.push('PAGEERROR '+e.message.slice(0,200)));
  let n=0; const snap=async(label)=>{ await pg.waitForTimeout(1200); n++; await pg.screenshot({path:`${out}/${String(n).padStart(2,'0')}-${label}.png`}); const t=await pg.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,1500)); log.push(`## ${n} ${label}\n${t}`); };
  const tap=async(text,opt={})=>{ try{ const l=pg.getByText(text,{exact:opt.exact??false}).first(); await l.click({timeout:2500}); return true; }catch(e){ log.push(`(não achei: ${text})`); return false; } };
  await pg.goto(`http://localhost:${port}/`); await pg.waitForTimeout(3000); await snap('inicio');
  await tap('Continuar sem conta'); await snap('sem-conta');
  try{ await pg.locator('input').first().fill('Igor',{timeout:2000}); }catch{}
  for(const t of ['Continuar','Começar','Vamos lá','Pular','Entendi','Agora não','Fechar']){ if(await tap(t,{exact:true})) await snap('ob-'+t.replace(/\s/g,'')); }
  for(let i=0;i<6;i++){ let any=false; for(const t of ['Pular','Pular tour','Agora não','Depois','Fechar','Entendi','Continuar','Começar']){ if(await tap(t,{exact:true})){ any=true; await snap('pos-'+t.replace(/\s/g,'')); break; } } if(!any) break; }
  for(const tab of ['Início','Tarefas','Foco','Lagoa','Ajustes','Loja','Progresso','Recompensas']){ try{ await pg.getByRole('button',{name:tab}).first().click({timeout:1500}); await snap('aba-'+tab); }catch{ log.push('(sem aba '+tab+')'); } }
  fs.writeFileSync(out+'/log.txt',log.join('\n')+'\n# ERROS\n'+errs.join('\n')); await b.close(); srv.close();
})();
