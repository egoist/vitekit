import serialize from "serialize-javascript"
import { MiddlewareArgs } from "vitekit/shared/server.js"
import { documentFile } from "/.vitekit/generated/special-files.js"
import { renderToString } from "vue/server-renderer"
import { replacePlaceholders } from "vitekit/html"
import { createApp } from "./create-app"

export const renderApp = async ({
  url,
  __loaderData,
  __actionData,
}: MiddlewareArgs): Promise<{ html: string }> => {
  const pathname = url.split("?")[0]
  const loaderData = { [pathname]: __loaderData }
  const actionData = { [pathname]: __actionData }
  const { app, router } = createApp({
    vitekit: { loaderData, actionData },
  })
  await router.push(url)
  await router.isReady()
  const appHTML = await renderToString(app)

  const getHtml = await documentFile().then((res: any) => res.default)

  const html =
    "<!DOCTYPE html>" +
    replacePlaceholders(getHtml(), {
      scripts: `<script>VITEKIT=${serialize(
        { loaderData, actionData },
        { isJSON: true }
      )}</script>
    <script type="module" src="/@id/.vitekit-package/client.js"></script>`,
      main: `<div id="vitekit">${appHTML}</div>`,
      head: "",
    })

  return { html }
}
