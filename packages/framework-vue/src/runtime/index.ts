import { computed, ComputedRef } from "vue"
import { useVitekit } from "./inject"
import { useRoute } from "vue-router"

export { useRoute, useRouter, RouterLink } from "vue-router"
export { useHead, Head } from "@vueuse/head"

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
