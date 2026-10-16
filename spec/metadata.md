# Metadata

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

## Levels

- **`metadata/site`** — `src/metadata.ts` exports `metadata: Metadata`. Every page needs it, and it is checked before anything else (see [pages.md](pages.md#errors)): if it's missing, fails to import, or has no `metadata` export, every page returns 500.
- **`metadata/layout`** — A layout's `metadata.ts` exports `metadata: Partial<Metadata>`. Optional.
- **`metadata/page`** — A page module exports `metadata: Partial<Metadata>`. Optional.
- **`metadata/merge`** — The page's metadata is `{ ...site, ...layout, ...page }`: a shallow merge where later levels override earlier ones. An override with `""` or `undefined` also counts, so a later level can remove a tag.
- **`metadata/required`** — `title` and `description` are required by the type only. Nothing checks them at runtime. A missing `title` renders as the text `undefined`. A missing `description` produces no tag.
- **`metadata/no-defaults`** — unbundle adds no metadata of its own.

## Output

- **`metadata/title`** — `title` replaces `{{title}}` in the layout, unescaped. It produces no tag of its own.
- **`metadata/tags`** — `<!-- {{metadata}} -->` is replaced with one tag per key:

  | Key | Tag |
  |---|---|
  | `description` | `<meta name="description" content="…" />` |
  | `theme-color` | `<meta name="theme-color" content="…" />` |
  | `color-scheme` | `<meta name="color-scheme" content="…" />` |
  | `manifest` | `<link rel="manifest" href="…" />` |
  | `icon` | `<link rel="icon" href="…" type="image/png" />` |

- **`metadata/order`** — Tags follow the merged object's key order: the order each key first appears across site, then layout, then page. Overriding a key doesn't move it.
- **`metadata/escaping`** — In the three `<meta>` values, `"` becomes `&quot;` and `'` becomes `&#39;`. Nothing else is escaped (`&`, `<`, `>`), and `manifest`, `icon` and `title` are not escaped at all.
- **`metadata/urls`** — `manifest` and `icon` are written exactly as given. `BASE_URL` is not applied.
- **`metadata/skip`** — Keys with a falsy value are skipped. Keys not in the table produce nothing. A `<meta>` value that isn't a string throws (see `pages/error-uncaught`).

## TODO

- **`metadata/tags`** — Review `icon`: it always gets `type="image/png"`, whatever the file is.
- **`metadata/required`** — Every page must have a title; that's why site metadata is required. The type says so, but nothing checks it at runtime. Check `title` (and `description`, also required by the type) at runtime, so a missing `title` is an error instead of the text `undefined`.
- **`metadata/escaping`** — Escape every inserted value properly, `title` and the `<link>` hrefs included.
