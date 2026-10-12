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

- **`layouts/folder`** — A layout is a folder in `src/layouts/`, named after the folder. The path is always `src`, whatever `SRC_FOLDER` is.
- **`layouts/pick`** — A page picks a layout with `config.layout = "<name>"` in its module. When `config.layout` is `undefined` or `null`, the page uses `main`. The value is used as a path segment without validation: `""` points at `src/layouts/` itself, and `../x` works.
- **`layouts/missing`** — If `src/layouts/<name>/layout.html` doesn't exist, the page returns status 500 (see [pages.md](pages.md#errors)). This covers both an unknown layout and a folder without `layout.html`.
- **`layouts/other-files`** — Anything else in a layout folder is transpiled (`.ts`) or copied like every other file in `src/`. unbundle doesn't read it.
- **`layouts/urls`** — A layout's files are served from `<BASE_URL>layouts/<name>/`.
- **`layouts/metadata`** — `metadata.ts` exports `metadata: Partial<Metadata>`. See [metadata.md](metadata.md). If it fails to import, the page returns 500. If it has no `metadata` export, it is ignored.

## Placeholders

A page is its layout's `layout.html` with placeholders replaced, then formatted with Prettier using the `html` parser and Prettier's defaults. The site's Prettier config is not read for pages.

- **`layouts/placeholder-form`** — `{{title}}` is written bare. Every other placeholder is written as an HTML comment, exactly `<!-- {{name}} -->` with one space on each side. `<!--{{styles}}-->` is not replaced.
- **`layouts/placeholder-first-only`** — Each placeholder is replaced at its first occurrence only. A placeholder missing from the layout is skipped silently.
- **`layouts/placeholder-order`** — Placeholders are replaced in this order: `title`, `sync-scripts`, `styles`, `scripts`, `metadata`, `content`. Text inserted early can therefore contain a later placeholder and get it filled; `content()` comes last, so placeholders in it are never filled.
- **`layouts/placeholder-dollar`** — Inserted text is passed to `String.prototype.replace` as a replacement string, so `$$`, `$&`, `` $` `` and `$'` in it are expanded. `Price $$5` comes out as `Price $5`. This applies to every placeholder, including `content()`.

| Placeholder | Replaced with |
|---|---|
| `{{title}}` | `metadata.title` |
| `<!-- {{sync-scripts}} -->` | The layout's `sync.ts`, then the page's |
| `<!-- {{styles}} -->` | `<link rel="stylesheet">` to the layout's `styles.css`, then the page's |
| `<!-- {{scripts}} -->` | Import map, layout `global.js`, page `index.js`, live reload |
| `<!-- {{metadata}} -->` | Metadata tags, see [metadata.md](metadata.md) |
| `<!-- {{content}} -->` | The page module's `content()` |

### Sync scripts

- **`layouts/sync-transpile`** — Each `sync.ts` is read from `src/` and transpiled with esbuild (`esm`, `esnext`, browser platform, no bundling), then inlined as a classic script: `<script>(() => {\n<code>\n})()</script>`. A compile error returns 500 with esbuild's message.
- **`layouts/sync-scope`** — Each one runs in its own function scope, so the layout's and the page's can declare the same names.
- **`layouts/sync-imports`** — Imports are not checked. `import type` is removed by esbuild and is safe. Value imports and exports stay, and fail in the browser, since a classic script can't use them.
- **`layouts/sync-placement`** — A layout should put `<!-- {{sync-scripts}} -->` before its stylesheet links: an inline script after a stylesheet waits for that stylesheet to download.

### Scripts

- **`layouts/scripts`** — `<!-- {{scripts}} -->` gets, in order:
  1. `<script type="importmap">` if `src/import-map.json` exists (always `src`, see [build.md](build.md#import-map)).
  2. `<script type="module" src="<BASE_URL>layouts/<name>/global.js">` if the layout has `global.ts`.
  3. `<script type="module" src="<BASE_URL>app/<page>/index.js">`, always.
  4. The live-reload script, when `NODE_ENV` is `development` (see [dev-server.md](dev-server.md#live-reload)).

  A layout without `<!-- {{scripts}} -->` gets none of these, live reload included.

### Environment blocks

These run after every placeholder is replaced, on the whole page, `content()` included.

- **`layouts/production-only`** — Unless `NODE_ENV` is `production`, every block from `<!-- {{production-only:start}} -->` to the next `<!-- {{production-only:end}} -->` is removed, markers included. The markers must be written exactly so. Blocks don't nest. A placeholder inside a block is still filled first, then removed with it.
- **`layouts/placeholder-strip`** — Unless `NODE_ENV` is `development`, every comment matching `/<!--\s*{{[^}]+}}\s*-->/` is removed. This is looser than `layouts/placeholder-form`, so a mistyped placeholder is never filled but disappears outside development. In production it also removes the `production-only` markers, keeping what's between them. In development, leftover placeholders stay in the output.

## TODO

- **`layouts/placeholder-form`** — Write `{{title}}` as a comment like the others.
- **`layouts/placeholder-first-only`** — Replace every occurrence of a placeholder, not just the first.
- **`layouts/placeholder-dollar`** — Insert text literally, with a replacer function, so `$` patterns are left alone.
- **`layouts/pick`** — Validate `config.layout` as a folder name.
