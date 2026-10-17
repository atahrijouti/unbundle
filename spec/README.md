# Spec

What unbundle does today, one element per file. It is a one-to-one record of the code: when they disagree, one of them has a bug. Terms are defined in [`CONTEXT.md`](../CONTEXT.md); history and reasoning live in [`changes/`](../changes/).

## How a spec file is written

Every file covers one element, with the same five sections, in this order:

1. **Source** — what the author writes, or what unbundle reads.
2. **Output** — what it becomes in the finished site.
3. **Development** — how the dev server differs from the build.
4. **Errors** — what fails, and what the author sees.
5. **TODO** — known gaps and intended changes.

A section with nothing to say says so ("No differences."), so a missing piece shows up as a question rather than a silence.

Each rule:

- has an ID, `<file>/<rule>`, so tests and change records can point at it;
- states one fact the author can observe: files, URLs, HTML, status codes, exit codes, logs;
- names a code detail only when the exact text is what the author depends on;
- is either wanted as it is, or has a TODO to change it. The rule always says what the code does today; only the TODO says what's wanted instead;
- lives in the element where the author's action starts. Other elements point to it rather than repeat it.

A TODO names the rule it changes. Picking one up starts a change record; the change updates the rule, its TODO and the tests together.

Both commands run from the site's root folder. Every path here is relative to it.

## Elements

- [Page](page.md)
- [Layout](layout.md)
- [Metadata](metadata.md)
- [Scripts](scripts.md)
- [Import map](import-map.md)
- [Static files](static.md)
- [Config](config.md)
- [Build](build.md)
- [Dev server](dev-server.md)
- [Package](package.md)
