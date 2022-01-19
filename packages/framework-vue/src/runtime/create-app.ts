import { createSSRApp, h } from "vue"
import { createHead } from "@vueuse/head"
import { createRouter } from "./create-router"
import { injectVitekit, ViteKit } from "./inject"
import { RouterView } from "vue-router"

export const createApp = ({ vitekit }: { vitekit: ViteKit }) => {
  const router = createRouter()
  const head = createHead()
  const app = createSSRApp({
    setup() {
      return () => h(RouterView)
    },
  })

  app.use(router)
  app.use(head)
  injectVitekit(app, vitekit)

  return { app, router, head }
}
