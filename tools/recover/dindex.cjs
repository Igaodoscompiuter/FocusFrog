const {load}=require('./units.cjs');
const B=load(process.argv[2]);
const lo=+process.argv[3],hi=+process.argv[4];
let run=null;const out=[];
const flush=()=>{ if(run){ out.push(`${run.s}-${run.e}\tCSS ${run.hash} x${run.n}`); run=null; } };
for(const u of B.units){
  if(u.end<lo||u.start>hi) continue;
  const text=B.src.slice(u.node.start,u.node.end);
  const m=u.type==='var'&&u.node.init&&u.node.init.type==='StringLiteral'&&/^_[\w-]+_([a-z0-9]{5})_\d+$/.exec(u.node.init.value);
  if(m){ if(run&&run.hash===m[1]){run.e=u.end;run.n++;} else {flush(); run={s:u.start,e:u.end,hash:m[1],n:1};} continue; }
  flush();
  const size=u.end-u.start+1;
  let tag=u.type==='stmt'?'STMT':/\bi\.jsxs?\(/.test(text)?'JSX':/\bw\.use[A-Z]/.test(text)?'HOOK':/\bw\.createContext/.test(text)?'CTX':'';
  const uses=(B.refs.get(u.names[0])||[]).length;
  const strs=(text.match(/"[^"\n]{4,50}"/g)||[]).filter(s=>/[a-zA-Zà-ú]{4}/.test(s)&&!/^"_\w+_[a-z0-9]{5}_\d+"$/.test(s)).slice(0,3).join(' ');
  if(size<3&&!tag&&uses<4&&!strs) continue; // ruído
  out.push(`${u.start}${size>1?'+'+size:''}\t${u.names.join(',')||'-'}\t${tag}\tu${uses}\t${strs.slice(0,90)}`);
}
flush(); console.log(out.join('\n'));
