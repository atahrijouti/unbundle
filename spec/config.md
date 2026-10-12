# Config

## `unbundle.config.js`

- **`config/file`** — `./unbundle.config.js` in the site's root is optional. No other name or extension is looked up.
  - It is imported once when a command starts, and not watched. Edits need a restart.
  - It loads before `NODE_ENV` gets its default, so it only sees a `NODE_ENV` set by the shell.
  - If its default export is an object, it is shallow-merged over the defaults. Otherwise (no default export, or not an object) it is ignored.
  - Unknown keys are merged and unused.
  - An error while importing it stops the command.
- **`config/base-url`** — When a config object is merged, `/` is appended to `BASE_URL` if it doesn't end with one. Only a trailing slash is added: `"blog"` becomes `"blog/"`, which gives relative URLs. A non-string value becomes a string such as `"undefined/"`.

| Key | Default | Honored by |
|---|---|---|
| `BASE_URL` | `/` | URLs of page and layout files, import map values. Not by the dev server's routing (see `dev-server/base-url`), nor by `manifest` and `icon` (see `metadata/urls`). |
| `SRC_FOLDER` | `src` | Listing pages, preparing `dist/` (including reading the import map to copy `node_modules` entries), watching. Not by page assembly, which reads `src/app/`, `src/layouts/`, `src/metadata.ts` and `src/import-map.json` (for the `importmap` tag), nor by the `ready` check. |
| `DIST_FOLDER` | `dist` | Where the build and the dev server write. The dev server always serves `./dist`, so changing it breaks dev. |
| `OUT_DIR` | `out` | The build. |
| `PUBLIC_FOLDER` | `public` | The build. The dev server always serves `./public`. |
| `NODE_MODULES_FOLDER` | `node_modules` | Nothing useful. Import map entries are read from their literal `./node_modules/…` path and written to `<DIST_FOLDER>/node_modules/`. This key only feeds a relative-path calculation: some values give the same result, others misplace the copies or make the copy fail. |

- **`config/fixed`** — The dev server port (3000) and the live-reload URL (`ws://localhost:3000`) are not configurable.

## `NODE_ENV`

`unbundle-serve` defaults it to `development` and `unbundle-build` to `production`, only when it is unset. Each check compares against one exact value, so any other value (such as `test`) gets the "neither" behavior:

| Behavior | `development` | `production` | Other |
|---|---|---|---|
| Live-reload script on pages (`layouts/scripts`) | yes | no | no |
| Re-importing modules per request (`dev-server/page-reimport`) | yes | no | no |
| `production-only` blocks kept (`layouts/production-only`) | no | yes | no |
| Leftover placeholder comments kept (`layouts/placeholder-strip`) | yes | no | no |

## TODO

- **`config/file`** — Wire every config value into every place that uses that folder or URL, so the config overrides everything. Today the gaps listed in the table above use hardcoded paths, and `NODE_MODULES_FOLDER` has no useful effect.
