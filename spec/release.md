# Release

unbundle is installed from GitHub, not npm. Each release is a git tag whose commit contains the built `dist/`.

## Package

- **`release/bins`** — `unbundle-serve` runs `dist/server/index.js`; `unbundle-build` runs `dist/server/build.js`.
- **`release/exports`** — `unbundle` resolves to `dist/client/index.js`; `unbundle/eslint` to `eslint/unbundle.js`.
- **`release/build`** — `pnpm build` (`build.js`) bundles `lib/client/index.ts` into `dist/client/index.js`, and `lib/server/index.ts` and `lib/server/build.ts` into `dist/server/`, with npm dependencies left external.
- **`release/dist-ignored`** — `dist/` is git-ignored. It is never committed on `main`.
- **`release/no-install-scripts`** — The package has no install scripts. Nothing builds when a site installs it.

## Releasing

- **`release/trigger`** — Releasing is changing `version` in `package.json` and pushing to `main`.
- **`release/workflow`** — `.github/workflows/release.yml` runs on every push to `main`:
  1. If the tag `v<version>` already exists, it stops.
  2. Otherwise it installs, runs `pnpm build` on Node 24, commits `dist/` with `git add --force` on a detached commit on top of that `main` commit (`main` doesn't move), tags it `v<version>` and pushes the tag.
  3. It creates a GitHub release for the tag, with generated notes.
- **`release/one-at-a-time`** — Release runs don't overlap. A running release is never cancelled by a newer push; the newer run waits.

## Installing

- **`release/pin`** — A site depends on a tag: `"unbundle": "github:atahrijouti/unbundle#v0.2.0"`, or `"github:atahrijouti/unbundle#semver:^0.2.0"` so `pnpm update unbundle` picks up newer tags.
- **`release/local`** — A site can use a local checkout with `"unbundle": "link:../unbundle"`. Linked packages don't run install scripts, so `pnpm build` must be run in the checkout after each change.
