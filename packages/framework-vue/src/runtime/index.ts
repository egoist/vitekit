import { computed, ComputedRef } from "vue"
import { RouteLocationRaw, useRoute, useRouter } from "vue-router"
import { useVitekit } from "./inject"

export const useNavigate = () => {
  const router = useRouter()
  return (to: RouteLocationRaw, replace = false) => {
    if (replace) {
      router.replace(to)
    } else {
      router.push(to)
    }
  }
}

export { useRoute }

export const useLoaderData = <T = any>(): ComputedRef<T> => {
  const route = useRoute()
  const vitekit = useVitekit()

  return computed(() => {
    return vitekit.loaderData[route.path] || {}
  })
}

export const useActionData = <T = any>(): ComputedRef<T> => {
  const route = useRoute()
  const vitekit = useVitekit()

  return computed(() => {
    return vitekit.actionData[route.path] || {}
  })
}
