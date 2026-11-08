# Encoding

## Text

- **`encoding/text/utf-8`** — unbundle reads and writes every text file as UTF-8: the layout file, the import map, `.ts` files, the files transpiled from them, and pages. Every other file, from `src/` or the static folder, is copied byte for byte.
- **`encoding/text/as-written`** — Text outside ASCII, such as `·` or `é` in a string, reaches transpiled files and inlined sync scripts as it is, not as an escape like `\xB7`.

## Charset

- **`encoding/charset`** — Neither command declares a charset for a page: the build writes a plain file, and the dev server sends `text/html` with none (see `dev-server/serve/mime`). A browser reads a page as UTF-8 because the layout file says so with `<meta charset="utf-8">`. Module scripts are always read as UTF-8, whatever the server sends; inlined sync scripts are part of the page.
