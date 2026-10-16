# Package

What a site imports from unbundle: the browser helpers and the ESLint plugin.

## `unbundle`

`import { … } from "unbundle"` resolves to `dist/client/index.js`, a bundled ES module. Its types come from `lib/client/index.ts`.

- **`package/types`** — Exports the types `Metadata`, `Module` and `Config` (see [pages.md](pages.md) and [metadata.md](metadata.md)).
- **`package/html-css`** — `html` and `css` are template tags that return the same string an untagged template literal would: escapes such as `\n` are processed and values are interpolated. They exist so editors highlight the template. The code calls `String.raw`, but passes it the processed strings, so it has no effect.
- **`package/text-to-html`** — `textToHTML(string)` sets the string as the `innerHTML` of a new `<div>` and returns its first element. Text and any later top-level elements are dropped. The element stays a child of that detached `<div>`. Markup that can't sit in a `<div>`, such as a lone `<tr>`, parses to nothing. If there is no element, it logs an error and returns an empty `<div>`. It needs a DOM, so it throws in Node, including inside a page's `content()`.
- **`package/loop`** — `$loop(items, fn)` is `items.map(fn).join("")`. `fn` also receives the index and the array, though its type only declares the item.

## `unbundle/eslint`

`import unbundle from "unbundle/eslint"` gives an ESLint plugin named `unbundle`, for flat config. `unbundle.configs.recommended` registers the plugin and turns on both rules as errors, with no `files` restriction. Types come from `eslint/unbundle.d.ts`.

- **`package/eslint-scope`** — Both rules check the source of `import`, `export … from` and `export * from` declarations, `import type` included. Dynamic `import()` and `require()` are not checked. A `?query` is removed first, then a source is checked only if it starts with `.` and doesn't end with `.ts`. Paths resolve from the linted file's folder.
- **`package/eslint-require-extensions`** — `unbundle/require-extensions` reports a source that doesn't exist on disk: "Relative imports and exports must end with .ts". The fix appends `.ts` to the source as written, without checking the result exists: `./x.js` becomes `./x.js.ts`. There is no fix when the source has a `?query`. A source that exists as written, such as `./styles.css` or a folder, is not reported.
- **`package/eslint-require-index`** — `unbundle/require-index` reports a source that is a folder: "Directory paths must end with index.ts". The fix appends `/index.ts` to the source as written, even with a `?query` (`./dir?x` becomes `./dir?x/index.ts`) or a trailing slash (`./dir/` becomes `./dir//index.ts`). A symlink to a folder is not seen as a folder, so neither rule reports it.
- **`package/eslint-quotes`** — Fixes write the source with single quotes.

## TODO

- **`package/html-css`** — Decide whether `html` and `css` should keep escapes raw (`String.raw(strings, …)`) or process them; either way, drop the `String.raw` call that does nothing.
- **`package/html-css`** — `esbuild/untag.js` (an esbuild plugin that strips the `html` and `css` tags) is dead code: nothing uses it, and it isn't listed in `files`. Delete it.
- **`package/eslint-require-extensions`** — Only offer the `.ts` fix when the resulting file exists.
- **`package/eslint-require-extensions`** — Research whether authors can stop writing `.ts` in relative imports (both Node at build time and the browser need a real file path today), so these rules are no longer needed.
- **`package/eslint-require-index`** — Build the fix from the source without its query and trailing slash, or skip the fix when there is a query.
