import { createSSRApp, h } from "vue"
import { RouterView } from "vue-router"
import { createRouter } from "./create-router"
import { injectVitekit, ViteKit } from "./inject"

export const createApp = ({ vitekit }: { vitekit: ViteKit }) => {
  const router = createRouter()
  const app = createSSRApp({
    setup() {
      return () => h(RouterView)
    },
  })

  app.use(router)

  injectVitekit(app, vitekit)

  return { app, router }
}
