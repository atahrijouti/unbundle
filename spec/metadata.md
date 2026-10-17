# Metadata

## Source

- **`metadata/levels`** — Metadata is declared at three levels:

  | Level | Where | Exports |
  |---|---|---|
  | Site | `src/metadata.ts`, required | `metadata: Metadata` |
  | Layout | `src/layouts/<name>/metadata.ts`, optional | `metadata: Partial<Metadata>` |
  | Page | the page's module, optional | `metadata: Partial<Metadata>` |

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

## Output

- **`metadata/merge`** — A page's metadata is the site's, overridden key by key by its layout's, then by its own. A key set to `""` or `undefined` overrides too, which removes its tag.
- **`metadata/title`** — The title fills `{{title}}`. Without a title, the page shows the text `undefined` there.
- **`metadata/tags`** — `<!-- {{metadata}} -->` gets one tag per key whose value isn't falsy. Other keys produce nothing:

  | Key | Tag |
  |---|---|
  | `description` | `<meta name="description" content="…" />` |
  | `theme-color` | `<meta name="theme-color" content="…" />` |
  | `color-scheme` | `<meta name="color-scheme" content="…" />` |
  | `manifest` | `<link rel="manifest" href="…" />` |
  | `icon` | `<link rel="icon" href="…" type="image/png" />` |

- **`metadata/order`** — Tags follow the order each key first appears in the site's, then the layout's, then the page's metadata. Overriding a key doesn't move it.
- **`metadata/escaping`** — In the three `<meta>` values, `"` becomes `&quot;` and `'` becomes `&#39;`. Formatting (see `layout/format`) then turns `&quot;` back into `"` inside a single-quoted attribute, so only `&#39;` shows in the finished HTML. Nothing else is escaped (`&`, `<`, `>`); the title and the `<link>` hrefs aren't escaped at all.
- **`metadata/urls`** — `manifest` and `icon` are written as given. The base URL isn't added.
- **`metadata/no-defaults`** — unbundle adds no metadata of its own.

## Development

- **`metadata/dev-fresh`** — Metadata files are reloaded on each request (see `page/dev-fresh`).

## Errors

- **`metadata/error-site`** — Without site metadata, every page fails with 500 (see `page/error-checks`).
- **`metadata/error-layout`** — Layout metadata that fails to load fails the page with 500. Layout metadata without a `metadata` export is ignored.
- **`metadata/error-type`** — A `description`, `theme-color` or `color-scheme` that isn't a string, and isn't falsy, is an unchecked error (see `page/error-uncaught`). Other keys are written as text, whatever their type, except a `title` that's a function: it's called, and what it returns is written.

## TODO

- **`metadata/required`** — Every page must have a title; that's why site metadata is required. Check `title` (and `description`, also required by the type) at runtime, so a missing title is an error instead of the text `undefined`.
- **`metadata/tags`** — Review `icon`: it always gets `type="image/png"`, whatever the file is.
- **`metadata/escaping`** — Escape every value properly, the title and the `<link>` hrefs included.
