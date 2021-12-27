import { parse } from "regexparam"

export type MaybePromise<T> = T | Promise<T>

export type BaseLoaderArgs<TRequest> = {
  request: TRequest
  params: Record<string, string>
}

export type BaseLoaderResult =
  | {
      body?: any
      status?: number
      headers?: Record<string, string>
    }
  | Response

export type BaseLoaderFunction<TRequest> = (
  args: BaseLoaderArgs<TRequest>
) => MaybePromise<BaseLoaderResult | null | undefined>

function exec(path: string, result: { keys: string[]; pattern: RegExp }) {
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
    const out = exec(url, p)
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
