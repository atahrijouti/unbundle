# Spec

What unbundle does today, one topic per file. It is a one-to-one record of the code: when they disagree, one of them has a bug. Terms are defined in [`CONTEXT.md`](../CONTEXT.md); history and reasoning live in [`changes/`](../changes/).

## How a spec file is written

Each file covers one topic, split into concepts, one `##` heading each, and ends with a `## TODO` section. Within a concept, rules follow the order you'd think about it:

1. what the author writes, or what unbundle reads;
2. what it becomes in the finished site;
3. how development or the dev server differs;
4. what fails, pointing to [Errors](errors.md), which gathers every failure in one place.

Only the parts that apply are written. When writing or reviewing a concept, ask all four questions, so a missing answer is a choice rather than an oversight.

*Development* and *production* are modes, set by `NODE_ENV` (see `config/modes/effects`). A rule about the dev server says *the dev server*.

Each rule:

- has an ID, `<topic>/<concept>/<aspect>`, or `<topic>/<concept>` when the concept is a single rule, so tests and change records can point at it. IDs name what a rule is about, never which part of the list above it belongs to;
- states one fact the author can observe: files, URLs, HTML, status codes, exit codes, logs;
- names a code detail only when the exact text is what the author depends on;
- is either wanted as it is, or has a TODO to change it. The rule always says what the code does today; only the TODO says what's wanted instead;
- lives in one place. Other rules point to it rather than repeat it.

A TODO names the rule it changes. Picking one up starts a change record; the change updates the rule, its TODO and the tests together.

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
