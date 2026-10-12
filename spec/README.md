# Spec

What unbundle does today, area by area. This is the reference: when the code and a spec disagree, one of them has a bug.

| File | Covers |
|---|---|
| [pages.md](pages.md) | Page folders, the page module, routes, errors |
| [layouts.md](layouts.md) | Layout folders, how a page picks one, placeholders |
| [metadata.md](metadata.md) | Site, layout and page metadata, and the tags they produce |
| [build.md](build.md) | `unbundle-build`, transpiling, the import map, `out/` |
| [dev-server.md](dev-server.md) | `unbundle-serve`, watching, live reload |
| [config.md](config.md) | `unbundle.config.js`, `NODE_ENV` |
| [package.md](package.md) | What a site imports: `unbundle` and `unbundle/eslint` |
| [release.md](release.md) | How unbundle is versioned, released and installed |

## Conventions

- Written in the present tense, describing current behavior only. History and reasoning live in [`../changes/`](../changes/).
- Each rule has an ID, `<file>/<rule>` (such as `pages/home`), so tests and change records can point at it. The prefix is always the name of the file the rule lives in.
- Known gaps and intended improvements go in a `## TODO` section at the bottom of each file, naming the rule they affect. Picking one up starts a change record in `changes/`.

## Runtime

- Both commands run from the site's root folder; every path in these specs is relative to it.
- Node imports the site's `.ts` files directly: page modules, `src/metadata.ts`, layout `metadata.ts`, and everything they import. This needs Node's built-in type stripping, unflagged from Node 22.18 and 23.6. Releases are built on Node 24.
- Node only strips erasable TypeScript, so those files can't use enums, namespaces or parameter properties, and their relative imports must end in `.ts`. esbuild, which transpiles the same files for the browser, accepts more, so a file can work in the browser and still fail in Node.
