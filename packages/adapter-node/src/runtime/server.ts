import { IncomingMessage, ServerResponse } from "http"
import {
  MatchedRoute,
  matchRoute,
  MiddlewareArgs,
  handleRequest,
} from "vitekit/shared/server.js"
import { incomingMessageToNodeRequest } from "vitekit/shared/node-server.js"
import { routes } from "/.vitekit/generated/routes.js"

export const createRequestHandler =
  ({
    viteTransformHTML,
  }: { viteTransformHTML?: MiddlewareArgs["__viteTransformHTML"] } = {}) =>
  async (req: IncomingMessage, res: ServerResponse) => {
    const m = matchRoute<MatchedRoute>(req.url!, routes)

    if (!m) {
      res.statusCode = 404
      res.end("not found")
      return
    }

    const { params, route } = m

    const args: MiddlewareArgs = {
      url: req.url!,
      request: incomingMessageToNodeRequest(req) as any,
      route,
      params,
      __actionData: {},
      __loaderData: {},
      __viteTransformHTML: viteTransformHTML,
    }

    const response = await handleRequest(args)

    let status = response.status
    // Not found route
    if (args.route.path === "/*") {
      status = 404
    }

    res.statusCode = status || 200

    response.headers.forEach((value, key) => {
      res.setHeader(key.toLowerCase(), value)
    })

    if (response.body) {
      // @ts-expect-error
      response.body.pipe(res)
    } else {
      res.end()
    }
  }
