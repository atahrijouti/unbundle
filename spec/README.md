# Spec

What unbundle does today, area by area. This is the reference: when the code and a spec disagree, one of them has a bug.

| File | Covers |
|---|---|
| [pages.md](pages.md) | Page folders, the page module, routes |
| [layouts.md](layouts.md) | Layout folders, how a page picks one, placeholders |
| [metadata.md](metadata.md) | Site, layout and page metadata, and the tags they produce |
| [build.md](build.md) | `unbundle-build`, transpiling, the import map, `out/` |
| [dev-server.md](dev-server.md) | `unbundle-serve`, watching, live reload |
| [config.md](config.md) | `unbundle.config.js` |
| [package.md](package.md) | What a site imports: `unbundle` and `unbundle/eslint` |
| [release.md](release.md) | How unbundle is versioned, released and installed |

## Conventions

- Written in the present tense, describing current behavior only. History and reasoning live in [`../changes/`](../changes/).
- Each rule has an ID, `<file>/<rule>` (such as `pages/home`), so tests and change records can point at it. The prefix is always the name of the file the rule lives in.
- Known gaps go in a `## TODO` section at the bottom of each file, naming the rule they affect. Picking one up starts a change record in `changes/`.

## Runtime

- Node imports the site's `.ts` files directly (page modules, metadata), so it needs a Node version that strips TypeScript types natively.
- Both commands run from the site's root folder; every path in these specs is relative to it.
