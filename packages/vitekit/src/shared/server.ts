import { parse } from "regexparam"
import { renderApp } from ".vitekit-runtime/server.js"

export type MaybePromise<T> = T | Promise<T>

export type MatchedRoute = {
  path: string
  hasLoader: boolean
  hasAction: boolean
  hasDefault: boolean
  load: () => Promise<any>
}

export type MiddlewareArgs = {
  /** pathname + search string */
  url: string
  request: Request
  params: Record<string, string>
  route: MatchedRoute
  /** @private */
  __loaderData: Record<string, any>
  /** @private */
  __actionData: Record<string, any>
  /** @private */
  __notFound?: boolean
  /** @private */
  __viteTransformHTML?: (url: string, html: string) => Promise<string>
}

export type MiddlewareResult<TData = any> = TData | Response | false

export type Middleware<TBody = any> = (
  args: MiddlewareArgs
) => MaybePromise<MiddlewareResult<TBody> | null | undefined | void>

function execPath(path: string, result: { keys: string[]; pattern: RegExp }) {
  let i = 0,
    out: Record<string, string> = {}
  let matches = result.pattern.exec(path)
  if (!matches) return null
  while (i < result.keys.length) {
    out[result.keys[i]] = matches[++i]
  }
  return out
}

export const matchRoute = <T extends { path: string }>(
  url: string,
  routes: T[]
) => {
  url = url.split("?")[0]
  let params: Record<string, string> | null = null
  let matchedRoute: T | null = null
  for (const route of routes) {
    const p = parse(route.path)
    const out = execPath(url, p)
    if (out) {
      params = out
      matchedRoute = route
      break
    }
  }
  if (!matchedRoute || !params) return null
  return {
    params,
    route: matchedRoute,
  }
}

export const redirect = (url: string, status?: number) => {
  return new Response(null, {
    status: status || 302,
    headers: {
      Location: url,
    },
  })
}

const toResponse = (data: any) => {
  if (data instanceof Response) return data

  return new Response(typeof data === "string" ? data : JSON.stringify(data))
}

export const handleRequest = async (
  args: MiddlewareArgs
): Promise<Response> => {
  const { route, request } = args
  const mod = await route.load()

  let result: MiddlewareResult | undefined
  let notFound = false
  let type: "loader" | "action" | undefined

  if (request.method === "GET" && mod.loader) {
    type = "loader"
    result = await mod.loader(args)
    if (result === false) {
      notFound = true
    }
  } else if (request.method !== "GET" && mod.action) {
    type = "action"
    result = await mod.action(args)
    if (result === false) {
      notFound = true
    }
  }

  if (result instanceof Response && result.headers.has("Location")) {
    return result
  }

  const dataResponse = toResponse(result)

  if (args.request.headers.has("x-vitekit-request")) {
    return dataResponse
  }

  if (!mod.default && !notFound) {
    return dataResponse
  }

  if (type === "loader") {
    Object.assign(args.__loaderData, result)
  } else if (type === "action") {
    Object.assign(args.__actionData, result)
  }

  args.__notFound = notFound

  const rendered: { html: string } = await renderApp(args)

  if (args.__viteTransformHTML) {
    rendered.html = await args.__viteTransformHTML(args.url, rendered.html)
  }
  dataResponse.headers.set("content-type", "text/html")
  return new Response(rendered.html, {
    status: dataResponse.status,
    headers: dataResponse.headers,
  })
}
