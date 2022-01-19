import path from "upath"
import fs from "fs"
import { fileURLToPath } from "url"

/**
 * File URL to dirname
 */
export const getDirname = (url: string) => {
  return path.dirname(fileURLToPath(url))
}

export const findUp = (
  files: string[],
  from: string,
  stopDir = path.parse(from).root
): string | null => {
  for (const file of files) {
    const filePath = path.join(from, file)
    if (fs.existsSync(filePath)) {
      return filePath
    }
  }
  const parent = path.dirname(from)
  if (parent === stopDir || !fs.existsSync(parent)) {
    return null
  }
  return findUp(files, parent)
}
