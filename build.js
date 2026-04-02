import esbuild from "esbuild"

await esbuild.build({
  entryPoints: ["lib/client/index.ts"],
  outfile: "dist/client/index.js",
  bundle: true,
  format: "esm",
})

await esbuild.build({
  entryPoints: ["lib/server/index.ts", "lib/server/build.ts"],
  outdir: "dist/server",
  bundle: true,
  format: "esm",
  platform: "node",
  packages: "external",
})
