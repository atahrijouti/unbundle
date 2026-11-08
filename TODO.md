# TODO

The backlog, in the order to work through it. Each group above "To decide" is one change: write its proposal, then build it (see `CONTRIBUTING.md`). Items name the spec rule they change.

## Build failures

- **`build/html`** — Don't write pages that fail; skip them and report them (see the TODOs on `errors/page/error-page`).
- **`errors/page/error-page`** — Only the dev server shows error pages. The build doesn't write pages that fail: it skips them, builds the rest, reports on the command line each failed page and why, then exits non-zero.
- **`errors/page/unchecked`** — In the build, every error while producing a page is reported on the command line, and no HTML is written for that page.
- **`errors/build/exit`** — Exit non-zero on any error.
- **`errors/static`** — Don't fail when the static folder doesn't exist. A site with no static files, or one that keeps an empty `public/` out of git, should still build.

## Sample site in CI

- Run `pnpm sample:build` in the PR workflow, after `pnpm check`. Depends on "Build failures" above: until then a failing page is written as an error page or stops the build, and the build still exits 0, so the step would only catch errors while filling the staging folder or loading the config.

## Dev server errors

- **`errors/dev-server/crash`** — Catch errors while answering a request and return a 500 page instead of stopping.
- **`errors/page/unchecked`** — In the dev server, every error while producing a page becomes a 500 error page, and the dev server keeps running.
- **`errors/page/checks`** — A missing `content` export is 500, like the other checks.
- **`errors/page/error-page`** — Live reload only in development. Escape the message.
- **`errors/staging/sync`** — Don't reload after a failed sync.
- **`errors/staging/dev-server`** — Show errors from filling the staging folder in the browser too, on the page being viewed, not only in the log.

## Tests from the spec

- Write tests from the spec. Explore how thoroughly first. Things known so far:
  - `PORT: 0` lets each test run its own dev server (`dev-server/port`).
  - The dev server logs nothing when a sync finishes or a reload is sent; syncs wait 50 ms and reloads 750 ms (`staging/dev-server`, `dev-server/reload/trigger`).
  - Every rule was checked on Windows only. Symlinks and path separators may behave differently elsewhere.
  - A few rules need a real browser or a second device (`dev-server/reload/reconnect`, `dev-server/reload/host`).

## Placeholder filling

- **`layout/placeholders/dollar`** — Insert values literally, by passing a function to `replace` instead of a string.
- **`layout/placeholders/first-only`** — Fill every occurrence of a placeholder, not just the first.
- **`layout/placeholders/order`** — Only fill placeholders written in the layout file, never ones that appear inside a filled value.

## Metadata output

- **`metadata/tags/escaping`** — Escape every value properly, the title and the `<link>` hrefs included.
- **`metadata/tags/keys`** — Render a tag only for entries whose value isn't `null` or `undefined`. Render any string as is, `""` included.
- **`metadata/required`** — Every page must have a title; that's why site metadata is required. Check `title` (and `description`, also required by the type) at runtime, so a missing title is an error instead of the text `undefined`.
- **`metadata/export`** — Warn when a layout's `metadata.ts` has no `metadata` export.

## Staging folder

- **`staging/build`** — Empty the staging folder before a build, so stale files don't ship.
- **`staging/dev-server`** — Remove a file from the staging folder when it's deleted from the source folder.
- **`staging/copy`** — Make the same file win when an `x.ts` and an `x.js` sit side by side, in a fill and in every sync, or report the clash as an error.

## Import rewriting

- **`staging/ts-imports`** — Change `.ts` in side-effect imports and `import()` too, and only in real import paths, not in strings or comments.
- **`page/module/ready`** — Detect a `ready` export properly instead of matching text. Keep adding the listener to the page's `index.js`, so it stays visible there.

## Input checks

- **`config/base-url`** — Treat a `BASE_URL` of `null` or `undefined` as not set, so it defaults to `/`, and reject any other value that isn't a string with a clear message.
- **`layout/pick`** — Check that `config.layout` is a layout's name, and allow only safe characters in layout names.
- **`page/url/index-clash`** — Reject a page named `index`, or resolve the clash with `home`.

## Dev server serving

- **`dev-server/serve/order`** — Serve the `404` page with status 404 when one exists, instead of `404 :-/`. `/404` should also return 404, like GitHub Pages.
- **`dev-server/serve/mime`** — Cover file types as exhaustively as practical, `.webmanifest` and `.map` included.
- **`dev-server/serve/base-url`** — Serve the site under its base URL.
- **`page/url/dev-server`** — Decode percent-encoded paths, and accept `/<name>/`.

## Dev server watching

- **`dev-server/watch`** — Ignore the temporary files other popular editors write while saving, not only Helix's `.bck`.
- **`dev-server/reload/reconnect`** — Keep trying every second until the dev server is back, then reload, instead of reloading into the browser's error page.
- **`static/watch`** — Consider watching the static folder too, so changes in it trigger live reload.
- **`page/module/fresh`** — Also reload the modules the page's module and the metadata files import.

## Config used everywhere

- **`config/file/keys`** — Use every key everywhere it applies, so the config overrides everything, and make `NODE_MODULES_FOLDER` mean something or remove it.

## Package fixes

- **`package/types`** — Add an optional `ready?: () => void` to `Module`, matching `page/module/exports`.
- **`package/eslint/require-extensions`** — Research how the fix should handle a path whose file doesn't exist. For example: add `.ts` only when that file exists, replace `.js` with `.ts` when `./x.ts` exists, and otherwise report without a fix.
- **`package/eslint/require-index`** — Build the fix from the path without its query and trailing slash, or skip the fix when there's a query.
- **`package/helpers/html-css`** — Decide whether `html` and `css` should keep escapes as written or process them; either way, drop the `String.raw` call that does nothing.

## To decide

- **`layout/folder/files`** — Go through the names of the files unbundle reads from a layout's and a page's folder (`layout.html`, `metadata.ts`, `styles.css`, `sync.ts`, `global.ts`, `index.ts`) and pick the clearest name for each, for example `layout.css` rather than `styles.css` in a layout, or decide that the folder name already says enough.
- **`layout/placeholders/form`** — Write `{{title}}` as a comment like the others.
- **`layout/format`** — Format the HTML with the site's Prettier config when it has one, like transpiled files (see `staging/format`).
- **`staging/fill`** — Consider renaming `dist/` to a name that says unbundle generates it and authors don't edit it.
- **`staging/ships-all`** — Consider leaving files only used at build time out of the site, or a config entry with glob patterns for files to leave out.
- **`import-map/file/format`** — Use the browser's standard import map format, `{ "imports": { … } }`, so maps can be copied as they are and can use `scopes` and `integrity`.
- **`import-map/node-modules/copy`** — Research a better way to bring `node_modules` dependencies into the site, so a file arrives with what it imports from its package.
- **`page/folder/location`** — Research producing several pages from one page, for blogs and other lists. Astro does it with `[slug].astro` files exporting `getStaticPaths()`, run at build time, returning one `{ params, props }` per page.
- **`page/module/node`** — Research how to deal with the gap between what Node accepts at build time and what the browser copy accepts, so a page doesn't work in one and fail in the other.
- **`page/module/runs-twice`** — Export helpers that tell build time from the browser, such as `isBrowser`, so a page module can guard browser-only code without `typeof document` checks.
- **`page/url/name`** — Add a config option to write `<name>/index.html` instead of `<name>.html`, like Astro's `build.format`; the dev server accepts the matching URLs.
- **`metadata/tags/keys`** — Review `icon`: it always gets `type="image/png"`, whatever the file is.
- **`metadata/tags/urls`** — Apply the base URL to `manifest` and `icon` paths that start with `./`, the way the import map does.
- **`package/eslint/require-extensions`** — Research whether authors can stop writing `.ts` in relative imports, so these rules are no longer needed.
