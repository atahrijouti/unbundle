# Release

unbundle is installed from GitHub, not npm: each release is a git tag whose commit contains the built package.

## Shape

- **`release/private`** — `package.json` is `"private": true`, so it can't be published to npm.
- **`release/bins`** — `unbundle-serve` runs the dev server; `unbundle-build` runs the build.
- **`release/exports`** — `unbundle` is the browser helpers, `unbundle/eslint` the ESLint rules, each with its types (see [package.md](package.md)).
- **`release/dependencies`** — Sites get `esbuild`, `prettier` and `ws` installed with unbundle.

## Behavior

### Building unbundle

- **`release/build`** — `pnpm build` writes `dist/`: the browser helpers bundled into one file, and the two commands bundled for Node with their npm dependencies left out. The version in `package.json` is built in, which is what `dev-server/version` prints.
- **`release/dist-ignored`** — `dist/` is ignored by git and never committed on `main`.
- **`release/no-install-scripts`** — Installing unbundle builds nothing.

### Releasing

- **`release/trigger`** — Releasing is changing `version` in `package.json` and pushing to `main`.
- **`release/workflow`** — `.github/workflows/release.yml` runs on every push to `main`:
  1. If the tag `v<version>` exists, it stops.
  2. Otherwise it builds (pnpm 10, Node 24), commits `dist/` on top of the pushed commit as `Release v<version>`, tags that commit `v<version>`, and pushes only the tag. `main` doesn't move.
  3. It creates a GitHub release for the tag, with generated notes.
- **`release/one-at-a-time`** — Only one release runs at a time and none is cancelled. A newer push replaces a run that's still waiting, so the version in the newer commit is released and the one in between is skipped.

### Installing

- **`release/pin`** — A site depends on a tag: `"unbundle": "github:atahrijouti/unbundle#v0.2.0"`, or `"github:atahrijouti/unbundle#semver:^0.2.0"` so `pnpm update unbundle` picks up newer tags.
- **`release/local`** — A site can use a local checkout with `"unbundle": "link:../unbundle"`. The checkout then needs `pnpm install`, and `pnpm build` after each change.

## TODO

None known.
