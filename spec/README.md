# Spec

What unbundle does today, area by area. This is the reference: when the code and a spec disagree, one of them has a bug. Terms are defined in [`../CONTEXT.md`](../CONTEXT.md).

| File | Covers |
|---|---|
| [pages.md](pages.md) | Pages: their folders, module, URLs and errors |
| [layouts.md](layouts.md) | Layouts, placeholders, global and sync scripts |
| [metadata.md](metadata.md) | Site, layout and page metadata, and the tags it produces |
| [build.md](build.md) | The build, the staging folder, the import map |
| [dev-server.md](dev-server.md) | The dev server and live reload |
| [config.md](config.md) | The config, development and production |
| [package.md](package.md) | What a site imports: browser helpers and ESLint rules |
| [release.md](release.md) | How unbundle is versioned, released and installed |

## How a spec file is written

Every file follows the same outline, leaving out sections it has nothing for:

1. **Purpose**: one sentence under the title saying what the area is.
2. **Shape**: the files or interface the author writes.
3. **Behavior**: rules in the order things happen, from what the author writes to what the site gets.
4. **Errors**: what fails, and what the author sees.
5. **Notes**: advice for authors. Not rules.
6. **TODO**: known gaps and intended changes.

Each rule:

- has an ID, `<file>/<rule>` (such as `pages/home`), so tests and change records can point at it. The prefix is the file's name.
- states one fact the author can observe: files, URLs, HTML, status codes, exit codes.
- uses the terms in `CONTEXT.md`.
- names a code detail (a function, a regex) only when the exact text is what the author depends on.
- is either wanted as it is, or has a TODO to change it. A behavior that is neither doesn't belong in the spec.

A TODO names the rule it changes. Picking one up starts a change record in [`../changes/`](../changes/), which holds history and reasoning; the spec only describes the present.

## Runtime

- Both commands run from the site's root folder; every path in these specs is relative to it.
- Node imports the site's TypeScript at build time: each page's module, the metadata files, and what they import. This needs Node's built-in type stripping (Node 22.18 or 23.6 and later; releases are built on Node 24).
- Node only strips erasable TypeScript, so those files can't use enums, namespaces or parameter properties, and their relative imports must end in `.ts`. The browser copy is transpiled by esbuild, which accepts more, so a file can work in the browser and still fail at build time.
