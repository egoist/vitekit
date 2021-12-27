import fs from "fs-extra"
import path from "upath"
import { Plugin, build } from "vite"
import { writeRoutes } from "./routes"
import { findUp } from "./utils"

export type Options = {
  root?: string
  routesDir?: string
}

class ViteKit {
  root: string
  routesDir: string
  nodeModulesDir: string
  runtimeDir: string
  constructor(options: Options) {
    this.root = options.root || process.cwd()
    this.routesDir = path.join(this.root, options.routesDir || "routes")
    const nodeModulesDir = findUp(["node_modules"], this.root)
    if (!nodeModulesDir) {
      throw new Error("No node_modules found.")
    }
    this.nodeModulesDir = nodeModulesDir
    this.runtimeDir = path.join(this.nodeModulesDir, ".vitekit")
  }
}

const plugin = (options: Options = {}): Plugin => {
  let kit: ViteKit

  const ssrBuild = !!process.env.VITEKIT_SSR_BUILD

  return {
    name: "vitekit",

    resolveId(id) {
      if (id.startsWith(".vitekit/")) {
        return id.replace(
          ".vitekit",
          path.join(kit.root, "node_modules/.vitekit")
        )
      }
    },

    configResolved(_config) {
      kit = new ViteKit({ root: _config.root, ...options })
    },

    async buildStart() {
      if (ssrBuild) return
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

      const routesFile = writeRoutes(kit.routesDir, kit.runtimeDir)

      this.addWatchFile(routesFile)
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
      server.middlewares.use(async (req, res, next) => {
        const mod = await server.ssrLoadModule(`vitekit/server`)
        mod.middleware(req, res, next)
      })
    },

    async buildEnd(err) {
      if (ssrBuild || err) return

      process.env.VITEKIT_SSR_BUILD = "true"
      await build({
        build: {
          ssr: path.join(kit.runtimeDir, "server.js"),
          outDir: "build",
          rollupOptions: {
            output: {
              format: "esm",
            },
          },
        },
      })
    },
  }
}

export default plugin
