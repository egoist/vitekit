// @ts-check
import http from "http"
import { createApp } from "h3"
import serveStatic from "sirv"
import { middleware } from "../build/server/server.js"

const app = createApp()

// Serve static files
app.use(serveStatic("./build/client"))

// Serve routes
app.use(middleware)

// Fallback to SPA
app.use(serveStatic("./build/client", { single: true }))

http.createServer(app).listen(3001)
console.log("> http://localhost:3001")
