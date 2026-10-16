# Pages

A page is a folder in the source folder whose module provides its content and metadata at build time and runs again in the browser.

## Shape

```
<source folder>/app/<page>/
  index.ts      required, the page's module
  styles.css    optional
  sync.ts       optional, the page's sync script
```

The module's exports:

```ts
export const content: () => string             // required
export const metadata: Partial<Metadata>       // optional, see metadata.md
export const config: { layout?: string }       // optional, see layouts.md
export const ready: () => void                 // optional
```

## Behavior

- **`pages/folder`** — Every folder directly inside `<source folder>/app/` is a page, named after its folder.
- **`pages/flat`** — Pages are flat: a folder inside a page's folder is part of that page, not another page.
- **`pages/other-files`** — Other files in a page's folder reach the site like the rest of the source folder (see [build.md](build.md)).
- **`pages/home`** — The page named `home` is at `/` and is built as `index.html`.
- **`pages/route`** — Any other page `<name>` is at `/<name>` in the dev server and is built as `<name>.html`. In production, `/<name>` without `.html` works only if the host resolves it; GitHub Pages does.
- **`pages/index-clash`** — A page named `index` is also built as `index.html`. With both `home` and `index`, the last one written wins.
- **`pages/404`** — A page named `404` is built as `404.html`, which GitHub Pages serves for unknown URLs. unbundle gives it no special treatment.
- **`pages/urls`** — A page's own files are at `<base URL>app/<page>/`: its script `index.js`, and `styles.css` when it exists.
- **`pages/module`** — The page's module runs twice: at build time, to read `content`, `metadata` and `config`, and in the browser, as the page's script.
- **`pages/content`** — `content()` is called once at build time, with no arguments. The string it returns goes where the layout file has its content placeholder. It isn't awaited.
- **`pages/ready`** — If the module's source contains the text `export const ready`, the browser runs `ready` once the HTML is parsed (`DOMContentLoaded`). Only that exact text is detected: `export function ready` is not, and `export const readyCount` is, wrongly.

## Errors

Producing a page runs these checks in order; the first that fails decides the response:

1. **`pages/error-site-metadata`** — The site metadata file is missing, fails to load, or doesn't export `metadata`: 500.
2. **`pages/error-module`** — The page's `index.ts` is missing or fails to load: 500.
3. **`pages/error-content`** — The module doesn't export `content`: 400.
4. **`pages/error-layout`** — The layout has no layout file: 500.
5. **`pages/error-layout-files`** — The layout's metadata fails to load, or a sync script fails to compile: 500.

- **`pages/error-page`** — A failed check produces a bare page, `<title><page> - <status></title><p><message></p>`, without the layout, and logs the message. The message is inserted as raw HTML. The page includes live reload in production too.
- **`pages/error-uncaught`** — Any other error while producing a page is not turned into an error page: `content` not being a function or throwing, an invalid import map, a metadata value that isn't a string. See `dev-server/crash` and `build/html` for what happens then.

## Notes

- Because the module also runs at build time, its top-level code and `content()` must not use browser-only APIs such as `document` or `window`. That includes `textToHTML`.

## TODO

- **`pages/flat`** — Research how to produce several pages from one page, for blogs and other lists of pages. Astro does it with dynamic route files (`[slug].astro`) exporting `getStaticPaths()`, which runs at build time and returns one `{ params, props }` per page.
- **`pages/route`** — Add a config option for how pages are written: `file` (`<page>.html`, today's behavior and the default) or `directory` (`<page>/index.html`), like Astro's `build.format`. The dev server should accept the URLs that match.
- **`pages/index-clash`** — Reject a page named `index`, or otherwise resolve the clash with `home`.
- **`pages/ready`** — Detect a `ready` export properly instead of matching text. Keep adding the listener to the page's built script, so it stays visible there.
- **`pages/error-content`** — A missing `content` export breaks the page contract like the other errors: return 500.
- **`pages/error-page`** — Only include live reload in development. Escape the message.
- **`pages/error-uncaught`** — Turn every error while producing a page into a 500 error page.
