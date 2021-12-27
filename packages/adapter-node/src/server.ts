import { IncomingMessage, ServerResponse } from "http"
import fetch, {
  Request as NodeRequest,
  RequestInit as NodeRequestInit,
  Response as NodeResponse,
} from "node-fetch"
import { matchRoute, BaseLoaderFunction } from "@vitekit/server-utils"
import { routes } from "vitekit/routes"

Object.assign(globalThis, {
  fetch,
  Request: NodeRequest,
  Response: NodeResponse,
})

declare var Request: NodeRequest
declare var Response: NodeRequest

export type LoaderFunction = BaseLoaderFunction<NodeRequest>
export type ActionFunction = BaseLoaderFunction<NodeRequest>

// Get a `NodeRequest` from `IncomingMessage`
export const incomingMessageToNodeRequest = (message: IncomingMessage) => {
  const protocol = message.headers["x-forwarded-proto"] || "http"
  const host = message.headers["x-forwarded-host"] || message.headers.host
  const headers = message.headers as Record<string, string>

  const url = `${protocol}://${host}${message.url}`
  const init: NodeRequestInit = {
    method: message.method,
    headers,
  }

  if (init.method !== "GET" && init.method !== "HEAD") {
    init.body = message
  }

  return new NodeRequest(url, init)
}

export const middleware = async (
  req: IncomingMessage,
  res: ServerResponse,
  next: (err?: Error) => void
) => {
  const m = matchRoute<{ path: string; load: () => Promise<any> }>(
    req.url!,
    routes
  )

  if (!m) return next()

  const { params, route } = m
  const request = incomingMessageToNodeRequest(req)
  const mod = await route.load()
  if (!mod.loader && !mod.action) return next()

  let response: any
  if (req.method === "GET" && mod.loader) {
    response = await mod.loader({ request, params })
  } else if (req.method !== "GET" && mod.action) {
    response = await mod.action({ request, params })
  }

  console.log(req.url, response)

  if (!response) return next()

  res.writeHead(response.status || 200, response.headers || {})

  const body = response.body
  if (body) {
    if (typeof body === "object") {
      res.end(JSON.stringify(body))
    } else if (typeof body === "string") {
      res.end(body)
    }
  } else {
    res.end()
  }
}
