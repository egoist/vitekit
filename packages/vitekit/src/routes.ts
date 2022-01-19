import path from "upath"
import fs from "fs-extra"
import { sortRoutesInPlace } from "./sort-routes"
import { parseRouteFile } from "./lib/parse-route-file"

export const ROUTE_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".md",
  ".mdx",
  ".vue",
  ".svelte",
]

const getRouteFiles = (
  dir: string,
  _routesDir?: string
): {
  files: string[]
} => {
  const result: string[] = []
  const routesDir = _routesDir || dir

  const ignored = (name: string) => name.startsWith(".") || name.startsWith("_")

  if (!fs.existsSync(dir))
    return {
      files: result,
    }

  const names = fs.readdirSync(dir)

  for (const name of names) {
    const filepath = path.join(dir, name)
    const stat = fs.statSync(filepath)

    if (stat.isDirectory()) {
      if (ignored(name)) continue
      getRouteFiles(filepath, routesDir).files.forEach((v) => result.push(v))
    } else {
      const relativePath = path.relative(routesDir, filepath)

      if (ignored(name)) continue

      if (!ROUTE_EXTENSIONS.includes(path.extname(relativePath))) {
        continue
      }

      result.push(relativePath)
    }
  }

  return { files: result }
}

export const writeRoutes = async ({
  routesDir,
  runtimeDir,
}: {
  routesDir: string
  runtimeDir: string
}) => {
  const { files } = getRouteFiles(routesDir)

  const routes = sortRoutesInPlace(
    await Promise.all(
      files.map(async (file) => {
        const absolutePath = path.join(routesDir, file)
        const { hasAction, hasLoader, hasDefault } = await parseRouteFile(
          absolutePath
        )
        return {
          path:
            "/" +
            file
              .replace(/\.[a-z]+$/, "")
              .replace(/^index$/, "")
              .replace(/\/index$/, "")
              .replace(/\$(\w+)/g, ":$1")
              .replace(/\$/, "*"),
          absolutePath: absolutePath,
          relativePath: file,
          hasLoader,
          hasAction,
          hasDefault,
        }
      })
    )
  )

  const routesContent = `
  import { notFoundFile } from './special-files.js'

  let routes = [
      ${routes
        .map((route) => {
          return `{
              path: "${route.path}",
              hasLoader: ${route.hasLoader},
              hasAction: ${route.hasAction},
              hasDefault: ${route.hasDefault},
              load: () => import("${path.relative(
                runtimeDir,
                route.absolutePath
              )}")
          }`
        })
        .join(",\n")}${routes.length > 0 ? "," : ""}
        {
          path: "/*",
          load: notFoundFile
        }
  ]

  export { routes }
  `

  const routesFile = path.join(runtimeDir, "routes.js")
  fs.outputFileSync(routesFile, routesContent)

  const clientRoutes = routes.filter((route) => route.hasDefault)

  const clientRoutesContent = `
  import { notFoundFile } from './special-files.js'
    
    let routes = [
      ${clientRoutes
        .map((route) => {
          return `{
          path: "${route.path}",
          load: () => import("${path.relative(runtimeDir, route.absolutePath)}")
        }`
        })
        .join(",\n")}
        ${routes.length > 0 ? "," : ""}
        {
          path: "/*",
          load: notFoundFile
        }
    ]

    export { routes }
    `

  const clientRoutesFile = path.join(runtimeDir, "client-routes.js")
  fs.outputFileSync(clientRoutesFile, clientRoutesContent)
}
