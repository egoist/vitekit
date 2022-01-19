import { App, inject } from "vue"

const VITEKIT_INJECT = Symbol("for-vitekit")

export type ViteKit = { loaderData: any; actionData: any }

export const injectVitekit = (app: App, vitekit: ViteKit) => {
  app.provide(VITEKIT_INJECT, vitekit)
}

export const useVitekit = () => {
  const vitekit = inject<ViteKit>(VITEKIT_INJECT)
  if (!vitekit) {
    throw new Error("failed to inject vitekit")
  }
  return vitekit
}
