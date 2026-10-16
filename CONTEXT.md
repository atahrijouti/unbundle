# unbundle

A tool for building static websites from TypeScript, HTML and CSS without bundling: a dev server to work on the site, and a build that writes the finished site. What the author writes in the source folder reaches the site as written, transpiled where needed but never bundled, so it stays readable in View Source.

## Language

### Folders

**Source folder**:
Where the author writes the site: pages, layouts and the code they use. `src/` by default.
_Avoid_: app folder, project folder

**Static folder**:
Where the author puts files that go to the site unchanged, such as images, fonts and `CNAME`. `public/` by default.
_Avoid_: assets folder

**Staging folder**:
Where unbundle writes the transpiled and copied source while it works. The author never edits it, but must keep it out of git, TypeScript and other tools. `dist/` today.
_Avoid_: dist, build folder

**Output folder**:
Where the build writes the finished site, ready to deploy. `out/` by default.
_Avoid_: dist, build, export

### The site

**Page**:
One page of the site, end to end: its folder and module in the source folder, the content and metadata it describes, the URL it lives at (such as `/resume`), and what the browser receives there. Its module runs at build time and in the browser.
_Avoid_: page module, page script, page content, route, view

**Metadata**:
What describes a page to the browser and the outside world, such as its title, description and icon. Every page has a title. It is declared at three levels, site, layout and page: each page's metadata is the site's, overridden by its layout's, overridden by its own.
_Avoid_: head, meta, SEO

**Layout**:
The frame pages are placed into: a folder with its layout file and the styles and scripts that go with it. Each page uses one layout.
_Avoid_: template, theme

**Layout file**:
The HTML file that drives a layout. Wherever it has a placeholder, the build puts the matching piece of the page there.
_Avoid_: template, shell

**Placeholder**:
A tag in a layout file that the build replaces with a piece of the page, such as its title, content, metadata, styles or scripts.
_Avoid_: slot, token, marker

**Global script**:
A script a layout loads on every page that uses that layout.
_Avoid_: layout script, main script

**Sync script**:
A script inlined in a page's HTML that the browser runs as soon as it reaches it, before first paint. A layout and a page can each have one.
_Avoid_: blocking script, inline script, head script

**Import map**:
The browser's import map, kept as a file in the source folder: it lets pages import modules by name. Modules it points to inside `node_modules` are copied into the site.
_Avoid_: aliases, module map

**Base URL**:
The path the site is served under, such as `/` or `/blog/`. Every URL unbundle writes starts with it.
_Avoid_: base path, base, root

**Config**:
The site's optional `unbundle.config.js`, where the author changes the base URL and the folder names.
_Avoid_: settings, options

### Producing the site

**Build**:
The process that finds every page in the source folder and produces the finished site in the output folder.
_Avoid_: compile, export, generate

**Dev server**:
Serves the site while the author works on it, running the same build-time steps on each request, plus development extras such as live reload.
_Avoid_: preview, watch mode

**Build time**:
When code runs in Node to produce a page: once per page during the build, and on each request in the dev server. The opposite is the browser.
_Avoid_: render time, compile time, server side

**Development** / **Production**:
The two modes a site is produced in. The dev server produces development, which adds live reload; the build produces production.
_Avoid_: dev mode, prod, environment

**Live reload**:
In development, the open page reloads itself when the author changes the source.
_Avoid_: HMR, hot reload

**Production-only block**:
A part of a layout file that only appears in production, such as analytics.
_Avoid_: prod block, conditional block
