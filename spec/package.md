# Package

## Imports

- **`package/imports`** — A site imports from unbundle:

  ```ts
  import { html, css, textToHTML, $loop } from "unbundle"
  import type { Metadata, Module, Config } from "unbundle"
  import unbundle from "unbundle/eslint"
  ```

  What a site imports reaches the site through the import map like any other module (see `import-map/node-modules/copy`).
- **`package/types`** — `Metadata`, `Module` and `Config` describe metadata and a page's module. `Module` has `content`, `metadata` and `config`, but no `ready` (see `page/module/exports`).

## Helpers

- **`package/helpers/html-css`** — `html` and `css` are template tags that return the same string an untagged template literal would: escapes processed, values interpolated. They exist so editors highlight the HTML and CSS inside them. The code calls `String.raw`, but passes it the processed strings, so it has no effect. A part of the template holding an escape that isn't valid JavaScript, such as CSS's `\2014`, comes out as the text `undefined`.
- **`package/helpers/text-to-html`** — `textToHTML(string)` sets the string as the `innerHTML` of a new `<div>` and returns its first element, still a child of that detached `<div>`. Text and later elements are dropped, and markup that can't sit in a `<div>`, such as a lone `<tr>`, parses to nothing. With no element, it logs an error and returns an empty `<div>`. It needs a DOM, so it throws in Node, `content()` included.
- **`package/helpers/loop`** — `$loop(items, fn)` maps each item to a string and joins them with nothing in between. `fn` also receives the index and the array, though its type only declares the item.

## ESLint rules

- **`package/eslint/recommended`** — `unbundle.configs.recommended` registers the plugin and turns on both ESLint rules as errors, for ESLint's flat config, with no `files` restriction.
- **`package/eslint/scope`** — The rules check the path of every `import`, side-effect imports and `import type` included, and of `export … from` and `export * from`. A `?query` is removed first; then only paths starting with `.` and not ending in `.ts` are checked, resolved from the linted file's folder. `import()` and `require()` aren't checked.
- **`package/eslint/require-extensions`** — `unbundle/require-extensions` reports a relative path that doesn't exist: "Relative imports and exports must end with .ts". A path that exists as written, such as `./styles.css` or a folder, isn't reported. Its fix adds `.ts`, even when the result doesn't exist either: `./x.js` becomes `./x.js.ts`. There's no fix when the path has a `?query`.
- **`package/eslint/require-index`** — `unbundle/require-index` reports a path to a folder: "Directory paths must end with index.ts". Its fix adds `/index.ts`, which breaks a path with a trailing slash (`./dir//index.ts`) or a query: `./dir?x/index.ts` still points at the folder, so `--fix` adds `/index.ts` again on each pass, up to ESLint's 10. A symlink to a folder isn't seen as a folder, so neither rule reports it.
- **`package/eslint/quotes`** — Fixes write the path in single quotes.
