import { UserConfig as ViteConfig } from "vite"
import { ViteKit } from "./node"

export type InjectGlobalsResult =
  | Record<string, string | [string, string]>
  | undefined
  | null

export type RuntimeHook = (this: ViteKit) =>
  | {
      /** File names in the folder to export in `vitekit/server` */
      serverFiles?: string[]
      globalFiles?: string[]
      /** File names in the folder to export in `vitekit` */
      indexFiles?: string[]
      clientFiles?: string[]
    }
  | void
  | undefined
  | null

export type ViteHook = (this: ViteKit, config: ViteConfig) => void

export interface Plugin {
  name: string

  /**
   * Inject runtime files
   */
  runtime?: RuntimeHook

  /**
   * Extend Vite config
   */
  vite?: ViteHook
}
