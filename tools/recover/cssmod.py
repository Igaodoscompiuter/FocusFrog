import re,sys,subprocess
css=open(sys.argv[1]).read()
out=sys.argv[2]
# split top-level rules (handles @media/@keyframes nesting)
rules=[];depth=0;start=0
for i,c in enumerate(css):
    if c=='{':depth+=1
    elif c=='}':
        depth-=1
        if depth==0: rules.append(css[start:i+1]);start=i+1
mods={}
for r in rules:
    hs=set(re.findall(r'_[\w-]+_([a-z0-9]{5})_\d+(?![\w-])',r))
    key=sorted(hs)[0] if len(hs)==1 else ('GLOBAL' if not hs else 'MIX_'+'_'.join(sorted(hs)))
    mods.setdefault(key,[]).append(r)
for k,rs in mods.items():
    t='\n'.join(rs)
    t=re.sub(r'_([\w-]+?)_[a-z0-9]{5}_\d+(?![\w-])',r'\1',t)
    open(f'{out}/{k}.css','w').write(t)
print({k:sum(map(len,v)) for k,v in mods.items()})
