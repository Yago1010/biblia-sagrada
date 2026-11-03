# Bíblia Sagrada — web + mobile

Aplicativo de Bíblia sem cadastro: tela principal com menu, todos os 66 livros, seleção de tradução (NVI e outras), idioma português/inglês, modo claro/escuro e busca de capítulo com versículos clicáveis.

## Stack

| Camada   | Tecnologia                                  |
| -------- | ------------------------------------------- |
| Web      | Next.js 15 · TypeScript · Tailwind · next-themes |
| Mobile   | React Native (Expo SDK 54) · expo-router · NativeWind |
| API      | Node 20+ · Express                          |
| Núcleo   | `@biblia/core` — 66 livros, aliases, i18n PT/EN |

## Estrutura

```
biblia-sagrada/
├─ packages/bible-core/   # livros, traduções, busca "joão 3", textos PT/EN
├─ server/                # API Express (porta 4000) + JSONs em server/data/
├─ apps/web/              # Next.js (porta 3000)
├─ apps/mobile/           # Expo
└─ scripts/sync-bibles.ts # baixa/importa traduções
```

## Rodando

Requisito: Node 20+.

```powershell
npm install

# 1) API de versículos (sempre primeiro)
npm run server          # http://localhost:4000/api

# 2) web
npm run web             # http://localhost:3000

# 3) mobile (outra aba)
npm run mobile           # expo → digite i (iOS) / a (Android)
```

A web funciona **sem** o servidor Node (ela tem rotas `/api` próprias rodando dentro do Next). O servidor Node é obrigatório para o **mobile**.

### Mobile apontando para a API

Crie `apps/mobile/.env` (ou exporte a variável):

```bash
# emulador Android
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000/api

# iOS simulador / web
EXPO_PUBLIC_API_URL=http://localhost:4000/api

# celular físico na mesma rede (use o IP da sua máquina)
EXPO_PUBLIC_API_URL=http://192.168.0.10:4000/api
```

Para a web apontar para o servidor Node em vez das rotas locais:

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## Traduções

**21 registradas** —17 ao vivo pela bible-api.com (funcionam sem arquivo) +4 por JSON local:

| id | nome | idioma | fonte |
| --- | --- | --- | --- |
| `almeida` | Almeida | pt | API |
| `kjv` · `web` · `asv` · `bbe` · `darby` · `dra` | KJV, WEB, ASV, BBE, Darby, DRA | en | API |
| `webbe` · `oeb-us` · `oeb-cw` · `ylt`* · `cherokee`* | WEB-UK, OEB-US, OEB-CW, YLT, Cherokee | en | API |
| `cuv` · `bkr` · `clementine` · `rccv` · `synodal` | 中文, čeština, Latina, română, русский | — | API |
| `nvi` · `acf` · `ara` · `niv` | NVI, ACF, ARA, NIV | pt/en | JSON local |

\* `ylt` e `cherokee` são somente Novo Testamento na fonte — pedir Antigo Testamento responde `testament_unavailable`.

A bible-api.com limita rajadas (403/429) — o servidor faz retry automático; sync espera e retoma de onde parou.

### Instalando NVI / ACF / ARA / NIV (JSON licenciado)

Essas traduções são licenciadas — o texto vem do seu próprio acervo/assinatura. Coloque o JSON no formato canônico e importe:

```powershell
# no PowerShell use npm.cmd (o npm.ps1 engole flags com --)
npm.cmd run sync -- --import "C:\caminho\nvi.json" --translation nvi
```

Formato aceito (66 livros, ordem canônica — detalhes em `server/data/README.md`):

```json
[
  { "id": "gen", "chapters": [["No princípio...", "..."], ["..."]] },
  { "id": "exo", "chapters": [["..."]] }
]
```

Também aceita `{ "books": [...] }` e objetos `{ "verse": 1, "text": "..." }` por versículo. Com o arquivo em `server/data/nvi.json` a NVI aparece disponível e entra na busca de versículos.

### Baixando traduções públicas pela API

```powershell
npm.cmd run sync -- --source api --translation kjv
npm.cmd run sync -- --source api --translation almeida   # texto PT completo p/ busca offline
# teste rápido com um livro só (sync é retomável — livros prontos são pulados):
npm.cmd run sync -- --source api --translation kjv --book john
```

## Busca

Lupa (ou `Ctrl+K` na web / aba Pesquisar no mobile):

- **Referência**: `João 3`, `salmos 23`, `jn 3:16`, `john 3`, `1co 13` — abre o capítulo (e rola até o versículo).
- **Texto**: qualquer palavra (`love`, `Deus`, `amor`) — varre **todos os JSONs locais** (NVI instalada, KJV sincronizado…) e lista os versículos com livro, capítulo, versículo e tradução; clicar navega até o versículo.

Endpoint: `GET /api/search?q=amor&limit=40` → `{ hits: [...], truncated }`.

## APK (Android)

```powershell
cd apps\mobile
npx expo prebuild -p android --no-install   # já gerado nesta árvore
# gera keystore uma vez (se não existir):
#   keytool -genkeypair -keystore keystore\biblia.keystore -alias biblia ^
#     -keyalg RSA -keysize 2048 -validity 10000 -storepass biblia2026 ^
#     -keypass biblia2026 -dname "CN=Biblia Sagrada, OU=Mobile, O=Local, C=BR"
cd android
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot
gradlew.bat assembleRelease
# → app\build\outputs\apk\release\app-release.apk (assinado, instalável)
```

O APK espera a API em `EXPO_PUBLIC_API_URL` no build-time; por padrão usa `http://localhost:4000/api` (emulador: `http://10.0.2.2:4000/api`).

## Recursos

- Modo claro/escuro/sistema (persistido no aparelho)
- Idioma da interface PT/EN (persistido)
- Versículo clicável → copiar, compartilhar, destacar
- Marcados salvos localmente (menu → Marcados)
- Sem login, sem banco — tudo local/JSON

## Typecheck

```powershell
npm run typecheck
```
