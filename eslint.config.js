import globals from "globals"
import eslint from "@eslint/js"
import tseslint from "typescript-eslint"

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
  {
    ignores: ["dist/**"],
  },
  {
    files: ["**/**.ts"],
    ignores: ["!node_modules/", "node_modules/*"],
  },
  //
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
)
