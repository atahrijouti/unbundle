# Layout

## Folder

- **`layout/folder/location`** — A layout is a folder in `src/layouts/`, named after its folder. Its files are at `<base URL>layouts/<name>/`.
- **`layout/folder/files`** — What unbundle does with the files in a layout's folder:

  | File          |          | What happens to it                                                             |
  | ------------- | -------- | ------------------------------------------------------------------------------ |
  | `layout.html` | required | The layout file (see Placeholders).                                            |
  | `metadata.ts` | optional | The layout's metadata (see `metadata/levels`).                                 |
  | `styles.css`  | optional | Linked before the page's (see `layout/placeholders/list`).                     |
  | `sync.ts`     | optional | Pasted into the page's HTML (see `scripts/sync/inline`).                       |
  | `global.ts`   | optional | Loaded on every page using the layout (see `scripts/global`).                  |
  | anything else |          | Reaches the site like the rest of the source folder; unbundle doesn't read it. |

## Pick

- **`layout/pick`** — A page uses the layout named in its `config.layout`, or `main` when that's `undefined` or `null`. The name isn't checked: it's used as part of a path, so `""` points at `src/layouts/` itself and `../x` works.

## Placeholders

- **`layout/placeholders/list`** — The layout file can contain these placeholders, filled in this order:

  | Placeholder                 | Filled with                                                                                                                                                                                                           |
  | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `{{title}}`                 | The page's title (see `metadata/title`).                                                                                                                                                                              |
  | `<!-- {{sync-scripts}} -->` | The layout's `sync.ts`, then the page's (see `scripts/sync/inline`).                                                                                                                                                  |
  | `<!-- {{styles}} -->`       | A `<link rel="stylesheet">` for the layout's `styles.css`, then the page's, for each that exists.                                                                                                                     |
  | `<!-- {{scripts}} -->`      | In order: the import map, if there is one (see `import-map/tag`); the layout's `global.js`, if it has a `global.ts`; the page's `index.js`; in development, the live reload script (see `dev-server/reload/trigger`). |
  | `<!-- {{metadata}} -->`     | The page's metadata tags (see `metadata/tags/keys`).                                                                                                                                                                  |
  | `<!-- {{content}} -->`      | What `content()` returns (see `page/module/content`).                                                                                                                                                                 |

- **`layout/placeholders/form`** — `{{title}}` is written bare. Every other placeholder is an HTML comment written exactly `<!-- {{name}} -->`, with one space on each side; written any other way, it isn't filled.
- **`layout/placeholders/missing`** — A placeholder the layout file leaves out is skipped, so what it would have brought doesn't reach the page: a layout file without `<!-- {{scripts}} -->` gets no import map, no scripts and no live reload. Every value except a function title (see `metadata/title`) is still produced, so its errors still happen: `content()` runs even without `<!-- {{content}} -->`.
- **`layout/placeholders/first-only`** — Only the first occurrence of each placeholder is filled.
- **`layout/placeholders/order`** — Because they're filled in order, a filled value that contains a later placeholder gets it filled, when it comes before the layout's own, which is then left unfilled. Placeholders in `content()`, filled last, are never filled.
- **`layout/placeholders/dollar`** — `$$`, `$&`, `` $` `` and `$'` in a filled value are treated as replacement patterns, not text: `Price $$5` in `content()` comes out as `Price $5`. This applies to every placeholder.
- **`layout/placeholders/unfilled`** — Outside development, unfilled placeholders written as comments are removed. This matches any `<!-- {{…}} -->`, whatever its spacing, so a mistyped placeholder is never filled but still disappears. A bare `{{title}}` left unfilled, such as a second one or one in `content()`, stays. In development, every unfilled placeholder stays in the HTML.

## Production-only blocks

- **`layout/production-only/markers`** — A production-only block runs from `<!-- {{production-only:start}} -->` to the next `<!-- {{production-only:end}} -->`, written exactly so. Blocks don't nest.
- **`layout/production-only/production`** — In production, the markers are removed and the content stays.
- **`layout/production-only/other-modes`** — In any other mode, development included, the whole block is removed, markers and content. Placeholders inside it are filled first, then removed with it.

## Formatting

- **`layout/format`** — The finished HTML is formatted with Prettier's default settings, so it reads well in View Source. The site's Prettier config isn't used.
