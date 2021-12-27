import fs from "fs-extra"
import path from "upath"
import { Plugin, build } from "vite"
import { ViteKit } from "./node"
import { writeRoutes } from "./routes"

export const createVitePlugin = (kit: ViteKit): Plugin => {
  return {
    name: "vitekit",

    resolveId(id) {
      if (id.startsWith("vitekit/")) {
        return id.replace("vitekit", kit.runtimeDir).replace(/(\.js)?$/, ".js")
      }
    },

    async buildStart() {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(kit.root, "package.json"), "utf8")
      )
      const deps = [
        ...new Set(Object.keys(pkg.dependencies || {})),
        ...new Set(Object.keys(pkg.devDependencies || {})),
      ]
      let adapter: string | undefined
      for (const dep of deps) {
        if (dep.startsWith("@vitekit/adapter-")) {
          if (adapter) {
            throw new Error(
              `Multiple ViteKit adapters found: ${adapter} and ${dep}`
            )
          }
          adapter = dep
        }
      }
      if (!adapter) {
        throw new Error("No ViteKit adapter found.")
      }

      const adapterDist = path.join(kit.nodeModulesDir, adapter, "dist")
      const adapterFiles = await fs.readdir(adapterDist)
      let serverRuntime = "export { routes } from './routes.js'"
      let serverRuntimeTypes = ""

      for (const file of adapterFiles) {
        const outFile = path.join(kit.runtimeDir, adapter, file)
        await fs.ensureDir(path.dirname(outFile))
        await fs.copyFile(path.join(adapterDist, file), outFile)
        const relativePath = `./${path.relative(kit.runtimeDir, outFile)}`
        if (file === "server.js") {
          serverRuntime += `
            export * from '${relativePath}'
            `
        } else if (file === "server.d.ts") {
          serverRuntimeTypes += `
            export * from '${relativePath.replace(".d.ts", "")}'
            `
        }
      }
      await fs.outputFile(path.join(kit.runtimeDir, "server.js"), serverRuntime)
      await fs.outputFile(
        path.join(kit.runtimeDir, "server.d.ts"),
        serverRuntimeTypes
      )

      writeRoutes(kit.routesDir, kit.runtimeDir)
    },

    configureServer(server) {
      const updateRoutes = (filepath: string) => {
        if (!filepath.startsWith(kit.routesDir)) return
        console.log(`[vitekit] updating routes..`)
        writeRoutes(kit.routesDir, kit.runtimeDir)
      }
      server.watcher
        .on("add", (filepath) => {
          updateRoutes(filepath)
        })
        .on("unlink", (filepath) => {
          updateRoutes(filepath)
        })
        .on("unlinkDir", (filepath) => {
          updateRoutes(filepath)
        })
        .on("addDir", (filepath) => {
          updateRoutes(filepath)
        })

      // Apply after Vite serving static files
      return () => {
        // Serve the routes
        server.middlewares.use(async (req, res, next) => {
          const mod = await server.ssrLoadModule(`vitekit/server`)
          mod.middleware(req, res, next)
        })

        // Serve index.html and assets
        server.middlewares.use(async (req, res, next) => {
          const htmlFile = path.join(kit.root, "index.html")
          if (!fs.existsSync(htmlFile)) {
            return next()
          }
          const html = fs.readFileSync(htmlFile, "utf8")
          const result = await server.transformIndexHtml(req.url!, html)
          res.setHeader("Content-Type", "text/html")
          res.end(result)
        })
      }
    },
  }
}
