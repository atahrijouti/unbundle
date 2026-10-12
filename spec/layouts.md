# Layouts

## Layout folders

```
src/layouts/<name>/
  layout.html   required
  metadata.ts   optional, overrides site metadata
  styles.css    optional, linked before the page's
  sync.ts       optional, inlined before first paint, before the page's
  global.ts     optional, loaded as a module script before the page's
```

- **`layouts/folder`** — A layout is a folder in `src/layouts/`, named after the folder.
- **`layouts/pick`** — A page picks a layout with `config.layout = "<name>"` in its module. Without it, the page uses `main`.
- **`layouts/missing`** — If `src/layouts/<name>/layout.html` doesn't exist, the page returns status 500. This covers both an unknown layout and a folder without `layout.html`.
- **`layouts/other-files`** — Anything else in a layout folder is transpiled (`.ts`) or copied like every other file in `src/`. unbundle doesn't read it.
- **`layouts/urls`** — A layout's files are served from `<BASE_URL>layouts/<name>/`.
- **`layouts/metadata`** — `metadata.ts` exports `metadata: Partial<Metadata>`. See [metadata.md](metadata.md). If it fails to import, the page returns status 500.

## Placeholders

A page is its layout's `layout.html` with placeholders replaced, then formatted with Prettier (`html` parser).

- **`layouts/placeholder-first-only`** — Each placeholder is replaced at its first occurrence only.
- **`layouts/placeholder-order`** — Placeholders are replaced in this order: `title`, `sync-scripts`, `styles`, `scripts`, `metadata`, `content`.
- **`layouts/placeholder-form`** — `{{title}}` is written bare. Every other placeholder is written as an HTML comment, exactly `<!-- {{name}} -->`.

| Placeholder | Replaced with |
|---|---|
| `{{title}}` | `metadata.title` |
| `<!-- {{sync-scripts}} -->` | The layout's `sync.ts`, then the page's |
| `<!-- {{styles}} -->` | `<link rel="stylesheet">` to the layout's `styles.css`, then the page's |
| `<!-- {{scripts}} -->` | Import map, layout `global.js`, page `index.js`, live reload |
| `<!-- {{metadata}} -->` | Metadata tags, see [metadata.md](metadata.md) |
| `<!-- {{content}} -->` | The page module's `content()` |

### Sync scripts

- **`layouts/sync-transpile`** — Each `sync.ts` is transpiled with esbuild (types stripped, no bundling) and inlined as `<script>(() => { … })()</script>`.
- **`layouts/sync-scope`** — Each one runs in its own function scope, so the layout's and the page's can declare the same names.
- **`layouts/sync-imports`** — Imports are not checked. A classic script can't use `import` or `export`, so they fail in the browser.
- **`layouts/sync-placement`** — A layout should put `<!-- {{sync-scripts}} -->` before its stylesheet links: an inline script after a stylesheet waits for that stylesheet to download.

### Scripts

- **`layouts/scripts`** — `<!-- {{scripts}} -->` gets, in order:
  1. `<script type="importmap">` if `src/import-map.json` exists (see [build.md](build.md#import-map)).
  2. `<script type="module" src="<BASE_URL>layouts/<name>/global.js">` if the layout has `global.ts`.
  3. `<script type="module" src="<BASE_URL>app/<page>/index.js">`, always.
  4. The live-reload script, in development only (see [dev-server.md](dev-server.md)).

### Environment blocks

- **`layouts/production-only`** — Every `<!-- {{production-only:start}} -->` … `<!-- {{production-only:end}} -->` block, markers included, is removed unless `NODE_ENV` is `production`.
- **`layouts/placeholder-strip`** — Unless `NODE_ENV` is `development`, any `<!-- {{…}} -->` comment left after replacement is removed. In development, they stay in the output.

## TODO

- **`layouts/placeholder-form`** — Write `{{title}}` as a comment like the others.
- **`layouts/placeholder-first-only`** — Replace every occurrence of a placeholder, not just the first.
