import { Plugin } from "vite"
import { ViteKit } from "../node"

export const createVitePlugin = (kit: ViteKit): Plugin => {
  return {
    name: "vitekit",

    configureServer(server) {
      // Apply after Vite serving static files
      return () => {
        // Serve the routes
        server.middlewares.use(async (req, res) => {
          const mod = await server.ssrLoadModule(`vitekit/server`)
          const handleRequest = mod.createRequestHandler({
            viteTransformHTML: server.transformIndexHtml,
          })
          handleRequest(req, res)
        })
      }
    },
  }
}
