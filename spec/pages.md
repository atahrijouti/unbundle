# Pages

## Page folders

- **`pages/folder`** — Every folder directly inside `src/app/` is a page, named after the folder. Files are ignored.
- **`pages/flat`** — Pages are flat: only the first level of `src/app/` is read. A folder inside a page folder is part of that page, not another page.
- **`pages/home`** — The page named `home` is served at `/` and built as `out/index.html`.
- **`pages/route`** — Any other page `<name>` is served at `/<name>` by the dev server and built as `out/<name>.html`. Clean URLs in production (`/<name>` without `.html`) depend on the host resolving them; GitHub Pages does.
- **`pages/404`** — A page named `404` builds `out/404.html`, which GitHub Pages uses as its not-found page. unbundle gives it no special treatment.

## Page files

```
src/app/<page>/
  index.ts      required, the page module
  styles.css    optional, linked after the layout's
  sync.ts       optional, inlined before first paint, after the layout's
```

- **`pages/other-files`** — Anything else in a page folder is transpiled (`.ts`) or copied like every other file in `src/` (see [build.md](build.md)).

## The page module

`src/app/<page>/index.ts` runs in two places:

- **`pages/module-server`** — Node imports it when the page is assembled, to read `content`, `metadata` and `config`.
- **`pages/module-browser`** — It is also transpiled to `index.js` and loaded on the page as a module script.
- **`pages/module-top-level`** — Top-level code therefore runs in both Node and the browser. It must not touch browser-only APIs (the DOM, `window`) at the top level.

Exports:

- **`pages/content`** — `content: () => string`, required. Its return value replaces the layout's `<!-- {{content}} -->`.
- **`pages/metadata`** — `metadata?: Partial<Metadata>`, optional. See [metadata.md](metadata.md).
- **`pages/config`** — `config?: { layout?: string }`, optional. See [layouts.md](layouts.md).
- **`pages/ready`** — If the text `export const ready` appears in the source of `src/app/<page>/index.ts`, the transpiled `index.js` ends with `document.addEventListener("DOMContentLoaded", ready);`. The check is a plain text match: `export function ready`, `export { ready }` or a re-export are not detected. Only a page's own `index.ts` is checked.

## Errors

- **`pages/error-missing-module`** — No `index.ts`, or one that fails to import: status 500.
- **`pages/error-missing-content`** — No `content` export: status 400.
- **`pages/error-page`** — An error returns a minimal HTML page with the page name, the status and the message, and logs the message. That page always includes the live-reload script (see [dev-server.md](dev-server.md)).

## TODO

- **`pages/flat`** — Research how to generate several pages from one page module, for blogs and other lists of pages. Astro does it with dynamic route files (`[slug].astro`) exporting `getStaticPaths()`, which runs at build time and returns one `{ params, props }` per page.
- **`pages/route`** — Add a config option for the output format: `file` (`<page>.html`, today's behavior and the default) or `directory` (`<page>/index.html`), like Astro's `build.format`. The dev server should accept the URLs that match the chosen format.
- **`pages/ready`** — Detect a `ready` export properly instead of matching text. Keep appending the listener to the transpiled `index.js`, so it stays visible in the file.
- **`pages/error-missing-content`** — A missing `content` export breaks the page contract like the other errors: return 500.
- **`pages/error-page`** — Only include the live-reload script in development.
