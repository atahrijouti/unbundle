# Staging folder

## Filling it

- **`staging/fill`** — Before producing any page, the build and the dev server fill the staging folder (`dist/`) from the source folder. Transpiled and copied files wait there: the build then writes them to the output folder (see `build/write`), and the dev server serves them (see `dev-server/serve/order`) and writes nothing to the output folder.
- **`staging/ships-all`** — Every file in the source folder reaches the staging folder, keeping its path, including files only used at build time such as layout files and metadata. Empty folders don't.
- **`staging/build`** — The build doesn't empty the staging folder first: files from earlier runs, the dev server's included, stay and reach the output folder.
- **`staging/dev-server`** — The dev server empties the staging folder at start, then keeps it in sync: changes are collected until none has come in for 50 ms, then the changed `.ts` files are transpiled and other files copied. Deleted source files stay in the staging folder until the dev server restarts.

## Copying

- **`staging/copy`** — Files other than `.ts` are copied unchanged. When the staging folder is filled, copying happens before transpiling, so an `x.ts` overwrites an `x.js` next to it. In the dev server, whichever of the two was synced last wins; when both change in the same sync, either can win.

## Transpiling

- **`staging/transpile`** — Each `.ts` file becomes a `.js` file next to where it was, one to one: types removed, never bundled or minified. Only `.ts` files are transpiled; `.tsx`, `.mts` and `.cts` files are copied as they are. The site's `tsconfig.json` is read as esbuild normally reads it. A `.d.ts` file becomes an empty `.d.js`. All the `.ts` files of one fill or sync are transpiled together (see `errors/staging/transpile`).
- **`staging/ts-imports`** — In each transpiled file, `.ts` becomes `.js` wherever the text `from "<path>.ts"` (or with single quotes) appears and the path starts with `.`. It's a text replacement over the whole file, so matching text in strings, and in the comments the transpiled file keeps, changes too. Side-effect imports (`import "./x.ts"`), `import()`, and paths with a query (`./x.ts?v=1`) keep `.ts`.
- **`staging/format`** — Transpiled files are formatted with the site's Prettier config, as found from the file's path in the staging folder; a `parser` set there wins. Copied files aren't formatted.
