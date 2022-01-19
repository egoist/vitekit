import { createApp } from "./create-app"

declare const VITEKIT: any

const vitekit = VITEKIT

const { app, router } = createApp({
  vitekit,
})

const path = location.pathname + location.search
const hash = location.hash

router.push(path).then(() => {
  app.mount("#vitekit")

  if (hash) {
    router.replace(path + hash)
  }

  router.beforeResolve(async (to) => {
    const { hasLoader } = to.matched[0].components.default as any
    if (hasLoader) {
      const data = await fetch(to.path, {
        headers: {
          "x-vitekit-request": "loader",
        },
      }).then((res) => res.json())
      vitekit.loaderData[to.path] = data
    }
  })
})
