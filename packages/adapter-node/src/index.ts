import { Plugin } from "vitekit/node"

const plugin = (): Plugin => {
  return {
    name: "adapter-node",

    runtime() {
      return {
        globalFiles: [`${__PKG_NAME__}/dist/runtime/global.js`],
        serverFiles: [`${__PKG_NAME__}/dist/runtime/server.js`],
      }
    },
  }
}

export default plugin
