# Release

unbundle is installed from GitHub, not npm. Each release is a git tag whose commit contains the built `dist/`.

## Package

- **`release/private`** — `package.json` has `"private": true`, so it can't be published to npm.
- **`release/bins`** — `unbundle-serve` runs `dist/server/index.js`; `unbundle-build` runs `dist/server/build.js`.
- **`release/exports`** — `unbundle` resolves to `dist/client/index.js`, with types from `lib/client/index.ts`. `unbundle/eslint` resolves to `eslint/unbundle.js`, with types from `eslint/unbundle.d.ts`.
- **`release/dependencies`** — Runtime dependencies are `esbuild`, `prettier` and `ws`.
- **`release/build`** — `pnpm build` (`build.js`) runs two esbuild bundles:
  - `lib/client/index.ts` into `dist/client/index.js`, with everything inlined.
  - `lib/server/index.ts` and `lib/server/build.ts` into `dist/server/`, for Node, with npm dependencies left external. `package.json`'s `version` is inlined here, which is what `dev-server/version` prints.
- **`release/dist-ignored`** — `dist/` is git-ignored. It is never committed on `main`.
- **`release/no-install-scripts`** — The package has no install scripts. Nothing builds when a site installs it.

## Releasing

- **`release/trigger`** — Releasing is changing `version` in `package.json` and pushing to `main`.
- **`release/workflow`** — `.github/workflows/release.yml` runs on every push to `main`, on the pushed commit:
  1. If the tag `v<version>` already exists, it stops.
  2. Otherwise it runs `pnpm install` and `pnpm build` (pnpm 10, Node 24). Then it commits `dist/` with `git add --force` on a detached commit on top of the pushed commit, with the message `Release v<version>`, tags it `v<version>` (a lightweight tag) and pushes only the tag. `main` doesn't move.
  3. It creates a GitHub release for the tag, with generated notes.
- **`release/one-at-a-time`** — Release runs share one concurrency group. A running release is never cancelled. At most one run waits behind it: a newer push replaces a run that is still waiting. Each run releases the version in its own commit, so a version bump whose run was replaced is skipped, and the newer commit's version is released instead.

## Installing

- **`release/pin`** — A site depends on a tag: `"unbundle": "github:atahrijouti/unbundle#v0.2.0"`, or `"github:atahrijouti/unbundle#semver:^0.2.0"` so `pnpm update unbundle` picks up newer tags.
- **`release/local`** — A site can use a local checkout with `"unbundle": "link:../unbundle"`. Linked packages don't run install scripts, so the checkout needs `pnpm install`, then `pnpm build` after each change.

## TODO

None known.
