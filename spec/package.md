# Package

What a site imports from unbundle: browser helpers from `unbundle`, and ESLint rules from `unbundle/eslint`.

## Shape

```ts
import { html, css, textToHTML, $loop } from "unbundle"
import type { Metadata, Module, Config } from "unbundle"
import unbundle from "unbundle/eslint"
```

## Behavior

### Browser helpers

- **`package/types`** — `Metadata`, `Module` and `Config` describe site metadata and a page's module (see [pages.md](pages.md) and [metadata.md](metadata.md)).
- **`package/html-css`** — `html` and `css` are template tags that return the same string an untagged template literal would, escapes processed. They exist so editors highlight the HTML and CSS inside them.
- **`package/text-to-html`** — `textToHTML(string)` returns the first element the string parses to, as a new element not yet in the page. Text and later elements are dropped. If there is no element, it logs an error and returns an empty `<div>`.
- **`package/loop`** — `$loop(items, fn)` maps each item to a string and joins them with nothing in between.

### ESLint rules

- **`package/eslint-recommended`** — `unbundle.configs.recommended` turns on both rules as errors, for ESLint's flat config.
- **`package/eslint-scope`** — The rules check relative paths in `import … from` and `export … from`. Paths ending in `.ts`, and dynamic `import()`, aren't checked.
- **`package/eslint-require-extensions`** — `unbundle/require-extensions` reports a relative path that doesn't exist on disk: "Relative imports and exports must end with .ts". Its fix adds `.ts`, even when the result doesn't exist either: `./x.js` becomes `./x.js.ts`.
- **`package/eslint-require-index`** — `unbundle/require-index` reports a path to a folder: "Directory paths must end with index.ts". Its fix adds `/index.ts`, which breaks a path with a query (`./dir?x/index.ts`) or a trailing slash (`./dir//index.ts`).

## TODO

- **`package/html-css`** — Decide whether `html` and `css` should keep escapes as written or process them. The code calls `String.raw` but passes it already processed strings, so it has no effect.
- **`package/html-css`** — `esbuild/untag.js` (an esbuild plugin that strips the `html` and `css` tags) is dead code: nothing uses it, and it isn't listed in `files`. Delete it.
- **`package/eslint-require-extensions`** — Only offer the `.ts` fix when the resulting file exists.
- **`package/eslint-require-extensions`** — Research whether authors can stop writing `.ts` in relative imports (both Node at build time and the browser need a real file path today), so these rules are no longer needed.
- **`package/eslint-require-index`** — Build the fix from the path without its query and trailing slash.
