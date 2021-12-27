import http from "http"
import path from "upath"
import {
  createServer as createViteServer,
  build as viteBuild,
  UserConfig as ViteUserConfig,
} from "vite"
import { findUp } from "./utils"
import { createVitePlugin } from "./plugin"

export type Options = {
  root?: string
  routesDir?: string
}

const getViteConfig = (kit: ViteKit, isServer: boolean): ViteUserConfig => {
  return {
    root: kit.root,
    server: {
      middlewareMode: true,
    },
    build: {
      outDir: isServer ? "build/server" : "build/client",
      ssr: isServer ? path.join(kit.runtimeDir, "server.js") : undefined,
      rollupOptions: {
        output: {
          format: "esm",
        },
      },
    },
    // @ts-expect-error experimental api
    ssr: {},
    plugins: [createVitePlugin(kit)],
  }
}

export class ViteKit {
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
    this.runtimeDir = path.join(this.root, ".vitekit/runtime")
  }

  async createDevServer() {
    const viteServer = await createViteServer(getViteConfig(this, false))

    const server = http.createServer(viteServer.middlewares).listen(3000)
    console.log(`[vitekit] dev server listening on http://localhost:3000`)

    return {
      close() {
        server.close()
      },
    }
  }

  async build() {
    await viteBuild(getViteConfig(this, false))
    await viteBuild(getViteConfig(this, true))
  }
}
