# Config

## File

- **`config/file/load`** — The config is the site's optional `./unbundle.config.js`; no other name or extension is looked up. Its default export, if it's an object, is merged over the defaults key by key; unknown keys are kept and unused. A default export that isn't an object is ignored. The config is read once, when a command starts: edits need a restart of the dev server.
- **`config/file/keys`** — The keys, their defaults, and where each isn't used yet:

  | Key                   | Default                              | Means                                         | Not used by                                                                                                                                                                               |
  | --------------------- | ------------------------------------ | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `BASE_URL`            | `"/"`                                | Base URL                                      | The dev server (`dev-server/serve/base-url`), `manifest` and `icon` (`metadata/tags/urls`)                                                                                                |
  | `SRC_FOLDER`          | `"src"`                              | Source folder                                 | Producing pages, which always reads `src/app/`, `src/layouts/`, `src/metadata.ts` and `src/import-map.json`; the `ready` check                                                            |
  | `DIST_FOLDER`         | `"dist"`                             | Staging folder                                | The dev server's answers, which always read `./dist`, while it still fills the folder this key names                                                                                      |
  | `OUT_DIR`             | `"out"`                              | Output folder                                 | —                                                                                                                                                                                         |
  | `PUBLIC_FOLDER`       | `"public"`                           | Static folder                                 | The dev server, which always serves `./public`                                                                                                                                            |
  | `NODE_MODULES_FOLDER` | `"node_modules"`                     | —                                             | Anything useful: import map paths are always read from `./node_modules/`. The key only feeds a relative path, so other values can put the copies in the wrong place or make copying fail. |
  | `PORT`                | `3000`                               | The dev server's port (see `dev-server/port`) | —                                                                                                                                                                                         |
  | `HOST`                | `undefined`, every network interface | The dev server's host (see `dev-server/port`) | —                                                                                                                                                                                         |

## Base URL

- **`config/base-url`** — A `/` is added to the end of the base URL if it's missing. Nothing is added at the start, so `"blog"` gives relative URLs. `null` and `undefined` become `"null/"` and `"undefined/"`; any other value that isn't a string stops the command with exit code 1.

## Modes

- **`config/modes/node-env`** — `NODE_ENV` decides between development and production. The dev server sets `development` and the build `production`, unless it's already set. The config loads before that, so it only sees a `NODE_ENV` set by the shell.
- **`config/modes/effects`** — Each mode checks for one exact value of `NODE_ENV`:

  |                                                                   | `development` | `production` | Anything else |
  | ----------------------------------------------------------------- | ------------- | ------------ | ------------- |
  | Live reload (`layout/placeholders/list`)                          | yes           | no           | no            |
  | Fresh modules on each request (`page/module/fresh`)               | yes           | no           | no            |
  | Production-only blocks kept (`layout/production-only/production`) | no            | yes          | no            |
  | Unfilled placeholders kept (`layout/placeholders/unfilled`)       | yes           | no           | no            |

  Error pages include live reload in every mode (see `errors/page/error-page`).
