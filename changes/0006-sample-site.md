# 0006 — Sample site

## Why

- Trying a change to unbundle means linking a real site to this checkout, or releasing a version and bumping it there.
- Nothing in the repo runs the two commands against a site, so a change can break one without anyone noticing until a site upgrades.

## Shape

```
sample-site/
  package.json          "unbundle": "workspace:*", scripts dev and build
  tsconfig.json
  eslint.config.js      unbundle.configs.recommended
  src/
    metadata.ts
    import-map.json
    layouts/
      main/             layout.html, metadata.ts, styles.css, sync.ts, global.ts
      plain/            layout.html
    app/
      home/             index.ts with ready, styles.css, sync.ts
      about/            index.ts, config.layout = "plain"
      404/              index.ts
  public/
```

- `pnpm-workspace.yaml` lists `sample-site`, so `pnpm install` at the root links this checkout into `sample-site/node_modules/unbundle`, bins included. The sample site runs `unbundle-serve` and `unbundle-build` the way a real site does.
- The sample site uses every feature a site can use, each once. The tree above is what that means today. It's a working site, not a catalogue of edge cases: those stay in throwaway sites and, later, tests.
- Its import map maps `unbundle` to `./node_modules/unbundle/dist/client/index.js`, so pages can import the helpers in the browser. It names that one file because unbundle copies whatever the map names into the site (`import-map/node-modules/copy`), and `node_modules/unbundle` is a link to this checkout: naming the folder would copy the whole checkout.
- No `unbundle.config.js`: the sample site runs on the defaults. When port 3000 is taken, the dev server moves to the next one (`dev-server/port`).
- Root scripts build unbundle, then run the sample site: `pnpm sample` starts its dev server, `pnpm sample:build` writes `sample-site/out/`. A change to unbundle needs the dev server restarted.
- `pnpm check` covers the sample site: Prettier with the root config, `tsc -p sample-site` with its own `tsconfig.json` (the root one excludes `sample-site/`), and ESLint with the sample site's own config, which also exercises the ESLint plugin.
- "Changing unbundle" in `CONTRIBUTING.md` gains a rule: a change that adds or changes something a site can use updates the sample site in the same PR, with the spec, the tests and the code. `AGENTS.md` says the same.
- `CONTRIBUTING.md` and `AGENTS.md` say to try changes on the sample site first, and on a throwaway site for cases it doesn't cover.
- No spec rule changes. Settles the "Sample site" item in `TODO.md`.

## Breaking changes

None for sites.
