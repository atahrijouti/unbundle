# Spec

What unbundle does today, one topic per file. It is a one-to-one record of the code: when they disagree, one of them has a bug. Planned changes live in [`TODO.md`](../TODO.md). Terms are defined in [`CONTEXT.md`](../CONTEXT.md); history and reasoning live in [`changes/`](../changes/).

## How a spec file is written

Each file covers one topic, split into concepts, one `##` heading each. Within a concept, rules follow the order you'd think about it:

1. what the author writes, or what unbundle reads;
2. what it becomes in the finished site;
3. how development or the dev server differs;
4. what fails. [Errors](errors.md) gathers what fails while producing a page, filling the staging folder or running either command, so the build and the dev server can be compared side by side. Other failures stay with the rule they belong to.

Only the parts that apply are written. When writing or reviewing a concept, ask all four questions, so a missing answer is a choice rather than an oversight.

*Development* and *production* are modes, set by `NODE_ENV` (see `config/modes/effects`). A rule about the dev server says *the dev server*.

Each rule:

- has an ID, `<topic>/<concept>/<aspect>`, or `<topic>/<concept>` when the concept is a single rule, so tests and change records can point at it. IDs name what a rule is about, never which part of the list above it belongs to;
- states one fact the author can observe: files, URLs, HTML, status codes, exit codes, logs;
- names a code detail only when the exact text is what the author depends on;
- says what the code does today;
- lives in one place. Other rules point to it rather than repeat it.

Both commands run from the site's root folder. Every path here is relative to it.

## Topics

- [Page](page.md)
- [Layout](layout.md)
- [Metadata](metadata.md)
- [Scripts](scripts.md)
- [Import map](import-map.md)
- [Static files](static.md)
- [Config](config.md)
- [Staging folder](staging.md)
- [Build](build.md)
- [Dev server](dev-server.md)
- [Errors](errors.md)
- [Package](package.md)
