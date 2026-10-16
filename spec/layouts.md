# Layouts

A layout is the frame pages are placed into: a folder whose layout file has placeholders that each page fills.

## Shape

```
src/layouts/<name>/
  layout.html   required, the layout file
  metadata.ts   optional, layout metadata (see metadata.md)
  styles.css    optional
  sync.ts       optional, the layout's sync script
  global.ts     optional, the layout's global script
```

Placeholders in the layout file:

| Placeholder | Replaced with |
|---|---|
| `{{title}}` | The page's title |
| `<!-- {{sync-scripts}} -->` | The layout's sync script, then the page's |
| `<!-- {{styles}} -->` | Links to the layout's `styles.css`, then the page's |
| `<!-- {{scripts}} -->` | The import map, the global script, the page's script, live reload |
| `<!-- {{metadata}} -->` | The page's metadata tags (see [metadata.md](metadata.md)) |
| `<!-- {{content}} -->` | The page's `content()` |

## Behavior

### Choosing a layout

- **`layouts/folder`** — A layout is a folder in `src/layouts/`, named after its folder.
- **`layouts/pick`** — A page uses the layout named in its `config.layout`, or `main` when it doesn't set one. The name isn't checked: it's used as part of a path.
- **`layouts/other-files`** — Other files in a layout's folder reach the site like the rest of the source folder. unbundle doesn't read them.
- **`layouts/urls`** — A layout's files are at `<base URL>layouts/<name>/`.

### Filling the layout file

- **`layouts/placeholder-form`** — `{{title}}` is written bare. Every other placeholder is an HTML comment written exactly `<!-- {{name}} -->`.
- **`layouts/placeholder-first-only`** — Only the first occurrence of each placeholder is filled. A placeholder the layout file leaves out is skipped.
- **`layouts/placeholder-dollar`** — `$$`, `$&`, `` $` `` and `$'` in a filled value are treated as replacement patterns, not text: `Price $$5` in `content()` comes out as `Price $5`.
- **`layouts/sync-scripts`** — Each sync script is transpiled, not bundled, and inlined as a classic `<script>`, wrapped in its own function so the layout's and the page's can use the same names.
- **`layouts/styles`** — `<!-- {{styles}} -->` gets a `<link rel="stylesheet">` for each `styles.css` that exists, layout first.
- **`layouts/scripts`** — `<!-- {{scripts}} -->` gets, in order:
  1. the import map, if there is one (see [build.md](build.md#import-map));
  2. the global script, as a module, if the layout has one;
  3. the page's script, as a module;
  4. live reload, in development.

  A layout file without `<!-- {{scripts}} -->` gets none of these, live reload included.

### Finishing the page

- **`layouts/production-only`** — Outside production, every production-only block, from `<!-- {{production-only:start}} -->` to `<!-- {{production-only:end}} -->`, is removed with its markers. In production, the markers are removed and the content stays.
- **`layouts/placeholder-strip`** — Outside development, placeholders left unfilled are removed. In development they stay visible in the HTML.
- **`layouts/format`** — The finished HTML is formatted with Prettier's default settings, so it reads well in View Source. The site's Prettier config isn't used for pages.

## Notes

- Put `<!-- {{sync-scripts}} -->` before the stylesheet links: an inline script after a stylesheet waits for that stylesheet to download.
- Sync scripts can't import or export: they run as classic scripts. `import type` is fine, since it disappears when transpiled.

## TODO

- **`layouts/placeholder-form`** — Write `{{title}}` as a comment like the others.
- **`layouts/placeholder-first-only`** — Fill every occurrence of a placeholder, not just the first.
- **`layouts/placeholder-dollar`** — Insert values literally.
- **`layouts/pick`** — Check that `config.layout` is a layout's name.
