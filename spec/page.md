# Page

## Folder

- **`page/folder/location`** — A page is a folder directly inside `<source folder>/app/`, named after its folder. Folders inside a page's folder belong to the page; they aren't pages.
- **`page/folder/listing`** — Pages are found by listing `<source folder>/app/`: every folder there is a page, hidden and symlinked ones included, and files directly in `app/` are ignored. The build lists them once, when it starts. The dev server lists them again on every request, so a new page shows up without a restart.
- **`page/folder/files`** — What unbundle does with the files in a page's folder:

  | File | | What happens to it |
  |---|---|---|
  | `index.ts` | required | The page's module (see Module). Loaded as a module script from `<base URL>app/<page>/index.js`. |
  | `styles.css` | optional | Linked from `<base URL>app/<page>/styles.css`, after the layout's (see `layout/placeholders/list`). |
  | `sync.ts` | optional | Pasted into the page's HTML (see `scripts/sync/inline`). |
  | anything else | | Reaches the site like the rest of the source folder (see `staging/ships-all`). |

## Module

- **`page/module/runs-twice`** — The folder's `index.ts` is the page's module. It runs at build time and again in the browser, so its top-level code and `content()` can't use browser-only APIs such as `document`, `textToHTML` included (see `package/helpers/text-to-html`).
- **`page/module/node`** — Node imports the site's TypeScript at build time, using its built-in type stripping (Node 22.18 or 23.6 and later). That TypeScript can't use enums, namespaces or parameter properties, and its relative imports must end in `.ts`; the browser copy accepts more, so a file can work in the browser and still fail at build time.
- **`page/module/exports`** — The module exports:

  ```ts
  export const content: () => string         // required
  export const metadata: Partial<Metadata>   // optional, see Metadata
  export const config: { layout?: string }   // optional, see Layout
  export const ready: () => void             // optional
  ```

- **`page/module/content`** — `content()` is called once each time the page is produced, with no arguments, and isn't awaited. What it returns fills `<!-- {{content}} -->`.
- **`page/module/ready`** — If the module's source contains the text `export const ready`, unbundle appends `document.addEventListener("DOMContentLoaded", ready)` to the page's `index.js`, after its code and before its exports, so the site ships a modified copy of the module. It's a text match: `export function ready` and `export { ready }` aren't detected, while `export const readyCount`, or the text in a comment, is, and the script then throws as soon as it loads, since that `ready` doesn't exist. Only a page's own `index.ts` is checked, and only when its path ends in `src/app/<page>/index.ts` (see `config/file/keys`).
- **`page/module/fresh`** — In development, each request reloads the page's module, the site's `src/metadata.ts` and the layout's `metadata.ts`, so edits to them show up without a restart. Modules they import are not reloaded until the dev server restarts. The layout file, the `sync.ts` files and the import map are read again on every request, in any mode.

## URL

- **`page/url/home`** — `home` becomes `index.html`; its page URL is `/`.
- **`page/url/name`** — Any other page becomes `<name>.html`; its page URL is `/<name>`, which only works without `.html` if the host resolves it. GitHub Pages does.
- **`page/url/index-clash`** — A page named `index` also becomes `index.html`. With both `home` and `index`, the last one written wins, in the order the folders are listed.
- **`page/url/404`** — A page named `404` becomes `404.html`, which GitHub Pages serves for unknown URLs. Nothing else is special about it.
- **`page/url/dev-server`** — The dev server serves each page at its page URL, `/` or `/<name>`. `/home` serves the home page too. `/<name>.html`, `/<name>/` and names that need percent-encoding don't.

## HTML

- **`page/html`** — The page's HTML is its layout file, with each placeholder replaced by the matching piece of the page: its title, metadata, styles, scripts and content (see `layout/placeholders/list`).
