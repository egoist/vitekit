import { Plugin } from "vitekit/node"
import vue from "@vitejs/plugin-vue"

type Options = {
  reactivityTransform?: boolean
  include?: string | RegExp | (string | RegExp)[]
  exclude?: string | RegExp | (string | RegExp)[]
}

const plugin = (options: Options = {}): Plugin => {
  return {
    name: "framework-vue",

    runtime() {
      return {
        serverFiles: [`${__PKG_NAME__}/dist/runtime/server.js`],
        indexFiles: [`${__PKG_NAME__}/dist/runtime/index.js`],
        clientFiles: [`${__PKG_NAME__}/dist/runtime/client.js`],
      }
    },

    vite(config) {
      config.plugins!.push(
        vue({
          reactivityTransform: options.reactivityTransform,
          include: options.include,
          exclude: options.exclude,
        })
      )
    },
  }
}

export default plugin
