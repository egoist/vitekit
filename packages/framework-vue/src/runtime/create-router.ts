import {
  createRouter as createVueRouter,
  createMemoryHistory,
  createWebHistory,
} from "vue-router"
import { routes } from "/.vitekit/generated/client-routes.js"

export const createRouter = () => {
  const router = createVueRouter({
    history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
    routes: routes.map((route: any) => {
      return {
        ...route,
        component: () =>
          route.load().then((res: any) => {
            const component = res.default
            component.hasLoader = res.loader
            component.hasAction = res.action
            return res
          }),
      }
    }),
  })

  return router
}
