# 0005 — Port and host

## Why

- The dev server always listens on port 3000, so a second one can't run beside it, and tests need several (`dev-server/port`).
- Live reload always connects to `localhost:3000`, so a page served on another port, or opened from another device, doesn't reload (`dev-server/reload/host`).

## Shape

- Config keys `PORT`, default `3000`, and `HOST`, default every network interface. `PORT: 0` lets the operating system pick a free port.
- When the port is taken, the dev server tries the next one up.
- It prints the address it actually got: `Server running on http://<host>:<port>`, with `localhost` when `HOST` isn't set.
- Live reload connects to the address that served the page, and declares no global.
- Settles the TODOs on `dev-server/port` and `dev-server/reload/host`.

## Breaking changes

None: the defaults keep today's behavior.
