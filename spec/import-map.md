# Import map

## File

- **`import-map/file/format`** — The import map is `src/import-map.json`, optional: a flat `{ "<name>": "<path>" }` object. unbundle wraps it in the browser's `imports` key when it writes the tag (see `import-map/tag`).
- **`import-map/file/ships`** — `import-map.json` itself reaches the site like any other source file.

## Tag

- **`import-map/tag`** — Every page gets it as `<script type="importmap">{ "imports": … }</script>`, first in `<!-- {{scripts}} -->`.
- **`import-map/base-url`** — When the base URL isn't `/`, paths starting with `./` start with the base URL instead.

## node_modules

- **`import-map/node-modules/copy`** — Each path starting with `./node_modules/` is copied into the site, keeping its path. A file is copied alone, without what it imports from the rest of its package. A folder is copied whole. A path that doesn't exist is skipped silently. Other paths, such as URLs, aren't copied.
- **`import-map/node-modules/dev-server`** — In the dev server, changing the import map copies its `node_modules` paths again.

## TODO

- **`import-map/file/format`** — Use the browser's standard import map format, `{ "imports": { … } }`, so maps can be copied as they are and can use `scopes` and `integrity`.
- **`import-map/node-modules/copy`** — Research a better way to bring `node_modules` dependencies into the site, so a file arrives with what it imports from its package.
