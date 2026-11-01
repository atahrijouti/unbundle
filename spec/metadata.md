# Metadata

## Levels

- **`metadata/levels`** — Metadata is declared at three levels:

  | Level | Where | Exports |
  |---|---|---|
  | Site | `src/metadata.ts`, required | `metadata: Metadata` |
  | Layout | `src/layouts/<name>/metadata.ts`, optional | `metadata: Partial<Metadata>` |
  | Page | the page's module, optional | `metadata: Partial<Metadata>` |

- **`metadata/export`** — Metadata comes only from each level's `metadata` export. A layout's `metadata.ts` that loads but has no `export const metadata` is ignored, without a warning.
- **`metadata/keys`** — The keys:

  ```ts
  type Metadata = {
    title: string
    description: string
    manifest?: string
    "theme-color"?: string
    "color-scheme"?: string
    icon?: string
  }
  ```

- **`metadata/required`** — `title` and `description` are required by the type only. Nothing checks them at runtime.
- **`metadata/merge`** — A page's metadata is the site's, overridden entry by entry by its layout's, then by its own. An entry set to `""` or `undefined` overrides too, so it has no value and renders no tag. In development, edits show on the next request (see `page/module/fresh`).
- **`metadata/no-defaults`** — unbundle adds no metadata of its own.

## Title

- **`metadata/title`** — The title fills the title placeholder (see `layout/placeholders/form`). Without a title, the page shows the text `undefined` there. A title that isn't a string is written as text, except a function: it's called, and what it returns becomes the title.

## Tags

- **`metadata/tags/keys`** — `<!-- {{metadata}} -->` gets one tag per entry whose value isn't falsy. Entries with other keys render nothing:

  | Key | Tag |
  |---|---|
  | `description` | `<meta name="description" content="…" />` |
  | `theme-color` | `<meta name="theme-color" content="…" />` |
  | `color-scheme` | `<meta name="color-scheme" content="…" />` |
  | `manifest` | `<link rel="manifest" href="…" />` |
  | `icon` | `<link rel="icon" href="…" type="image/png" />` |

- **`metadata/tags/types`** — `description`, `theme-color` and `color-scheme` are expected to be strings. Falsy values such as `0` or `false` are skipped, like `""`; any other value that isn't a string, such as a number or an object, is an unchecked error (see `errors/page/unchecked`). `manifest` and `icon` are written as text, whatever their type.
- **`metadata/tags/order`** — Tags come out in the order their keys first appear: the site's keys in the order the site wrote them, then keys only the layout adds, then keys only the page adds. A layout or page that overrides a key changes its value, not its position.
- **`metadata/tags/escaping`** — In the three `<meta>` values, `"` becomes `&quot;` and `'` becomes `&#39;`. Formatting (see `layout/format`) then turns `&quot;` back into `"` inside a single-quoted attribute, so only `&#39;` shows in the finished HTML. Nothing else is escaped (`&`, `<`, `>`); the title and the `<link>` hrefs aren't escaped at all.
- **`metadata/tags/urls`** — `manifest` and `icon` are written as given. The base URL isn't added.

## TODO

- **`metadata/export`** — Warn when a layout's `metadata.ts` has no `metadata` export.
- **`metadata/required`** — Every page must have a title; that's why site metadata is required. Check `title` (and `description`, also required by the type) at runtime, so a missing title is an error instead of the text `undefined`.
- **`metadata/tags/keys`** — Render a tag only for entries whose value isn't `null` or `undefined`. Render any string as is, `""` included.
- **`metadata/tags/keys`** — Review `icon`: it always gets `type="image/png"`, whatever the file is.
- **`metadata/tags/escaping`** — Escape every value properly, the title and the `<link>` hrefs included.
- **`metadata/tags/urls`** — Apply the base URL to `manifest` and `icon` paths that start with `./`, the way the import map does.
