# Static files

## Source

- **`static/folder`** — Files in the static folder go to the site unchanged.

## Output

- **`static/copy`** — The static folder is copied into the output folder first. A file from the source folder, or a page, with the same name wins over it.

## Development

- **`static/dev-serve`** — A path not matching a page or a file in the staging folder is served from the static folder. A folder is served by its `index.html`.
- **`static/dev-watch`** — The static folder isn't watched; changes in it don't trigger live reload.

## Errors

- **`static/error-missing`** — Without a static folder, the build writes no pages and still exits 0.

## TODO

- **`static/error-missing`** — Don't fail when the static folder doesn't exist.
