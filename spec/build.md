# Build

## Source

- **`build/command`** — `unbundle-build` reads the source folder, the static folder and the config.
- **`build/pages`** — It finds the pages once, when it starts.

## Output

- **`build/out-reset`** — The output folder is emptied first.
- **`build/staging`** — The source folder is turned into the staging folder, which isn't emptied first: files from earlier runs, the dev server's included, stay and reach the output folder.
- **`build/ships-all`** — Every file in the source folder reaches the staging folder, keeping its path, including files only used at build time such as layout files and metadata. Empty folders don't.
- **`build/copy`** — Files other than `.ts` are copied unchanged, `.tsx`, `.mts` and `.cts` included. Copying happens before transpiling.
- **`build/transpile`** — Each `.ts` file becomes a `.js` file next to where it was, one to one: types removed, never bundled or minified. The site's `tsconfig.json` is read as esbuild normally reads it. A `.d.ts` file becomes an empty `.d.js`.
- **`build/ts-imports`** — In each transpiled file, `.ts` becomes `.js` wherever the text `from "<path>.ts"` (or with single quotes) appears and the path starts with `.`. It's a text replacement over the whole file, so matching text in strings, and in the comments the transpiled file keeps, changes too. Side-effect imports (`import "./x.ts"`), `import()`, and paths with a query (`./x.ts?v=1`) keep `.ts`.
- **`build/format`** — Transpiled files are formatted with the site's Prettier config, as found from the file's path in the staging folder; a `parser` set there wins. Copied files aren't formatted.
- **`build/write`** — The static folder, then the staging folder, then each page's HTML are written to the output folder; a later file wins over an earlier one with the same name.
- **`build/html`** — Each page is written whatever its status, one at a time, in the order the folders are listed: a page that fails is written as its error page.

## Development

- **`build/dev`** — The dev server fills the staging folder the same way (see `dev-server/staging`), and writes nothing to the output folder.

## Errors

- **`build/error-transpile`** — All `.ts` files are transpiled together: a syntax error in one stops the build with exit code 1, and none are written.
- **`build/error-staging`** — Any error while filling the staging folder, such as a syntax error (see `build/error-transpile`) or an invalid import map (see `import-map/error-json`), is logged as `Error preparing dist:` and exits with code 1.
- **`build/exit`** — A missing `app/` folder or a config that fails to load exits non-zero. Any other error, while emptying the output folder, copying into it, or producing or writing a page, is logged and the build exits 0. An error while producing a page also stops the remaining pages from being written.

## TODO

- **`build/html`** — Don't write pages that fail. Skip them, build the rest, then exit non-zero.
- **`build/exit`** — Exit non-zero on any error.
- **`build/staging`** — Empty the staging folder before a build, so stale files don't ship.
- **`build/staging`** — Consider renaming `dist/` to a name that says unbundle generates it and authors don't edit it.
- **`build/ts-imports`** — Change `.ts` in side-effect imports and `import()` too, and only in real import paths, not in strings or comments.
