# 0001 — Layout folders

Status: draft

## Why

- A site should be able to have several layouts and let each page pick one.
- Layout files (template, styles, scripts) currently sit loose in `src/` and are wired into the template by hand.
- Logic that must run before first paint ends up written inline in the template, with no types or lint.

## Shape

```
src/
  metadata.ts            site-wide metadata, shared by every layout
  layouts/
    main/                default layout
      layout.html        mandatory
      metadata.ts        optional, overrides site
      styles.css         optional
      sync.ts            optional, inlined before first paint
      global.ts          optional, module script
    full-width/
      layout.html
  app/<page>/
    index.ts             content, optional metadata, config.layout = "full-width"
    styles.css           optional
    sync.ts              optional
```

- A page picks a layout with `config.layout = "<folder name>"`. Default: `main`.
- An unknown layout, or a layout folder without `layout.html`, returns the 500 page.
- Anything else in a layout folder is copied as-is; unbundle doesn't look at it.

## Metadata

- Only `metadata.ts` lives outside a layout, so layouts don't redeclare site-wide facts.
- Every level exports it as `metadata`.
- `src/metadata.ts` is complete (`title`, `description` required). Layout and page metadata are optional and partial: they only override what differs.
- unbundle adds nothing of its own (no default icon or similar); whatever a site wants is declared in its metadata.

## Placeholders

Each one gets the layout's file, then the page's:

- `{{sync-scripts}}` — `sync.ts`, types stripped, inlined in a classic `<script>`.
- `{{styles}}` — `<link>` to `styles.css`.
- `{{scripts}}` — import map, layout `global.js`, page `index.js`.
- `{{metadata}}` — `{ ...site, ...layout, ...page }`.

Layouts should place `{{sync-scripts}}` before their stylesheet links: an inline script after a stylesheet waits for that stylesheet to download.

## Sync scripts take no imports

`sync.ts` is compiled on its own and never bundled. An `import` or `export` in it fails assembly with an error naming the file.

This is deliberate: sync scripts block first paint, so they should stay a few lines. Not being able to pull code in keeps them small, and makes it visible when one starts to grow.

## Breaking change: 0.2.0

No transition period. Consumers pin a tag or a `^0.1` range, so they move when they choose to upgrade.

- `config.layout` is a folder name, no longer a file path.
- `src/main.layout.html` and `src/main.metadata.ts` are no longer read.
- Site metadata is exported as `metadata`, no longer `defaultMetadata`.
