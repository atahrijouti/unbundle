import type { ESLint, Rule } from "eslint"

declare const eslintPlugin: {
  meta: { name: string }
  configs: Record<string, ESLint.ConfigData>
  rules: Record<string, Rule.RuleModule>
}

export default eslintPlugin
