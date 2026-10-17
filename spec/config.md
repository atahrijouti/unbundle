# Config

## Source

- **`config/file`** — The config is the site's optional `./unbundle.config.js`; no other name or extension is looked up. Its default export may set:

  ```js
  export default {
    BASE_URL: "/",
    SRC_FOLDER: "src",
    DIST_FOLDER: "dist",
    OUT_DIR: "out",
    PUBLIC_FOLDER: "public",
    NODE_MODULES_FOLDER: "node_modules",
  }
  ```

  The values shown are the defaults. An object is merged over them key by key; unknown keys are kept and unused. A default export that isn't an object is ignored. On Windows no config loads, even a valid one: importing it fails, and the command exits with code 1.
- **`config/base-url`** — A `/` is added to the end of the base URL if it's missing. Nothing is added at the start, so `"blog"` gives relative URLs. `null` and `undefined` become `"null/"` and `"undefined/"`; any other value that isn't a string stops the command with exit code 1.
- **`config/node-env`** — `NODE_ENV` decides between development and production. The dev server sets `development` and the build `production`, unless it's already set. The config loads before that, so it only sees a `NODE_ENV` set by the shell.

## Output

- **`config/keys`** — Not every key is used everywhere yet:

  | Key | Means | Not used by |
  |---|---|---|
  | `BASE_URL` | Base URL | The dev server (`dev-server/base-url`), `manifest` and `icon` (`metadata/urls`) |
  | `SRC_FOLDER` | Source folder | Producing pages, which always reads `src/app/`, `src/layouts/`, `src/metadata.ts` and `src/import-map.json`; the `ready` check |
  | `DIST_FOLDER` | Staging folder | The dev server's answers, which always read `./dist`, while it still fills the folder this key names |
  | `OUT_DIR` | Output folder | — |
  | `PUBLIC_FOLDER` | Static folder | The dev server, which always serves `./public` |
  | `NODE_MODULES_FOLDER` | — | Anything useful: import map paths are always read from `./node_modules/`. The key only feeds a relative path, so other values can put the copies in the wrong place or make copying fail. |

- **`config/modes`** — Each mode checks for one exact value of `NODE_ENV`:

  | | `development` | `production` | Anything else |
  |---|---|---|---|
  | Live reload (`layout/dev-reload`) | yes | no | no |
  | Fresh modules on each request (`page/dev-fresh`) | yes | no | no |
  | Production-only blocks kept (`layout/production-blocks`) | no | yes | no |
  | Unfilled placeholders kept (`layout/dev-placeholders`) | yes | no | no |

  Error pages include live reload in every mode (see `page/error-page`).

## Development

- **`config/dev-read-once`** — The config is read once, when the dev server starts. Edits need a restart.
- **`config/fixed`** — The dev server's port, 3000, and the address live reload connects to, `ws://localhost:3000`, can't be changed.

## Errors

- **`config/error-load`** — A config that fails to load stops the command with a non-zero exit code.

## TODO

- **`config/file`** — Load the config on Windows.
- **`config/keys`** — Use every key everywhere it applies, so the config overrides everything, and make `NODE_MODULES_FOLDER` mean something or remove it.
