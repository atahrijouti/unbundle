# 0000 — Prebuilt dist

Status: accepted — release tags carry `dist/`

## Problem

unbundle is installed from git and used to build its own `dist/` in a `postinstall` script. Both bins (`unbundle-serve`, `unbundle-build`) and the client export point into `dist/`, so if that script doesn't run, nothing works.

Since pnpm 10.34, a git dependency's build script only runs when its exact source is approved:

```yaml
allowBuilds:
  unbundle@https://codeload.github.com/atahrijouti/unbundle/tar.gz/<commit>: true
```

`unbundle: true` no longer covers it. The commit hash is part of the key, so every unbundle bump needed a new approval, otherwise installs silently skipped the build and `unbundle-build: not found` failed CI.

Running the TypeScript directly isn't an option: Node refuses to strip types from files under `node_modules`.

## Decision

Ship `dist/` inside release tags, never on `main`, and drop `postinstall`.

1. **Releasing is a version bump.** Change `version` in `package.json` and push to `main`.
2. **`.github/workflows/release.yml`** runs on every push to `main`. If `v<version>` is already tagged, it stops. Otherwise it builds, commits `dist/` on top of that `main` commit (detached; `main` doesn't move), tags that commit `v<version>`, pushes the tag and creates a GitHub release.
3. **Consumers pin a tag:** `"unbundle": "github:atahrijouti/unbundle#v0.0.4"`, or `#semver:^0.1.0` so `pnpm update unbundle` picks up newer tags. The tag's tarball already contains `dist/`: nothing builds at install, nothing to approve in `allowBuilds`.

`dist/` stays in `.gitignore`; the release job adds it with `git add --force`.

### Rejected

- **Commit `dist/` on `main`, guarded by a pre-commit hook.** The hook has to be enabled on every clone, so a forgotten setup means a stale `dist/` and failing CI; and `dist/` adds noise to every diff.
- **A bot PR that rebuilds `dist/` and bumps the version** (release-please / changesets). Needs Actions to open PRs, those PRs don't trigger other workflows, and `dist/` still lands on `main`. Worth it with changelogs or several contributors; a version-bump commit is the same gate here.
- **Publish to npm.** Works (approval by name), but adds a registry account and publish step for a personal tool.
- **Keep `postinstall`.** Re-approve the exact key on every bump.

## Developing against a local copy

A site can point at a local checkout with `"unbundle": "link:../unbundle"`. Linked packages don't run install scripts, so rebuild by hand (`pnpm build`) after each change. `dist/` is git-ignored, so the local build never gets committed by accident.
