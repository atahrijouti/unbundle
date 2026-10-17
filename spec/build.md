# Build

## Source

- **`build/command`** — `unbundle-build` reads the source folder, the static folder and the config.
- **`build/pages`** — It finds the pages once, when it starts.

## Output

- **`build/out-reset`** — The output folder is emptied first.
- **`build/staging`** — The source folder is turned into the staging folder, which isn't emptied first: files from earlier runs, the dev server's included, stay and reach the output folder.
- **`build/ships-all`** — Every file in the source folder reaches the staging folder, keeping its path, including files only used at build time such as layout files and metadata.
- **`build/copy`** — Files other than `.ts` are copied unchanged.
- **`build/transpile`** — Each `.ts` file becomes a `.js` file next to where it was, one to one: types removed, never bundled or minified. `.tsx` and `.mts` files are copied, not transpiled.
- **`build/ts-imports`** — In `import … from` and `export … from`, a relative path ending in `.ts` is changed to `.js`. Side-effect imports (`import "./x.ts"`) and `import()` keep `.ts`.
- **`build/format`** — Transpiled files are formatted with the site's Prettier config.
- **`build/write`** — The static folder, then the staging folder, then each page's HTML are written to the output folder; a later file wins over an earlier one with the same name.
- **`build/html`** — Each page is written whatever its status: a page that fails is written as its error page.

## Development

- **`build/dev`** — The dev server fills the staging folder the same way (see `dev-server/staging`), and writes nothing to the output folder.

## Errors

- **`build/error-transpile`** — All `.ts` files are transpiled together: a syntax error in one stops the build with exit code 1, and none are written.
- **`build/exit`** — A missing `app/` folder or a config that fails to load exits non-zero. Any other error is logged and the build exits 0, including an error while producing a page, which also stops the remaining pages from being written.

## TODO

- **`build/html`** — Don't write pages that fail. Skip them, build the rest, then exit non-zero.
- **`build/exit`** — Exit non-zero on any error.
- **`build/staging`** — Empty the staging folder before a build, so stale files don't ship.
- **`build/staging`** — Consider renaming `dist/` to a name that says unbundle generates it and authors don't edit it.
- **`build/ts-imports`** — Change `.ts` in side-effect imports and `import()` too. Today the change is a text replacement over the whole file, which also touches matching text in strings and comments; only change real import paths.
