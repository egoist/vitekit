import { IncomingMessage } from "http"
import fetch, { RequestInit, Request, Response } from "node-fetch"

export const injectGlobals = () => {
  Object.assign(globalThis, {
    fetch,
    Request,
    Response,
  })
}

export const incomingMessageToNodeRequest = (message: IncomingMessage) => {
  const protocol = message.headers["x-forwarded-proto"] || "http"
  const host = message.headers["x-forwarded-host"] || message.headers.host
  const headers = message.headers as Record<string, string>

  const url = `${protocol}://${host}${message.url}`
  const init: RequestInit = {
    method: message.method,
    headers,
  }

  if (init.method !== "GET" && init.method !== "HEAD") {
    init.body = message
  }

  return new Request(url, init)
}
