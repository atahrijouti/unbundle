# Build

The build (`unbundle-build`) produces every page and writes the finished site to the output folder.

## Behavior

### Starting

- **`build/production`** — The build produces production, unless `NODE_ENV` is set to something else (see [config.md](config.md#development-and-production)).
- **`build/pages`** — The build finds the pages once, when it starts (see [pages.md](pages.md)).
- **`build/out-reset`** — The output folder is emptied.

### The staging folder

The build and the dev server first turn the source folder into the staging folder.

- **`build/staging`** — The staging folder isn't emptied first, so files from earlier runs, the dev server's included, stay in it and reach the output folder.
- **`build/ships-all`** — Every file in the source folder reaches the staging folder, keeping its path. That includes files only used at build time, such as layout files and metadata.
- **`build/copy`** — Files other than `.ts` are copied unchanged.
- **`build/transpile`** — Each `.ts` file is transpiled into a `.js` file next to where it was, one to one: types removed, never bundled or minified. `.tsx` and `.mts` files are copied, not transpiled.
- **`build/ts-imports`** — In `import … from` and `export … from`, a relative path ending in `.ts` is changed to `.js`. Side-effect imports (`import "./x.ts"`) and `import()` keep `.ts`.
- **`build/format`** — Transpiled files are formatted with the site's Prettier config.
- **`build/ready`** — A page's script gets its `ready` listener added (see `pages/ready`).

### Writing the site

- **`build/write`** — The static folder is copied into the output folder, then the staging folder on top of it, then each page's HTML. A later file wins over an earlier one with the same name.
- **`build/html`** — Each page is written as described in `pages/home` and `pages/route`, whatever its status: a page that fails is written as its error page.

## Import map

- **`build/import-map-file`** — The import map is `src/import-map.json`, optional: a flat `{ "<name>": "<path>" }` object, without the standard `imports` key.
- **`build/import-map-output`** — Every page gets it as `<script type="importmap">` (see `layouts/scripts`).
- **`build/import-map-base-url`** — When the base URL isn't `/`, a path starting with `./` gets the base URL instead.
- **`build/import-map-node-modules`** — Each path starting with `./node_modules/` is copied into the staging folder, keeping its path. For a file, only that file is copied, not what it imports from the rest of its package. A folder is copied whole. A path that doesn't exist is skipped silently.
- **`build/import-map-ships`** — The import map file itself reaches the site like any other file in the source folder.

## Errors

- **`build/transpile-batch`** — All `.ts` files are transpiled together: a syntax error in one stops the build with exit code 1, and none are written.
- **`build/import-map-invalid`** — An import map that isn't valid JSON stops the build with exit code 1.
- **`build/exit`** — A missing `app/` folder or a config that fails to load exits non-zero. Any other error is logged and the build exits 0, including an error while producing a page, which also stops the remaining pages from being written.

## TODO

- **`build/html`** — Don't write pages that fail. Skip them, build the rest, then exit non-zero.
- **`build/exit`** — Exit non-zero on any error.
- **`build/write`** — Don't fail when the static folder doesn't exist. Today the copy throws, no pages are written, and the build exits 0.
- **`build/staging`** — Empty the staging folder before a build, so stale files don't ship.
- **`build/staging`** — Consider renaming `dist/` to a name that says unbundle generates it and authors don't edit it.
- **`build/ts-imports`** — Change `.ts` in side-effect imports and `import()` too. Today the change is a text replacement over the whole file, which also touches matching text in strings and comments; only change real import paths.
