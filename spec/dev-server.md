# Dev server

## Source

- **`dev-server/command`** — `unbundle-serve` reads the source folder, the static folder and the config, and prints `unbundle v<version>`.
- **`dev-server/watch`** — It watches the source folder. Files ending in `.bck` are ignored, since some editors (Helix) write them while saving.

## Output

- **`dev-server/port`** — It listens on port 3000, on every network interface.
- **`dev-server/staging`** — It empties the staging folder and fills it from the source folder (see [Build](build.md)), then keeps it in sync: a changed `.ts` file is transpiled, another file copied.
- **`dev-server/watch-deletes`** — Deleted source files stay in the staging folder until the dev server restarts.
- **`dev-server/serve`** — A request is answered by the first match: a page (see `page/dev-url`), a file in the staging folder, a file in the static folder, or 404 with the text `404 :-/`.
- **`dev-server/mime`** — Files are served with a content type for `.html`, `.js`, `.css`, `.json`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.ico`, `.woff`, `.woff2` and `.webp`. Anything else, `.webmanifest` included, is `application/octet-stream`.
- **`dev-server/base-url`** — The base URL is ignored. With a base URL other than `/`, pages ask for their scripts and styles under it, and get 404.
- **`dev-server/reload`** — After each sync, every open page reloads.
- **`dev-server/reload-reconnect`** — A page that loses its connection reloads a second later. While the dev server is down, that repeats every second until it's back.
- **`dev-server/reload-host`** — The page connects to `localhost:3000`, whichever host served it. The script declares a global `ws`.

## Development

Not applicable: the dev server is development.

## Errors

- **`dev-server/error-staging`** — Errors while filling the staging folder at start are logged, and the dev server starts anyway. A syntax error in one `.ts` file stops the whole sync it's part of, logged as `Error during transpilation:`. Open pages reload anyway.
- **`dev-server/crash`** — An unchecked error while producing a page (see `page/error-uncaught`), or a missing `app/` folder, stops the dev server. Open pages then reload every second until it's restarted.

## TODO

- **`dev-server/serve`** — Serve the `404` page with status 404 when one exists, instead of `404 :-/`. `/404` should also return 404, like GitHub Pages.
- **`dev-server/watch-deletes`** — Remove a file from the staging folder when it's deleted from the source folder.
- **`dev-server/crash`** — Catch errors while answering a request and return a 500 page instead of stopping.
- **`dev-server/base-url`** — Serve the site under its base URL.
- **`dev-server/reload-host`** — Connect to the host that served the page, so pages opened from another device on the network work. Don't declare a global.
- **`dev-server/error-staging`** — Don't reload after a failed sync.
