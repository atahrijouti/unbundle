# Config

- **`config/file`** — `unbundle.config.js` in the site's root is optional. Its default export is shallow-merged over the defaults.
- **`config/base-url`** — `BASE_URL` always ends with `/`; one is appended if missing.

| Key | Default | Honored by |
|---|---|---|
| `BASE_URL` | `/` | URLs of page and layout files, import map values. The dev server ignores it when routing. |
| `SRC_FOLDER` | `src` | Listing pages, preparing `dist/`, watching. Not by page assembly, the import map or the `ready` check, which use `src`. |
| `DIST_FOLDER` | `dist` | Preparing `dist/`, the build. Not by the dev server, which serves `./dist`. |
| `OUT_DIR` | `out` | The build. |
| `PUBLIC_FOLDER` | `public` | The build. Not by the dev server, which serves `./public`. |
| `NODE_MODULES_FOLDER` | `node_modules` | Copying import map entries. |

- **`config/fixed`** — The dev server port (3000) and the live-reload URL (`ws://localhost:3000`) are not configurable.

## TODO

- **`config/file`** — Wire every config value into every place that uses that folder or URL, so the config overrides everything. Today the gaps listed in the table above use hardcoded paths.
