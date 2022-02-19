import path from "path"
import { UserConfig as ViteConfig } from "vite"
import { ViteKit } from "../node"
import { ownDir } from "../utils"
import { createVitePlugin } from "./plugin"
import { stripExportsPlugin } from "./strip-exports-plugin"

export const getViteConfig = (kit: ViteKit, isServer: boolean) => {
  const config: ViteConfig = {
    root: kit.root,
    server: {
      middlewareMode: true,
    },
    resolve: {
      alias: {},
    },
    build: {
      outDir: path.join(kit.outDir, isServer ? "server" : "client"),
      ssr: isServer,
      rollupOptions: {
        input: isServer
          ? path.join(kit.generatedPackagesDir, "server.js")
          : path.join(kit.generatedPackagesDir, "client.js"),
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
      // Resolve vitekit in this directory
      // Prevent duplication in a pnpm workspace where `vitekit` is a leaf package
      // (only happens in our own workspace)
      {
        name: "resolve-vitekit",
        enforce: "pre",
        resolveId(id, importer) {
          if (id === "vitekit" || id.startsWith("vitekit/")) {
            return this.resolve(id.replace("vitekit", ownDir), importer, {
              skipSelf: true,
            })
          }
        },
      },
      // Resolve .vitekit-package to the generate package in node_modules
      {
        name: "resolve-generated-vitekit-package",
        enforce: "pre",
        resolveId(id) {
          if (id.startsWith(".vitekit-package")) {
            return id
              .replace(".vitekit-package", kit.generatedPackagesDir)
              .replace(/(\.js)?$/, ".js")
          }
        },
      },
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
