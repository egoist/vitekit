import path from "upath"
import fs from "fs"

export const findUp = (files: string[], from: string): string | null => {
  for (const file of files) {
    const filePath = path.join(from, file)
    if (fs.existsSync(filePath)) {
      return filePath
    }
  }
  const parent = path.dirname(from)
  if (parent === "/" || !fs.existsSync(parent)) {
    return null
  }
  return findUp(files, parent)
}
