import { bundleRequire } from "bundle-require"
import fs from "fs-extra"
import path from "upath"
import { ViteKit } from "./node"
import { Plugin } from "./plugin"

export type UserConfig = {
  plugins?: Plugin[]
  /**
   * The directory to output server bundles and client bundled
   * Server bundled are output to `out/server`
   * Client bundled are output to `out/client`
   * @default "out"
   */
  outDir?: string
}

export const defineConfig = (config: UserConfig) => config

export const loadConfig = async (kit: ViteKit) => {
  const configFile = path.join(kit.root, "vitekit.config.ts")
  if (!fs.existsSync(configFile)) return

  const { mod } = await bundleRequire({
    filepath: configFile,
    esbuildOptions: {
      external: ["vitekit/*"],
    },
  })
  const userConfig: UserConfig = mod.default

  if (userConfig.plugins) {
    kit.plugins = userConfig.plugins
  }

  if (userConfig.outDir) {
    kit.outDir = path.resolve(kit.root, userConfig.outDir)
  }
}
