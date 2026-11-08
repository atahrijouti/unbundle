# Contributing

## Building unbundle

- `mise.toml` sets the Node and pnpm versions, for development and releases alike; `mise install` installs them.
- `pnpm install`, then `pnpm build`, writes `dist/`: the browser helpers bundled into one file, and the two commands bundled for Node with their npm dependencies left out. The version in `package.json` is built in; it's what `unbundle-serve` prints.
- `dist/` is ignored by git and never committed on `main`.
- `package.json` is `"private": true`, so it can't be published to npm. Installing unbundle builds nothing: there are no install scripts.

## Sample site

- `sample-site/` is a site that runs on this checkout: the pnpm workspace links it to unbundle, bins included. It uses every feature a site can use, each once.
- `pnpm sample` builds unbundle and starts the sample site's dev server. `pnpm sample:build` builds unbundle and writes the sample site to `sample-site/out/`. After a change to unbundle, restart the dev server.
- Try changes on the sample site first, and on a throwaway site for cases it doesn't cover, such as errors.
- `pnpm check` covers it too, with its own `tsconfig.json` and ESLint config.

## Releasing

Releasing is changing `version` in `package.json` and pushing to `main`. `.github/workflows/release.yml` runs on every push to `main`:

1. If the tag `v<version>` exists, it stops.
2. Otherwise it builds with the versions in `mise.toml`, commits `dist/` on top of the pushed commit as `Release v<version>`, tags that commit `v<version>`, and pushes only the tag. `main` doesn't move.
3. It creates a GitHub release for the tag, with generated notes.

Only one release runs at a time and none is cancelled. A newer push replaces a run that's still waiting, so the version in the newer commit is released and the one in between is skipped.

## Installing

- A site depends on a tag: `"unbundle": "github:atahrijouti/unbundle#v0.2.0"`, or `"github:atahrijouti/unbundle#semver:^0.2.0"` so `pnpm update unbundle` picks up newer tags. It gets `esbuild`, `prettier` and `ws` installed with it.
- A site can use a local checkout with `"unbundle": "link:../unbundle"`. The checkout then needs `pnpm install`, and `pnpm build` after each change.

## Changing unbundle

1. **Propose.** Write the change in `proposals/<name>.md`: why, what changes, which rules in `spec/` and items in `TODO.md` it touches, and any breaking changes. A proposal can wait on `main` until there's time to build it; one that's abandoned is deleted.
   Nothing is built until the maintainer approves the proposal. When the direction isn't clear yet, as with the items under "To decide" in `TODO.md`, discuss the options with the maintainer first; the proposal then records what was chosen.
2. **Implement.** In one PR, move the proposal to `changes/` with the next number (`changes/<NNNN>-<name>.md`), change `spec/`, the tests and the code together, update the sample site when the change adds or changes something a site can use, and remove the items it settles from `TODO.md`. Run `pnpm format`, then make sure `pnpm check` passes before opening the PR. Every record in `changes/` is in effect. One that replaces an earlier record says so at its top.
3. Use the terms in `CONTEXT.md`.
