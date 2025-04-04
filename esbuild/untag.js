import fs from "fs/promises"

export default {
  name: "untag",
  setup(build) {
    build.onLoad({ filter: /\.ts$/ }, async (args) => {
      const contents = await fs.readFile(args.path, "utf8")

      const transformedContents = contents
        .replace(/html(`[\s\S]*?`)/g, "$1")
        .replace(/css(`[\s\S]*?`)/g, "$1")

      return {
        contents: transformedContents,
        loader: "ts",
      }
    })
  },
}
