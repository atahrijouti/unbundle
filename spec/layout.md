# Layout

## Source

- **`layout/folder`** — A layout is a folder in `src/layouts/`, named after its folder. Its `layout.html` is the layout file, and is required.
- **`layout/files`** — Optional `metadata.ts` (see [Metadata](metadata.md)), `styles.css`, and `sync.ts` and `global.ts` (see [Scripts](scripts.md)). Other files reach the site like the rest of the source folder; unbundle doesn't read them.
- **`layout/pick`** — A page uses the layout named in its `config.layout`, or `main` when that's `undefined` or `null`. The name isn't checked: it's used as part of a path, so `""` points at `src/layouts/` itself and `../x` works.
- **`layout/placeholders`** — The layout file can contain these placeholders:

  | Placeholder | Filled with |
  |---|---|
  | `{{title}}` | The page's title |
  | `<!-- {{sync-scripts}} -->` | The layout's sync script, then the page's |
  | `<!-- {{styles}} -->` | The layout's styles, then the page's |
  | `<!-- {{scripts}} -->` | The import map, the global script, the page's script, live reload |
  | `<!-- {{metadata}} -->` | The page's metadata tags |
  | `<!-- {{content}} -->` | The page's `content()` |

- **`layout/placeholder-form`** — `{{title}}` is written bare. Every other placeholder is an HTML comment written exactly `<!-- {{name}} -->`, one space on each side: `<!--{{styles}}-->` isn't filled.
- **`layout/production-only`** — A production-only block runs from `<!-- {{production-only:start}} -->` to the next `<!-- {{production-only:end}} -->`, written exactly so. Blocks don't nest.

## Output

- **`layout/urls`** — A layout's files are at `<base URL>layouts/<name>/`.
- **`layout/placeholder-order`** — Placeholders are filled in the order of the table above, `{{title}}` first and `<!-- {{content}} -->` last. A filled value that contains a later placeholder gets it filled; placeholders in `content()` are never filled.
- **`layout/placeholder-first-only`** — Only the first occurrence of each placeholder is filled. A placeholder the layout file leaves out is skipped.
- **`layout/placeholder-dollar`** — `$$`, `$&`, `` $` `` and `$'` in a filled value are treated as replacement patterns, not text: `Price $$5` in `content()` comes out as `Price $5`. This applies to every placeholder.
- **`layout/styles`** — `<!-- {{styles}} -->` gets a `<link rel="stylesheet">` for each `styles.css` that exists, the layout's first.
- **`layout/scripts`** — `<!-- {{scripts}} -->` gets, in order: the import map if there is one, the global script if the layout has one, and the page's script. A layout file without `<!-- {{scripts}} -->` gets none of these.
- **`layout/production-blocks`** — Production-only blocks keep their content; their markers are removed.
- **`layout/placeholder-strip`** — Placeholders left unfilled are removed. This matches any `<!-- {{…}} -->`, whatever its spacing, so a mistyped placeholder is never filled but still disappears.
- **`layout/format`** — The finished HTML is formatted with Prettier's default settings, so it reads well in View Source. The site's Prettier config isn't used.

## Development

- **`layout/dev-production-blocks`** — Production-only blocks are removed, markers and content. Placeholders inside them are filled first, then removed with them.
- **`layout/dev-placeholders`** — Unfilled placeholders stay in the HTML.
- **`layout/dev-reload`** — `<!-- {{scripts}} -->` also gets live reload (see `dev-server/reload`). A layout file without it gets no live reload.

## Errors

- **`layout/error-missing`** — A page whose layout has no layout file fails with 500 (see `page/error-checks`).

## TODO

- **`layout/placeholder-form`** — Write `{{title}}` as a comment like the others.
- **`layout/placeholder-first-only`** — Fill every occurrence of a placeholder, not just the first.
- **`layout/placeholder-dollar`** — Insert values literally.
- **`layout/pick`** — Check that `config.layout` is a layout's name.
