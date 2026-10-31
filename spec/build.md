# Build

## Command

- **`build/command`** — `unbundle-build` reads the source folder, the static folder and the config. It lists the pages once, when it starts (see `page/folder/listing`), and fills the staging folder (see `staging/fill`).

## Output folder

- **`build/out-reset`** — The output folder is emptied first.
- **`build/write`** — The static folder, then the staging folder, then each page's HTML are written to the output folder; a later file wins over an earlier one with the same name.
- **`build/html`** — Pages are written one at a time, in the order the folders are listed, whatever their status: a page that fails a check is written as its error page (see `errors/page/error-page`).

## TODO

- **`build/html`** — Don't write pages that fail; skip them and report them (see the TODOs on `errors/page/error-page`).
