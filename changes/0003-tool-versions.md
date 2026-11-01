# 0003 — Tool versions

## Why

- The Node and pnpm versions are written in three places, and they disagree: `mise.toml` says Node LTS and pnpm 12, the release workflow pins Node 24 and pnpm 10, and `CONTRIBUTING.md` repeats Node 24 and pnpm 10.
- So releases are built with different tools than the ones used while developing.

## Shape

- `mise.toml` is the only place the versions are written. Node is pinned to a major instead of `lts`, so a new LTS doesn't change what releases are built with until a commit says so.
- The release workflow installs them with `jdx/mise-action`, which reads `mise.toml`, instead of `pnpm/action-setup` and `actions/setup-node`.
- `CONTRIBUTING.md` names `mise.toml` instead of version numbers.

## Breaking changes

None for sites. Releases are built with the versions in `mise.toml`, which are newer than the ones the workflow pinned.
