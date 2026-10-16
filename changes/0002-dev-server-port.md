# 0002 — Dev server port

Status: proposed

## Why

The dev server only ever uses port 3000. A second dev server, such as another site's or the one the tests in [0003](0003-tests-from-spec.md) start, fails if 3000 is taken.

## Change

- If port 3000 is taken, the dev server tries the next one up, up to 20 tries.
- It logs the port it got: `Server running on http://localhost:<port>`.
- Live reload connects to the host and port that served the page, instead of `localhost:3000`, and no longer declares a global.

## Spec changes

- `dev-server/port`: 3000, or the next free port.
- `dev-server/reload-host`: connects to the host that served the page. Its TODO is removed, since pages opened from another device now live reload too.
- `config/fixed`: removed.

## Rejected

- **A `PORT` config key.** Nothing needs a different starting port yet.
- **Failing when the port is taken.** That's the problem this change solves.
