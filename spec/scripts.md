# Scripts

## Kinds

- **`scripts/kinds`** — There are two kinds of script besides the page's own `index.ts`:

  | | Sync script (`sync.ts`) | Global script (`global.ts`) |
  |---|---|---|
  | Who can have one | a layout and a page | a layout only |
  | How it reaches the page | its code is pasted inline at `<!-- {{sync-scripts}} -->` | `global.js` is linked at `<!-- {{scripts}} -->` |
  | When it runs | as soon as the browser reaches it, before first paint | after the HTML is parsed, as a module |
  | Can it import | no | yes |
  | Typical use | what's needed before first paint, such as setting the theme | code every page of the layout shares |

## Sync scripts

- **`scripts/sync/file`** — A layout and a page can each have an optional `sync.ts`. Its code ends up pasted into the page's HTML as a plain `<script>`, not `type="module"`, so it can't use `import` or `export`. Nothing checks for them; they fail in the browser. `import type`, and imports whose names are never used, are removed when transpiled, so those are fine.
- **`scripts/sync/inline`** — unbundle reads each `sync.ts` from `src/`, transpiles it without bundling, and pastes the code into `<!-- {{sync-scripts}} -->` as `<script>(() => { … })()</script>`, the layout's first. Each one is wrapped in its own function, so the two can use the same names. Being `.ts` files, they're also transpiled into the staging folder like any other (see `staging/transpile`).

## Global script

- **`scripts/global`** — A layout can have an optional `global.ts`. It becomes `global.js`, loaded as a module script from `<base URL>layouts/<name>/global.js` on every page using that layout, before the page's `index.js`.
