# Page

## Source

- **`page/folder`** — A page is a folder directly inside `<source folder>/app/`, named after its folder. Files there are ignored; hidden and symlinked folders count. Folders inside a page's folder belong to the page; they aren't pages.
- **`page/module`** — The folder's `index.ts` is the page's module. It runs at build time and again in the browser, so its top-level code and `content()` can't use browser-only APIs such as `document`, `textToHTML` included (see `package/text-to-html`).
- **`page/node`** — Node imports the site's TypeScript at build time, using its built-in type stripping (Node 22.18 or 23.6 and later). That TypeScript can't use enums, namespaces or parameter properties, and its relative imports must end in `.ts`; the browser copy accepts more, so a file can work in the browser and still fail at build time.
- **`page/exports`** — The module exports:

  ```ts
  export const content: () => string         // required
  export const metadata: Partial<Metadata>   // optional, see Metadata
  export const config: { layout?: string }   // optional, see Layout
  export const ready: () => void             // optional
  ```

- **`page/files`** — Optional `styles.css` and `sync.ts` (see [Scripts](scripts.md)). Other files reach the site like the rest of the source folder (see [Build](build.md)).

## Output

- **`page/home`** — `home` becomes `index.html`, at `/`.
- **`page/name`** — Any other page becomes `<name>.html`. `/<name>` without `.html` only works if the host resolves it; GitHub Pages does.
- **`page/index-clash`** — A page named `index` also becomes `index.html`. With both `home` and `index`, the last one written wins, in the order the folders are listed.
- **`page/404`** — A page named `404` becomes `404.html`, which GitHub Pages serves for unknown URLs. Nothing else is special about it.
- **`page/html`** — The page's HTML is its layout file filled with the page (see [Layout](layout.md)). `content()` is called once, with no arguments, and not awaited: an `async` one inserts the text `[object Promise]`.
- **`page/script`** — The page's module is loaded as a module script from `<base URL>app/<page>/index.js`, and its `styles.css`, if any, from `<base URL>app/<page>/styles.css`.
- **`page/ready`** — If the module's source contains the text `export const ready`, the page's script gets `document.addEventListener("DOMContentLoaded", ready)` after its code, before its exports. It's a text match: `export function ready` and `export { ready }` aren't detected, while `export const readyCount`, or the text in a comment, is, and the script then throws as soon as it loads, since that `ready` doesn't exist. Only a page's own `index.ts` is checked, and only when its path ends in `src/app/<page>/index.ts` (see `config/keys`).

## Development

- **`page/dev-url`** — `/` and `/<name>` serve the page. So does `/home`. `/<name>.html`, `/<name>/` and names that need percent-encoding don't.
- **`page/dev-found`** — Pages are found on each request, so a new page shows up without a restart.
- **`page/dev-fresh`** — Each request reloads the page's module and the metadata files. Modules they import are not reloaded until the dev server restarts. The layout file, sync scripts and the import map are read again on every request, in any mode.

## Errors

- **`page/error-checks`** — These checks run in order; the first that fails decides the status:
  1. The site metadata file is missing, fails to load, or doesn't export `metadata`: 500.
  2. The page's `index.ts` is missing or fails to load: 500.
  3. The module doesn't export `content`: 400.
  4. The layout has no layout file: 500.
  5. The layout's metadata fails to load, or a sync script fails to compile: 500.

  In the build, a sync script that doesn't compile stops the build before any page is produced (see `scripts/error-sync`).
- **`page/error-page`** — A failed check gives `<title><page> - <status></title><p><message></p>` instead of the layout, unformatted, and logs the message. The message is raw HTML; for checks 1 to 4 it includes an absolute file path. The page includes live reload, in production too.
- **`page/error-uncaught`** — Other errors aren't checked: `content` not being a function or throwing, a `description`, `theme-color` or `color-scheme` that isn't a string (see `metadata/error-type`), Prettier failing on the HTML, and, in the dev server, an invalid import map. The dev server stops (see `dev-server/crash`); the build stops writing pages (see `build/exit`). In the build, an invalid import map fails earlier (see `import-map/error-json`).

## TODO

- **`page/folder`** — Research producing several pages from one page, for blogs and other lists. Astro does it with `[slug].astro` files exporting `getStaticPaths()`, run at build time, returning one `{ params, props }` per page.
- **`page/name`** — Add a config option to write `<name>/index.html` instead of `<name>.html`, like Astro's `build.format`; the dev server accepts the matching URLs.
- **`page/index-clash`** — Reject a page named `index`, or resolve the clash with `home`.
- **`page/ready`** — Detect a `ready` export properly instead of matching text. Keep adding the listener to the page's script, so it stays visible there.
- **`page/error-checks`** — A missing `content` export is 500, like the other checks.
- **`page/error-page`** — Live reload only in development. Escape the message.
- **`page/error-uncaught`** — Every error while producing a page becomes a 500 error page.
- **`page/dev-url`** — Decode percent-encoded paths, and accept `/<name>/`.
- **`page/dev-fresh`** — Also reload the modules the page's module and the metadata files import.
