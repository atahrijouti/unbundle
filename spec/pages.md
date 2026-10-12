# Pages

## Page folders

- **`pages/folder`** — Every folder directly inside `<SRC_FOLDER>/app/` is a page, named after the folder. Files are ignored. Symlinked folders and hidden folders (`.name`) count. If `app/` doesn't exist, listing pages throws (see [build.md](build.md) and [dev-server.md](dev-server.md) for what each command does then).
- **`pages/flat`** — Pages are flat: only the first level of `app/` is read. A folder inside a page folder is part of that page, not another page.
- **`pages/home`** — The page named `home` is served at `/` and built as `out/index.html`.
- **`pages/route`** — Any other page `<name>` is served at `/<name>` by the dev server and built as `out/<name>.html`. Clean URLs in production (`/<name>` without `.html`) depend on the host resolving them; GitHub Pages does.
- **`pages/index-clash`** — A page named `index` also builds `out/index.html`. With both `home` and `index`, the one written last wins, in directory listing order. In dev, `index` is served at `/index`.
- **`pages/404`** — A page named `404` builds `out/404.html`, which GitHub Pages uses as its not-found page. unbundle gives it no special treatment.
- **`pages/urls`** — A page's files are served from `<BASE_URL>app/<page>/`: `index.js`, and `styles.css` when it exists.

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

- **`pages/module-server`** — Node imports it when the page is assembled, to read `content`, `metadata` and `config`. The rules in [README.md](README.md#runtime) apply.
- **`pages/module-browser`** — It is also transpiled to `index.js` and loaded on the page as a module script.
- **`pages/module-top-level`** — Top-level code therefore runs in both Node and the browser. It must not touch browser-only APIs (the DOM, `window`) at the top level.

Exports:

- **`pages/content`** — `content: () => string`, required. It is called once, in Node, with no arguments, and its return value replaces the layout's `<!-- {{content}} -->`. It must not use the DOM either, which includes `textToHTML`. Only its presence is checked: a non-function value throws, and an `async` function inserts the text `[object Promise]`.
- **`pages/metadata`** — `metadata?: Partial<Metadata>`, optional. See [metadata.md](metadata.md).
- **`pages/config`** — `config?: { layout?: string }`, optional. See [layouts.md](layouts.md).
- **`pages/ready`** — If the source of `src/app/<page>/index.ts` contains the text `export const ready`, the transpiled `index.js` ends with `document.addEventListener("DOMContentLoaded", ready);` (then formatted with Prettier like the rest of the file). The check is a plain substring match:
  - `export function ready`, `export { ready }` and re-exports are not detected.
  - `export const readyCount` (or the text in a comment) is detected, and the appended line then refers to a `ready` that doesn't exist.
  - Only a page's own `index.ts` is checked, and only under a folder literally named `src`.

## Errors

Assembling a page runs these checks in order. The first one that fails decides the response:

1. **`pages/error-site-metadata`** — `src/metadata.ts` is missing, fails to import, or has no `metadata` export: 500.
2. **`pages/error-missing-module`** — `index.ts` is missing or fails to import: 500.
3. **`pages/error-missing-content`** — No `content` export: 400.
4. **`pages/error-layout`** — The layout's `layout.html` doesn't exist: 500.
5. **`pages/error-layout-files`** — The layout's `metadata.ts` fails to import, or either `sync.ts` fails to compile: 500.

- **`pages/error-page`** — A failed check returns `<title><page> - <status></title><p><message></p>` followed by the live-reload script, and logs the message. The page doesn't use the layout and isn't formatted. The message is inserted as raw HTML and contains absolute file paths. The live-reload script is included whatever `NODE_ENV` is.
- **`pages/error-uncaught`** — Any other error while assembling a page is thrown, not turned into an error page. That includes `content` not being a function or throwing, an invalid `src/import-map.json`, a metadata value that isn't a string, and Prettier failing on the HTML. See `dev-server/crash` and `build/html` for what happens then.

## TODO

- **`pages/flat`** — Research how to generate several pages from one page module, for blogs and other lists of pages. Astro does it with dynamic route files (`[slug].astro`) exporting `getStaticPaths()`, which runs at build time and returns one `{ params, props }` per page.
- **`pages/route`** — Add a config option for the output format: `file` (`<page>.html`, today's behavior and the default) or `directory` (`<page>/index.html`), like Astro's `build.format`. The dev server should accept the URLs that match the chosen format.
- **`pages/index-clash`** — Reject a page named `index`, or otherwise resolve the clash with `home`.
- **`pages/ready`** — Detect a `ready` export properly instead of matching text. Keep appending the listener to the transpiled `index.js`, so it stays visible in the file.
- **`pages/error-missing-content`** — A missing `content` export breaks the page contract like the other errors: return 500.
- **`pages/error-page`** — Only include the live-reload script in development. Escape the message.
- **`pages/error-uncaught`** — Turn every error while assembling a page into a 500 error page.
