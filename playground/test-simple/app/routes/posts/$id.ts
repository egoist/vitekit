import { Middleware } from ".vitekit-package/server"

export const loader: Middleware = async ({ params }) => {
  const postRes = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${params.id}`
  )
  if (postRes.status === 404) return
  if (!postRes.ok) return { status: postRes.status, body: postRes.statusText }
  return {
    body: {
      post: await postRes.json(),
    },
    headers: {
      "x-foo": "foo",
    },
  }
}
