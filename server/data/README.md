# server/data — JSONs das traduções locais

Formato aceito (66 livros, ordem canônica, um arquivo por tradução):

```json
[
  {
    "id": "gen",
    "chapters": [
      ["No princípio criou Deus os céus e a terra...", "E a terra era..."],
      ["..."]
    ]
  }
]
```

- `chapters[capítulo-1][versículo-1]` = texto do versículo.
- Também aceita objetos por versículo: `{ "verse": 1, "text": "..." }`.
- No lugar de `id` também vale `abbrev` (sigla) ou o nome do livro.
- Arquivos conhecidos: `nvi.json`, `acf.json`, `ara.json`, `niv.json`.

Instalação a partir de um arquivo do seu acervo:

```
npm run sync -- --import "C:\caminho\nvi.json" --translation nvi --lang pt
```

Ou baixe uma tradução pública direto da API (KJV, Almeida, WEB):

```
npm run sync -- --source api --translation kjv --lang en
```
