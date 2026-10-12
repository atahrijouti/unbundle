# Package

What a site imports from unbundle: the browser helpers and the ESLint plugin.

## `unbundle`

`import { … } from "unbundle"` resolves to `dist/client/index.js`, a bundled ES module. Its types come from `lib/client/index.ts`.

- **`package/types`** — Exports the types `Metadata`, `Module` and `Config` (see [pages.md](pages.md) and [metadata.md](metadata.md)).
- **`package/html-css`** — `html` and `css` are template tags that return the string unchanged. They exist so editors highlight the template. They use `String.raw`, so escapes such as `\n` stay as written instead of becoming characters.
- **`package/text-to-html`** — `textToHTML(string)` parses the string and returns its first element. If there is none, it logs an error and returns an empty `<div>`.
- **`package/loop`** — `$loop(items, fn)` maps each item to a string and joins them with no separator.

## `unbundle/eslint`

`import unbundle from "unbundle/eslint"` gives an ESLint plugin named `unbundle`. Its `recommended` config turns on both rules as errors.

Both rules check the source of `import` and `export … from` declarations:

- **`package/eslint-scope`** — Only relative sources (starting with `.`) are checked. A `?query` is ignored. Sources already ending in `.ts` are skipped. Paths resolve from the linted file's folder.
- **`package/eslint-require-extensions`** — `unbundle/require-extensions` reports a source that doesn't exist on disk: "Relative imports and exports must end with .ts". The fix appends `.ts`. There is no fix when the source has a `?query`. A source that exists as written, such as `./styles.css`, is not reported.
- **`package/eslint-require-index`** — `unbundle/require-index` reports a source that is a folder: "Directory paths must end with index.ts". The fix appends `/index.ts`.
- **`package/eslint-quotes`** — Fixes write the source with single quotes.

## TODO

- **`package/html-css`** — `esbuild/untag.js` (an esbuild plugin that strips the `html` and `css` tags) is dead code: nothing uses it, and it isn't published. Delete it.
