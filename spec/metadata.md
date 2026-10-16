# Metadata

Metadata describes a page to the browser and the outside world. It is declared for the site, a layout and a page, and the page gets all three merged.

## Shape

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

| Level | Where | Exports |
|---|---|---|
| Site | `src/metadata.ts`, required | `metadata: Metadata` |
| Layout | `src/layouts/<name>/metadata.ts`, optional | `metadata: Partial<Metadata>` |
| Page | the page's module, optional | `metadata: Partial<Metadata>` |

## Behavior

- **`metadata/merge`** — A page's metadata is the site's, overridden key by key by its layout's, then by its own. Setting a key to `""` or `undefined` overrides too, which removes that tag.
- **`metadata/no-defaults`** — unbundle adds no metadata of its own.
- **`metadata/title`** — The title fills `{{title}}`. It produces no tag of its own.
- **`metadata/tags`** — `<!-- {{metadata}} -->` gets one tag per key that has a value:

  | Key | Tag |
  |---|---|
  | `description` | `<meta name="description" content="…" />` |
  | `theme-color` | `<meta name="theme-color" content="…" />` |
  | `color-scheme` | `<meta name="color-scheme" content="…" />` |
  | `manifest` | `<link rel="manifest" href="…" />` |
  | `icon` | `<link rel="icon" href="…" type="image/png" />` |

  Keys not in the table produce nothing.
- **`metadata/escaping`** — In the three `<meta>` values, `"` and `'` are escaped. Nothing else is, and the title and the `<link>` hrefs aren't escaped at all.
- **`metadata/urls`** — `manifest` and `icon` are written as given. The base URL isn't added.

## Errors

- **`metadata/site`** — Without site metadata, every page fails (see `pages/error-site-metadata`).
- **`metadata/required`** — `title` and `description` are required by the type only. Without a `title`, the page shows the text `undefined` where the title goes.

## TODO

- **`metadata/required`** — Every page must have a title; that's why site metadata is required. Check `title` (and `description`, also required by the type) at runtime, so a missing title is an error instead of the text `undefined`.
- **`metadata/tags`** — Review `icon`: it always gets `type="image/png"`, whatever the file is.
- **`metadata/escaping`** — Escape every value properly, the title and the `<link>` hrefs included.
