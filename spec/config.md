# Config

The config is the site's optional `unbundle.config.js`, which sets the base URL and folder names. `NODE_ENV` decides between development and production.

## Shape

```js
// unbundle.config.js
export default {
  BASE_URL: "/",
  SRC_FOLDER: "src",
  DIST_FOLDER: "dist",
  OUT_DIR: "out",
  PUBLIC_FOLDER: "public",
  NODE_MODULES_FOLDER: "node_modules",
}
```

Every key is optional; the values above are the defaults.

## Behavior

- **`config/file`** — The config is read once, when a command starts. Edits need a restart. A default export that isn't an object is ignored.
- **`config/base-url`** — `/` is added to the end of the base URL if it's missing. Nothing is added at the start, so `"blog"` gives relative URLs.
- **`config/keys`** — Not every key is used everywhere:

  | Key | Means | Where it isn't used yet |
  |---|---|---|
  | `BASE_URL` | Base URL | The dev server (`dev-server/base-url`), `manifest` and `icon` (`metadata/urls`) |
  | `SRC_FOLDER` | Source folder | Producing pages, which always reads `src/app/`, `src/layouts/`, `src/metadata.ts` and `src/import-map.json`, and the `ready` check |
  | `DIST_FOLDER` | Staging folder | The dev server, which always serves `./dist` |
  | `OUT_DIR` | Output folder | — |
  | `PUBLIC_FOLDER` | Static folder | The dev server, which always serves `./public` |
  | `NODE_MODULES_FOLDER` | — | Everywhere: import map paths are always read from `./node_modules/`. Other values can put the copies in the wrong place. |

- **`config/fixed`** — The dev server's port, 3000, can't be changed.

## Development and production

- **`config/node-env`** — The dev server produces development and the build produces production, unless `NODE_ENV` is set. Each behavior checks for one exact value:

  | Behavior | `development` | `production` | Anything else |
  |---|---|---|---|
  | Live reload (`layouts/scripts`) | yes | no | no |
  | Fresh modules on each request (`dev-server/page-fresh`) | yes | no | no |
  | Production-only blocks kept (`layouts/production-only`) | no | yes | no |
  | Unfilled placeholders kept (`layouts/placeholder-strip`) | yes | no | no |

## Errors

- **`config/load-error`** — A config that fails to load stops the command.

## TODO

- **`config/keys`** — Use every key everywhere it applies, so the config overrides everything, and make `NODE_MODULES_FOLDER` mean something or remove it.
