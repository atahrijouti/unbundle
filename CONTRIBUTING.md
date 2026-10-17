# Contributing

## Building unbundle

- `pnpm install`, then `pnpm build`, writes `dist/`: the browser helpers bundled into one file, and the two commands bundled for Node with their npm dependencies left out. The version in `package.json` is built in; it's what `unbundle-serve` prints.
- `dist/` is ignored by git and never committed on `main`.
- `package.json` is `"private": true`, so it can't be published to npm. Installing unbundle builds nothing: there are no install scripts.

## Releasing

Releasing is changing `version` in `package.json` and pushing to `main`. `.github/workflows/release.yml` runs on every push to `main`:

1. If the tag `v<version>` exists, it stops.
2. Otherwise it builds (pnpm 10, Node 24), commits `dist/` on top of the pushed commit as `Release v<version>`, tags that commit `v<version>`, and pushes only the tag. `main` doesn't move.
3. It creates a GitHub release for the tag, with generated notes.

Only one release runs at a time and none is cancelled. A newer push replaces a run that's still waiting, so the version in the newer commit is released and the one in between is skipped.

## Installing

- A site depends on a tag: `"unbundle": "github:atahrijouti/unbundle#v0.2.0"`, or `"github:atahrijouti/unbundle#semver:^0.2.0"` so `pnpm update unbundle` picks up newer tags. It gets `esbuild`, `prettier` and `ws` installed with it.
- A site can use a local checkout with `"unbundle": "link:../unbundle"`. The checkout then needs `pnpm install`, and `pnpm build` after each change.

## Changing unbundle

1. Write a change record in `changes/`: why, what changes, which rules in `spec/` it touches, what was rejected.
2. Once it's accepted, change `spec/`, the tests and the code together.
3. Use the terms in `CONTEXT.md`.
