# Dev server

## Command

- **`dev-server/command`** — `unbundle-serve` reads the source folder, the static folder and the config, prints `unbundle v<version>`, and fills the staging folder (see `staging/dev-server`).
- **`dev-server/port`** — It listens on port 3000, on every network interface. The port can't be changed.

## Serving

- **`dev-server/serve/order`** — A request is answered by the first match: a page (see `page/url/dev-server`), a file in the staging folder, a file in the static folder, or 404 with the text `404 :-/`. A folder is served by its `index.html`.
- **`dev-server/serve/requests`** — Every HTTP method is answered the same way, and the query string is ignored. Paths aren't percent-decoded, for pages or files: `/a%20b.txt` doesn't find `a b.txt`. A page is sent as `text/html` with its status.
- **`dev-server/serve/mime`** — Files get a content type from their lowercased extension, with no charset:

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
- **`dev-server/serve/base-url`** — The base URL is ignored. With a base URL other than `/`, pages ask for their scripts and styles under it, and get 404.

## Watching

- **`dev-server/watch`** — It watches the source folder. Files ending in `.bck` are ignored, since some editors (Helix) write them while saving. Events on folders are ignored.

## Live reload

- **`dev-server/reload/trigger`** — After each sync, every open page reloads, debounced to 750 ms. Any changed or new file in the source folder triggers it, layout files, metadata and the import map included. Deleting a file, creating a folder or writing a `.bck` file doesn't.
- **`dev-server/reload/socket`** — Live reload uses a WebSocket on the dev server's port, accepted on any path.
- **`dev-server/reload/reconnect`** — A page that loses its connection reloads once, a second later. While the dev server is down, that reload gets the browser's own error page, which has no live reload, so unbundle doesn't try again.
- **`dev-server/reload/host`** — The page connects to `localhost:3000`, whichever host served it, and that address can't be changed. The script declares a global `ws`.

## TODO

- **`dev-server/port`** — Make the dev server's port and host configurable, and when the port is taken, try the next one up.
- **`dev-server/serve/order`** — Serve the `404` page with status 404 when one exists, instead of `404 :-/`. `/404` should also return 404, like GitHub Pages.
- **`dev-server/serve/mime`** — Cover file types as exhaustively as practical, `.webmanifest` and `.map` included.
- **`dev-server/serve/base-url`** — Serve the site under its base URL.
- **`dev-server/watch`** — Ignore the temporary files other popular editors write while saving, not only Helix's `.bck`.
- **`dev-server/reload/reconnect`** — Keep trying every second until the dev server is back, then reload, instead of reloading into the browser's error page.
- **`dev-server/reload/host`** — Connect to the host that served the page, so pages opened from another device on the network work. Don't declare a global.
