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

- **`metadata/site`** — `src/metadata.ts` exports `metadata: Metadata`. Every page needs it: if the file is missing, fails to import, or has no `metadata` export, the page returns status 500.
- **`metadata/layout`** — A layout's `metadata.ts` exports `metadata: Partial<Metadata>`. Optional.
- **`metadata/page`** — A page module exports `metadata: Partial<Metadata>`. Optional.
- **`metadata/merge`** — The page's metadata is `{ ...site, ...layout, ...page }`: a shallow merge where later levels override earlier ones.
- **`metadata/required`** — `title` and `description` are required by the type only. At runtime nothing checks that they are present.
- **`metadata/no-defaults`** — unbundle adds no metadata of its own.

## Output

- **`metadata/title`** — `title` replaces `{{title}}` in the layout, unescaped. It produces no tag of its own.
- **`metadata/tags`** — `<!-- {{metadata}} -->` is replaced with one tag per key, in the merged object's key order:

  | Key | Tag |
  |---|---|
  | `description` | `<meta name="description" content="…" />` |
  | `theme-color` | `<meta name="theme-color" content="…" />` |
  | `color-scheme` | `<meta name="color-scheme" content="…" />` |
  | `manifest` | `<link rel="manifest" href="…" />` |
  | `icon` | `<link rel="icon" href="…" type="image/png" />` |

- **`metadata/escaping`** — `"` and `'` are escaped in `<meta>` values. `manifest` and `icon` values are not escaped.
- **`metadata/skip`** — Keys with a falsy value are skipped. Keys not in the table produce nothing.

## TODO

- **`metadata/tags`** — Review `icon`: it always gets `type="image/png"`, whatever the file is.
