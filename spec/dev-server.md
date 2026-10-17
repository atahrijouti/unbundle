# Dev server

## Source

- **`dev-server/command`** — `unbundle-serve` reads the source folder, the static folder and the config, and prints `unbundle v<version>`.
- **`dev-server/watch`** — It watches the source folder. Files ending in `.bck` are ignored, since some editors (Helix) write them while saving. Events on folders are ignored.

## Output

- **`dev-server/port`** — It listens on port 3000, on every network interface.
- **`dev-server/staging`** — It empties the staging folder and fills it from the source folder (see [Build](build.md)), then keeps it in sync: changes are collected until none has come in for 50 ms, then the changed `.ts` files are transpiled and other files copied.
- **`dev-server/watch-deletes`** — Deleted source files stay in the staging folder until the dev server restarts.
- **`dev-server/serve`** — A request is answered by the first match: a page (see `page/dev-url`), a file in the staging folder, a file in the static folder, or 404 with the text `404 :-/`. A folder is served by its `index.html`. Every HTTP method is answered the same way, and the query string is ignored. Paths aren't percent-decoded, for pages or files: `/a%20b.txt` doesn't find `a b.txt`. A page is sent as `text/html` with its status.
- **`dev-server/mime`** — Files get a content type from their lowercased extension, with no charset:

  | Extension | Content type |
  |---|---|
  | `.html` | `text/html` |
  | `.js` | `text/javascript` |
  | `.css` | `text/css` |
  | `.json` | `application/json` |
  | `.png` | `image/png` |
  | `.jpg`, `.jpeg` | `image/jpeg` |
  | `.gif` | `image/gif` |
  | `.svg` | `image/svg+xml` |
  | `.ico` | `image/x-icon` |
  | `.woff` | `font/woff` |
  | `.woff2` | `font/woff2` |
  | `.webp` | `image/webp` |

  Anything else, `.webmanifest` and `.map` included, is `application/octet-stream`.
- **`dev-server/base-url`** — The base URL is ignored. With a base URL other than `/`, pages ask for their scripts and styles under it, and get 404.
- **`dev-server/reload`** — After each sync, every open page reloads, debounced to 750 ms. Any changed or new file in the source folder triggers it, layout files, metadata and the import map included. Deleting a file, creating a folder or writing a `.bck` file doesn't.
- **`dev-server/reload-socket`** — Live reload uses a WebSocket on the dev server's port, accepted on any path.
- **`dev-server/reload-reconnect`** — A page that loses its connection reloads once, a second later. While the dev server is down, that reload gets the browser's own error page, which has no live reload, so unbundle doesn't try again.
- **`dev-server/reload-host`** — The page connects to `localhost:3000`, whichever host served it. The script declares a global `ws`.

## Development

Not applicable: the dev server is development.

## Errors

- **`dev-server/error-staging`** — Errors while filling the staging folder at start are logged as `Error preparing dist:`, and the dev server starts anyway.
- **`dev-server/error-sync`** — During a sync, a syntax error in one `.ts` file stops every `.ts` file of that sync from being written; other files in it are still copied. The error is logged as `Error during transpilation:`, and open pages reload anyway.
- **`dev-server/crash`** — An unchecked error while producing a page (see `page/error-uncaught`), or a missing `app/` folder, stops the dev server. So does failing to empty the staging folder, or a missing source folder, at start. Open pages then reload once and show the browser's error page (see `dev-server/reload-reconnect`).

## TODO

- **`dev-server/serve`** — Serve the `404` page with status 404 when one exists, instead of `404 :-/`. `/404` should also return 404, like GitHub Pages.
- **`dev-server/watch-deletes`** — Remove a file from the staging folder when it's deleted from the source folder.
- **`dev-server/crash`** — Catch errors while answering a request and return a 500 page instead of stopping.
- **`dev-server/base-url`** — Serve the site under its base URL.
- **`dev-server/reload-host`** — Connect to the host that served the page, so pages opened from another device on the network work. Don't declare a global.
- **`dev-server/error-sync`** — Don't reload after a failed sync.
- **`dev-server/reload-reconnect`** — Keep trying every second until the dev server is back, then reload, instead of reloading into the browser's error page.
