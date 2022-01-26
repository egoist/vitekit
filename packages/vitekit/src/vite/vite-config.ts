import path from "path"
import { UserConfig as ViteConfig } from "vite"
import { ViteKit } from "../node"
import { createVitePlugin } from "./plugin"
import { stripExportsPlugin } from "./strip-exports-plugin"

export const getViteConfig = (kit: ViteKit, isServer: boolean) => {
  const config: ViteConfig = {
    root: kit.root,
    server: {
      middlewareMode: true,
    },
    build: {
      outDir: path.join(kit.outDir, isServer ? "server" : "client"),
      ssr: isServer,
      rollupOptions: {
        input: isServer
          ? path.join(kit.runtimeDir, "server.js")
          : path.join(kit.runtimeDir, "client.js"),
        output: {
          format: "esm",
        },
      },
      manifest: !isServer,
      ssrManifest: isServer,
    },
    // @ts-expect-error experimental api
    ssr: {},
    plugins: [
      createVitePlugin(kit),
      stripExportsPlugin({ routesDir: kit.routesDir }),
    ],
  }

  // Extend Vite config
  for (const plugin of kit.plugins) {
    if (plugin.vite) {
      plugin.vite.call(kit, config)
    }
  }

  return config
}
