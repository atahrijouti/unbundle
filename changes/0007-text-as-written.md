# 0007 — Text as written

## Why

- Transpiled files and inlined sync scripts turn text outside ASCII into escapes: `"Home · Site"` reaches View Source as `"Home \xB7 Site"`. The sample site showed it in its first build.
- That's esbuild's default output charset. UTF-8 is the standard for text on the web and in code, and unbundle should write to that standard, not around it. Readable output follows from it.

## Shape

- Both esbuild calls, the staging folder's transpile and the sync script's, write UTF-8 instead of escapes (`encoding/text/as-written`).
- A new spec topic, Encoding, states what unbundle already did: text files are read and written as UTF-8 (`encoding/text/utf-8`), and pages carry no charset, so the layout's `<meta charset>` decides (`encoding/charset`). The spec README says it up front.
- Browsers always read module scripts as UTF-8, whatever the server sends, so the dev server's `text/javascript` with no charset (`dev-server/serve/mime`) still works. Inlined sync scripts are read with the page's charset, like the rest of the layout file.

## Breaking changes

None.
