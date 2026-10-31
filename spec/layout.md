# Layout

## Source

- **`layout/folder`** — A layout is a folder in `src/layouts/`, named after its folder. Its `layout.html` is the layout file, and is required.
- **`layout/files`** — A layout's folder can also hold an optional `metadata.ts` (see [Metadata](metadata.md)), `styles.css`, `sync.ts` and `global.ts` (see [Scripts](scripts.md)). Other files in the layout's folder reach the site like the rest of the source folder; unbundle doesn't read them.
- **`layout/pick`** — A page uses the layout named in its `config.layout`, or `main` when that's `undefined` or `null`. The name isn't checked: it's used as part of a path, so `""` points at `src/layouts/` itself and `../x` works.
- **`layout/placeholders`** — The layout file can contain these placeholders:

  | Placeholder | Filled with |
  |---|---|
  | `{{title}}` | The page's title |
  | `<!-- {{sync-scripts}} -->` | The layout's `sync.ts`, then the page's |
  | `<!-- {{styles}} -->` | The layout's `styles.css`, then the page's |
  | `<!-- {{scripts}} -->` | The import map, the layout's `global.js`, the page's `index.js`, live reload |
  | `<!-- {{metadata}} -->` | The page's metadata tags |
  | `<!-- {{content}} -->` | The page's `content()` |

- **`layout/placeholder-form`** — `{{title}}` is written bare. Every other placeholder is an HTML comment written exactly `<!-- {{name}} -->`, with one space on each side; written any other way, it isn't filled.
- **`layout/production-only`** — A production-only block runs from `<!-- {{production-only:start}} -->` to the next `<!-- {{production-only:end}} -->`, written exactly so. Blocks don't nest.

## Output

- **`layout/urls`** — A layout's files are at `<base URL>layouts/<name>/`.
- **`layout/placeholder-order`** — Placeholders are filled in the order of the table above, `{{title}}` first and `<!-- {{content}} -->` last. A filled value that contains a later placeholder gets it filled, when it comes before the layout's own, which is then left unfilled. Placeholders in `content()` are never filled.
- **`layout/placeholder-first-only`** — Only the first occurrence of each placeholder is filled. A placeholder the layout file leaves out is skipped.
- **`layout/placeholder-dollar`** — `$$`, `$&`, `` $` `` and `$'` in a filled value are treated as replacement patterns, not text: `Price $$5` in `content()` comes out as `Price $5`. This applies to every placeholder.
- **`layout/styles`** — `<!-- {{styles}} -->` gets a `<link rel="stylesheet">` for the layout's `styles.css`, then the page's, for each that exists.
- **`layout/scripts`** — `<!-- {{scripts}} -->` gets, in order: the import map if there is one, the layout's `global.js` if it has a `global.ts`, and the page's `index.js`. A layout file without `<!-- {{scripts}} -->` gets none of these.
- **`layout/production-blocks`** — Production-only blocks keep their content; their markers are removed.
- **`layout/placeholder-strip`** — Placeholders left unfilled are removed when they're comments. This matches any `<!-- {{…}} -->`, whatever its spacing, so a mistyped placeholder is never filled but still disappears. A bare `{{title}}` left unfilled, such as a second one or one in `content()`, stays.
- **`layout/format`** — The finished HTML is formatted with Prettier's default settings, so it reads well in View Source. The site's Prettier config isn't used.

## Development

- **`layout/dev-production-blocks`** — Production-only blocks are removed, markers and content. Placeholders inside them are filled first, then removed with them.
- **`layout/dev-placeholders`** — Unfilled placeholders stay in the HTML.
- **`layout/dev-reload`** — In development, `<!-- {{scripts}} -->` also gets the live reload script, after the page's `index.js` (see `dev-server/reload`). A layout file without `<!-- {{scripts}} -->` has nowhere to put it, so its pages don't live reload.

## Errors

- **`layout/error-missing`** — A page whose layout has no layout file fails with 500 (see `page/error-checks`).

## TODO

- **`layout/files`** — Go through the names of the files unbundle reads from a layout's and a page's folder (`layout.html`, `metadata.ts`, `styles.css`, `sync.ts`, `global.ts`, `index.ts`) and pick the clearest name for each, for example `layout.css` rather than `styles.css` in a layout, or decide that the folder name already says enough.
- **`layout/placeholder-form`** — Write `{{title}}` as a comment like the others.
- **`layout/placeholder-first-only`** — Fill every occurrence of a placeholder, not just the first.
- **`layout/placeholder-order`** — Only fill placeholders written in the layout file, never ones that appear inside a filled value.
- **`layout/placeholder-dollar`** — Insert values literally, by passing a function to `replace` instead of a string.
- **`layout/pick`** — Check that `config.layout` is a layout's name, and allow only safe characters in layout names.
- **`layout/format`** — Format the HTML with the site's Prettier config when it has one, like transpiled files (see `build/format`).
