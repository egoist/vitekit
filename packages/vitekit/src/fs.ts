import path from "upath"
import fs from "fs"

export const outputFileSync = (filepath: string, data: any) => {
  fs.mkdirSync(path.dirname(filepath), { recursive: true })
  fs.writeFileSync(filepath, data)
}
