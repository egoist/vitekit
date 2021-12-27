import path from "upath"
import fs from "fs-extra"
import { sortRoutesInPlace } from "./sort-routes"

const readDir = (
  dir: string,
  ignore: (file: string) => boolean,
  rootDir = dir
): string[] => {
  const result: string[] = []
  if (!fs.existsSync(dir)) return result
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    const relativePath = path.relative(rootDir, filePath)
    if (ignore(relativePath)) {
      continue
    }
    if (stat.isDirectory()) {
      result.push(...readDir(filePath, ignore, rootDir))
    } else {
      result.push(relativePath)
    }
  }
  return result
}

export const writeRoutes = (routesDir: string, runtimeDir: string) => {
  const files = readDir(
    routesDir,
    // Ignore dot files/folders
    // And non js files
    (file) =>
      !file.endsWith(".") &&
      !file.includes("/.") &&
      !/\.(js|ts|jsx|tsx|mjs)$/.test(file)
  )

  const routes = sortRoutesInPlace(
    files.map((file) => {
      return {
        path:
          "/" +
          file
            .replace(/\.[a-z]+$/, "")
            .replace(/^\/index$/, "")
            .replace(/\/index$/, "")
            .replace(/\$(\w+)/g, ":$1")
            .replace(/\$/, "*"),
        absolutePath: path.join(routesDir, file),
        relativePath: file,
      }
    })
  )

  const routesContent = `
  let routes = [
      ${routes
        .map((route) => {
          return `{
              path: "${route.path}",
              load: () => import("${path.relative(
                runtimeDir,
                route.absolutePath
              )}")
          }`
        })
        .join(",\n")}
  ]
  export { routes }
  `
  const routesFile = path.join(runtimeDir, "routes.js")
  fs.outputFileSync(routesFile, routesContent)
  return routesFile
}
