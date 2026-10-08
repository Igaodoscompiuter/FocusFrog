# Como contribuir

O FocusFrog é proprietário (veja [`LICENSE`](LICENSE)). Sugestões e correções
são bem-vindas, mas **ao enviar qualquer contribuição você cede os direitos
sobre ela à Online Já Tech** ([detalhes](docs/PROPRIEDADE-INTELECTUAL.md#contribuições)).

## Branches

```
main ─────●────────────●──────  versões publicadas (cada uma com tag vX.Y.Z)
           \          /
develop ────●──●──●──●────────  integração do dia a dia
               \  /
feature/xyz ────●              uma branch por mudança
```

| Prefixo | Para quê | Sai de / volta para |
|---|---|---|
| `feature/` | funcionalidade nova | `develop` |
| `fix/` | correção de bug | `develop` |
| `hotfix/` | correção urgente em produção | `main` (e depois `develop`) |
| `chore/` | organização, build, dependências | `develop` |
| `docs/` | documentação | `develop` |

- Nunca commite direto em `main`.
- `develop` → `main` só numa versão: sobe o número, atualiza o `CHANGELOG.md`
  e cria a tag.

## Commits (Conventional Commits)

```
<tipo>(<escopo opcional>): <resumo no imperativo, minúsculo>
```

Tipos: `feat`, `fix`, `refactor`, `perf`, `style`, `docs`, `test`, `build`,
`ci`, `chore`. Exemplos:

```
feat(lagoa): sapos piscam e respiram parados
fix(widget): lista some ao marcar item
chore: remove sobras do Firebase
```

## Versões (SemVer)

`MAJOR.MINOR.PATCH`, iguais em `package.json` (`version`) e
`android/app/build.gradle` (`versionName`). O `versionCode` do Android sobe
**+1 a cada APK publicado** — é ele que o aviso de nova versão compara.

## Antes de abrir um pull request

```bash
npm ci
npx tsc --noEmit   # sem erros de tipo
npm run build      # build web ok
```

## Commits assinados

Os commits de quem mantém o projeto são assinados (selo **Verified** no
GitHub). Pra configurar a sua assinatura por chave SSH:

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```

Depois cadastre a mesma chave em GitHub → Settings → SSH and GPG keys →
**New SSH key → Key type: Signing Key**.
