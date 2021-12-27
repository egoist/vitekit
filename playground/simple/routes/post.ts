import { ActionFunction } from "vitekit/server"

export const action: ActionFunction = async ({ request }) => {
  const data = await request.json()
  return {
    body: {
      data,
    },
  }
}
