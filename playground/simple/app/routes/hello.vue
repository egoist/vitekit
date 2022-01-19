<script lang="ts">
import fs from "fs"
import { Middleware } from ".vitekit-runtime/index"

type LoaderData = {
  title: string
  code: string
}

export const loader: Middleware<LoaderData> = () => {
  return {
    body: {
      title: "Hello",
      code: fs.readFileSync("app/routes/hello.vue", "utf8"),
    },
  }
}
</script>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useLoaderData, useHead } from ".vitekit-runtime/index"

const count = ref(0)
const data = useLoaderData<LoaderData>()

const inc = () => count.value++

useHead({
  title: computed(() => data.value.title),
})
</script>

<template>
  <div>
    <h1>{{ data.title }}</h1>
    <pre>{{ data.code }}</pre>
    <button @click="inc">{{ count }}</button>
  </div>
</template>

<style scoped>
pre {
  color: darkcyan;
  border: 1px solid #e2e2e2;
  padding: 1em;
}
</style>
