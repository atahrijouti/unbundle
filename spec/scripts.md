# Scripts

## Source

- **`scripts/sync`** — A layout and a page can each have a `sync.ts`, their sync script.
- **`scripts/sync-classic`** — A sync script runs as a classic script. Nothing checks it for `import` or `export`: they stay in the output and fail in the browser. `import type` is fine, since it disappears when transpiled.
- **`scripts/global`** — A layout can have a `global.ts`, its global script.

## Output

- **`scripts/sync-inline`** — Each sync script is read from `src/`, transpiled, not bundled, and inlined in `<!-- {{sync-scripts}} -->` as a classic `<script>`, wrapped in `(() => { … })()` so the layout's and the page's can use the same names. The layout's comes first.
- **`scripts/sync-placement`** — The browser runs a sync script as soon as it reaches it. Placed after a stylesheet link, it waits for that stylesheet to download.
- **`scripts/global-module`** — The global script is loaded as a module script from `<base URL>layouts/<name>/global.js` on every page using that layout, before the page's script.

## Development

No differences.

## Errors

- **`scripts/error-sync`** — A sync script that fails to compile fails the page with 500 and esbuild's message (see `page/error-checks`).

## TODO

None.
