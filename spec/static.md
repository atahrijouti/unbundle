# Static files

## Static folder

- **`static/copy`** — Files in the static folder go to the site unchanged. The build copies the folder into the output folder first, so a file from the source folder, or a page, with the same name wins over it (see `build/write`).
- **`static/dev-serve`** — In the dev server, a path not matching a page or a file in the staging folder is served from the static folder. A folder is served by its `index.html`.
- **`static/watch`** — The dev server doesn't watch the static folder; changes in it don't trigger live reload.

## TODO

- **`static/watch`** — Consider watching the static folder too, so changes in it trigger live reload.
