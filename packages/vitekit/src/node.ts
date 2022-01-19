import http from "http"
import path from "upath"
import {
  createServer as createViteServer,
  build as viteBuild,
  Plugin as VitePlugin,
} from "vite"
import { findUp } from "./utils"
import { writeRoutes } from "./routes"
import { Plugin } from "./plugin"
import { getViteConfig } from "./vite/vite-config"
import { loadConfig } from "./config"
import { outputFileSync } from "./fs"
import { writeSpecialFiles } from "./special-files"

export type Options = {
  root?: string
  dev?: boolean
}

export { getDirname } from "./utils"
export { defineConfig } from "./config"

export { path }

export type { VitePlugin, Plugin }

export class ViteKit {
  root: string
  appDir: string
  routesDir: string
  nodeModulesDir: string
  runtimeDir: string
  dev: boolean
  plugins: Plugin[]
  outDir: string

  constructor(options: Options) {
    this.dev = !!options.dev
    this.root = options.root || process.cwd()
    this.appDir = path.join(this.root, "app")
    this.routesDir = path.join(this.appDir, "routes")
    const nodeModulesDir = findUp(["node_modules"], this.root)
    if (!nodeModulesDir) {
      throw new Error("No node_modules found.")
    }
    this.nodeModulesDir = nodeModulesDir
    this.runtimeDir = path.join(nodeModulesDir, ".vitekit-runtime")
    this.outDir = path.join(this.root, "out")
    this.plugins = []
  }

  async prepare() {
    await loadConfig(this)

    const plugins = this.plugins

    const runtimeFiles: Record<string, { code: string; type: string }> = {
      server: {
        code: `import "./global";
        export {
          redirect
        } from "vitekit/shared/server.js"
        `,
        type: `
        export {
          redirect,
          Middleware,
          MiddlewareArgs,
          MiddlewareResult,
        } from "vitekit/shared/server"
        `,
      },
      index: {
        code: ``,
        type: ``,
      },
      global: {
        code: "",
        type: "",
      },
      client: {
        code: "",
        type: "",
      },
    }

    for (const plugin of plugins) {
      const files = plugin.runtime?.call(this)
      if (!files) continue

      if (files.serverFiles) {
        for (const file of files.serverFiles) {
          runtimeFiles.server.code += `export * from "${file}";\n`
          runtimeFiles.server.type += `export * from "${file.replace(
            /\.js$/,
            ""
          )}";\n`
        }
      }
      if (files.globalFiles) {
        for (const file of files.globalFiles) {
          runtimeFiles.global.code += `import "${file}";\n`
          runtimeFiles.global.type += `export * from "${file.replace(
            /\.js$/,
            ""
          )}";\n`
        }
      }
      if (files.indexFiles) {
        for (const file of files.indexFiles) {
          runtimeFiles.index.code += `export * from "${file}";\n`
          runtimeFiles.index.type += `export * from "${file.replace(
            /\.js$/,
            ""
          )}";\n`
        }
      }
      if (files.clientFiles) {
        for (const file of files.clientFiles) {
          runtimeFiles.client.code += `import "${file}";\n`
        }
      }
    }

    for (const name in runtimeFiles) {
      outputFileSync(
        path.join(this.runtimeDir, `${name}.js`),
        runtimeFiles[name].code
      )
      outputFileSync(
        path.join(this.runtimeDir, `${name}.d.ts`),
        runtimeFiles[name].type
      )
    }

    await writeRoutes({
      routesDir: this.routesDir,
      runtimeDir: this.runtimeDir,
    })
    await writeSpecialFiles({
      appDir: this.appDir,
      runtimeDir: this.runtimeDir,
    })

    // initialize plugins
    this.plugins = plugins
  }

  async createDevServer() {
    await this.prepare()
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
    await this.prepare()
    await viteBuild(getViteConfig(this, false))
    await viteBuild(getViteConfig(this, true))
  }
}
