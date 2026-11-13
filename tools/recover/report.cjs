const {load}=require('./units.cjs');
const B=load(process.argv[2]);
const app=[[18727,21205],[21968,28116],[31732,36514],[43125,45404],[48301,54153]];
const inApp=u=>app.some(([a,b])=>u.start>=a&&u.end<=b);
const out=[];
for(const [name,arr] of B.refs){
  const o=B.owner.get(name); if(!o||inApp(o)) continue;
  const uses=arr.filter(r=>inApp(r.unit)); if(!uses.length) continue;
  out.push([o.start,name,uses.length,uses.some(r=>r.write)?'W':'',B.src.slice(o.node.start,o.node.start+90).replace(/\s+/g,' ')]);
}
out.sort((a,b)=>a[0]-b[0]);
console.log(out.length); for(const r of out) console.log(r.join('\t'));
