/* FocusFrog — script da página inicial.
 * Configuração no topo; o resto é comportamento da página. */

/* ======= CONFIGURE AQUI ======= */
const APP_VERSION = '1.4.0';                // versão do APK publicado (igual ao update.json)
const APK_URL = '/FocusFrog.apk';            // APK na raiz do site (o app e o update.json apontam pra cá)
const PIX_CODE = '00020126940014BR.GOV.BCB.PIX013642cf5c38-ccc4-452f-b55a-dd3fc32074f20232obrigado por apoiar o Focus Frog5204000053039865802BR5925Igor Sousa Rocha Aguiar V6009SAO PAULO62140510rDkAtQCzNL63048AC4'; // Pix "copia e cola" (código completo). Vazio = apoio por Pix oculto
const GA_ID   = 'G-S5P71J2Y3Z';             // GA4 do FocusFrog (o mesmo do app). Vazio = sem análise e sem aviso de cookies
/* =============================== */
document.querySelectorAll('[data-apk]').forEach(a=>a.setAttribute('href',APK_URL));
const toast=document.getElementById('toast');let tt;
function say(m){toast.textContent=m;toast.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>toast.classList.remove('on'),2600)}

/* ---- análise (GA4 com Consent Mode) ---- */
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
const track=(n,p)=>{try{gtag('event',n,Object.assign({page_location:location.href},p||{}))}catch(e){}};
const loc=el=>el.closest('#bar')?'barra_fixa':el.closest('.topbar')?'cabecalho':el.closest('.hero')?'hero':el.closest('aside')?'lateral':el.closest('.fim')?'final':el.closest('footer')?'rodape':'outro';
const CK='ff_consent';let saved=null;try{saved=localStorage.getItem(CK)}catch(e){}
if(GA_ID){
  gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:saved==='granted'?'granted':'denied'});
  gtag('js',new Date());gtag('config',GA_ID,{anonymize_ip:true});
  const sc=document.createElement('script');sc.async=true;sc.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(GA_ID);document.head.appendChild(sc);
  const ck=document.getElementById('ck');
  if(!saved)ck.classList.add('on');
  const set=v=>{try{localStorage.setItem(CK,v)}catch(e){}gtag('consent','update',{analytics_storage:v});ck.classList.remove('on')};
  document.getElementById('ckOk').addEventListener('click',()=>set('granted'));
  document.getElementById('ckNo').addEventListener('click',()=>set('denied'));
}else document.querySelectorAll('[data-priv],[data-privwrap]').forEach(e=>e.hidden=true);
const dlg=document.getElementById('priv');
document.querySelectorAll('[data-priv]').forEach(b=>b.addEventListener('click',()=>{if(dlg.showModal)dlg.showModal()}));
document.getElementById('privX').addEventListener('click',()=>dlg.close());
dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-apk],[data-ig],[data-oj],#pix');if(!a)return;
  if(a.hasAttribute('data-apk')){track('download_apk',{link_location:loc(a),file_name:'FocusFrog.apk',app_version:APP_VERSION})}
  else if(a.hasAttribute('data-ig'))track('click_instagram',{link_location:loc(a)});
  else if(a.hasAttribute('data-oj'))track('click_online_ja',{link_location:loc(a)});
  else if(a.id==='pix')track('click_apoiar',{method:'pix',link_location:'apoio'});
});

/* ---- apoio por Pix ---- */
const pix=document.getElementById('pix'),tx=document.getElementById('tx'),qrb=document.getElementById('qrbox');
if(PIX_CODE){pix.hidden=false;tx.hidden=false;qrb.hidden=false;pix.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(PIX_CODE);say('Código Pix copiado. Cole no app do seu banco. Obrigado!')}
  catch(e){const t=document.createElement('textarea');t.value=PIX_CODE;t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();let ok=false;try{ok=document.execCommand('copy')}catch(_){}t.remove();say(ok?'Código Pix copiado. Cole no app do seu banco. Obrigado!':'Não consegui copiar. Use o QR Code.')}})}
else{document.getElementById('apoiar').hidden=true;document.querySelectorAll('a[href="#apoiar"]').forEach(a=>a.hidden=true)}

/* ---- menu no celular ---- */
const nav=document.getElementById('nav'),mb=document.getElementById('menuBtn');
const closeMenu=()=>{nav.classList.remove('open');mb.setAttribute('aria-expanded','false')};
mb.addEventListener('click',()=>{const o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o)});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});

/* ---- sapos (SVGs e animações extraídos do app) ---- */
const ESP=[
 {n:'Sapo da Selva',r:'comum',p:'#2E7D32',s:'#AED581'},{n:'Sapo Solar',r:'comum',p:'#FFC107',s:'#FFF9C4'},
 {n:'Sapo Oceânico',r:'comum',p:'#0288D1',s:'#B3E5FC'},{n:'Sapo Morango',r:'rara',p:'#E91E63',s:'#F8BBD0'},
 {n:'Sapo Fantasma',r:'épica',p:'#CFD8DC',s:'#F5F7F8'},{n:'Sapo Galáxia',r:'épica',p:'#191970',s:'#483D8B'}];
let gid=0;
const vars=e=>`--c1:${e.p};--c2:${e.s};--t1:${e.s};--t2:${e.p}`;
const grad=id=>`<defs><radialGradient id="${id}"><stop offset="0%" style="stop-color:var(--t2)"/><stop offset="100%" style="stop-color:var(--t1)"/></radialGradient></defs>`;
const SV={
 egg:()=>{const id='zg-egg-'+(++gid);return `<svg viewBox="0 0 50 50"><defs><radialGradient id="${id}"><stop offset="0%" stop-color="rgba(255,255,255,.1)"/><stop offset="70%" stop-color="rgba(255,255,255,.25)"/><stop offset="100%" stop-color="rgba(255,255,255,.45)"/></radialGradient></defs><circle cx="25" cy="25" r="24" fill="url(#${id})" class="eggGel"/><circle cx="25" cy="25" r="8" class="eggCore"/><ellipse cx="32" cy="18" rx="7" ry="4" class="eggHi"/></svg>`},
 tad:()=>{const id='zg-tad-'+(++gid);return `<svg viewBox="0 0 80 80">${grad(id)}<g class="tBody"><g class="tTail"><path d="M 40,54 Q 30,64 40,74 Q 50,64 40,54 Z"/></g><ellipse cx="40" cy="40" rx="11" ry="14" fill="url(#${id})"/><circle cx="36" cy="33" r="2" class="eye"/><circle cx="44" cy="33" r="2" class="eye"/></g></svg>`},
 fro:()=>{const id='zg-fro-'+(++gid);return `<svg viewBox="0 0 80 80">${grad(id)}<g class="tBody"><g class="tTail"><path d="M 40,54 Q 55,68 40,78 Q 25,68 40,54 Z"/></g><g class="back"><path class="leg" d="M32,52 C 20,62, 25,40, 30,45 Z"/><path class="leg" d="M48,52 C 60,62, 55,40, 50,45 Z"/></g><ellipse cx="40" cy="40" rx="11" ry="14" fill="url(#${id})"/><g class="front"><path class="leg" d="M35,54 C 30,62, 40,62, 38,55 Z"/><path class="leg" d="M45,54 C 50,62, 40,62, 42,55 Z"/></g><circle cx="36" cy="33" r="2.5" class="eye"/><circle cx="44" cy="33" r="2.5" class="eye"/></g></svg>`},
 sapo:()=>`<svg viewBox="0 0 100 100"><g class="aBody"><ellipse cx="28" cy="75" rx="12" ry="10" class="aLeg"/><ellipse cx="72" cy="75" rx="12" ry="10" class="aLeg"/><ellipse cx="50" cy="60" rx="30" ry="25" class="aMain"/><ellipse cx="50" cy="65" rx="20" ry="18" class="aBelly"/><ellipse cx="38" cy="80" rx="8" ry="6" class="aLeg"/><ellipse cx="62" cy="80" rx="8" ry="6" class="aLeg"/><g class="aEye"><circle cx="40" cy="45" r="10" class="sock"/><circle cx="40" cy="45" r="5" class="pupil"/></g><g class="aEye"><circle cx="60" cy="45" r="10" class="sock"/><circle cx="60" cy="45" r="5" class="pupil"/></g><path d="M45,68 Q50,72 55,68" class="mouth"/></g></svg>`
};
const pick={egg:ESP[0],tad:ESP[0],fro:ESP[2],sapo:ESP[0]};
document.querySelectorAll('.fz[data-s]').forEach(el=>{const sp=el.dataset.v?ESP[+el.dataset.v]:pick[el.dataset.s];el.setAttribute('style',vars(sp));el.innerHTML=SV[el.dataset.s]()});
document.getElementById('especies').innerHTML=ESP.map(e=>`<li><div class="fz" style="${vars(e)}">${SV.sapo()}</div>${e.n}<em>${e.r}</em></li>`).join('');
document.querySelectorAll('.especies li').forEach(li=>li.addEventListener('mouseenter',()=>{const f=li.querySelector('.fz');f.classList.remove('hop');void f.offsetWidth;f.classList.add('hop')}));

/* ---- Lago Zen animado dentro do celular (carrega ao chegar perto) ---- */
const lk=document.getElementById('lake');
if(!matchMedia('(prefers-reduced-motion:reduce)').matches){
  new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){
    const f=document.createElement('iframe');f.title='Lago Zen animado, com sapos pulando entre vitórias-régias';f.setAttribute('sandbox','allow-scripts');f.tabIndex=-1;f.setAttribute('aria-hidden','true');
    f.src='/assets/lago/lago.html?v='+APP_VERSION;f.loading='lazy';
    lk.appendChild(f);o.disconnect()}},{rootMargin:'500px'}).observe(lk);
}

/* ---- revelar ao rolar e animações de uma vez só ---- */
const rv=document.querySelectorAll('article.content h2,article.content .tag,article.content .lead,article.content .card,.sapocard,.sol .fluxo,.evol li,.especies,.rel,.gphone,.faq details,.fim .w,aside .card');
rv.forEach(el=>{el.setAttribute('data-r','');const i=[...el.parentElement.children].indexOf(el);el.style.setProperty('--d',Math.min(i,6)*.06+'s')});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -5% 0px'});
rv.forEach(el=>io.observe(el));
const once=(el,fn,t=.4)=>new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){fn(el);o.disconnect()}},{threshold:t}).observe(el);
const fl=document.getElementById('fluxo');
once(fl,()=>{fl.classList.add('go');[...fl.querySelectorAll('li')].forEach((li,i)=>setTimeout(()=>li.classList.add('on'),i*520))},.5);
once(document.getElementById('sapocard'),e=>e.classList.add('go'),.5);
once(document.getElementById('steps'),()=>document.querySelectorAll('#steps .viz').forEach((v,i)=>{setTimeout(()=>{v.classList.add('go');if(v.classList.contains('subs')){const l=v.querySelectorAll('li');setTimeout(()=>l[1].classList.add('d'),700)}},i*260)}),.25);
once(document.getElementById('evol'),e=>{[...e.querySelectorAll('li')].forEach((li,i)=>li.style.transitionDelay=(i*.35)+'s');e.classList.add('go')},.3);

/* ---- cabeçalho, menu ativo e barra fixa ---- */
const tb=document.getElementById('topbar');
const onScroll=()=>tb.classList.toggle('scrolled',scrollY>8);onScroll();addEventListener('scroll',onScroll,{passive:true});
const links=[...document.querySelectorAll('.topbar nav a')];
const map={solucao:'#solucao',como:'#solucao',recursos:'#solucao',privacidade:'#solucao',jardim:'#jardim',faq:'#faq'};
const spy=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const h=map[e.target.id];links.forEach(a=>{const on=a.getAttribute('href')===h;a.classList.toggle('on',on);on?a.setAttribute('aria-current','true'):a.removeAttribute('aria-current')})}}),{rootMargin:'-45% 0px -50% 0px'});
Object.keys(map).forEach(id=>{const el=document.getElementById(id);if(el)spy.observe(el)});
const bar=document.getElementById('bar'),hero=document.getElementById('heroCta'),fim=document.querySelector('.fim');let heroOut=false,fimIn=false;
const upd=()=>bar.classList.toggle('on',heroOut&&!fimIn);
new IntersectionObserver(e=>{heroOut=!e[0].isIntersecting&&e[0].boundingClientRect.top<0;upd()}).observe(hero);
new IntersectionObserver(e=>{fimIn=e[0].isIntersecting;upd()},{threshold:.25}).observe(fim);

/* ---- modal de download ----
   O navegador não abre o APK baixado nem avisa quando terminou. Então, ao
   tocar em baixar, o download segue normal e o modal mostra como instalar;
   "Já instalei" leva pra página de obrigado. */
(() => {
  const modal = document.getElementById('downloadModal');
  if (!modal) return;
  const close = () => { modal.hidden = true; document.body.style.overflow = ''; };
  document.querySelectorAll('[data-apk]').forEach(link => link.addEventListener('click', () => {
    setTimeout(() => { modal.hidden = false; document.body.style.overflow = 'hidden'; document.getElementById('downloadDone').focus(); }, 400);
  }));
  document.getElementById('downloadClose').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) close(); });
})();
