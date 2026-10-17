# 0003 — Tests from the spec

Status: proposed

Depends on [0002](0002-dev-server-port.md), so dev server tests don't need port 3000 free.

## Why

- `spec/` describes what unbundle does, but nothing checks it. Several rules rest only on reading the code.
- Upcoming changes, the TODOs and reshaping the code around `CONTEXT.md`, need a safety net: behavior must not change by accident.
- A rule nobody wants to test is noise. Writing the tests is also the last review of the spec.

## Shape

```
test/
  helpers.ts
  page.test.ts        one file per spec file
  layout.test.ts
  metadata.test.ts
  scripts.test.ts
  import-map.test.ts
  static.test.ts
  config.test.ts
  build.test.ts
  dev-server.test.ts
  package.test.ts
  coverage.test.ts
.github/workflows/test.yml
```

`pnpm test` runs `pnpm build`, then `node --test`, so tests run the same `dist/` a site installs. CI runs it on every push and pull request.

## How tests work

- **From the outside only.** Tests run the two commands and check what an author would see: output files, HTML, status codes, exit codes, logs. They never import from `lib/`, so the code can be reshaped freely.
- **One test per rule, named by its ID:**

  ```ts
  test("page/home", async () => {
    const s = await site({ "src/app/home/index.ts": page("Hi") })
    const { out } = await build(s)
    assert.match(out("index.html"), /Hi/)
  })
  ```

- **Each test builds its own site** in a temporary folder: a minimal site plus the files the test is about. Helpers run the build, or start the dev server and read its port from the log.
- **Current behavior is what's tested, TODOs included.** `page/error-checks` tests a missing `content` as 400. Picking up a TODO changes the spec, the test and the code together.
- **Coverage:** a test fails if any rule ID in `spec/` has no test with that name, except the rules checked by hand.

## Not automated

- Checked by hand: `dev-server/port` and `dev-server/reload-host` (need a second device).
- Skipped: `package/text-to-html` needs a DOM, which Node doesn't have, for a helper that only wraps `innerHTML`. It's a `test.skip`, so every run shows it as pending. Write it or delete the helper when it matters.

## Order

1. Helpers, `pnpm test`, CI, and three tests (`page/home`, `build/write`, `page/dev-url`) to prove the setup.
2. The rest, one element at a time, then the coverage test.

A test that fails against today's code means the spec is wrong or the code has a bug. Each is settled with the author: fix the spec, or test the current behavior and add a TODO.

## Rejected

- **Unit tests against `lib/`.** They would lock in today's code structure, which is about to change.
- **Fixture sites kept in the repo.** One shared site mixes many rules together; a site per test keeps each test focused.
- **A test framework (Vitest, Jest).** `node:test` is enough, and adds no dependency.
