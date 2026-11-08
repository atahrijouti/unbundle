# Principles

What unbundle is for, and how to decide on a change. Every proposal is checked against these. When they conflict, readable output wins.

## Readable output

What the author writes reaches the site as written. Names, words and code stay as they are; nothing is compressed or mangled by default.

- Stripping types, so `.ts` becomes `.js`, is fine.
- Small, visible additions that help the page work are fine, such as the `ready` listener appended to a page's module. It marks where the page's dynamic part starts, and it stays visible in the module rather than in an inline script in the HTML.

## Not a concern

What can differ from the source without hurting readable output:

- **Formatting.** A page is assembled from several pieces, and formatting it makes them read as one document with consistent indentation. It may become optional.
- **Line numbers.** The layout file is a shell that brings in other files at its placeholders, so a page's lines don't map back to its source files.

## No bundling

Bundling is the whole pipeline: building a module graph from every script, dropping what isn't needed, minifying and renaming, and packing the result into one bundle or chunks sized for fast requests. unbundle doesn't do it. A single step can be offered on its own when what ships stays recognizable: tree shaking removes code that wasn't needed on the page and leaves the rest as written. Joining files into one isn't bundling.

## Speed without the tangle

unbundle is written so sites stay fast and never laggy, and so live reload and builds are quick. Optimizations such as content hashes, tree shaking and minification come later and are options: designing around them from the start leads to a tangled setup. Anything that costs readability, such as minification, is turned on by the site.

## HTML, JavaScript and CSS

unbundle works with HTML, JavaScript and CSS; the rest is up to the author. Any library that runs in the browser should work, but unbundle doesn't promote one to be compatible with. The tools it offers work through those native pieces.

## Static first

The target is static websites, with SEO built in. Not every site needs to be a web app, but a static site should be able to grow into one.

## Scale without bundling

unbundle doesn't claim to scale today. It should get there gradually without bundling, for example by fetching ahead the scripts nearby pages need.

## Dependencies

Code that isn't the author's matters less for readability: it often arrives minified, and it ships as published. What matters is size: a site shouldn't pull in more than it needs.

## Conventions first

Sites follow fixed conventions for where things live. Ways to configure them can come where possible, but aren't a priority.
