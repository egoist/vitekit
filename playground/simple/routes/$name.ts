import { LoaderFunction } from "vitekit/server"

export const loader: LoaderFunction = async ({ params, request }) => {
  const postRes = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${params.name}`
  )
  if (!postRes.ok) return { status: postRes.status, body: postRes.statusText }
  return {
    body: {
      post: await postRes.json(),
    },
  }
}
