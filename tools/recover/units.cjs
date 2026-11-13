// Carrega o bundle, divide o topo em unidades (declarador por declarador) e resolve referências entre unidades.
const fs=require('fs'),parser=require('@babel/parser'),traverse=require('@babel/traverse').default,t=require('@babel/types');
exports.load=function(file){
  const src=fs.readFileSync(file,'utf8');
  const ast=parser.parse(src,{sourceType:'module'});
  const units=[]; // {i,kind,names,start,end,node,declKind}
  for(const n of ast.program.body){
    if(n.type==='VariableDeclaration'){
      for(const d of n.declarations){
        const names=Object.keys(t.getBindingIdentifiers(d.id));
        units.push({names,start:d.loc.start.line,end:d.loc.end.line,node:d,declKind:n.kind,type:'var'});
      }
    } else if(n.type==='FunctionDeclaration'||n.type==='ClassDeclaration'){
      units.push({names:[n.id.name],start:n.loc.start.line,end:n.loc.end.line,node:n,type:'decl'});
    } else units.push({names:[],start:n.loc.start.line,end:n.loc.end.line,node:n,type:'stmt'});
  }
  units.forEach((u,i)=>u.i=i);
  const owner=new Map(); units.forEach(u=>u.names.forEach(n=>owner.set(n,u)));
  // unit lookup by position
  const unitAt=(pos)=>{ let lo=0,hi=units.length-1; while(lo<hi){const m=(lo+hi+1)>>1; if(units[m].node.start<=pos) lo=m; else hi=m-1;} return units[lo]; };
  let scope;
  traverse(ast,{Program(p){scope=p.scope; p.stop();}});
  const refs=new Map(); // name -> [{unit, eager, write}]
  for(const [name,b] of Object.entries(scope.bindings)){
    const arr=[];
    const add=(path,write)=>{
      const u=unitAt(path.node.start);
      const eager=!path.findParent(p=>p.isFunction()&&p.node.start>=u.node.start);
      arr.push({unit:u,eager,write});
    };
    b.referencePaths.forEach(p=>add(p,false));
    b.constantViolations.forEach(p=>add(p,true));
    refs.set(name,arr);
  }
  return {src,ast,units,owner,refs,scope};
};
