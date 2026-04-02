import { readdirSync, statSync } from "node:fs"
import { join } from "node:path"

export const getPages = () => {
  return readdirSync("./src/app").filter((name) => statSync(join("./src/app", name)).isDirectory())
}

export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  delay: number,
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => func(...args), delay)
  }
}
