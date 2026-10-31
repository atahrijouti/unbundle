# Import map

## Source

- **`import-map/file`** — The import map is `src/import-map.json`, optional: a flat `{ "<name>": "<path>" }` object. unbundle wraps it in the browser's `imports` key when it writes the tag (see `import-map/tag`).

## Output

- **`import-map/tag`** — Every page gets it as `<script type="importmap">{ "imports": … }</script>`, first in `<!-- {{scripts}} -->`.
- **`import-map/base-url`** — When the base URL isn't `/`, paths starting with `./` start with the base URL instead.
- **`import-map/node-modules`** — Each path starting with `./node_modules/` is copied into the site, keeping its path. A file is copied alone, without what it imports from the rest of its package. A folder is copied whole. A path that doesn't exist is skipped silently. Other paths, such as URLs, aren't copied.
- **`import-map/ships`** — `import-map.json` itself reaches the site like any other source file.

## Development

- **`import-map/dev-watch`** — Changing the import map copies its `node_modules` paths again.

## Errors

- **`import-map/error-json`** — An import map that isn't valid JSON stops the build with exit code 1. In the dev server it's logged when the staging folder is filled, and a page that's requested stops the dev server (see `page/error-uncaught`).

## TODO

- **`import-map/file`** — Use the browser's standard import map format, `{ "imports": { … } }`, so maps can be copied as they are and can use `scopes` and `integrity`.
- **`import-map/node-modules`** — Research a better way to bring `node_modules` dependencies into the site, so a file arrives with what it imports from its package.
