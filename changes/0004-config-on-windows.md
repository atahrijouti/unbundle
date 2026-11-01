# 0004 — Config on Windows

## Why

- On Windows, `unbundle.config.js` never loads, even a valid one: both commands exit with code 1 (`config/file/load`).
- `lib/server/config.ts` imports the config by its plain path (`C:\…`), which Node's module loader rejects.

## Shape

- Import the config through a `file://` URL, the way page modules are already imported.
- Settles the TODO on `config/file/load`; the rule loses its Windows sentence.

## Breaking changes

None.
