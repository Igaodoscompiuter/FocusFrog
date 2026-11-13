#!/bin/bash
# Regera a árvore recuperada e monta em src/ do repositório.
set -e
S=/tmp/claude-0/-home-claude/599b4ddb-a729-52f2-83ec-6045ef7133e5/scratchpad; R=/home/claude/focusfrog
cd $S/tools/deb && node gen.cjs $S/rec/index-CwIlNUvy.pretty.js manifest.cjs $S/out $S/css249
cd $R
KEEP=$S/keep; rm -rf $KEEP; mkdir -p $KEEP/domain $KEEP/data
git show HEAD:src/supabaseClient.ts > $KEEP/supabaseClient.ts
git show HEAD:src/vite-env.d.ts > $KEEP/vite-env.d.ts
git show HEAD:src/custom.d.ts > $KEEP/custom.d.ts
git show HEAD:src/types.ts > $KEEP/types.ts
for f in domain/routines.ts domain/routines.test.ts domain/taskImport.ts domain/taskImport.test.ts data/routines.ts data/taskTemplates.ts; do git show HEAD:src/$f > $KEEP/$f; done
git archive HEAD src/assets | tar -x -C $KEEP --strip-components=1
rm -rf src; mkdir src; cp -r $KEEP/* src/; cp -r $S/out/* src/
mkdir -p src/styles src/lagoa src/utils
cp $S/css249/GLOBAL.css src/styles/global.css
cat > src/utils/lazyImport.ts <<'X'
/** Carrega um módulo sob demanda (no build original era o helper de preload do Vite). */
export const lazyImport = <T,>(load: () => Promise<T>, _deps?: unknown): Promise<T> => load();
X
cat > src/domain/zodShim.ts <<'X'
import { z } from 'zod';

export const zString = z.string;
export const zNumber = z.number;
export const zBoolean = z.boolean;
export const zArray = z.array;
export const zObject = z.object;
export const zUnion = z.union;
X
# motor da lagoa (PixiJS)
python3 - <<'PY'
import re
S='/tmp/claude-0/-home-claude/599b4ddb-a729-52f2-83ec-6045ef7133e5/scratchpad'
s=open(S+'/rec/lagoaEngine-DjU9jey-.pretty.js').read()
s=s[s.index('import { _ as U'):]
s=s.replace('import { _ as U, f as q, P as Z, a as V } from "./index-CwIlNUvy.js";',
 "import { FROG_SPECIES as q, FROG_PATTERNS as Z } from '../data/frogs';\nimport { ZEN_FROG_COLORS as V } from '../components/zen/ZenFrog';")
s=re.sub(r'await U\(\s*\(\) => import\("\./index-Bt5xK9Kb\.js"\),\s*__vite__mapDeps\(\[0, 1, 2\]\),\s*\)',"await import('pixi.js')",s)
open('/home/claude/focusfrog/src/lagoa/lagoaEngine.ts','w').write('// @ts-nocheck\n// Recuperado do build 2.4.9: motor da lagoa em PixiJS.\n'+s)
PY
sed -i 's#await import("./lagoaEngine-DjU9jey-.js")#await import("../../lagoa/lagoaEngine")#' src/components/zen/LagoaCanvas.tsx
sed -i 's#export const ET = "/assets/focusfrog-coffee-95FMuiuU.png";#import ET from "../assets/focusfrog-coffee.png";\nexport { ET };#' src/screens/RewardsScreen.tsx
sed -i "0,/^import/s//import '.\/styles\/global.css';\nimport/" src/main.tsx
sed -i 's#/src/index.tsx#/src/main.tsx#' index.html
