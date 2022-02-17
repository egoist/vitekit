<script lang="ts">
import { Middleware, redirect } from ".vitekit-package/server"

globalThis.todos = globalThis.todos || []

type LoaderData = {
  todos: string[]
}

export const loader: Middleware<LoaderData> = async () => {
  return {
    todos,
  }
}

export const action: Middleware = async ({ request }) => {
  const data = await request.formData()

  const todo = data.get("todo") as string | null
  if (!todo) {
    return {
      error: "content must not be empty",
    }
  }

  todos.push(todo)

  return redirect("/todos")
}
</script>

<script lang="ts" setup>
import { useLoaderData } from ".vitekit-package/index"

const loaderData = useLoaderData<LoaderData>()
</script>

<template>
  <ul>
    <li v-for="(todo, index) in loaderData.todos" :key="index">{{ todo }}</li>
  </ul>
  <form method="POST">
    <input type="text" name="todo" />
    <button type="submit">Add Todo</button>
  </form>
</template>
