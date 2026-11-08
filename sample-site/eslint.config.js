import tseslint from "typescript-eslint"
import unbundle from "unbundle/eslint"

export default tseslint.config(
  { ignores: ["dist/", "out/"] },
  { languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } } },
  tseslint.configs.recommended,
  unbundle.configs.recommended,
)
