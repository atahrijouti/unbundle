# unbundle

A static-site tool that doesn't bundle: `unbundle-build` writes the finished site, and `unbundle-serve` is the dev server.

## Where things are

- `CONTEXT.md`: the terms. Use them.
- `spec/`: what unbundle does today, rule by rule. `spec/README.md` explains the format.
- `TODO.md`: the backlog of planned changes, in order. An item that changes existing behavior names the spec rule it changes.
- `proposals/`: changes written down but not built yet.
- `changes/`: changes in effect, numbered.
- `CONTRIBUTING.md`: building, releasing, and how to change unbundle.
- `lib/server/`: the build and the dev server. `lib/client/`: the helpers a site imports. `eslint/`: the ESLint plugin.

## Changing unbundle

Follow "Changing unbundle" in `CONTRIBUTING.md`. A change starts as a proposal. Building it moves the proposal to `changes/` with the next number and updates the spec, the tests and the code in the same PR, and removes the items it settles from `TODO.md`. The spec must stay exactly true to the code.

## Tools and checks

- `mise.toml` sets the Node and pnpm versions; `mise install` installs them.
- `pnpm install`, then `pnpm build`, writes `dist/`.
- After any change, run `pnpm format`, then `pnpm check`, which checks formatting, types and lint without changing anything. It must pass; CI runs it on every pull request.
- Check behavior on a throwaway site in a temp folder: run `node <repo>/dist/server/build.js` or `node <repo>/dist/server/index.js` from the site's root. Give its `unbundle.config.js` `PORT: 0`, so the dev server never clashes with one already running.
- There are no tests yet (see `TODO.md`).
