# Site do FocusFrog

Página oficial de divulgação e download do app: **[focusfrog.netlify.app](https://focusfrog.netlify.app)**

Site estático (HTML, CSS e JS puros, sem build), hospedado no Netlify.
Desenvolvido pela [Online Já Tech](https://onlinejacwb.com.br).

## Estrutura

```
site/
├── index.html               página principal (só conteúdo e metadados)
├── download-concluido.html  "obrigado pelo download" + Pix (noindex)
├── 404.html                 página não encontrada (noindex)
├── update.json              versão mais recente do APK — o app lê este arquivo
├── FocusFrog.apk            APK publicado (fora do git, entra só no deploy)
├── assets/
│   ├── css/site.css         estilos da página principal + modal de download
│   ├── css/pagina.css       estilos das páginas simples
│   ├── css/fonts.css        Manrope (arquivos locais, sem Google Fonts)
│   ├── fonts/               manrope-500/700/800.woff2
│   ├── js/site.js           comportamento: menu, sapos, animações, Pix, modal
│   └── lago/lago.html       Lago Zen animado (carregado num iframe)
├── images/global/           prints do app, OG, ícones, mascote
├── _headers  _redirects     regras do Netlify (cache, segurança, rotas)
├── robots.txt  sitemap.xml  SEO
└── manifest.webmanifest  humans.txt  google*.html
```

## Publicar uma versão nova do app

1. Gere o APK assinado com a chave definitiva e copie para `site/FocusFrog.apk`.
2. Atualize `update.json`: `versionCode` (igual ao `build.gradle`), `versionName`,
   `notes`, `publishedAt` e `sha256` (`sha256sum site/FocusFrog.apk`).
3. Em `index.html`: `softwareVersion`/`dateModified` no JSON-LD e o texto
   "FocusFrog X.Y.Z" do card de instalação. Em `assets/js/site.js`: `APP_VERSION`.
4. Troque o `?v=` dos links de CSS/JS no `index.html` pela versão nova
   (os arquivos têm cache longo; o `?v=` força o navegador a baixar de novo).
5. Atualize o `lastmod` do `sitemap.xml`.
6. Faça o deploy da **pasta `site/` inteira** — o Netlify troca o site todo a
   cada deploy, então o pacote precisa estar completo (com o APK).

O app instalado consulta `update.json` a cada 12 h e avisa quando há versão nova.
`/version.json` redireciona para `update.json` (as instalações da 1.4.0 usam esse
endereço).

## SEO

- Endereço oficial (canonical, `og:url`, sitemap): `https://focusfrog.netlify.app/`.
  Se o site mudar de domínio, troque em `index.html`, `sitemap.xml`, `robots.txt`,
  `update.json` e `humans.txt`.
- Imagem de compartilhamento: `images/global/og-focusfrog-1200x630.jpg` (1200×630).
- Dados estruturados: WebSite, WebPage, MobileApplication, FAQPage, Person e
  Organization (Online Já Tech).
- Google Search Console verificado por meta tag e por `googleb1386ff3dd60b7c8.html`.

## Testar localmente

```bash
cd site && python3 -m http.server 8080
```

As regras de `_redirects` só funcionam no Netlify.

---

© 2026 FocusFrog · Igor Viana. Todos os direitos reservados — veja [`LICENSE`](../LICENSE).
