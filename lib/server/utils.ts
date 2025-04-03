import { readdirSync, statSync } from "fs"
import { join } from "path"

const SRC_PATH = join(process.cwd(), "src")

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

const checkSkipImport = (filePath: string) => {
  if (!filePath.startsWith(SRC_PATH)) {
    return true
  }

  return false
}

export const clearImportCache = () => {
  for (const file of Object.keys(require.cache)) {
    if (checkSkipImport(file)) continue
    delete require.cache[file]
  }
}
