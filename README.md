# unbundle

unbundle builds static websites without a bundler, so the code the browser gets is the code you wrote, and anyone who opens View Source can read it.

## Why

- **View Source should show real code.** The web grew up on right-click → View Source. A visitor should be able to read a site's source and learn from it, and the person building it should be able to debug it, in production too.
- **Bundling trades clarity for speed.** Today's tools ship fast sites and compile fast, but every layer makes the setup harder to follow and leaves the developer blind when something breaks in production.
- **The platform is enough.** Web APIs have come far enough that a static site can do a lot without bundling or a complicated setup.
- **Fast, without the tangle.** Live reload should be instant, builds quick, and sites never laggy. Optimizations can come later, as options.

unbundle works with HTML, JavaScript and CSS. Bring any library that runs in the browser; unbundle doesn't favor one.

## Status

Early stages. `unbundle-build` writes the finished site, and `unbundle-serve` is the dev server. What you write in the source folder reaches the site as written: transpiled with esbuild where needed, never bundled, and placed into an HTML layout file.
