const fs=require('fs'),parser=require('@babel/parser');
const src=fs.readFileSync(process.argv[2],'utf8');
const ast=parser.parse(src,{sourceType:'module'});
const rows=[];
for(const n of ast.program.body){
  let names=[];
  if(n.type==='VariableDeclaration') for(const d of n.declarations){ if(d.id.type==='Identifier') names.push(d.id.name); else names.push('{..}'); }
  else if(n.type==='FunctionDeclaration'||n.type==='ClassDeclaration') names.push(n.id.name);
  else names.push('<'+n.type+'>');
  const text=src.slice(n.start,n.end);
  const strs=(text.match(/"[^"\n]{6,60}"/g)||[]).filter(s=>/[a-zA-Zà-ú]{4}/.test(s)).slice(0,3).join(' ');
  rows.push([n.loc.start.line,n.loc.end.line,n.type.replace('Declaration','').slice(0,4),names.length,names.slice(0,6).join(','),strs.slice(0,110)].join('\t'));
}
fs.writeFileSync(process.argv[3],rows.join('\n'));
console.log(rows.length);
